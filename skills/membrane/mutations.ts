/**
 * @module skills/membrane/mutations
 * @description
 * Gall Classification: S3 Membrane Primitives
 * Purpose: Provides implementations for creating synchronous proxies and tracking transactions,
 * simulations, audit logs, tenant isolation, and OCEL envelope generation over wrapped targets.
 */

import { createContext as unctxCreateContext } from 'unctx';
import { AsyncLocalStorage } from 'node:async_hooks';
import { hash, stableJson } from "../hash/mutations.js";
import { createHash, randomUUID } from 'node:crypto';
import { type TruexContext, createDeterministicContext } from "../../packages/truex-core/src/context.js";

const defaultMembraneContext = createDeterministicContext(99_999);

// ============================================================================
// SECTION 1: CORE CONTEXT & PROXY INTERCEPTION
// ============================================================================

export function createContext<T = any>() {
  // Configured to track asynchronous context propagation to prevent async context leaks
  const ctx = unctxCreateContext<T>({
    asyncContext: true,
    AsyncLocalStorage
  });
  return {
    use: () => ctx.use(),
    tryUse: () => ctx.tryUse(),
    call: (value: T, callback: () => any) => ctx.call(value, callback),
    set: (value: T, replace = false) => ctx.set(value, replace),
    unset: () => ctx.unset()
  };
}

export const runInterceptors = (interceptors: any[], fallback: Function, ...args: any[]) => {
  for (const interceptor of interceptors) {
    const result = interceptor(...args);
    if (result !== undefined) return result;
  }
  return fallback(...args);
};

export const runBooleanInterceptors = (interceptors: any[], fallback: Function, ...args: any[]) => {
  for (const interceptor of interceptors) {
    const result = interceptor(...args);
    if (result === false) return false;
    if (result === true) return true;
  }
  return fallback(...args);
};

export const runOwnKeysInterceptors = (interceptors: any[], fallback: Function, target: any) => {
  let keys = fallback(target);
  for (const interceptor of interceptors) {
    const additionalKeys = interceptor(target, keys);
    if (Array.isArray(additionalKeys)) {
      keys = additionalKeys;
    }
  }
  return keys;
};

