/**
 * @module tenant-context
 * @description
 * Gall Classification: S₀ - Operational Primitive
 * Purpose: Implements exhaustive, receiptable operations without deferred logic or stubs.
 */

/**
 * Multi-Tenant Behavioral Views
 *
 * Allows multiple tenants to have different views of the same proxy:
 * - Filtered keys (visibility control)
 * - Virtual properties (synthetic properties per tenant)
 * - Transformed values (get/set transformations)
 * - Tenant metadata and context
 *
 * No cloning, no branching - pure behavioral views.
 */

// Store active tenant contexts (WeakMap for memory safety)
export const activeTenantContexts = new WeakMap();

// TrackableWeakMap extends WeakMap to provide a size property for verification
export class TrackableWeakMap extends WeakMap {
  constructor() {
    super();
    this._keys = new Set();
  }

  set(key, value) {
    super.set(key, value);
    let exists = false;
    for (const ref of this._keys) {
      if (ref.deref() === key) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      this._keys.add(new WeakRef(key));
    }
    return this;
  }

  delete(key) {
    const result = super.delete(key);
    for (const ref of this._keys) {
      const k = ref.deref();
      if (k === key || k === undefined) {
        this._keys.delete(ref);
      }
    }
    return result;
  }

  get size() {
    for (const ref of this._keys) {
      if (ref.deref() === undefined) {
        this._keys.delete(ref);
      }
    }
    return this._keys.size;
  }
}

// Store tenant configurations using TrackableWeakMap
export const tenantConfigs = new TrackableWeakMap();

// Trace GC cleanups
export const finalizedTenants = new Set();
export const tenantFinalizationRegistry = new FinalizationRegistry(
  (heldValue) => {
    const { tenantId } = heldValue;
    finalizedTenants.add(tenantId);
  },
);

// Symbol for accessing raw target
const RAW_TARGET = Symbol("rawTarget");
const TENANT_ID = Symbol("tenantId");

/**
 * Create a tenant context for a target object
 *
 * @param {any} target - The underlying object/proxy
 * @param {string} tenantId - Unique identifier for this tenant
 * @param {Object} tenantConfig - Tenant configuration
 * @param {Set|Function} tenantConfig.visibleKeys - Keys visible to this tenant
 * @param {Object} tenantConfig.virtualProperties - Virtual properties for this tenant
 * @param {Function} tenantConfig.transformGet - Transform values on get
 * @param {Function} tenantConfig.transformSet - Transform values on set
 * @param {Object} tenantConfig.metadata - Tenant metadata (name, org, etc.)
 * @returns {Object} Tenant context API
 */
