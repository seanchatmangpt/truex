import { WasmWorkerPool } from '../packages/membrane/src/concurrency/wasm-worker-pool.js';
import * as path from 'node:path';

async function test() {
  const workerScript = path.resolve(process.cwd(), 'packages/membrane/src/concurrency/wasm-worker.ts');
  console.log('Spawning pool...');
  const pool = new WasmWorkerPool(2, workerScript);
  console.log('Executing 5 concurrent tasks...');
  try {
    const promises = Array.from({ length: 5 }, (_, i) => 
      pool.execute({
        tenantId: `tenant_${i}`,
        algorithm: 'xes_format_info',
        payload: []
      }).then(res => console.log(`Task ${i} finished.`))
    );
    await Promise.all(promises);
    console.log('All tasks finished!');
  } catch (err) {
    console.error('Failed:', err);
  } finally {
    pool.terminate();
    console.log('Pool terminated.');
  }
}

test();
