/**
 * @module powl-context
 * @description
 * Gall Classification: S₁ - Operational Primitive
 * Purpose: Implements the Partially Ordered Workflow Language (POWL) v2 Governor.
 */
import { createContext } from '../context/context.js'

/**
 * State machine for mathematical POWL graph traversal.
 */
export class PowlStateMachine {
  constructor(rootNode) {
    if (!rootNode || !rootNode.id) {
      throw new Error('Invalid POWL root node provided')
    }
    this.rootNode = rootNode
    this.completed = new Set()
    this.choiceTokens = new Map()
    this.initializeState()
  }

  initializeState() {
    this.completed.clear()
    this.choiceTokens.clear()
    this.propagate()
  }

  findNode(id, current = this.rootNode) {
    if (current.id === id) return current
    if (current.nodes) {
      for (const child of current.nodes) {
        const found = this.findNode(id, child)
        if (found) return found
      }
    }
    return null
  }

  isNodeCompleted(nodeId) {
    return this.completed.has(nodeId)
  }

  resetNodeCompletion(nodeId) {
    this.completed.delete(nodeId)
    const node = this.findNode(nodeId)
    if (node && node.nodes) {
      for (const child of node.nodes) {
        this.resetNodeCompletion(child.id)
      }
    }
  }

  propagate() {
    let changed = true
    let iterations = 0
    const maxIterations = 1000 // Prevent infinite recursion

    while (changed && iterations < maxIterations) {
      changed = false
      iterations++

      // 1. Propagate completions of compound nodes
      if (this.propagateCompletions(this.rootNode)) {
        changed = true
      }

      // 2. Automatically execute enabled silent nodes
      const enabled = this.getEnabledLeafNodes(this.rootNode)
      const silentEnabled = enabled.filter(n => n.type === 'silent')
      for (const s of silentEnabled) {
        if (!this.completed.has(s.id)) {
          this.resetNodeCompletion(s.id)
          this.completed.add(s.id)
          this.transitionTokens(this.rootNode, s.id)
          changed = true
        }
      }
    }
  }

  propagateCompletions(node) {
    if (this.completed.has(node.id)) return false

    if (node.type === 'partial_order') {
      const allChildrenCompleted = node.nodes.every(child => this.completed.has(child.id))
      if (allChildrenCompleted) {
        this.completed.add(node.id)
        this.transitionTokens(this.rootNode, node.id)
        return true
      }
    } else if (node.type === 'choice_graph') {
      if (this.completed.has(node.end)) {
        this.completed.add(node.id)
        this.transitionTokens(this.rootNode, node.id)
        return true
      }
    }

    let changed = false
    if (node.nodes) {
      for (const child of node.nodes) {
        if (this.propagateCompletions(child)) {
          changed = true
        }
      }
    }
    return changed
  }

  getEnabledLeafNodes(node = this.rootNode) {
    const enabled = []
    const collect = (curr) => {
      if (this.completed.has(curr.id)) return

      if (curr.type === 'activity' || curr.type === 'silent') {
        enabled.push(curr)
        return
      }

      if (curr.type === 'partial_order') {
        for (const child of curr.nodes) {
          const incomingEdges = curr.edges.filter(e => e.to === child.id)
          const predecessorsCompleted = incomingEdges.every(e => this.completed.has(e.from))
          if (predecessorsCompleted) {
            collect(child)
          }
        }
      } else if (curr.type === 'choice_graph') {
        if (!this.choiceTokens.has(curr.id)) {
          this.choiceTokens.set(curr.id, new Set([curr.start]))
        }
        const tokens = this.choiceTokens.get(curr.id)
        for (const activeNodeId of tokens) {
          const child = curr.nodes.find(n => n.id === activeNodeId)
          if (child) {
            if (!this.completed.has(child.id)) {
              collect(child)
            } else {
              const outgoing = curr.edges.filter(e => e.from === activeNodeId)
              for (const edge of outgoing) {
                const targetChild = curr.nodes.find(n => n.id === edge.to)
                if (targetChild && !this.completed.has(targetChild.id)) {
                  collect(targetChild)
                }
              }
            }
          }
        }
      }
    }

    collect(node)
    return enabled
  }

  isAdmissible(activityName) {
    const enabled = this.getEnabledLeafNodes(this.rootNode)
    return enabled.some(
      n => n.type === 'activity' && (n.id === activityName || n.label === activityName)
    )
  }

  executeActivity(activityName) {
    const enabled = this.getEnabledLeafNodes(this.rootNode)
    const targetNode = enabled.find(
      n => n.type === 'activity' && (n.id === activityName || n.label === activityName)
    )

    if (!targetNode) {
      throw new Error(
        `[JIDOKA FATAL ERROR] POWL state machine violation: transition to '${activityName}' is mathematically inadmissible.`
      )
    }

    this.resetNodeCompletion(targetNode.id)
    this.completed.add(targetNode.id)
    this.transitionTokens(this.rootNode, targetNode.id)
    this.propagate()
  }