export function createProxy(target: any = {}) {
  const proxyContext = createContext();
  proxyContext.set(
    {
      getInterceptors: [],
      setInterceptors: [],
      hasInterceptors: [],
      deletePropertyInterceptors: [],
      ownKeysInterceptors: [],
      definePropertyInterceptors: [],
      preventExtensionsInterceptors: [],
      isExtensibleInterceptors: [],
      getOwnPropertyDescriptorInterceptors: [],
      applyInterceptors: [],
      constructInterceptors: [],
      getPrototypeOfInterceptors: [],
      setPrototypeOfInterceptors: []
    },
    true
  );

  const proxy = new Proxy(target, {
    get(t, prop, receiver) {
      const interceptors = proxyContext.use().getInterceptors;
      const result = runInterceptors(interceptors, Reflect.get, t, prop, receiver);
      
      // Deep proxy wrapping: recursively wrap nested properties returning objects
      if (
        result &&
        typeof result === 'object' &&
        prop !== '__proto__' &&
        prop !== 'prototype' &&
        prop !== 'constructor' &&
        typeof prop !== 'symbol'
      ) {
        const nestedProxyInterface = createProxy(result);
        const parentCtx = proxyContext.use();
        const childCtx = nestedProxyInterface.proxyContext.use();
        
        childCtx.getInterceptors = parentCtx.getInterceptors;
        childCtx.setInterceptors = parentCtx.setInterceptors;
        childCtx.hasInterceptors = parentCtx.hasInterceptors;
        childCtx.deletePropertyInterceptors = parentCtx.deletePropertyInterceptors;
        childCtx.ownKeysInterceptors = parentCtx.ownKeysInterceptors;
        childCtx.definePropertyInterceptors = parentCtx.definePropertyInterceptors;
        childCtx.preventExtensionsInterceptors = parentCtx.preventExtensionsInterceptors;
        childCtx.isExtensibleInterceptors = parentCtx.isExtensibleInterceptors;
        childCtx.getOwnPropertyDescriptorInterceptors = parentCtx.getOwnPropertyDescriptorInterceptors;
        childCtx.applyInterceptors = parentCtx.applyInterceptors;
        childCtx.constructInterceptors = parentCtx.constructInterceptors;
        childCtx.getPrototypeOfInterceptors = parentCtx.getPrototypeOfInterceptors;
        childCtx.setPrototypeOfInterceptors = parentCtx.setPrototypeOfInterceptors;
        
        return nestedProxyInterface.proxy;
      }
      return result;
    },
    set(t, prop, value, receiver) {
      if (prop === '__proto__') {
        const errorMsg = 'Prototype mutation/breakout attempted via __proto__ property write';
        if ((globalThis as any).__truex_trigger_jidoka) {
          (globalThis as any).__truex_trigger_jidoka(errorMsg);
        } else {
          throw new Error(`[JIDOKA FATAL ERROR] ${errorMsg}`);
        }
      }
      const interceptors = proxyContext.use().setInterceptors;
      return runBooleanInterceptors(interceptors, Reflect.set, t, prop, value, receiver);
    },
    has(t, prop) {
      const interceptors = proxyContext.use().hasInterceptors;
      return runBooleanInterceptors(interceptors, Reflect.has, t, prop);
    },
    deleteProperty(t, prop) {
      const interceptors = proxyContext.use().deletePropertyInterceptors;
      return runBooleanInterceptors(interceptors, Reflect.deleteProperty, t, prop);
    },
    defineProperty(t, prop, descriptor) {
      if (prop === '__proto__') {
        const errorMsg = 'Prototype mutation/breakout attempted via __proto__ property definition';
        if ((globalThis as any).__truex_trigger_jidoka) {
          (globalThis as any).__truex_trigger_jidoka(errorMsg);
        } else {
          throw new Error(`[JIDOKA FATAL ERROR] ${errorMsg}`);
        }
      }
      const interceptors = proxyContext.use().definePropertyInterceptors;
      return runBooleanInterceptors(interceptors, Reflect.defineProperty, t, prop, descriptor);
    },
    preventExtensions(t) {
      const interceptors = proxyContext.use().preventExtensionsInterceptors;
      return runBooleanInterceptors(interceptors, Reflect.preventExtensions, t);
    },
    isExtensible(t) {
      const interceptors = proxyContext.use().isExtensibleInterceptors;
      return runBooleanInterceptors(interceptors, Reflect.isExtensible, t);
    },
    ownKeys(t) {
      const interceptors = proxyContext.use().ownKeysInterceptors;
      return runOwnKeysInterceptors(interceptors, Reflect.ownKeys, t) as ArrayLike<string | symbol>;
    },
    getOwnPropertyDescriptor(t, prop) {
      const interceptors = proxyContext.use().getOwnPropertyDescriptorInterceptors;
      return runInterceptors(interceptors, Reflect.getOwnPropertyDescriptor, t, prop);
    },
    apply(t, thisArg, argsList) {
      const interceptors = proxyContext.use().applyInterceptors;
      return runInterceptors(interceptors, Reflect.apply, t, thisArg, argsList);
    },
    construct(t, argsList, newTarget) {
      const interceptors = proxyContext.use().constructInterceptors;
      return runInterceptors(interceptors, Reflect.construct, t, argsList, newTarget);
    },
    setPrototypeOf(_t, _proto) {
      const errorMsg = 'Prototype mutation refused on Truex Membrane';
      if ((globalThis as any).__truex_trigger_jidoka) {
        (globalThis as any).__truex_trigger_jidoka(errorMsg);
      } else {
        throw new Error(`[JIDOKA FATAL ERROR] ${errorMsg}`);
      }
      return false;
    },
    getPrototypeOf(t) {
      const interceptors = proxyContext.use().getPrototypeOfInterceptors;
      return runInterceptors(interceptors, Reflect.getPrototypeOf, t);
    }
  });

  const addInterceptor = (trap: string, interceptor: Function) => {
    const context = proxyContext.tryUse();
    if (!context) {
      throw new Error(`Cannot add interceptor for "${trap}" without an active context.`);
    }
    const listName = `${trap}Interceptors`;
    if (!Array.isArray(context[listName])) {
      throw new TypeError(`Trap "${trap}" is not initialized in the context.`);
    }
    context[listName].push(interceptor);
  };

  return {
    proxy,
    proxyContext,
    addInterceptor,
    defineGetInterceptor: (fn: Function) => addInterceptor('get', fn),
    defineSetInterceptor: (fn: Function) => addInterceptor('set', fn),
    defineHasInterceptor: (fn: Function) => addInterceptor('has', fn),
    defineDeletePropertyInterceptor: (fn: Function) => addInterceptor('deleteProperty', fn),
    defineDefinePropertyInterceptor: (fn: Function) => addInterceptor('defineProperty', fn),
    definePreventExtensionsInterceptor: (fn: Function) => addInterceptor('preventExtensions', fn),
    defineIsExtensibleInterceptor: (fn: Function) => addInterceptor('isExtensible', fn),
    defineOwnKeysInterceptor: (fn: Function) => addInterceptor('ownKeys', fn),
    defineGetOwnPropertyDescriptorInterceptor: (fn: Function) => addInterceptor('getOwnPropertyDescriptor', fn),
    defineApplyInterceptor: (fn: Function) => addInterceptor('apply', fn),
    defineConstructInterceptor: (fn: Function) => addInterceptor('construct', fn),
    defineGetPrototypeOfInterceptor: (fn: Function) => addInterceptor('getPrototypeOf', fn),
    defineSetPrototypeOfInterceptor: (fn: Function) => addInterceptor('setPrototypeOf', fn),
  };
}

