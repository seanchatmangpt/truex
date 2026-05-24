/**
 * @module create-proxy
 * @description
 * Gall Classification: S₀ - Operational Primitive
 * Purpose: Implements exhaustive, receiptable operations without deferred logic or stubs.
 */
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

const proxyCache = new WeakMap()
const proxyToTarget = new WeakMap()

const rawGlobalPrototypes = new Set([
  Object.prototype,
  Array.prototype,
  Function.prototype,
  Error.prototype,
  RegExp.prototype,
  Date.prototype,
  Map.prototype,
  Set.prototype,
  WeakMap.prototype,
  WeakSet.prototype,
  Promise.prototype
])

function isRawGlobalPrototype(proto) {
  if (!proto) return false
  if (rawGlobalPrototypes.has(proto)) return true
  if (proto.constructor && typeof proto.constructor === 'function') {
    const name = proto.constructor.name
    if (globalThis[name] && globalThis[name].prototype === proto) {
      return true
    }
  }
  return false
}

function isNonConfigurableNonWritable(target, prop) {
  try {
    const desc = Reflect.getOwnPropertyDescriptor(target, prop)
    return desc && !desc.configurable && !desc.writable
  } catch (e) {
    return false
  }
}

function wrapValue(val, contextData) {
  if (val === null || (typeof val !== 'object' && typeof val !== 'function')) {
    return val
  }
  if (typeof val === 'function' && val.prototype === undefined) {
    return val
  }
  if (proxyCache.has(val)) {
    return proxyCache.get(val).proxy
  }
  const childInterface = createProxy(val, contextData)
  return childInterface.proxy
}

function wrapDescriptor(desc, contextData) {
  if (!desc) return desc
  const wrapped = { ...desc }
  if ('value' in wrapped) {
    wrapped.value = wrapValue(wrapped.value, contextData)
  }
  if ('get' in wrapped && typeof wrapped.get === 'function') {
    wrapped.get = wrapValue(wrapped.get, contextData)
  }
  if ('set' in wrapped && typeof wrapped.set === 'function') {
    wrapped.set = wrapValue(wrapped.set, contextData)
  }
  return wrapped
}

/**
 * Creates a Proxy with dynamic interception using an isolated context.
 * @param {object} target - The target object to be proxied.
 * @param {object} [parentContext=null] - The parent context data to share.
 * @returns {object} Contains the proxy and a method to add interceptors.
 */
