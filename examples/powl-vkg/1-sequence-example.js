import { createProxy } from '../../src/proxy/create-proxy.js';
import { createPowlContext, registerPowlInterceptors } from './powl-hook.js';

console.log('=== POWL VKG: Strict Sequence Example ===\n');

// 1. Substrate: The underlying target object
const compilerSubstrate = {
  init() { console.log('  [Substrate] Initializing...'); return true; },
  map() { console.log('  [Substrate] Mapping...'); return true; },
  plan() { console.log('  [Substrate] Planning...'); return true; },
  forge() { console.log('  [Substrate] Forging...'); return true; },
};

// 2. POWL Configuration: Strict Partial Order Sequence
const powlSequence = {
  type: 'partial_order',
  id: 'strict_sequence',
  nodes: [
    { id: 'init', label: 'Init' },
    { id: 'map', label: 'Map' },
    { id: 'plan', label: 'Plan' },
    { id: 'forge', label: 'Forge' }
  ],
  edges: [
    { from: 'init', to: 'map' },
    { from: 'map', to: 'plan' },
    { from: 'plan', to: 'forge' }
  ]
};

// 3. Create the Context and Membrane
const powlContext = createPowlContext(powlSequence);
const { proxy: compilerMembrane, ...proxyInterface } = createProxy(compilerSubstrate);
registerPowlInterceptors(proxyInterface, powlContext);

// 4. Test Valid Sequence
console.log('--- Testing Valid Sequence ---');
try {
  compilerMembrane.init();
  compilerMembrane.map();
  compilerMembrane.plan();
  compilerMembrane.forge();
  console.log('✓ Valid sequence completed successfully.\n');
} catch (err) {
  console.error(err.message);
}

// Let's create a new instance to test invalid sequence
console.log('--- Testing Invalid Sequence (Refusal) ---');
const powlContext2 = createPowlContext(powlSequence);
const { proxy: compilerMembrane2, ...proxyInterface2 } = createProxy(compilerSubstrate);
registerPowlInterceptors(proxyInterface2, powlContext2);

try {
  compilerMembrane2.init();
  compilerMembrane2.plan(); // Skips 'map', should be Refused
} catch (err) {
  console.log('✗ Caught expected error:', err.message);
}
console.log('\nReceipts for invalid sequence:');
console.table(powlContext2.getReceipts().map(r => ({ operation: r.operation, status: r.status })));