// ============================================================================
// SECTION 2: TRANSACTIONS & ROLLBACK
// ============================================================================

export function createTransactionContext(target: any, options: any = {}) {
  const transactionContext = createContext();
  let ctx = options.ctx;
  if (!ctx || typeof ctx.clock !== 'function') {
    ctx = defaultMembraneContext;
  }
  const state = {
    journal: [] as any[],
    journalIndex: 0,
    isActive: false,
    ctx,
  };

  const txRecord = {
    rollback: () => {
      try {
        rollback();
      } catch {
        // Ignore
      }
    }
  };

  function call(fn: Function) {
    if (state.isActive) return fn();
    state.isActive = true;
    (globalThis as any).__truex_active_transactions = (globalThis as any).__truex_active_transactions || new Set();
    (globalThis as any).__truex_active_transactions.add(txRecord);
    return transactionContext.call({ active: true, state }, () => fn());
  }

  function commit() {
    if (!state.isActive) throw new Error('No active transaction to commit');
    state.journal = [];
    state.journalIndex = 0;
    state.isActive = false;
    transactionContext.unset();
    if ((globalThis as any).__truex_active_transactions) {
      (globalThis as any).__truex_active_transactions.delete(txRecord);
    }
    return true;
  }

  function rollback() {
    if (!state.isActive) throw new Error('No active transaction to rollback');
    for (let i = state.journal.length - 1; i >= 0; i--) {
      const entry = state.journal[i];
      const writeTarget = entry.target || target;
      if (entry.operation === 'set') {
        if (entry.hadProperty) {
          Reflect.set(writeTarget, entry.property, entry.previousValue);
        } else {
          Reflect.deleteProperty(writeTarget, entry.property);
        }
      } else if (entry.operation === 'delete' && entry.hadProperty) {
          Reflect.set(writeTarget, entry.property, entry.previousValue);
      }
    }
    state.journal = [];
    state.journalIndex = 0;
    state.isActive = false;
    transactionContext.unset();
    if ((globalThis as any).__truex_active_transactions) {
      (globalThis as any).__truex_active_transactions.delete(txRecord);
    }
  }

  return {
    call,
    commit,
    rollback,
    getDryRun: () => state.journal.map(e => ({ ...e })),
    isActive: () => state.isActive,
    getJournal: () => state.journal.map(e => ({ ...e })),
    context: transactionContext,
    _state: state
  };
}

export function registerTransactionInterceptors(proxyInterface: any, txCtx: any) {
  proxyInterface.defineSetInterceptor((target: any, prop: any, value: any, receiver: any) => {
    const txState = txCtx.context.tryUse();
    if (!txState || !txState.active) return undefined;
    const hadProperty = Reflect.has(target, prop);
    const previousValue = hadProperty ? Reflect.get(target, prop, receiver) : undefined;
    const ctx = txState.state?.ctx || defaultMembraneContext;
    txCtx._state.journal.push({
      operation: 'set',
      target,
      property: prop,
      value,
      previousValue,
      hadProperty,
      timestamp: ctx.clock(),
      index: txCtx._state.journalIndex++,
    });
  });

  proxyInterface.defineDeletePropertyInterceptor((target: any, prop: any) => {
    const txState = txCtx.context.tryUse();
    if (!txState || !txState.active) return undefined;
    const hadProperty = Reflect.has(target, prop);
    const previousValue = hadProperty ? Reflect.get(target, prop) : undefined;
    const ctx = txState.state?.ctx || defaultMembraneContext;
    txCtx._state.journal.push({
      operation: 'delete',
      target,
      property: prop,
      previousValue,
      hadProperty,
      timestamp: ctx.clock(),
      index: txCtx._state.journalIndex++,
    });
  });
}

