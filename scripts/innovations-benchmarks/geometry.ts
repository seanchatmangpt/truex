import { performance } from 'perf_hooks';

const NUM_TRANSITIONS = 1_000_000;
const NUM_NODES = 31; // Max 31 to fit in a signed 32-bit bitmask easily

// 1. Traditional Array-Based State Machine
class ArrayStateMachine {
    nodes: number[][] = [];
    constructor() {
        for (let i = 0; i < NUM_NODES; i++) {
            this.nodes.push([(i + 1) % NUM_NODES, (i + 2) % NUM_NODES]);
        }
    }

    run() {
        let currentState = 0;
        const start = performance.now();
        for (let i = 0; i < NUM_TRANSITIONS; i++) {
            const transitions = this.nodes[currentState];
            currentState = transitions[i % transitions.length]; // simulate routing choice
        }
        return performance.now() - start;
    }
}

// 2. POWL v2 Choice Graph / Partial Order Routing via Bitsets (Process Geometry)
class ProcessGeometryGraph {
    // Adjacency matrix packed into Bitsets (each index is a 32-bit int)
    adjBitset: Int32Array;

    constructor() {
        this.adjBitset = new Int32Array(NUM_NODES);
        for (let i = 0; i < NUM_NODES; i++) {
            const next1 = (i + 1) % NUM_NODES;
            const next2 = (i + 2) % NUM_NODES;
            this.adjBitset[i] = (1 << next1) | (1 << next2);
        }
    }

    run() {
        let currentIdx = 0;
        const start = performance.now();
        
        for (let i = 0; i < NUM_TRANSITIONS; i++) {
            let edges = this.adjBitset[currentIdx];
            
            // Fast bitwise routing using CTZ (Count Trailing Zeros) equivalent
            if ((i & 1) === 0) {
                // Extract lowest set bit
                const lowestBit = edges & -edges;
                currentIdx = Math.clz32(lowestBit) ^ 31; 
            } else {
                // Clear lowest set bit and find next
                edges &= edges - 1;
                const lowestBit = edges & -edges;
                currentIdx = Math.clz32(lowestBit) ^ 31;
            }
        }
        return performance.now() - start;
    }
}

async function main() {
    console.log("===================================================================");
    console.log("🚀 Process Geometry vs Traditional State Machine Benchmark");
    console.log("===================================================================");
    console.log(`Swarm Transitions  : ${NUM_TRANSITIONS.toLocaleString()}`);
    console.log(`Graph Nodes        : ${NUM_NODES}`);
    console.log("-------------------------------------------------------------------");

    const arraySM = new ArrayStateMachine();
    const geomGraph = new ProcessGeometryGraph();

    // Warmup
    for (let i = 0; i < 5; i++) {
        arraySM.run();
        geomGraph.run();
    }

    // Benchmark Array SM
    let arrayTotalTime = 0;
    const runs = 10;
    for (let i = 0; i < runs; i++) arrayTotalTime += arraySM.run();
    const arrayAvgTime = arrayTotalTime / runs;

    // Benchmark Process Geometry
    let geomTotalTime = 0;
    for (let i = 0; i < runs; i++) geomTotalTime += geomGraph.run();
    const geomAvgTime = geomTotalTime / runs;

    console.log(`[Baseline] Array-based SM Avg Time   : ${arrayAvgTime.toFixed(4)} ms`);
    console.log(`[Innovate] Process Geometry Avg Time : ${geomAvgTime.toFixed(4)} ms`);
    
    const speedup = arrayAvgTime / geomAvgTime;
    console.log(`\n⚡ Process Geometry Speedup Multiplier : ${speedup.toFixed(2)}x`);
    console.log("===================================================================");
}

main().catch(console.error);