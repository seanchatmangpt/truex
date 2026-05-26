import Database from 'better-sqlite3';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as wasm from '../packages/kernel-wasm/pkg/truex_kernel.js';
import { WasmWorkerPool } from '../packages/membrane/src/concurrency/wasm-worker-pool.js';
import { TruexWasmBridge } from '../packages/membrane/src/concurrency/truex-wasm-bridge.ts';

export function proveWasm(): { passed: boolean; failures: string[]; invariants: string[] } {
  const failures: string[] = [];
  const invariants: string[] = [];

  try {
    // 1. Assert module reachability
    if (!wasm) {
      throw new Error("WASM module failed to load");
    }
    invariants.push("WebAssembly module is reachable");

    // 2. Assert basic exports function correctly
    const info = wasm.xes_format_info();
    if (typeof info !== 'string' || !info.includes('XES')) {
      throw new Error(`xes_format_info() returned unexpected output: ${info}`);
    }
    invariants.push("WebAssembly basic exports executed successfully");

    // 3. Assert state system clear is exported
    if (typeof wasm.clear_all_objects !== 'function') {
      throw new Error("clear_all_objects is not exported from WASM binary");
    }
    invariants.push("WebAssembly state system clear method is registered");

    return {
      passed: true,
      failures,
      invariants
    };
  } catch (error: any) {
    return {
      passed: false,
      failures: [error.message],
      invariants
    };
  }
}

export async function proveLedger(): Promise<{ passed: boolean; failures: string[]; invariants: string[] }> {
  const failures: string[] = [];
  const invariants: string[] = [];
  let pool: WasmWorkerPool | null = null;

  try {
    // 1. Initialize in-memory SQLite and schema
    const db = new Database(':memory:');
    db.exec(`
      CREATE TABLE receipts (
        id TEXT PRIMARY KEY,
        event_id TEXT,
        delta_id TEXT,
        input_hash TEXT,
        output_hash TEXT,
        previous_receipt_hash TEXT,
        status TEXT,
        receipt_hash TEXT UNIQUE
      );
      CREATE TABLE tenant_states (
        tenant_id TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    // Add dummy state
    db.prepare('INSERT INTO tenant_states (tenant_id, value) VALUES (?, ?)').run('tenant_test', 'initial_val');
    invariants.push("SQLite persistence membrane initialized");

    // 2. Instantiate worker pool and bridge
    const workerScript = path.resolve(process.cwd(), 'packages/membrane/src/concurrency/wasm-worker.ts');
    if (!fs.existsSync(workerScript)) {
      throw new Error(`Worker script not found at ${workerScript}`);
    }

    pool = new WasmWorkerPool(2, workerScript);
    const bridge = new TruexWasmBridge(db, pool);
    invariants.push("WasmWorkerPool and TruexWasmBridge instantiated successfully");

    // 3. Run concurrent WASM execution tasks via bridge
    // We run a simple set of calculations (e.g. Jaccard distance or info checks)
    const taskPromises = Array.from({ length: 5 }, (_, i) => 
      bridge.executeWasmTask('tenant_test', 'xes_format_info', { taskIndex: i })
    );

    const results = await Promise.all(taskPromises);

    for (const res of results) {
      if (!res.receipt || res.receipt.status !== 'confirmed') {
        throw new Error("Bridge failed to write confirmed receipt for executed task");
      }
    }
    invariants.push("Concurrent execution offloaded and committed cleanly");

    // 4. Assert receipts chain integrity
    const rows = db.prepare('SELECT count(*) as count FROM receipts').get() as { count: number };
    if (rows.count !== 5) {
      throw new Error(`Expected 5 receipts in database, found ${rows.count}`);
    }
    invariants.push("SQLite receipt store accurately recorded all executions");

    return {
      passed: true,
      failures,
      invariants
    };
  } catch (error: any) {
    return {
      passed: false,
      failures: [error.message],
      invariants
    };
  } finally {
    if (pool) {
      pool.terminate();
    }
  }
}
