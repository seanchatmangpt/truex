import { createProxy } from '../../src/proxy/create-proxy.js';
import { createPowlContext, registerPowlInterceptors } from './powl-hook.js';

console.log('=== POWL VKG: Parallel/Concurrency Example ===\n');

// 1. Substrate
const workerSubstrate = {
  start() { console.log('  [Substrate] Parallel workflow started.'); },
  taskA() { console.log('  [Substrate] Task A (Concurrent) executed.'); },
  taskB() { console.log('  [Substrate] Task B (Concurrent) executed.'); },
  finish() { console.log('  [Substrate] Parallel workflow finished.'); }
};

// 2. POWL Configuration: Partial Order with Concurrent branches
const powlParallel = {
  type: 'partial_order',
  id: 'parallel_execution',
  nodes: [
    { id: 'start', label: 'Start' },
    { id: 'taskA', label: 'Task A' },
    { id: 'taskB', label: 'Task B' },
    { id: 'finish', label: 'Finish' }
  ],
  edges: [
    { from: 'start', to: 'taskA' },
    { from: 'start', to: 'taskB' },
    { from: 'taskA', to: 'finish' }, // Finish depends on both A and B
    { from: 'taskB', to: 'finish' }
  ]
};

// 3. Test Valid Parallel Execution (A then B)
console.log('--- Testing Valid Concurrency (A then B) ---');
const ctxAB = createPowlContext(powlParallel);
const { proxy: memAB, ...ifaceAB } = createProxy(workerSubstrate);
registerPowlInterceptors(ifaceAB, ctxAB);

try {
  memAB.start();
  memAB.taskA();
  memAB.taskB();
  memAB.finish();
  console.log('✓ Valid A->B execution completed.\n');
} catch (err) {
  console.error(err.message);
}

// 4. Test Valid Parallel Execution (B then A)
console.log('--- Testing Valid Concurrency (B then A) ---');
const ctxBA = createPowlContext(powlParallel);
const { proxy: memBA, ...ifaceBA } = createProxy(workerSubstrate);
registerPowlInterceptors(ifaceBA, ctxBA);

try {
  memBA.start();
  memBA.taskB(); // B before A is perfectly valid in this partial order
  memBA.taskA();
  memBA.finish();
  console.log('✓ Valid B->A execution completed.\n');
} catch (err) {
  console.error(err.message);
}

// 5. Test Invalid Execution (Premature Finish)
console.log('--- Testing Invalid Execution (Premature Finish) ---');
const ctxInvalid = createPowlContext(powlParallel);
const { proxy: memInvalid, ...ifaceInvalid } = createProxy(workerSubstrate);
registerPowlInterceptors(ifaceInvalid, ctxInvalid);

try {
  memInvalid.start();
  memInvalid.taskA();
  memInvalid.finish(); // Should Refuse because taskB hasn't executed
} catch (err) {
  console.log('✗ Caught expected error:', err.message);
}

console.log('\nReceipts for invalid concurrency:');
console.table(ctxInvalid.getReceipts().map(r => ({ operation: r.operation, status: r.status })));