// ============================================================================
// SECTION 3: SIMULATION & COUNTERFACTUAL
// ============================================================================

function deepClone(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  if (obj instanceof Map) {
    const c = new Map();
    for (const [k, v] of obj) c.set(k, deepClone(v));
    return c;
  }
  if (obj instanceof Set) {
    const c = new Set();
    for (const v of obj) c.add(deepClone(v));
    return c;
  }
  if (Array.isArray(obj)) return obj.map(i => deepClone(i));
  const proto = Object.getPrototypeOf(obj);
  const c = proto ? Object.create(proto) : {};
  for (const k of Object.keys(obj)) c[k] = deepClone(obj[k]);
  for (const s of Object.getOwnPropertySymbols(obj)) c[s] = deepClone(obj[s]);
  return c;
}

export function createSimulationContext(target: any, options: any = {}) {
  const simulationContext = createContext();
  const state = {
    speculativeState: undefined as any,
    isActive: false,
    mutations: [] as any[],
    target,
    options
  };

  function speculate(fn: Function) {
    if (state.isActive) return fn();
    state.speculativeState = deepClone(target);
    state.isActive = true;
    try {
      return simulationContext.call({ active: true, state }, () => fn());
    } finally {
      // Remain active until commit or abort
    }
  }

  function commit() {
    if (!state.isActive) throw new Error('No active simulation');
    Object.assign(target, state.speculativeState);
    state.isActive = false;
    state.speculativeState = undefined;
    simulationContext.unset();
  }

  function abort() {
    state.isActive = false;
    state.speculativeState = undefined;
    simulationContext.unset();
  }

  return {
    speculate,
    commit,
    abort,
    isActive: () => state.isActive,
    getMutations: () => state.mutations,
    context: simulationContext,
    _state: state
  };
}

export function registerSimulationInterceptors(proxyInterface: any, simCtx: any) {
  proxyInterface.defineGetInterceptor((target: any, prop: any, receiver: any) => {
    const simState = simCtx.context.tryUse();
    if (!simState || !simState.active) return undefined;
    return Reflect.get(simCtx._state.speculativeState, prop);
  });

  proxyInterface.defineSetInterceptor((target: any, prop: any, value: any, receiver: any) => {
    const simState = simCtx.context.tryUse();
    if (!simState || !simState.active) return undefined;
    Reflect.set(simCtx._state.speculativeState, prop, value);
    simCtx._state.mutations.push({ property: prop, value });
    return true;
  });
}

// ============================================================================
// SECTION 4: OBSERVABILITY & AUDIT
// ============================================================================

export function createAuditContext(target: any, options: any = {}) {
  const auditContext = createContext();
  let ctx = options.ctx;
  if (!ctx || typeof ctx.clock !== 'function') {
    ctx = defaultMembraneContext;
  }
  const state = {
    logs: [] as any[],
    index: 0,
    options,
    ctx
  };

  return {
    call: (fn: Function) => auditContext.call(state, () => fn()),
    getLogs: () => [...state.logs],
    clearLog: () => { state.logs = []; state.index = 0; },
    context: auditContext,
    _state: state
  };
}

export function registerAuditInterceptors(proxyInterface: any, auditCtx: any) {
  const log = (trap: string, prop: any, intent: string, status: string, extra = {}) => {
    const state = auditCtx.context.tryUse();
    if (!state) return;
    const ctx = state.ctx || defaultMembraneContext;
    state.logs.push({
      index: state.index++,
      timestamp: new Date(ctx.clock()).toISOString(),
      trap,
      property: prop,
      intent,
      status,
      ...extra
    });
  };

  proxyInterface.defineGetInterceptor((target: any, prop: any) => {
    log('get', prop, 'read', 'allowed');
  });

  proxyInterface.defineSetInterceptor((target: any, prop: any, value: any) => {
    log('set', prop, 'write', 'allowed', { value });
  });

  proxyInterface.defineDeletePropertyInterceptor((target: any, prop: any) => {
    log('deleteProperty', prop, 'delete', 'allowed');
  });
}

// ============================================================================
// SECTION 5: TENANT ISOLATION
// ============================================================================

