import { createProxy } from '../../src/proxy/create-proxy.js';
import { createPowlContext, registerPowlInterceptors } from './powl-hook.js';

console.log('=== POWL VKG: Strict Cycle and Order Refusal ===\n');

// 1. Substrate
const targetSubstrate = {
  step1() { console.log('  [Substrate] Step 1 executed.'); },
  step2() { console.log('  [Substrate] Step 2 executed.'); },
  step3() { console.log('  [Substrate] Step 3 executed.'); }
};

// --- Test 1: Configuration Refusal (Cycle) ---
console.log('--- Test 1: Configuration Refusal (Cyclic POWL Model) ---');
const cyclicModel = {
  type: 'partial_order',
  id: 'invalid_cycle',
  nodes: [
    { id: 'step1', label: 'Step 1' },
    { id: 'step2', label: 'Step 2' },
    { id: 'step3', label: 'Step 3' }
  ],
  edges: [
    { from: 'step1', to: 'step2' },
    { from: 'step2', to: 'step3' },
    { from: 'step3', to: 'step1' } // This creates a cycle
  ]
};

try {
  // Creating the context should immediately Refuse the configuration
  const ctxCycle = createPowlContext(cyclicModel);
  console.log('✗ Failed: Cycle was not refused!');
} catch (err) {
  console.log('✓ Successfully Refused invalid configuration:');
  console.log('  ', err.message);
}

// --- Test 2: Runtime Order Refusal ---
console.log('\n--- Test 2: Runtime Order Refusal (Skipping Dependencies) ---');
const validModel = {
  type: 'partial_order',
  id: 'strict_sequence',
  nodes: [
    { id: 'step1', label: 'Step 1' },
    { id: 'step2', label: 'Step 2' },
    { id: 'step3', label: 'Step 3' }
  ],
  edges: [
    { from: 'step1', to: 'step2' },
    { from: 'step2', to: 'step3' }
  ]
};

const ctxOrder = createPowlContext(validModel);
const { proxy: memOrder, ...ifaceOrder } = createProxy(targetSubstrate);
registerPowlInterceptors(ifaceOrder, ctxOrder);

try {
  memOrder.step1(); // Should Admit
  memOrder.step3(); // Should Refuse because step2 hasn't executed
} catch (err) {
  console.log('✓ Successfully Refused out-of-order execution:');
  console.log('  ', err.message);
}

console.log('\nReceipts for runtime order test:');
console.table(ctxOrder.getReceipts().map(r => ({ operation: r.operation, status: r.status, error: r.error })));
