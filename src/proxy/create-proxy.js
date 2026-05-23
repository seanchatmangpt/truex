import { createContext } from '../context/context.js'
import { runInterceptors, runBooleanInterceptors } from './traps.js'

// Initialize Jidoka global trigger if not already defined
if (!globalThis.__truex_trigger_jidoka) {
  globalThis.__truex_trigger_jidoka = (errorMsg) => {
    const activeTx = globalThis.__truex_active_transactions
    if (activeTx && activeTx.size > 0) {
      for (const tx of activeTx) {
        try {
          tx.rollback()
        } catch {
          // Ignore errors during emergency rollback
        }
      }
      activeTx.clear()
    }
    const fatalError = new Error(`[JIDOKA FATAL ERROR] Execution halted: ${errorMsg}`)
    Object.freeze(fatalError)
    throw fatalError
  }
}

globalThis.__truex_active_transactions = globalThis.__truex_active_transactions || new Set()

/**
 * Creates a Proxy with dynamic interception using an isolated context.
 * @param {object} target - The target object to be proxied.
 * @returns {object} Contains the proxy and a method to add interceptors.
 */
export function createProxy(target = {}) {
  const proxyContext = createContext();

  // Initialize an isolated context for this Proxy
  proxyContext.set(
    {
      getInterceptors: [],
      setInterceptors: [],
      hasInterceptors: [],
      deletePropertyInterceptors: [], // Correctly named
      definePropertyInterceptors: [],
      setPrototypeOfInterceptors: [],
      getPrototypeOfInterceptors: [],
      isExtensibleInterceptors: [],
      preventExtensionsInterceptors: [],
      ownKeysInterceptors: [],
      getOwnPropertyDescriptorInterceptors: [],
      applyInterceptors: [],
      constructInterceptors: [],
    },
    true
  );

  // Create the proxy with all traps supported
  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      const interceptors = proxyContext.use().getInterceptors;
      return runInterceptors(interceptors, Reflect.get, target, prop, receiver);
    },

    set(target, prop, value, receiver) {
      if (prop === '__proto__') {
        globalThis.__truex_trigger_jidoka('Prototype mutation/breakout attempted via __proto__ property write')
      }
      const interceptors = proxyContext.use().setInterceptors;
      return runBooleanInterceptors(interceptors, Reflect.set, target, prop, value, receiver);
    },

    has(target, prop) {
      const interceptors = proxyContext.use().hasInterceptors;
      return runBooleanInterceptors(interceptors, Reflect.has, target, prop);
    },

    deleteProperty(target, prop) {
      const interceptors = proxyContext.use().deletePropertyInterceptors; // Matches naming
      return runBooleanInterceptors(interceptors, Reflect.deleteProperty, target, prop);
    },

    defineProperty(target, prop, descriptor) {
      if (prop === '__proto__') {
        globalThis.__truex_trigger_jidoka('Prototype mutation/breakout attempted via __proto__ property definition')
      }
      const interceptors = proxyContext.use().definePropertyInterceptors;
      return runBooleanInterceptors(interceptors, Reflect.defineProperty, target, prop, descriptor);
    },

    setPrototypeOf(target, prototype) {
      const interceptors = proxyContext.use().setPrototypeOfInterceptors;
      if (interceptors && interceptors.length > 0) {
        try {
          const result = runBooleanInterceptors(interceptors, Reflect.setPrototypeOf, target, prototype);
          if (result === false) {
            globalThis.__truex_trigger_jidoka('Prototype mutation/breakout attempted via setPrototypeOf');
          }
          return result;
        } catch (error) {
          globalThis.__truex_trigger_jidoka(`Prototype mutation/breakout attempted via setPrototypeOf: ${error.message}`);
        }
      }
      globalThis.__truex_trigger_jidoka('Prototype mutation/breakout attempted via setPrototypeOf');
    },

    getPrototypeOf(target) {
      const interceptors = proxyContext.use().getPrototypeOfInterceptors;
      return runInterceptors(interceptors, Reflect.getPrototypeOf, target);
    },

    isExtensible(target) {
      const interceptors = proxyContext.use().isExtensibleInterceptors;
      return runBooleanInterceptors(interceptors, Reflect.isExtensible, target);
    },

    preventExtensions(target) {
      const interceptors = proxyContext.use().preventExtensionsInterceptors;
      return runBooleanInterceptors(interceptors, Reflect.preventExtensions, target);
    },

    ownKeys(target) {
      const interceptors = proxyContext.use().ownKeysInterceptors;
      return runInterceptors(interceptors, Reflect.ownKeys, target);
    },

    getOwnPropertyDescriptor(target, prop) {
      const interceptors = proxyContext.use().getOwnPropertyDescriptorInterceptors;
      return runInterceptors(interceptors, Reflect.getOwnPropertyDescriptor, target, prop);
    },

    apply(target, thisArg, argsList) {
      const interceptors = proxyContext.use().applyInterceptors;
      return runInterceptors(interceptors, Reflect.apply, target, thisArg, argsList);
    },

    construct(target, argsList, newTarget) {
      const interceptors = proxyContext.use().constructInterceptors;
      return runInterceptors(interceptors, Reflect.construct, target, argsList, newTarget);
    },
  });

  const addInterceptor = (trap, interceptor) => {
    const validTraps = [
      'get',
      'set',
      'has',
      'deleteProperty', // Full name
      'defineProperty',
      'setPrototypeOf',
      'getPrototypeOf',
      'isExtensible',
      'preventExtensions',
      'ownKeys',
      'getOwnPropertyDescriptor',
      'apply',
      'construct',
    ];

    if (!validTraps.includes(trap)) {
      throw new TypeError(`Invalid trap name: "${trap}".`);
    }

    const context = proxyContext.tryUse();
    if (!context) {
      throw new Error(`Cannot add interceptor for "${trap}" without an active context.`);
    }

    const interceptorList = `${trap}Interceptors`;
    if (!Array.isArray(context[interceptorList])) {
      throw new TypeError(`Trap "${trap}" is not initialized in the context.`);
    }

    context[interceptorList].push(interceptor);
  };

  // Define specialized methods
  const defineGetInterceptor = (interceptor) => addInterceptor('get', interceptor);
  const defineSetInterceptor = (interceptor) => addInterceptor('set', interceptor);
  const defineHasInterceptor = (interceptor) => addInterceptor('has', interceptor);
  const defineDeletePropertyInterceptor = (interceptor) => addInterceptor('deleteProperty', interceptor); // Correctly named
  const defineDefinePropertyInterceptor = (interceptor) => addInterceptor('defineProperty', interceptor);
  const defineSetPrototypeOfInterceptor = (interceptor) => addInterceptor('setPrototypeOf', interceptor);
  const defineGetPrototypeOfInterceptor = (interceptor) => addInterceptor('getPrototypeOf', interceptor);
  const defineIsExtensibleInterceptor = (interceptor) => addInterceptor('isExtensible', interceptor);
  const definePreventExtensionsInterceptor = (interceptor) => addInterceptor('preventExtensions', interceptor);
  const defineOwnKeysInterceptor = (interceptor) => addInterceptor('ownKeys', interceptor);
  const defineGetOwnPropertyDescriptorInterceptor = (interceptor) =>
    addInterceptor('getOwnPropertyDescriptor', interceptor);
  const defineApplyInterceptor = (interceptor) => addInterceptor('apply', interceptor);
  const defineConstructInterceptor = (interceptor) => addInterceptor('construct', interceptor);

  return {
    proxy,
    addInterceptor,
    defineGetInterceptor,
    defineSetInterceptor,
    defineHasInterceptor,
    defineDeletePropertyInterceptor, // Full name method
    defineDefinePropertyInterceptor,
    defineSetPrototypeOfInterceptor,
    defineGetPrototypeOfInterceptor,
    defineIsExtensibleInterceptor,
    definePreventExtensionsInterceptor,
    defineOwnKeysInterceptor,
    defineGetOwnPropertyDescriptorInterceptor,
    defineApplyInterceptor,
    defineConstructInterceptor,
  };
}
