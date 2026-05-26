import * as crypto from 'crypto';
import { performance } from 'perf_hooks';

const iterations = 1000000;

const testObject = {
  id: "msg-12345",
  type: "trade_execution",
  timestamp: 1678886400000,
  payload: {
    symbol: "AAPL",
    qty: 100,
    price: 150.25
  }
};

// Simulated pre-allocated buffer for the membrane
const preAllocatedBuffer = Buffer.alloc(256);
const dataString = JSON.stringify(testObject);
preAllocatedBuffer.write(dataString);
const dataLength = Buffer.byteLength(dataString);

function benchmarkTraditional() {
  const start = performance.now();
  let matches = 0;
  const expectedString = JSON.stringify(testObject);
  
  for (let i = 0; i < iterations; i++) {
    // Traditional: stringify and compare
    const currentString = JSON.stringify(testObject);
    if (currentString === expectedString) {
      matches++;
    }
  }
  
  const end = performance.now();
  const durationMs = end - start;
  const opsPerSec = (iterations / durationMs) * 1000;
  
  console.log('--- Traditional JSON.stringify & Comparison ---');
  console.log(`Duration: ${durationMs.toFixed(2)} ms`);
  console.log(`Ops/sec: ${opsPerSec.toFixed(2)}`);
  return { durationMs, opsPerSec };
}

function benchmarkMembrane() {
  const start = performance.now();
  let matches = 0;
  
  // Pre-calculate expected hash
  const expectedHash = crypto.createHash('sha256').update(preAllocatedBuffer.subarray(0, dataLength)).digest();
  
  for (let i = 0; i < iterations; i++) {
    // Membrane: hash from pre-allocated buffer
    const currentHash = crypto.createHash('sha256').update(preAllocatedBuffer.subarray(0, dataLength)).digest();
    if (currentHash.equals(expectedHash)) {
      matches++;
    }
  }
  
  const end = performance.now();
  const durationMs = end - start;
  const opsPerSec = (iterations / durationMs) * 1000;
  
  console.log('\n--- Cryptographic Membrane (Pre-allocated Buffer + SHA256) ---');
  console.log(`Duration: ${durationMs.toFixed(2)} ms`);
  console.log(`Ops/sec: ${opsPerSec.toFixed(2)}`);
  return { durationMs, opsPerSec };
}

console.log(`Running benchmarks with ${iterations.toLocaleString()} iterations...\n`);
benchmarkTraditional();
benchmarkMembrane();