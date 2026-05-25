import type { Database } from 'better-sqlite3';
import { SQLiteLockManager } from '../persistence/lock.js';
import { SQLiteReceiptStore } from '../persistence/receipt-store.js';
import { WasmWorkerPool } from './wasm-worker-pool.js';
import { hash } from '../hash.js';
import { createDeterministicContext } from '../context.js';
import { createReceipt } from '../receipt.js';
import type { Receipt } from '../runtime-law.js';

export class TruexWasmBridge {
  private lockManager: SQLiteLockManager;
  private receiptStore: SQLiteReceiptStore;

  constructor(
    private db: Database,
    private workerPool: WasmWorkerPool
  ) {
    this.lockManager = new SQLiteLockManager(db);
    this.receiptStore = new SQLiteReceiptStore(db);
  }

  /**
   * Executes a WASM algorithm in the background and signs the result to the SQLite WAL.
   * Complies with the 3 Core Rules:
   * 1. Reads inputs outside transaction.
   * 2. Runs WASM in worker threads.
   * 3. Registers transaction only for writing.
   */
  async executeWasmTask(tenantId: string, algorithm: string, payload: any): Promise<{ receipt: Receipt; result: any }> {
    // Phase 1: Input Read and Validation (Outside write transaction)
    // Create a deterministic context for this computation step using a seed derived from the payload
    const payloadHash = hash(payload);
    // Convert hex hash prefix to a numeric seed
    const seedPart = payloadHash.slice(0, 8);
    const seed = parseInt(seedPart, 16);
    if (isNaN(seed)) {
      throw new Error(`Failed to derive deterministic seed from payload hash: ${seedPart}`);
    }
    const ctx = createDeterministicContext(seed);

    // Phase 2: Compute Phase (WASM inside Worker Pool, no DB locks held)
    const taskResult = await this.workerPool.execute({
      tenantId,
      algorithm,
      payload
    });

    if (!taskResult.success) {
      throw new Error(`WASM execution failed: ${taskResult.error}`);
    }

    // Phase 3: Write Phase (IMMEDIATE Transaction for Durability & Concurrency Protection)
    const receipt = await this.lockManager.executeExclusive(() => {
      const outputHash = hash(taskResult.result);
      const latestReceipt = this.receiptStore.latest();
      const previousReceiptHash = latestReceipt ? latestReceipt.receiptHash : null;

      const newReceipt = createReceipt(
        ctx,
        `evt_${algorithm}_${tenantId}`,
        `delta_${tenantId}`,
        payloadHash,
        outputHash,
        previousReceiptHash,
        'confirmed'
      );

      // Persist to SQLite
      this.receiptStore.append(newReceipt);

      return newReceipt;
    });

    return {
      receipt,
      result: taskResult.result
    };
  }
}
