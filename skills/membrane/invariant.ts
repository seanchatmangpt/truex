/**
 * @module skills/membrane/invariant
 * @description
 * Gall Classification: S3 Membrane Primitives
 * Purpose: Defines membrane invariants and access control policies (Capability, Sandbox, Invariant, Contract).
 * Uses proxies to enforce synchronous boundaries over state access.
 */

import { createContext } from "./mutations.js";

// Initialize Jidoka global trigger if not already defined
if (!(globalThis as any).__truex_trigger_jidoka) {
  (globalThis as any).__truex_trigger_jidoka = (errorMsg: string) => {
    const activeTx = (globalThis as any).__truex_active_transactions;
    if (activeTx && activeTx.size > 0) {
      for (const tx of activeTx) {
        try {
          tx.rollback();
        } catch {
          // Ignore errors during emergency rollback
        }
      }
      activeTx.clear();
    }
    const fatalError = new Error(`[JIDOKA FATAL ERROR] Execution halted: ${errorMsg}`);
    Object.freeze(fatalError);
    throw fatalError;
  };
}

(globalThis as any).__truex_active_transactions = (globalThis as any).__truex_active_transactions || new Set();

// ============================================================================
// CAPABILITY ACCESS CONTROL (ACL)
// ============================================================================

export function createCapabilityContext(target: any, capabilities: any = {}) {
  const capabilityContext = createContext();
  const normalized = {
    canRead: capabilities.canRead || new Set(),
    canWrite: capabilities.canWrite || new Set(),
    canDelete: capabilities.canDelete || new Set(),
    canConstruct: capabilities.canConstruct ?? false,
    canApply: capabilities.canApply ?? false,
  };

  return {
    context: capabilityContext,
    capabilities: normalized,
    use: () => capabilityContext.use(),
    tryUse: () => capabilityContext.tryUse(),
    call: (callback: Function) => capabilityContext.call(normalized, () => callback()),
    set: (replace = false) => capabilityContext.set(normalized, replace),
    unset: () => capabilityContext.unset(),
  };
}

const hasPropertyCap = (cap: any, key: any) => {
  if (typeof key === 'symbol') return true; 
  if (!cap) return false;
  if (typeof cap === 'function') return cap(key);
  if (cap instanceof Set) return cap.has(key);
  return false;
};

const hasBoolCap = (cap: any, ...args: any[]) => {
  if (typeof cap === 'function') return cap(...args);
  return Boolean(cap);
};

export function registerCapabilityInterceptors(proxyInterface: any, capCtx: any) {
  const builtInKeys = new Set(['constructor', 'prototype', 'length', 'size', 'name', 'message', 'stack']);
  
  const canRead = (prop: any) => {
    if (typeof prop === 'symbol') return true;
    if (builtInKeys.has(prop)) return true;
    const caps = capCtx.context.tryUse();
    return caps ? hasPropertyCap(caps.canRead, prop) : false;
  };

  const canWrite = (prop: any) => {
    const caps = capCtx.context.tryUse();
    return caps ? hasPropertyCap(caps.canWrite, prop) : false;
  };

  const canDelete = (prop: any) => {
    const caps = capCtx.context.tryUse();
    return caps ? hasPropertyCap(caps.canDelete, prop) : false;
  };

  proxyInterface.defineGetInterceptor((target: any, prop: any) => {
    if (!canRead(prop)) {
      throw new Error(`Access denied: No read capability for property "${String(prop)}"`);
    }
  });

  proxyInterface.defineSetInterceptor((target: any, prop: any) => {
    if (!canWrite(prop)) return false;
  });

  proxyInterface.defineHasInterceptor((target: any, prop: any) => {
    return canRead(prop);
  });

  proxyInterface.defineDeletePropertyInterceptor((target: any, prop: any) => {
    if (!canDelete(prop)) return false;
  });

  // Descriptor read protection check
  proxyInterface.defineGetOwnPropertyDescriptorInterceptor((target: any, prop: any) => {
    if (!canRead(prop)) {
      throw new Error(`Access denied: No read capability for property descriptor of "${String(prop)}"`);
    }
  });

  // defineProperty write protection check
  proxyInterface.defineDefinePropertyInterceptor((target: any, prop: any, descriptor: any) => {
    if (!canWrite(prop)) return false;
  });

  proxyInterface.defineApplyInterceptor((target: any, thisArg: any, argsList: any) => {
    const caps = capCtx.context.tryUse();
    if (!caps || !hasBoolCap(caps.canApply, target, thisArg, argsList)) {
      throw new Error("Access denied: apply not permitted");
    }
  });

  proxyInterface.defineConstructInterceptor((target: any, argsList: any, newTarget: any) => {
    const caps = capCtx.context.tryUse();
    if (!caps || !hasBoolCap(caps.canConstruct, target, argsList, newTarget)) {
      throw new Error("Access denied: construct not permitted");
    }
  });
}