export function createProxy(target = {}, parentContext = null) {
  if (target === null || (typeof target !== 'object' && typeof target !== 'function')) {
    throw new TypeError('Proxy target must be an object or function')
  }

  if (proxyCache.has(target)) {
    return proxyCache.get(target)
  }

  const proxyContext = createContext()

  const contextData = parentContext || {
    getInterceptors: [],
    setInterceptors: [],
    hasInterceptors: [],
    deletePropertyInterceptors: [],
    definePropertyInterceptors: [],
    setPrototypeOfInterceptors: [],
    getPrototypeOfInterceptors: [],
    isExtensibleInterceptors: [],
    preventExtensionsInterceptors: [],
    ownKeysInterceptors: [],
    getOwnPropertyDescriptorInterceptors: [],
    applyInterceptors: [],
    constructInterceptors: [],
  }

  proxyContext.set(contextData, true)

  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      const context = proxyContext.use()
      const interceptors = context.getInterceptors
      const res = runInterceptors(interceptors, Reflect.get, target, prop, receiver)
      if (isNonConfigurableNonWritable(target, prop)) {
        return res
      }
      return wrapValue(res, context)
    },

    set(target, prop, value, receiver) {
      if (prop === '__proto__') {
        globalThis.__truex_trigger_jidoka('Prototype mutation/breakout attempted via __proto__ property write')
      }
      if (isRawGlobalPrototype(target)) {
        throw new TypeError('Mutation of raw global prototype is refused')
      }
      const interceptors = proxyContext.use().setInterceptors
      return runBooleanInterceptors(interceptors, Reflect.set, target, prop, value, receiver)
    },

    has(target, prop) {
      const interceptors = proxyContext.use().hasInterceptors
      return runBooleanInterceptors(interceptors, Reflect.has, target, prop)
    },

    deleteProperty(target, prop) {
      if (isRawGlobalPrototype(target)) {
        throw new TypeError('Mutation of raw global prototype is refused')
      }
      const interceptors = proxyContext.use().deletePropertyInterceptors
      return runBooleanInterceptors(interceptors, Reflect.deleteProperty, target, prop)
    },

    defineProperty(target, prop, descriptor) {
      if (prop === '__proto__') {
        globalThis.__truex_trigger_jidoka('Prototype mutation/breakout attempted via __proto__ property definition')
      }
      if (isRawGlobalPrototype(target)) {
        throw new TypeError('Mutation of raw global prototype is refused')
      }
      const interceptors = proxyContext.use().definePropertyInterceptors
      return runBooleanInterceptors(interceptors, Reflect.defineProperty, target, prop, descriptor)
    },

    setPrototypeOf(target, prototype) {
      const interceptors = proxyContext.use().setPrototypeOfInterceptors
      const triggerJidokaAndThrow = (msg) => {
        const activeTx = globalThis.__truex_active_transactions
        if (activeTx && activeTx.size > 0) {
          for (const tx of activeTx) {
            try {
              tx.rollback()
            } catch {
              // Ignore
            }
          }
          activeTx.clear()
        }
        throw new TypeError(msg)
      }

      if (interceptors && interceptors.length > 0) {
        const result = runBooleanInterceptors(
          interceptors,
          () => {
            triggerJidokaAndThrow('Prototype mutation via setPrototypeOf is refused')
          },
          target,
          prototype
        )
        if (result === false) {
          triggerJidokaAndThrow('Prototype mutation via setPrototypeOf is refused')
        }
        return result
      }
      triggerJidokaAndThrow('Prototype mutation via setPrototypeOf is refused')
    },

    getPrototypeOf(target) {
      const context = proxyContext.use()
      const interceptors = context.getPrototypeOfInterceptors
      const rawProto = runInterceptors(interceptors, Reflect.getPrototypeOf, target)
      if (rawProto === null) {
        return null
      }
      if (isRawGlobalPrototype(rawProto)) {
        throw new TypeError('Access to raw global prototype is refused')
      }
      return rawProto
    },

    isExtensible(target) {
      const interceptors = proxyContext.use().isExtensibleInterceptors
      return runBooleanInterceptors(interceptors, Reflect.isExtensible, target)
    },

    preventExtensions(target) {
      const interceptors = proxyContext.use().preventExtensionsInterceptors
      return runBooleanInterceptors(interceptors, Reflect.preventExtensions, target)
    },

    ownKeys(target) {
      const interceptors = proxyContext.use().ownKeysInterceptors
      return runInterceptors(interceptors, Reflect.ownKeys, target)
    },

    getOwnPropertyDescriptor(target, prop) {
      const context = proxyContext.use()
      const interceptors = context.getOwnPropertyDescriptorInterceptors
      const desc = runInterceptors(interceptors, Reflect.getOwnPropertyDescriptor, target, prop)
      return wrapDescriptor(desc, context)
    },

    apply(target, thisArg, argsList) {
      const context = proxyContext.use()
      const interceptors = context.applyInterceptors
      const unwrappedThis = proxyToTarget.get(thisArg) || thisArg
      try {
        const res = runInterceptors(interceptors, Reflect.apply, target, thisArg, argsList)
        return wrapValue(res, context)
      } catch (err) {
        if (err instanceof TypeError && unwrappedThis !== thisArg) {
          const res = runInterceptors(interceptors, Reflect.apply, target, unwrappedThis, argsList)
          return wrapValue(res, context)
        }
        throw err
      }
    },

    construct(target, argsList, newTarget) {
      const context = proxyContext.use()
      const interceptors = context.constructInterceptors
      const res = runInterceptors(interceptors, Reflect.construct, target, argsList, newTarget)
      return wrapValue(res, context)
    },
  })

  // Helper for Reflect.construct because Vitest might have some issues with Reflect.construct directly if interceptors do something weird
  function reflectConstructWrap(target, argsList, newTarget) {
    return Reflect.construct(target, argsList, newTarget)
  }

  const addInterceptor = (trap, interceptor) => {
    const validTraps = [
      'get',
      'set',
      'has',
      'deleteProperty',
      'defineProperty',
      'setPrototypeOf',
      'getPrototypeOf',
      'isExtensible',
      'preventExtensions',
      'ownKeys',
      'getOwnPropertyDescriptor',
      'apply',
      'construct',
    ]

    if (!validTraps.includes(trap)) {
      throw new TypeError(`Invalid trap name: "${trap}".`)
    }

    const context = proxyContext.tryUse()
    if (!context) {
      throw new Error(`Cannot add interceptor for "${trap}" without an active context.`)
    }

    const interceptorList = `${trap}Interceptors`
    if (!Array.isArray(context[interceptorList])) {
      throw new TypeError(`Trap "${trap}" is not initialized in the context.`)
    }

    context[interceptorList].push(interceptor)
  }

  // Define specialized methods
  const defineGetInterceptor = (interceptor) => addInterceptor('get', interceptor)
  const defineSetInterceptor = (interceptor) => addInterceptor('set', interceptor)
  const defineHasInterceptor = (interceptor) => addInterceptor('has', interceptor)
  const defineDeletePropertyInterceptor = (interceptor) => addInterceptor('deleteProperty', interceptor)
  const defineDefinePropertyInterceptor = (interceptor) => addInterceptor('defineProperty', interceptor)
  const defineSetPrototypeOfInterceptor = (interceptor) => addInterceptor('setPrototypeOf', interceptor)
  const defineGetPrototypeOfInterceptor = (interceptor) => addInterceptor('getPrototypeOf', interceptor)
  const defineIsExtensibleInterceptor = (interceptor) => addInterceptor('isExtensible', interceptor)
  const definePreventExtensionsInterceptor = (interceptor) => addInterceptor('preventExtensions', interceptor)
  const defineOwnKeysInterceptor = (interceptor) => addInterceptor('ownKeys', interceptor)
  const defineGetOwnPropertyDescriptorInterceptor = (interceptor) =>
    addInterceptor('getOwnPropertyDescriptor', interceptor)
  const defineApplyInterceptor = (interceptor) => addInterceptor('apply', interceptor)
  const defineConstructInterceptor = (interceptor) => addInterceptor('construct', interceptor)

  const proxyInterface = {
    proxy,
    addInterceptor,
    defineGetInterceptor,
    defineSetInterceptor,
    defineHasInterceptor,
    defineDeletePropertyInterceptor,
    defineDefinePropertyInterceptor,
    defineSetPrototypeOfInterceptor,
    defineGetPrototypeOfInterceptor,
    defineIsExtensibleInterceptor,
    definePreventExtensionsInterceptor,
    defineOwnKeysInterceptor,
    defineGetOwnPropertyDescriptorInterceptor,
    defineApplyInterceptor,
    defineConstructInterceptor,
  }

  proxyCache.set(target, proxyInterface)
  proxyCache.set(proxy, proxyInterface)
  proxyToTarget.set(proxy, target)

  return proxyInterface
}