export function createTenantContext(target: any, tenantId: string, options: any = {}) {
  const visibleKeys = options.visibleKeys || new Set(Object.keys(target));
  const proxyInterface = createProxy(target);
  
  proxyInterface.defineGetInterceptor((t: any, prop: any) => {
    if (!visibleKeys.has(prop)) throw new Error(`Access denied for tenant ${tenantId}`);
  });

  proxyInterface.defineSetInterceptor((t: any, prop: any) => {
    if (!visibleKeys.has(prop)) return false;
  });

  return {
    call: (fn: (proxy: any) => any) => fn(proxyInterface.proxy)
  };
}

// ============================================================================
// SECTION 6: OCEL 2.0 LOG CAPTURE & CONTEXT-INJECTED CLOCKS
// ============================================================================

export function canonicalStringify(obj: any): string {
  return stableJson(obj);
}

export class OcelCollector {
  private state = this.createEmptyState();
  private activeBranch: any = undefined;
  private activeEventCtx = createContext();
  private registeredObjects = new Map();
  private proxyInterfaces: any[] = [];

  // Injected context used to prevent system clock/entropy leaks
  constructor(private ctx?: TruexContext) {}

  createEmptyState() {
    return {
      eventTypes: {} as Record<string, any>,
      objectTypes: {} as Record<string, any>,
      events: [] as any[],
      objects: [] as any,
      'event-object': [] as any[],
      'object-object': [] as any[],
      objectChanges: [] as any[]
    };
  }

  getCurrentState() {
    return this.activeBranch || this.state;
  }

  registerProxyInterface(proxyInterface: any, target: any) {
    this.proxyInterfaces.push({ proxyInterface, target });
  }

  registerObject(ref: any, target: any) {
    this.registeredObjects.set(target, ref);
    const state = this.getCurrentState();
    if (!state.objectTypes[ref.type]) {
      state.objectTypes[ref.type] = { attributes: [] };
    }
    if (!state.objects.some((o: any) => o['ocel:id'] === ref.id)) {
      state.objects.push({
        'ocel:id': ref.id,
        'ocel:type': ref.type,
        'ocel:attributes': { ...target }
      });
    }
  }

  observe(observation: any) {
    const currentEvent = this.activeEventCtx.tryUse();
    if (!currentEvent) return;
    const state = this.getCurrentState();
    state.objectChanges.push({
      'ocel:object-id': observation.objectId,
      'ocel:time': observation.timestamp,
      'ocel:field': observation.field,
      'ocel:value': observation.newValue
    });
  }

  event(contextParams: any, fn: Function) {
    const effectiveCtx = this.ctx || defaultMembraneContext;
    const eventId = contextParams.id || `evt_${effectiveCtx.uuid()}`;
    const timestamp = contextParams.timestamp || new Date(effectiveCtx.clock()).toISOString();
    const state = this.getCurrentState();

    if (!state.eventTypes[contextParams.activity]) {
      state.eventTypes[contextParams.activity] = { attributes: ['actor', 'causationId', 'correlationId'] };
    }

    state.events.push({
      'ocel:id': eventId,
      'ocel:type': contextParams.activity,
      'ocel:timestamp': timestamp,
      'ocel:attributes': {
        actor: contextParams.actor,
        causationId: contextParams.causationId,
        correlationId: contextParams.correlationId,
        ...contextParams.attributes
      }
    });

    if (contextParams.objects) {
      for (const objRef of contextParams.objects) {
        state['event-object'].push({
          'ocel:event-id': eventId,
          'ocel:object-id': objRef.id,
          'ocel:qualifier': objRef.qualifier
        });
      }
    }

    return this.activeEventCtx.call({ eventId, activity: contextParams.activity }, () => fn());
  }

  async simulate(contextParams: any, fn: Function) {
    const activeSims: any[] = [];
    for (const { proxyInterface, target } of this.proxyInterfaces) {
      const simCtx = createSimulationContext(target);
      registerSimulationInterceptors(proxyInterface, simCtx);
      activeSims.push(simCtx);
    }

    const previousBranch = this.activeBranch;
    this.activeBranch = deepClone(this.getCurrentState());

    let result;
    let valid = true;

    try {
      const runSpeculatively = (sims: any[], finalFn: Function): any => {
        if (sims.length === 0) return finalFn();
        const sim = sims[0];
        return sim.speculate(() => runSpeculatively(sims.slice(1), finalFn));
      };

      result = await runSpeculatively(activeSims, () => {
        return this.event(contextParams, fn);
      });
    } catch (error) {
      valid = false;
      result = error;
    }

    const speculativeOcel = this.activeBranch;
    this.activeBranch = previousBranch;

    return {
      trajectory: { valid, result },
      speculativeOcel,
      settle: () => {
        for (const sim of activeSims) sim.commit();
        if (this.activeBranch) {
          Object.assign(this.activeBranch, speculativeOcel);
        } else {
          this.state = speculativeOcel;
        }
      },
      discard: () => {
        for (const sim of activeSims) sim.abort();
      }
    };
  }

