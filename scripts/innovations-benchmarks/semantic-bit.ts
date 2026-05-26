import { performance } from 'perf_hooks';

const ITERATIONS = 50_000_000;

// Semantic Bit Implementation
const PENDING_BIT = 1 << 0;
const COMPLETED_BIT = 1 << 1;
const FAILED_BIT = 1 << 2;
const CANCELLED_BIT = 1 << 3;
const TIMEOUT_BIT = 1 << 4;

const TARGET_MASK = PENDING_BIT | COMPLETED_BIT | FAILED_BIT | CANCELLED_BIT;

function bitwiseBenchmark() {
  let state = PENDING_BIT;
  let matches = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    state = 1 << (i % 5);
    
    // Check state using bitwise
    if ((state & TARGET_MASK) !== 0) {
      matches++;
    }
  }
  return matches;
}

// Traditional String Implementation
const states = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'TIMEOUT'];

function stringBenchmark() {
  let state = 'PENDING';
  let matches = 0;
  for (let i = 0; i < ITERATIONS; i++) {
    state = states[i % 5];
    
    // Check state using strings
    if (state === 'PENDING' || state === 'COMPLETED' || state === 'FAILED' || state === 'CANCELLED') {
      matches++;
    }
  }
  return matches;
}

async function runBenchmarks() {
  console.log(`Running benchmarks with ${ITERATIONS.toLocaleString()} iterations...`);

  // Warmup
  bitwiseBenchmark();
  stringBenchmark();

  const startBitwise = performance.now();
  const bitwiseResult = bitwiseBenchmark();
  const endBitwise = performance.now();
  const bitwiseTime = endBitwise - startBitwise;

  const startString = performance.now();
  const stringResult = stringBenchmark();
  const endString = performance.now();
  const stringTime = endString - startString;

  console.log(`\n--- Results ---`);
  console.log(`Bitwise Matches: ${bitwiseResult}`);
  console.log(`String Matches: ${stringResult}`);
  console.log(`\n--- Timing ---`);
  console.log(`Bitwise Time: ${bitwiseTime.toFixed(2)} ms`);
  console.log(`String Time:  ${stringTime.toFixed(2)} ms`);
  console.log(`\nPerformance Gain: ${(stringTime / bitwiseTime).toFixed(2)}x faster`);
}

runBenchmarks().catch(console.error);