export function createTenantContext(target, tenantId, tenantConfig = {}) {
  if (!tenantId) {
    throw new Error("tenantId is required");
  }

  let disposed = false;
  let currentTarget = target;
  let currentTenantId = tenantId;
  let config = {
    visibleKeys: tenantConfig.visibleKeys,
    virtualProperties: tenantConfig.virtualProperties || {},
    transformGet: tenantConfig.transformGet,
    transformSet: tenantConfig.transformSet,
    metadata: tenantConfig.metadata || {},
  };

  const registeredRefs = new Set();
  const registerForCleanup = (obj) => {
    if (obj && typeof obj === "object") {
      registeredRefs.add(new WeakRef(obj));
    }
  };

  // Check if key is visible to this tenant
  const isKeyVisible = (key) => {
    if (disposed) return false;
    if (typeof key === "symbol") return true; // Symbols always visible
    if (!config.visibleKeys) return true; // No filter = all visible

    if (typeof config.visibleKeys === "function") {
      return config.visibleKeys(key);
    }

    if (config.visibleKeys instanceof Set) {
      return config.visibleKeys.has(key);
    }

    return true;
  };

  // Check if key is a virtual property
  const isVirtualProperty = (key) => {
    if (disposed) return false;
    return key in config.virtualProperties;
  };

  // Get virtual property value
  const getVirtualValue = (key, receiver) => {
    if (disposed) return undefined;
    const virtual = config.virtualProperties[key];
    return typeof virtual === "function" ? virtual.call(receiver) : virtual;
  };

  // Create the tenant proxy
  let tenantProxy = new Proxy(currentTarget, {
    get(_target, key, receiver) {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      // Special symbols for internal access
      if (key === RAW_TARGET) return currentTarget;
      if (key === TENANT_ID) return currentTenantId;

      // Check virtual properties first
      if (isVirtualProperty(key)) {
        return getVirtualValue(key, receiver);
      }

      // Check visibility
      if (!isKeyVisible(key)) {
        return undefined;
      }

      // Get the value
      const value = Reflect.get(currentTarget, key, receiver);

      // Apply transform if configured
      if (config.transformGet) {
        return config.transformGet(key, value, receiver);
      }

      return value;
    },

    set(_target, key, value, receiver) {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      // Can't set virtual properties
      if (isVirtualProperty(key)) {
        throw new Error(`Cannot set virtual property: ${String(key)}`);
      }

      // Check visibility
      if (!isKeyVisible(key)) {
        throw new Error(`Property not visible to tenant: ${String(key)}`);
      }

      // Apply transform if configured
      let actualValue = value;
      if (config.transformSet) {
        actualValue = config.transformSet(key, value, receiver);
      }

      return Reflect.set(currentTarget, key, actualValue, receiver);
    },

    has(_target, key) {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      // Virtual properties
      if (isVirtualProperty(key)) {
        return true;
      }

      // Check visibility
      if (!isKeyVisible(key)) {
        return false;
      }

      return Reflect.has(currentTarget, key);
    },

    ownKeys(_target) {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      const keys = Reflect.ownKeys(currentTarget);
      const virtualKeys = Object.keys(config.virtualProperties);

      // Filter visible keys and add virtual keys
      const visibleKeys = keys.filter((k) => isKeyVisible(k));
      return [...new Set([...visibleKeys, ...virtualKeys])];
    },

    getOwnPropertyDescriptor(_target, key) {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      // Virtual properties
      if (isVirtualProperty(key)) {
        return {
          configurable: true,
          enumerable: true,
          writable: false,
          value: getVirtualValue(key, tenantProxy),
        };
      }

      // Check visibility
      if (!isKeyVisible(key)) {
        return undefined;
      }

      return Reflect.getOwnPropertyDescriptor(currentTarget, key);
    },

    deleteProperty(_target, key) {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      // Can't delete virtual properties
      if (isVirtualProperty(key)) {
        throw new Error(`Cannot delete virtual property: ${String(key)}`);
      }

      // Check visibility
      if (!isKeyVisible(key)) {
        throw new Error(`Property not visible to tenant: ${String(key)}`);
      }

      return Reflect.deleteProperty(currentTarget, key);
    },

    // Tenant-aware function calls
    apply(_target, thisArg, argumentsList) {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      // Store current tenant context
      const previousContext = activeTenantContexts.get(thisArg);
      activeTenantContexts.set(thisArg, { tenantId: currentTenantId, config });
      registerForCleanup(thisArg);

      try {
        return Reflect.apply(currentTarget, thisArg, argumentsList);
      } finally {
        // Restore previous context
        if (previousContext) {
          activeTenantContexts.set(thisArg, previousContext);
        } else {
          activeTenantContexts.delete(thisArg);
        }
      }
    },

    // Tenant-aware construction
    construct(_target, argumentsList, newTarget) {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      // Create instance with tenant context
      const instance = Reflect.construct(
        currentTarget,
        argumentsList,
        newTarget,
      );
      activeTenantContexts.set(instance, { tenantId: currentTenantId, config });
      registerForCleanup(instance);
      return instance;
    },
  });

  // Store config
  tenantConfigs.set(tenantProxy, config);

  // Register with FinalizationRegistry
  tenantFinalizationRegistry.register(
    tenantProxy,
    { tenantId: currentTenantId },
    tenantProxy,
  );

  // Tenant API
  const tenantAPI = {
    /**
     * Execute a function within this tenant's context
     * @param {Function} fn - Function to execute
     * @returns {any} Result of function
     */
    call(fn) {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      if (typeof fn !== "function") {
        throw new TypeError("Argument must be a function");
      }

      // Store current context
      const previousContext = activeTenantContexts.get(tenantProxy);
      activeTenantContexts.set(tenantProxy, {
        tenantId: currentTenantId,
        config,
      });
      registerForCleanup(tenantProxy);

      try {
        return fn(tenantProxy);
      } finally {
        // Restore previous context
        if (previousContext) {
          activeTenantContexts.set(tenantProxy, previousContext);
        } else {
          activeTenantContexts.delete(tenantProxy);
        }
      }
    },

    /**
     * Get the tenant ID
     * @returns {string} Tenant ID
     */
    getTenantId() {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      return currentTenantId;
    },

    /**
     * Get tenant metadata
     * @returns {Object} Tenant metadata
     */
    getMetadata() {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      return { ...config.metadata };
    },

    /**
     * Get tenant configuration
     * @returns {Object} Tenant configuration
     */
    getConfig() {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      return {
        visibleKeys: config.visibleKeys,
        virtualProperties: { ...config.virtualProperties },
        transformGet: config.transformGet,
        transformSet: config.transformSet,
        metadata: { ...config.metadata },
      };
    },

    /**
     * Update tenant configuration
     * @param {Object} newConfig - New configuration (partial update)
     */
    updateConfig(newConfig) {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      if (newConfig.visibleKeys !== undefined) {
        config.visibleKeys = newConfig.visibleKeys;
      }
      if (newConfig.virtualProperties !== undefined) {
        config.virtualProperties = {
          ...config.virtualProperties,
          ...newConfig.virtualProperties,
        };
      }
      if (newConfig.transformGet !== undefined) {
        config.transformGet = newConfig.transformGet;
      }
      if (newConfig.transformSet !== undefined) {
        config.transformSet = newConfig.transformSet;
      }
      if (newConfig.metadata !== undefined) {
        config.metadata = { ...config.metadata, ...newConfig.metadata };
      }

      // Update stored config
      tenantConfigs.set(tenantProxy, config);
    },

    /**
     * Get the tenant proxy
     */
    get proxy() {
      if (disposed) {
        throw new Error("Tenant context has been disposed");
      }
      return tenantProxy;
    },

    /**
     * Explicit dispose lifecycle teardown method
     */
    dispose() {
      if (disposed) return;
      disposed = true;

      // Remove configuration mapping
      if (tenantProxy) {
        tenantConfigs.delete(tenantProxy);
      }

      // Remove references from active tenant contexts map
      if (tenantProxy) {
        activeTenantContexts.delete(tenantProxy);
      }
      if (currentTarget) {
        activeTenantContexts.delete(currentTarget);
      }

      // Clean up all other registered refs
      for (const ref of registeredRefs) {
        const obj = ref.deref();
        if (obj) {
          activeTenantContexts.delete(obj);
        }
      }
      registeredRefs.clear();

      // Unregister from finalization registry
      if (tenantProxy) {
        tenantFinalizationRegistry.unregister(tenantProxy);
      }

      // Sever all strong references in the closure
      config = undefined;
      currentTarget = undefined;
      currentTenantId = undefined;
      tenantProxy = undefined;
    },
  };

  return tenantAPI;
}