// ============================================================================
// INVARIANT ENFORCEMENT
// ============================================================================

export function createInvariantContext(target: any, invariants: any = {}) {
  const invariantContext = createContext();
  const invariantMap = new Map();

  if (Array.isArray(invariants)) {
    for (const [index, fn] of invariants.entries()) {
      invariantMap.set(`invariant_${index}`, fn);
    }
  } else if (typeof invariants === 'object') {
    for (const [name, fn] of Object.entries(invariants)) {
      if (typeof fn === 'function') invariantMap.set(name, fn);
    }
  }

  const contextState = { invariants: invariantMap, target };

  function validateState(operation: any) {
    const errors: string[] = [];
    for (const [name, invariantFn] of invariantMap) {
      try {
        const result = (invariantFn as Function)(target, operation);
        if (result === false) {
          errors.push(`Invariant "${name}" failed`);
        } else if (typeof result === 'string') {
          errors.push(result);
        }
      } catch (error_: any) {
        errors.push(`Invariant "${name}" threw error: ${error_.message}`);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  return {
    addInvariant: (name: string, fn: Function) => {
      if (invariantMap.has(name)) throw new Error(`Invariant "${name}" already exists`);
      invariantMap.set(name, fn);
    },
    removeInvariant: (name: string) => invariantMap.delete(name),
    getInvariants: () => Object.fromEntries(invariantMap),
    validateState,
    call: (fn: Function) => invariantContext.call(contextState, () => fn()),
    context: invariantContext,
    tryUse: () => invariantContext.tryUse(),
    _state: contextState
  };
}

export function registerInvariantInterceptors(proxyInterface: any, invCtx: any) {
  proxyInterface.defineSetInterceptor((target: any, prop: any, value: any, receiver: any) => {
    const ctx = invCtx.context.tryUse();
    if (!ctx) return undefined;
    const validation = invCtx.validateState({ trap: 'set', property: prop, value, receiver, target });
    if (!validation.valid) {
      const errorMsg = `Invariant violation: ${validation.errors[0]}`;
      if ((globalThis as any).__truex_trigger_jidoka) {
        (globalThis as any).__truex_trigger_jidoka(errorMsg);
      } else {
        throw new Error(`[JIDOKA FATAL ERROR] ${errorMsg}`);
      }
    }
  });

  proxyInterface.defineDeletePropertyInterceptor((target: any, prop: any) => {
    const ctx = invCtx.context.tryUse();
    if (!ctx) return undefined;
    const validation = invCtx.validateState({ trap: 'deleteProperty', property: prop, target });
    if (!validation.valid) {
      const errorMsg = `Invariant violation: ${validation.errors[0]}`;
      if ((globalThis as any).__truex_trigger_jidoka) {
        (globalThis as any).__truex_trigger_jidoka(errorMsg);
      } else {
        throw new Error(`[JIDOKA FATAL ERROR] ${errorMsg}`);
      }
    }
  });

  proxyInterface.defineDefinePropertyInterceptor((target: any, prop: any, descriptor: any) => {
    const ctx = invCtx.context.tryUse();
    if (!ctx) return undefined;
    const validation = invCtx.validateState({ trap: 'defineProperty', property: prop, value: descriptor.value, target });
    if (!validation.valid) {
      const errorMsg = `Invariant violation: ${validation.errors[0]}`;
      if ((globalThis as any).__truex_trigger_jidoka) {
        (globalThis as any).__truex_trigger_jidoka(errorMsg);
      } else {
        throw new Error(`[JIDOKA FATAL ERROR] ${errorMsg}`);
      }
    }
  });
}

// Invariant helper functions
export function typeInvariant(property: any, type: any) {
  return (target: any, operation: any) => {
    if (operation.trap === 'set' && operation.property === property) {
      const isValid = typeof operation.value === type.name.toLowerCase() ||
                      operation.value instanceof type ||
                      operation.value?.constructor === type;
      if (!isValid) return `Property "${String(property)}" must be of type ${type.name}`;
    }
    return true;
  };
}

export function rangeInvariant(property: any, min: number, max: number) {
  return (target: any, operation: any) => {
    if (operation.trap === 'set' && operation.property === property) {
      const value = operation.value;
      if (typeof value !== 'number') return `Property "${String(property)}" must be a number`;
      if (value < min || value > max) return `Property "${String(property)}" must be between ${min} and ${max}`;
    }
    return true;
  };
}

export function immutableInvariant(properties: Set<any>) {
  return (target: any, operation: any) => {
    if (operation.trap === 'set' && properties.has(operation.property) && Reflect.has(target, operation.property)) {
      return `Property "${String(operation.property)}" is immutable`;
    }
    if (operation.trap === 'deleteProperty' && properties.has(operation.property)) {
      return `Property "${String(operation.property)}" is immutable and cannot be deleted`;
    }
    return true;
  };
}

export function dependencyInvariant(name: string, predicate: Function) {
  return (target: any, operation: any) => {
    const nextState = { ...target };
    if (operation.trap === 'set') {
      nextState[operation.property] = operation.value;
    } else if (operation.trap === 'deleteProperty') {
      delete nextState[operation.property];
    }
    if (!predicate(nextState)) return `Dependency invariant "${name}" failed`;
    return true;
  };
}

export function uniquenessInvariant(property: any, collection: Set<any>) {
  return (target: any, operation: any) => {
    if (operation.trap === 'set' && operation.property === property) {
      const value = operation.value;
      const currentValue = target[property];
      if (collection.has(value) && value !== currentValue) {
        return `Property "${String(property)}" must be unique, "${value}" already exists`;
      }
    }
    return true;
  };
}

export function requiredInvariant(properties: Set<any>) {
  return (target: any, operation: any) => {
    if (operation.trap === 'deleteProperty' && properties.has(operation.property)) {
      return `Property "${String(operation.property)}" is required and cannot be deleted`;
    }
    return true;
  };
}

export function patternInvariant(property: any, pattern: RegExp, message?: string) {
  return (target: any, operation: any) => {
    if (operation.trap === 'set' && operation.property === property) {
      const value = operation.value;
      if (typeof value !== 'string') return `Property "${String(property)}" must be a string`;
      if (!pattern.test(value)) return message || `Property "${String(property)}" does not match required pattern`;
    }
    return true;
  };
}

// ============================================================================
// SANDBOXING & STRUCTURAL CONTAINMENT
// ============================================================================

export function createSandboxContext(target: any, policy: any = {}) {
  const sandboxContext = createContext();
  const restrictedKeys = policy.restrictedKeys || new Set();
  
  // Default restricted keys to prevent prototype pollution
  restrictedKeys.add("constructor");
  restrictedKeys.add("__proto__");
  restrictedKeys.add("prototype");

  const normalized = {
    restrictedKeys,
    allowConstruction: policy.allowConstruction ?? false,
    allowDescriptors: policy.allowDescriptors ?? false,
    allowEnumeration: policy.allowEnumeration ?? true,
    allowDelete: policy.allowDelete ?? false,
    allowApply: policy.allowApply ?? true,
    restrictedOperations: policy.restrictedOperations || new Set(),
  };

  const state = { policy: normalized, target };

  function isRestricted(key: any) {
    const { restrictedKeys } = state.policy;
    if (typeof restrictedKeys === 'function') return restrictedKeys(key);
    if (restrictedKeys instanceof Set) return restrictedKeys.has(key);
    return false;
  }

  return {
    isRestricted,
    getPolicy: () => ({ ...state.policy }),
    updatePolicy: (p: any) => { Object.assign(state.policy, p); },
    call: (fn: Function) => sandboxContext.call(state, () => fn()),
    context: sandboxContext,
    tryUse: () => sandboxContext.tryUse(),
    _state: state
  };
}

export function registerSandboxInterceptors(proxyInterface: any, sandboxCtx: any) {
  proxyInterface.defineGetInterceptor((target: any, prop: any) => {
    const state = sandboxCtx.context.tryUse();
    if (!state) return undefined;
    if (sandboxCtx.isRestricted(prop)) {
      throw new Error(`Sandbox violation: Restricted key access: "${String(prop)}"`);
    }
  });

  proxyInterface.defineSetInterceptor((target: any, prop: any) => {
    const state = sandboxCtx.context.tryUse();
    if (!state) return undefined;
    if (sandboxCtx.isRestricted(prop)) return false;
  });

  proxyInterface.defineOwnKeysInterceptor((target: any, currentKeys: any[]) => {
    const state = sandboxCtx.context.tryUse();
    if (!state || !state.policy.allowEnumeration) return [];
    return currentKeys.filter(k => !sandboxCtx.isRestricted(k));
  });

  proxyInterface.defineGetOwnPropertyDescriptorInterceptor((target: any, prop: any) => {
    const state = sandboxCtx.context.tryUse();
    if (!state) return undefined;
    if (sandboxCtx.isRestricted(prop) || !state.policy.allowDescriptors) {
      throw new Error(`Sandbox violation: Descriptor access denied for "${String(prop)}"`);
    }
  });

  proxyInterface.defineDeletePropertyInterceptor((target: any, prop: any) => {
    const state = sandboxCtx.context.tryUse();
    if (!state) return undefined;
    if (sandboxCtx.isRestricted(prop) || !state.policy.allowDelete) return false;
  });

  proxyInterface.defineApplyInterceptor((target: any, thisArg: any, argsList: any) => {
    const state = sandboxCtx.context.tryUse();
    if (!state) return undefined;
    if (!state.policy.allowApply) throw new Error("Sandbox violation: Function application blocked");
  });

  proxyInterface.defineConstructInterceptor((target: any, argsList: any, newTarget: any) => {
    const state = sandboxCtx.context.tryUse();
    if (!state) return undefined;
    if (!state.policy.allowConstruction) throw new Error("Sandbox violation: Constructor execution blocked");
  });
}

// ============================================================================
// CONTRACTS & VIRTUALIZATION
// ============================================================================

export function createVirtualContext(target: any, options: any = {}) {
  const virtualContext = createContext();
  const fields = options.virtualFields || {};
  return {
    call: (fn: Function) => virtualContext.call(fields, () => fn()),
    context: virtualContext
  };
}

export function registerVirtualInterceptors(proxyInterface: any, virtualCtx: any) {
  proxyInterface.defineGetInterceptor((target: any, prop: any, receiver: any) => {
    const fields = virtualCtx.context.tryUse();
    if (fields && fields[prop]) {
      return fields[prop].compute(target);
    }
  });
}

export function createContractContext(target: any, options: any = {}) {
  const contractContext = createContext();
  return {
    call: (fn: Function) => contractContext.call(options, () => fn()),
    context: contractContext
  };
}

export function registerContractInterceptors(proxyInterface: any, contractCtx: any) {
  proxyInterface.defineApplyInterceptor((target: any, thisArg: any, argsList: any) => {
    const policy = contractCtx.context.tryUse();
    if (policy && policy.preCondition) policy.preCondition(...argsList);
    const result = Reflect.apply(target, thisArg, argsList);
    if (policy && policy.postCondition) policy.postCondition(result);
    return result;
  });
}