  export() {
    return this.getCurrentState();
  }

  exportEnvelope(traceId = 'trace_1', spanId = 'span_1', previousReceiptHash?: string) {
    return OcelCollector.createEnvelope(this.getCurrentState(), traceId, spanId, previousReceiptHash);
  }

  static createEnvelope(ocelState: any, traceId = 'trace_1', spanId = 'span_1', previousReceiptHash?: string) {
    const canonicalOcel = canonicalStringify(ocelState);
    
    // Remediation: Unified Hash primitive (BLAKE3) instead of Node native SHA-256
    const batchHash = hash(canonicalOcel);
    const receiptSeed = `${traceId}:${spanId}:${batchHash}:${previousReceiptHash || ''}`;
    const receiptHash = hash(receiptSeed);

    return {
      profile: "zoe.ocel2.v1",
      traceId,
      spanId,
      ocelBatchHash: batchHash,
      previousReceiptHash,
      receiptHash,
      ocel: ocelState
    };
  }

  static verifyEnvelope(envelope: any): boolean {
    try {
      const { receiptHash, ocel, traceId, spanId, ocelBatchHash, previousReceiptHash } = envelope;
      
      // Normalize ocel attributes that might have been stripped of undefined values during JSON serialization
      let normalizedOcel = ocel;
      if (ocel && Array.isArray(ocel.events)) {
        normalizedOcel = {
          ...ocel,
          events: ocel.events.map((evt: any) => {
            if (!evt || !evt['ocel:attributes']) return evt;
            const attrs = { ...evt['ocel:attributes'] };
            if (!('causationId' in attrs)) attrs.causationId = undefined;
            if (!('correlationId' in attrs)) attrs.correlationId = undefined;
            return { ...evt, 'ocel:attributes': attrs };
          })
        };
      }

      const canonicalOcel = canonicalStringify(normalizedOcel);
      const computedBatchHash = hash(canonicalOcel);
      if (computedBatchHash !== ocelBatchHash) return false;
      
      const receiptSeed = `${traceId}:${spanId}:${ocelBatchHash}:${previousReceiptHash || ''}`;
      const computedReceiptHash = hash(receiptSeed);
      return computedReceiptHash === receiptHash;
    } catch {
      return false;
    }
  }

  static verifyEnvelopeChain(e1: any, e2: any): boolean {
    try {
      if (!OcelCollector.verifyEnvelope(e1) || !OcelCollector.verifyEnvelope(e2)) {
        return false;
      }
      return e2.previousReceiptHash === e1.receiptHash;
    } catch {
      return false;
    }
  }
}

export function createOcelProxy(target: any, ref: any, collector: OcelCollector) {
  const proxyInterface = createProxy(target);
  const { defineSetInterceptor, defineDeletePropertyInterceptor } = proxyInterface;

  collector.registerProxyInterface(proxyInterface, target);
  collector.registerObject(ref, target);

  defineSetInterceptor((t: any, prop: any, value: any) => {
    const oldValue = Reflect.get(t, prop);
    const effectiveCtx = (collector as any).ctx || defaultMembraneContext;
    const timestamp = new Date(effectiveCtx.clock()).toISOString();

    collector.observe({
      trap: "set",
      objectId: ref.id,
      objectType: ref.type,
      field: String(prop),
      oldValue,
      newValue: value,
      timestamp,
    });
    return undefined;
  });

  defineDeletePropertyInterceptor((t: any, prop: any) => {
    const oldValue = Reflect.get(t, prop);
    const effectiveCtx = (collector as any).ctx || defaultMembraneContext;
    const timestamp = new Date(effectiveCtx.clock()).toISOString();

    collector.observe({
      trap: "deleteProperty",
      objectId: ref.id,
      objectType: ref.type,
      field: String(prop),
      oldValue,
      newValue: undefined,
      timestamp,
    });
    return undefined;
  });

  return proxyInterface.proxy;
}
