import { createProxy } from '../../src/proxy/create-proxy.js';
import { createPowlContext, registerPowlInterceptors } from './powl-hook.js';

console.log('=== POWL VKG: Choice Graph (XOR) Example ===\n');

// 1. Substrate
const gatewaySubstrate = {
  start() { console.log('  [Substrate] Gateway started.'); },
  routeA() { console.log('  [Substrate] Routing to Path A.'); },
  routeB() { console.log('  [Substrate] Routing to Path B.'); },
  finish() { console.log('  [Substrate] Gateway finished.'); }
};

// 2. POWL Configuration: Choice Graph
const powlChoice = {
  type: 'choice_graph',
  id: 'routing_choice',
  start: 'start',
  end: 'finish',
  nodes: [
    { id: 'start', label: 'Start' },
    { id: 'routeA', label: 'Route A' },
    { id: 'routeB', label: 'Route B' },
    { id: 'finish', label: 'Finish' }
  ],
  edges: [
    { from: 'start', to: 'routeA' },
    { from: 'start', to: 'routeB' },
    { from: 'routeA', to: 'finish' },
    { from: 'routeB', to: 'finish' }
  ]
};

// 3. Test Valid Choice (Path A)
console.log('--- Testing Valid Choice (Path A) ---');
const ctxA = createPowlContext(powlChoice);
const { proxy: memA, ...ifaceA } = createProxy(gatewaySubstrate);
registerPowlInterceptors(ifaceA, ctxA);

try {
  memA.start();
  memA.routeA();
  memA.finish();
  console.log('✓ Valid Path A completed.\n');
} catch (err) {
  console.error(err.message);
}

// 4. Test Invalid Choice (Trying to take both paths)
console.log('--- Testing Invalid Choice (Refusal) ---');
const ctxInvalid = createPowlContext(powlChoice);
const { proxy: memInvalid, ...ifaceInvalid } = createProxy(gatewaySubstrate);
registerPowlInterceptors(ifaceInvalid, ctxInvalid);

try {
  memInvalid.start();
  memInvalid.routeA();
  memInvalid.routeB(); // Attempt to jump paths, should be Refused
} catch (err) {
  console.log('✗ Caught expected error:', err.message);
}

console.log('\nReceipts for invalid choice:');
console.table(ctxInvalid.getReceipts().map(r => ({ operation: r.operation, status: r.status })));
