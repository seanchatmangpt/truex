/**
 * @module transactions
 * @description Unified transaction management across memory and SQLite.
 * Gall Classification: S3 (sqlite membrane primitives).
 * Implements atomic execution and rollback for graph deltas.
 */
import Database from "better-sqlite3";
import { 
  createProxy, 
  createTransactionContext, 
  registerTransactionInterceptors 
} from "../membrane.js";
import type { TruexHook } from "../hook.js";
import type { TruexContext } from "../context.js";
import type { GraphDelta } from "../runtime-law.js";

/**
 * TransactionalMembrane provides a unified transaction layer across 
 * a SQLite database and a JavaScript Proxy-based state.
 * 
 * It implements Jidoka (Toyota Production System) by ensuring that 
 * any failure in the hook execution or state transition triggers a 
 * complete rollback of both persistence and in-memory state.
 * 
 * Reference: Toyota Production System (Jidoka) and Gall Law S3.
 */
export class TransactionalMembrane<T extends object> {
  private db: Database.Database;
  private target: T;
  private txCtx: any;
  public readonly proxy: T;

  constructor(db: Database.Database, target: T, options: { ctx?: TruexContext } = {}) {
    this.db = db;
    this.target = target;
    this.txCtx = createTransactionContext(target, options);
    const proxyInterface = createProxy(target);
    registerTransactionInterceptors(proxyInterface, this.txCtx);
    this.proxy = proxyInterface.proxy;
  }

  /**
   * Begins a unified transaction.
   * Ensures that subsequent changes to the database and the proxy 
   * are atomic and can be rolled back together.
   */
  begin() {
    if (this.txCtx.isActive()) {
      throw new Error("Transaction already active");
    }
    
    // SQLite BEGIN
    this.db.prepare("BEGIN").run();
    
    // Enter JS transaction context
    // We manually set the context because we want explicit control over begin/commit/rollback
    this.txCtx._state.isActive = true;
    this.txCtx.context.set({ active: true, state: this.txCtx._state });
  }

  /**
   * Commits the unified transaction.
   * Persists changes to the database and finalizes the proxy state journal.
   */
  commit() {
    if (!this.txCtx.isActive()) {
      throw new Error("No active transaction to commit");
    }
    
    try {
      // SQLite COMMIT
      this.db.prepare("COMMIT").run();
      
      // JS Transaction COMMIT (clears journal and unsets context)
      this.txCtx.commit();
    } catch (error) {
      // If DB commit fails, we attempt a full rollback to preserve integrity
      this.rollback();
      throw error;
    }
  }

  /**
   * Rolls back the unified transaction.
   * Reverts changes in both the SQLite database and the JS Proxy state.
   */
  rollback() {
    if (!this.txCtx.isActive()) {
      return;
    }
    
    try {
      // SQLite ROLLBACK
      // Note: SQLite might have already rolled back automatically on certain errors
      if (this.db.inTransaction) {
        this.db.prepare("ROLLBACK").run();
      }
    } catch (error) {
      // Silently handle rollback errors to ensure we proceed to JS rollback
      console.error("[TransactionalMembrane] SQLite rollback failed:", error);
    }
    
    try {
      // JS Transaction ROLLBACK (reverts target changes and unsets context)
      this.txCtx.rollback();
    } catch (error) {
      console.error("[TransactionalMembrane] JS rollback failed:", error);
    }
  }

  /**
   * Executes a hook within a unified transaction.
   * This is the primary Jidoka-compliant entry point: if any part of the 
   * hook execution fails, the entire state (DB + Memory) is reverted.
   */
  execute(ctx: TruexContext, delta: GraphDelta, hook: TruexHook, previousReceiptHash?: string) {
    this.begin();
    try {
      const result = hook.execute(ctx, delta, previousReceiptHash);
      this.commit();
      return result;
    } catch (error) {
      this.rollback();
      throw error;
    }
  }

  /**
   * Helper to check if a transaction is currently active.
   */
  isActive(): boolean {
    return this.txCtx.isActive();
  }

  /**
   * Returns the underlying target state.
   * Use with caution as this bypasses the transactional membrane.
   */
  getTarget(): T {
    return this.target;
  }
}
