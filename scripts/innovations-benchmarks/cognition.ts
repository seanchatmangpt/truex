import { performance } from 'perf_hooks';

// Simulate HDIT Cognitive Constant
const VECTOR_SIZE = 512;
const createVector = () => {
    const vec = new Float32Array(VECTOR_SIZE);
    for (let i = 0; i < VECTOR_SIZE; i++) {
        vec[i] = Math.random() * 2 - 1;
    }
    return vec;
};

const constantA = createVector();
const constantB = createVector();
const inputVector = createVector();

function dotProduct(v1: Float32Array, v2: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < VECTOR_SIZE; i++) {
        sum += v1[i] * v2[i];
    }
    return sum;
}

function hditRouting(input: Float32Array): string {
    const scoreA = dotProduct(input, constantA);
    const scoreB = dotProduct(input, constantB);
    return scoreA > scoreB ? 'Route A' : 'Route B';
}

// Mocked Traditional AI API Oracle
async function traditionalAIAPI(): Promise<string> {
    return new Promise(resolve => {
        // Simulate network latency (e.g., 200ms)
        setTimeout(() => {
            resolve(Math.random() > 0.5 ? 'Route A' : 'Route B');
        }, 200);
    });
}

async function runBenchmark() {
    console.log('--- Compiled Cognition Benchmark ---');
    console.log(`Vector Size: ${VECTOR_SIZE}`);
    
    // HDIT Benchmark
    const hditIterations = 1_000_000;
    console.log(`\nRunning HDIT Benchmark (${hditIterations} iterations)...`);
    const startHdit = performance.now();
    for (let i = 0; i < hditIterations; i++) {
        hditRouting(inputVector);
    }
    const endHdit = performance.now();
    const hditTimeMs = endHdit - startHdit;
    console.log(`HDIT Time: ${hditTimeMs.toFixed(2)} ms`);
    console.log(`HDIT Throughput: ${((hditIterations / hditTimeMs) * 1000).toFixed(2)} ops/sec`);

    // Traditional API Benchmark
    const apiIterations = 10;
    console.log(`\nRunning Traditional AI API Benchmark (${apiIterations} iterations for demonstration due to latency)...`);
    const startApi = performance.now();
    for (let i = 0; i < apiIterations; i++) {
        await traditionalAIAPI();
    }
    const endApi = performance.now();
    const apiTimeMs = endApi - startApi;
    const avgApiTimeMs = apiTimeMs / apiIterations;
    console.log(`Traditional API Avg Time per Request: ${avgApiTimeMs.toFixed(2)} ms`);
    console.log(`Traditional API Throughput: ${(1000 / avgApiTimeMs).toFixed(2)} ops/sec`);
    
    console.log('\n--- Conclusion ---');
    console.log(`HDIT is approximately ${((1000 / avgApiTimeMs) === 0 ? 0 : (((hditIterations / hditTimeMs) * 1000) / (1000 / avgApiTimeMs))).toFixed(2)}x faster than traditional API routing.`);
}

runBenchmark().catch(console.error);