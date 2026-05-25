import { WasmWorkerPool } from '../packages/membrane/src/concurrency/wasm-worker-pool.js';
import * as path from 'node:path';

async function test() {
  const workerScript = path.resolve(process.cwd(), 'packages/membrane/src/concurrency/wasm-worker.ts');
  console.log('Spawning pool with script:', workerScript);
  const pool = new WasmWorkerPool(2, workerScript);
  console.log('Pool spawned. Executing task...');
  try {
    const res = await pool.execute({
      tenantId: 'test',
      algorithm: 'xes_format_info',
      payload: []
    });
    console.log('Task finished. Result:', res);
  } catch (err) {
    console.error('Task failed:', err);
  } finally {
    pool.terminate();
    console.log('Pool terminated.');
  }
}

test();
