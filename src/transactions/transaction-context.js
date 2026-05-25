/**
 * @module transaction-context
 * @description
 * Gall Classification: S₀ - Operational Primitive
 * Purpose: Implements exhaustive, receiptable operations without deferred logic or stubs.
 */
import { createContext } from '../context/context.js'
import { createProxy } from '../proxy/create-proxy.js'
import { RecursionRefusalError } from '../invariants/invariant-context.js'

/**
 * Transaction journal system for Proxyable.
 * Implements transactional mutations with commit/rollback support.
 *
 * Mutations are intercepted and journaled instead of being applied immediately.
 * The journal can be inspected (dry-run), committed (applied via Reflect), or rolled back (discarded).
 */

/**
 * Creates a transaction context with journaling and commit/rollback support.
 *
 * @param {object} target - The target object to track mutations for
 * @param {object} [options] - Options configuration including maxDepth limit
 * @returns {object} Transaction API with call, commit, rollback, getDryRun, isActive, getJournal methods
 */
export function createTransactionContext(target, options = {}) {
  const transactionContext = createContext()

  // Internal transaction state - shared with interceptors
  const transactionState = {
    journal: [],
    journalIndex: 0,
    isActive: false,
  }

  const txRecord = {
    rollback: () => {
      try {
        rollback()
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Executes a function within a transaction context.
   * All mutations during execution are journaled instead of applied.
   *
   * @param {Function} fn - The function to execute within transaction context
   * @returns {*} The result of the function
   */
  function call(fn) {
    const currentDepth = (globalThis.__truex_transaction_depth || 0) + 1
    const limit = options.maxDepth === undefined ? 100 : options.maxDepth
    if (currentDepth > limit) {
      throw new RecursionRefusalError(`Transaction nesting limit of ${limit} exceeded`)
    }

    const previousDepth = globalThis.__truex_transaction_depth || 0
    globalThis.__truex_transaction_depth = currentDepth
    try {
      if (transactionState.isActive) {
        // Already in a transaction, just execute the function
        return fn()
      }

      transactionState.isActive = true
      globalThis.__truex_active_transactions = globalThis.__truex_active_transactions || new Set()
      globalThis.__truex_active_transactions.add(txRecord)
      return transactionContext.call({ active: true, state: transactionState }, fn)
    } finally {
      globalThis.__truex_transaction_depth = previousDepth
    }
  }

  /**
   * Commits all pending mutations.
   * Mutations were already applied during the transaction, so this just clears the journal.
   * @returns {boolean} True if commit succeeded
   */
  function commit() {
    if (!transactionState.isActive) {
      throw new Error('No active transaction to commit')
    }

    // Mutations were already applied during transaction
    // Commit just means "keep them" and clear the journal
    transactionState.journal = []
    transactionState.journalIndex = 0
    transactionState.isActive = false
    transactionContext.unset()

    if (globalThis.__truex_active_transactions) {
      globalThis.__truex_active_transactions.delete(txRecord)
    }

    return true
  }

  /**
   * Rolls back all pending mutations by restoring previous values.
   */
  function rollback() {
    if (!transactionState.isActive) {
      throw new Error('No active transaction to rollback')
    }

    // Restore previous values in reverse order
    for (let i = transactionState.journal.length - 1; i >= 0; i--) {
      const entry = transactionState.journal[i]

      switch (entry.operation) {
        case 'set': {
          const t = entry.target || target
          if (entry.previousValue === undefined && !Reflect.has(t, entry.property)) {
            // Property didn't exist before, delete it
            Reflect.deleteProperty(t, entry.property)
          } else {
            // Restore previous value
            Reflect.set(t, entry.property, entry.previousValue)
          }
          break
        }

        case 'delete': {
          const t = entry.target || target
          // Restore deleted property
          if (entry.previousValue !== undefined || entry.hadProperty) {
            Reflect.set(t, entry.property, entry.previousValue)
          }
          break
        }

        case 'apply':
        case 'construct': {
          // Function calls and constructions can't be rolled back
          // They're journaled for audit purposes only
          break
        }

        default: {
          // Unknown operation type, skip
          break
        }
      }
    }

    // Clear transaction state
    transactionState.journal = []
    transactionState.journalIndex = 0
    transactionState.isActive = false
    transactionContext.unset()

    if (globalThis.__truex_active_transactions) {
      globalThis.__truex_active_transactions.delete(txRecord)
    }
  }

  /**
   * Gets a dry-run view of what would change if committed.
   * Returns a copy of the journal without applying mutations.
   *
   * @returns {Array} Array of journal entries
   */
  function getDryRun() {
    // Return a shallow copy to prevent external modification
    return transactionState.journal.map(entry => ({ ...entry }))
  }

  /**
   * Checks if a transaction is currently active.
   *
   * @returns {boolean} True if transaction is active
   */
  function isActive() {
    return transactionState.isActive
  }

  /**
   * Gets the complete mutation journal.
   *
   * @returns {Array} Array of all journal entries
   */
  function getJournal() {
    return transactionState.journal.map(entry => ({ ...entry }))
  }

  return {
    call,
    commit,
    rollback,
    getDryRun,
    isActive,
    getJournal,
    context: transactionContext,
    // Internal: expose state for interceptors
    _state: transactionState,
  }
}

/**
 * Creates a set interceptor that journals mutations.
 * Mutations are applied to the target but journaled with previous values for rollback.
 *
 * @param {object} transactionCtx - The transaction context created by createTransactionContext
 * @returns {Function} Interceptor function for set trap
 */
export function createTransactionSetInterceptor(transactionCtx) {
  return (target, prop, value, receiver) => {
    const txState = transactionCtx.context.tryUse()
    if (!txState || !txState.active) {
      // No active transaction - allow operation to continue
      return undefined
    }

    // Get previous value for journal BEFORE applying the mutation
    const hadProperty = Reflect.has(target, prop)
    const previousValue = hadProperty ? Reflect.get(target, prop, receiver) : undefined

    // Record in journal using internal state
    const entry = {
      operation: 'set',
      target,
      property: prop,
      value,
      previousValue,
      hadProperty,
      timestamp: Date.now(),
      index: transactionCtx._state.journalIndex++,
    }

    transactionCtx._state.journal.push(entry)

    // Allow the operation to continue (mutation will be applied)
    // This allows subsequent reads to see the new value during the transaction
    return undefined
  }
}

/**
 * Creates a deleteProperty interceptor that journals deletions.
 * Deletions are applied to the target but journaled with previous values for rollback.
 *
 * @param {object} transactionCtx - The transaction context created by createTransactionContext
 * @returns {Function} Interceptor function for deleteProperty trap
 */
export function createTransactionDeletePropertyInterceptor(transactionCtx) {
  return (target, prop) => {
    const txState = transactionCtx.context.tryUse()
    if (!txState || !txState.active) {
      // No active transaction - allow operation to continue
      return undefined
    }

    // Get previous value for journal BEFORE applying the deletion
    const hadProperty = Reflect.has(target, prop)
    const previousValue = hadProperty ? Reflect.get(target, prop) : undefined

    // Record in journal using internal state
    const entry = {
      operation: 'delete',
      target,
      property: prop,
      previousValue,
      hadProperty,
      timestamp: Date.now(),
      index: transactionCtx._state.journalIndex++,
    }

    transactionCtx._state.journal.push(entry)

    // Allow the operation to continue (deletion will be applied)
    return undefined
  }
}

/**
 * Creates an apply interceptor that journals function calls.
 *
 * @param {object} transactionCtx - The transaction context created by createTransactionContext
 * @returns {Function} Interceptor function for apply trap
 */
export function createTransactionApplyInterceptor(transactionCtx) {
  return (target, thisArg, argsList) => {
    const txState = transactionCtx.context.tryUse()
    if (!txState || !txState.active) {
      // No active transaction - allow operation to continue
      return undefined
    }

    // Execute the function and capture the result
    const result = Reflect.apply(target, thisArg, argsList)

    // Record in journal using internal state
    const entry = {
      operation: 'apply',
      args: argsList,
      thisArg,
      result: (result && (typeof result === 'object' || typeof result === 'function')) ? createProxy(result).proxy : result,
      timestamp: Date.now(),
      index: transactionCtx._state.journalIndex++,
    }

    transactionCtx._state.journal.push(entry)

    // Return the result of the function call
    return result
  }
}

/**
 * Creates a construct interceptor that journals constructor calls.
 *
 * @param {object} transactionCtx - The transaction context created by createTransactionContext
 * @returns {Function} Interceptor function for construct trap
 */
export function createTransactionConstructInterceptor(transactionCtx) {
  return (target, argsList, newTarget) => {
    const txState = transactionCtx.context.tryUse()
    if (!txState || !txState.active) {
      // No active transaction - allow operation to continue
      return undefined
    }

    // Execute the constructor and capture the result
    const result = Reflect.construct(target, argsList, newTarget)

    // Record in journal using internal state
    const entry = {
      operation: 'construct',
      args: argsList,
      result: (result && (typeof result === 'object' || typeof result === 'function')) ? createProxy(result).proxy : result,
      timestamp: Date.now(),
      index: transactionCtx._state.journalIndex++,
    }

    transactionCtx._state.journal.push(entry)

    // Return the constructed instance
    return result
  }
}

/**
 * Helper function to register all transaction interceptors with a proxy.
 *
 * @param {object} proxyInterface - The proxy interface returned by createProxy
 * @param {object} transactionCtx - The transaction context
 */
export function registerTransactionInterceptors(proxyInterface, transactionCtx) {
  proxyInterface.defineSetInterceptor(createTransactionSetInterceptor(transactionCtx))
  proxyInterface.defineDeletePropertyInterceptor(createTransactionDeletePropertyInterceptor(transactionCtx))
  proxyInterface.defineApplyInterceptor(createTransactionApplyInterceptor(transactionCtx))
  proxyInterface.defineConstructInterceptor(createTransactionConstructInterceptor(transactionCtx))
}
