
import { canonicalStringify, OcelCollector } from './src/ocel2/index.js';
import { createProxy } from './src/proxy/create-proxy.js';
import { PowlExecutionEngine, getWizard8VerbWorkflow } from './packages/membrane/src/powl-project-workflow.gall.js';
import { performance } from 'perf_hooks';

// Benchmark canonicalStringify
function benchmarkStringify() {
  const largeObject = {
    events: Array.from({ length: 1000 }, (_, i) => ({
      'ocel:id': `evt_${i}`,
      'ocel:type': 'activity',
      'ocel:timestamp': new Date().toISOString(),
      'ocel:attributes': { a: i, b: 'test' }
    })),
    objects: Array.from({ length: 100 }, (_, i) => ({
      'ocel:id': `obj_${i}`,
      'ocel:type': 'object',
      'ocel:attributes': { x: i }
    }))
  };

  const start = performance.now();
  const result = canonicalStringify(largeObject);
  const end = performance.now();
  console.log(`canonicalStringify (1000 events): ${(end - start).toFixed(4)}ms`);
  return end - start;
}

// Benchmark PowlExecutionEngine
function benchmarkPowl() {
  const workflow = getWizard8VerbWorkflow();
  const engine = new PowlExecutionEngine(workflow);
  
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    const attempt = {
      id: 'test',
      verb: 'listen', // valid first verb
      target: {},
      args: [],
      timestamp: new Date().toISOString()
    };
    // Note: PowlExecutionEngine state changes, so we need to reset or use multiple verbs
    // For benchmark, let's just see raw validation cost on a simple workflow
    engine.validateAttempt(attempt);
  }
  const end = performance.now();
  console.log(`PowlExecutionEngine validateAttempt (1000 calls): ${(end - start).toFixed(4)}ms`);
  console.log(`Average latency per call: ${((end - start) / 1000).toFixed(4)}ms`);
}

console.log('--- Latency Audit ---');
benchmarkStringify();
benchmarkPowl();
