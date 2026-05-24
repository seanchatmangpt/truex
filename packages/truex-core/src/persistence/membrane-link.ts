/**
 * @module membrane-link
 * @description Bridges the virtual proxy membrane with the SQLite persistence layer.
 * Gall Classification: S3 (sqlite membrane primitives).
 * Provides atomic transactions across memory and persistence.
 */
import type { Database } from 'better-sqlite3';
import { createTransactionContext, registerTransactionInterceptors } from '../membrane.js';

/**
 * MembraneLink provides a unified transaction boundary between 
 * the virtual proxy membrane and the physical SQLite persistence layer.
 * 
 * It ensures that any mutation to a proxied object and its corresponding 
 * persistence in SQLite are treated as a single atomic operation.
 */
export class MembraneLink {
  private txCtx: any;

  /**
   * Creates a new MembraneLink.
   * 
   * @param db - The better-sqlite3 Database instance.
   * @param proxyInterface - The proxy interface returned by createProxy().
   * @param target - The underlying target object wrapped by the proxy.
   */
  constructor(
    private db: Database,
    private proxyInterface: any,
    private target: any
  ) {
    this.txCtx = createTransactionContext(target);
    registerTransactionInterceptors(proxyInterface, this.txCtx);
  }

  /**
   * Executes the provided function within an atomic transaction that spans
   * both the in-memory proxy state and the on-disk SQLite state.
   * 
   * If any error occurs within the function or during the SQLite commit,
   * the proxy state is automatically rolled back to its pre-transaction state.
   * 
   * Note: This operation is synchronous, as better-sqlite3 transactions 
   * must be executed synchronously.
   * 
   * @param fn - The function to execute within the transaction.
   * @returns The result of the function.
   * @throws Any error thrown by the function or the database.
   */
  execute<T>(fn: () => T): T {
    // Determine if this is the top-level transaction for this membrane.
    // Nested calls to execute on the same MembraneLink will reuse the existing
    // transaction context.
    const isTopLevel = !this.txCtx.isActive();

    // We wrap the entire process in a better-sqlite3 transaction.
    // In better-sqlite3, the transaction function is synchronous.
    // If we are already in a transaction, better-sqlite3 uses SAVEPOINTs.
    const sqliteTransaction = this.db.transaction(() => {
      // Enter the Transactional Membrane context.
      // createTransactionContext.call() handles nesting by returning the function
      // if already active.
      return this.txCtx.call(() => {
        try {
          return fn();
        } catch (error) {
          // If the user-provided function fails, we rollback the 
          // virtual proxy state immediately.
          if (this.txCtx.isActive()) {
            this.txCtx.rollback();
          }
          // Re-throwing ensures the SQLite transaction also rolls back.
          throw error;
        }
      });
    });

    try {
      const result = sqliteTransaction();
      
      // Only the top-level transaction should perform the final commit
      // to the proxy mutation journal.
      if (isTopLevel) {
        this.txCtx.commit();
      }
      
      return result;
    } catch (error) {
      // If the SQLite transaction failed (e.g., due to a constraint violation 
      // during the internal commit phase), we must ensure the proxy state
      // is also rolled back if it hasn't been already.
      if (isTopLevel && this.txCtx.isActive()) {
        try {
          this.txCtx.rollback();
        } catch {
          // Ignore secondary errors during emergency rollback
        }
      }
      throw error;
    }
  }

  /**
   * Returns the underlying Transactional Membrane context.
   * This can be used for manual inspection of the journal or dry-runs.
   */
  getTransactionContext() {
    return this.txCtx;
  }
}

/**
 * Factory function to create a linked membrane transaction boundary.
 * 
 * @param db - The better-sqlite3 Database instance.
 * @param proxyInterface - The proxy interface returned by createProxy().
 * @param target - The underlying target object wrapped by the proxy.
 * @returns A new MembraneLink instance.
 */
export function createMembraneLink(db: Database, proxyInterface: any, target: any) {
  return new MembraneLink(db, proxyInterface, target);
}