  transitionTokens(node, executedId) {
    if (node.type === 'choice_graph') {
      if (!this.choiceTokens.has(node.id)) {
        this.choiceTokens.set(node.id, new Set([node.start]))
      }
      const tokens = this.choiceTokens.get(node.id)

      for (const activeId of Array.from(tokens)) {
        const outgoingEdges = node.edges.filter(e => e.from === activeId)
        const activeEdge = outgoingEdges.find(e => e.to === executedId)
        if (activeEdge) {
          tokens.delete(activeId)
          tokens.add(executedId)
        }
      }

      // Reset completion status for any successor of a completed active token
      for (const activeId of Array.from(tokens)) {
        if (this.completed.has(activeId)) {
          const outgoingEdges = node.edges.filter(e => e.from === activeId)
          for (const edge of outgoingEdges) {
            if (this.completed.has(edge.to)) {
              this.resetNodeCompletion(edge.to)
            }
          }
        }
      }
    }

    if (node.nodes) {
      for (const child of node.nodes) {
        this.transitionTokens(child, executedId)
      }
    }
  }

  getStateSnapshot() {
    return {
      completed: Array.from(this.completed),
      choiceTokens: Array.from(this.choiceTokens.entries()).map(([id, set]) => [id, Array.from(set)])
    }
  }

  restoreStateSnapshot(snapshot) {
    this.completed = new Set(snapshot.completed)
    this.choiceTokens = new Map(snapshot.choiceTokens.map(([id, arr]) => [id, new Set(arr)]))
  }
}

/**
 * Creates a POWL context with specified workflow rules.
 *
 * @param {object|Function} target - The target object or function
 * @param {object} powlWorkflow - The POWL node graph workflow
 * @returns {object} POWL context with enforcement API
 */
export function createPowlContext(target, powlWorkflow) {
  const powlContext = createContext()
  const stateMachine = new PowlStateMachine(powlWorkflow)

  const contextState = {
    target,
    workflow: powlWorkflow,
    stateMachine
  }

  function validateCall(activityName) {
    try {
      stateMachine.executeActivity(activityName)
      return { valid: true }
    } catch (error) {
      return { valid: false, reason: error.message }
    }
  }

  function call(fn) {
    return powlContext.call(contextState, fn)
  }

  return {
    call,
    validateCall,
    getStateMachine: () => stateMachine,
    context: powlContext,
    use: () => powlContext.use(),
    tryUse: () => powlContext.tryUse(),
    set: (replace = false) => powlContext.set(contextState, replace),
    unset: () => powlContext.unset(),
    _state: contextState
  }
}

/**
 * Creates an apply interceptor that enforces POWL dynamic workflow execution.
 *
 * @param {object} powlCtx - The POWL context
 * @returns {Function} Interceptor function for apply trap
 */
export function createPowlApplyInterceptor(powlCtx) {
  return (target, thisArg, argsList) => {
    const ctx = powlCtx.context.tryUse()
    if (!ctx) {
      return undefined
    }

    const activityName = target.name || 'anonymous'
    const stateMachine = ctx.stateMachine

    const node = stateMachine.findNode(activityName)
    if (!node) {
      return undefined
    }

    try {
      stateMachine.executeActivity(activityName)
    } catch (error) {
      globalThis.__truex_trigger_jidoka(error.message)
    }

    return Reflect.apply(target, thisArg, argsList)
  }
}

/**
 * Creates a construct interceptor that enforces POWL dynamic workflow execution.
 *
 * @param {object} powlCtx - The POWL context
 * @returns {Function} Interceptor function for construct trap
 */
export function createPowlConstructInterceptor(powlCtx) {
  return (target, argsList, newTarget) => {
    const ctx = powlCtx.context.tryUse()
    if (!ctx) {
      return undefined
    }

    const activityName = target.name || 'Constructor'
    const stateMachine = ctx.stateMachine

    const node = stateMachine.findNode(activityName)
    if (!node) {
      return undefined
    }

    try {
      stateMachine.executeActivity(activityName)
    } catch (error) {
      globalThis.__truex_trigger_jidoka(error.message)
    }

    return Reflect.construct(target, argsList, newTarget)
  }
}

/**
 * Helper function to register all POWL interceptors with a proxy.
 *
 * @param {object} proxyInterface - The proxy interface returned by createProxy
 * @param {object} powlCtx - The POWL context
 */
export function registerPowlInterceptors(proxyInterface, powlCtx) {
  proxyInterface.defineApplyInterceptor(createPowlApplyInterceptor(powlCtx))
  proxyInterface.defineConstructInterceptor(createPowlConstructInterceptor(powlCtx))
}
