/**
 * @module index
 * @description
 * Gall Classification: S₀ - Operational Primitive
 * Purpose: Implements exhaustive, receiptable operations without deferred logic or stubs.
 */
import { createContext } from '../context/context.js'
import { createProxy } from '../proxy/create-proxy.js'
import { createSimulationContext, registerSimulationInterceptors } from '../simulation/simulation-context.js'
import { createHash, randomUUID } from 'node:crypto'


/**
 * canonicalStringify
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export function canonicalStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj)
  }

  if (Array.isArray(obj)) {
    if (obj.length > 0 && typeof obj[0] === 'object') {
      const clone = [...obj]
      if (clone[0]['ocel:id']) {
        clone.sort((a, b) => (a['ocel:id'] > b['ocel:id'] ? 1 : -1))
      } else if (clone[0]['ocel:event-id'] && clone[0]['ocel:object-id']) {
        clone.sort((a, b) => {
          const keyA = `${a['ocel:event-id']}|${a['ocel:object-id']}|${a['ocel:qualifier']}`
          const keyB = `${b['ocel:event-id']}|${b['ocel:object-id']}|${b['ocel:qualifier']}`
          return keyA > keyB ? 1 : -1
        })
      } else if (clone[0]['ocel:object-id'] && clone[0]['ocel:field']) {
        clone.sort((a, b) => {
          const keyA = `${a['ocel:object-id']}|${a['ocel:time']}|${a['ocel:field']}`
          const keyB = `${b['ocel:object-id']}|${b['ocel:time']}|${b['ocel:field']}`
          return keyA > keyB ? 1 : -1
        })
      }
      return `[${clone.map((item) => canonicalStringify(item)).join(',')}]`
    }
    return `[${obj.map((item) => canonicalStringify(item)).join(',')}]`
  }

  const keys = Object.keys(obj).sort()
  return `{${keys.map((k) => `"${k}":${canonicalStringify(obj[k])}`).join(',')}}`
}


/**
 * OcelCollector
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export class OcelCollector {
  constructor() {
    this.state = this.createEmptyState()
    this.activeBranch = undefined
    this.activeEventCtx = createContext()
    this.registeredObjects = new Map()
    this.proxyInterfaces = []
  }

  createEmptyState() {
    return {
      eventTypes: {},
      objectTypes: {},
      events: [],
      objects: [],
      'event-object': [],
      'object-object': [],
      objectChanges: []
    }
  }

  getCurrentState() {
    return this.activeBranch || this.state
  }

  registerProxyInterface(proxyInterface, target) {
    this.proxyInterfaces.push({ proxyInterface, target })
  }

  registerObject(ref, target) {
    this.registeredObjects.set(target, ref)
    const state = this.getCurrentState()
    
    if (!state.objectTypes[ref.type]) {
      state.objectTypes[ref.type] = { attributes: [] }
    }
    
    // Check if it already exists
    if (!state.objects.some(o => o['ocel:id'] === ref.id)) {
      state.objects.push({
        'ocel:id': ref.id,
        'ocel:type': ref.type,
        'ocel:attributes': { ...target } // Initial snapshot
      })
    }
  }

  observe(observation) {
    const currentEvent = this.activeEventCtx.tryUse()
    if (!currentEvent) return // Ignore mutations not occurring within an event context

    const state = this.getCurrentState()
    state.objectChanges.push({
      'ocel:object-id': observation.objectId,
      'ocel:time': observation.timestamp,
      'ocel:field': observation.field,
      'ocel:value': observation.newValue
    })
  }

  event(contextParams, fn) {
    const eventId = contextParams.id || `evt_${Date.now()}_${randomUUID().slice(0, 8)}`
    const timestamp = contextParams.timestamp || new Date().toISOString()
    const state = this.getCurrentState()

    if (!state.eventTypes[contextParams.activity]) {
      state.eventTypes[contextParams.activity] = { attributes: ['actor', 'causationId', 'correlationId'] }
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
    })

    if (contextParams.objects) {
      for (const objRef of contextParams.objects) {
        state['event-object'].push({
          'ocel:event-id': eventId,
          'ocel:object-id': objRef.id,
          'ocel:qualifier': objRef.qualifier
        })
      }
    }

    return this.activeEventCtx.call({ eventId, activity: contextParams.activity }, fn)
  }

  async simulate(contextParams, fn) {
    const activeSims = []
    
    // Setup simulation context for ALL registered proxies
    for (const { proxyInterface, target } of this.proxyInterfaces) {
      const simCtx = createSimulationContext(target)
      registerSimulationInterceptors(proxyInterface, simCtx)
      activeSims.push(simCtx)
    }

    // Branch the OCEL state
    const previousBranch = this.activeBranch
    this.activeBranch = structuredClone(this.getCurrentState())

    let result
    let valid = true

    try {
      // Nest the speculations so all proxies are isolated simultaneously
      const runSpeculatively = (sims, finalFn) => {
        if (sims.length === 0) return finalFn()
        const sim = sims[0]
        return sim.speculate(() => runSpeculatively(sims.slice(1), finalFn))
      }

      result = runSpeculatively(activeSims, () => {
        return this.event(contextParams, fn)
      })
    } catch (error) {
      valid = false
      result = error
    }

    const speculativeOcel = this.activeBranch
    this.activeBranch = previousBranch // Restore previous context

    return {
      trajectory: { valid, result },
      speculativeOcel,
      settle: () => {
        for (const sim of activeSims) sim.commit()
        // Accept the speculative OCEL branch as reality
        if (this.activeBranch) {
          // If we were already in a branch, update the branch
          Object.assign(this.activeBranch, speculativeOcel)
        } else {
          this.state = speculativeOcel
        }
      },
      discard: () => {
        for (const sim of activeSims) sim.abort()
      }
    }
  }

  export() {
    return this.getCurrentState()
  }

  exportEnvelope(traceId = 'trace_1', spanId = 'span_1', previousReceiptHash = undefined) {
    return OcelCollector.createEnvelope(this.getCurrentState(), traceId, spanId, previousReceiptHash)
  }

  static createEnvelope(ocelState, traceId = 'trace_1', spanId = 'span_1', previousReceiptHash = undefined) {
    const canonicalOcel = canonicalStringify(ocelState)
    const batchHash = createHash('sha256').update(canonicalOcel).digest('hex')
    const receiptSeed = `${traceId}:${spanId}:${batchHash}:${previousReceiptHash || ''}`
    const receiptHash = createHash('sha256').update(receiptSeed).digest('hex')

    return {
      profile: "zoe.ocel2.v1",
      traceId,
      spanId,
      ocelBatchHash: batchHash,
      previousReceiptHash,
      receiptHash,
      ocel: ocelState
    }
  }
}


/**
 * createOcelProxy
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export function createOcelProxy(target, ref, collector) {
  const proxyInterface = createProxy(target)
  const { defineSetInterceptor, defineDeletePropertyInterceptor } = proxyInterface

  collector.registerProxyInterface(proxyInterface, target)
  collector.registerObject(ref, target)

  defineSetInterceptor((t, prop, value) => {
    const oldValue = Reflect.get(t, prop)
    
    // We observe the intent.
    collector.observe({
      trap: "set",
      objectId: ref.id,
      objectType: ref.type,
      field: String(prop),
      oldValue,
      newValue: value,
      timestamp: new Date().toISOString(),
    })

    return undefined // let standard proxy resolution proceed
  })

  defineDeletePropertyInterceptor((t, prop) => {
    const oldValue = Reflect.get(t, prop)

    collector.observe({
      trap: "deleteProperty",
      objectId: ref.id,
      objectType: ref.type,
      field: String(prop),
      oldValue,
      newValue: undefined,
      timestamp: new Date().toISOString(),
    })

    return undefined
  })

  return proxyInterface.proxy
}