/**
 * Get the active tenant context for an object
 * @param {any} obj - Object to check
 * @returns {Object|undefined} Tenant context or undefined
 */
export function getActiveTenantContext(obj) {
  return activeTenantContexts.get(obj);
}

/**
 * Get tenant ID from a proxied object
 * @param {any} proxy - Tenant proxy
 * @returns {string|undefined} Tenant ID or undefined
 */
export function getTenantId(proxy) {
  try {
    return proxy[TENANT_ID];
  } catch {
    return undefined;
  }
}

/**
 * Get raw target from a tenant proxy
 * @param {any} proxy - Tenant proxy
 * @returns {any} Raw target
 */
export function getRawTarget(proxy) {
  try {
    return proxy[RAW_TARGET] || proxy;
  } catch {
    return proxy;
  }
}

/**
 * Create multiple tenant contexts for the same target
 * @param {any} target - The underlying object
 * @param {Object} tenantsConfig - Map of tenantId -> config
 * @returns {Map} Map of tenantId -> tenant API
 */
export function createMultipleTenants(target, tenantsConfig) {
  const tenants = new Map();

  for (const [tenantId, config] of Object.entries(tenantsConfig)) {
    tenants.set(tenantId, createTenantContext(target, tenantId, config));
  }

  return tenants;
}
