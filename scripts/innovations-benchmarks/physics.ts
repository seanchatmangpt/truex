const ITERS = 10_000_000;

function branchless(state: number, event: number): number {
  return (state ^ event) & 1;
}

function branched(state: number, event: number): number {
  if (state === 0) {
    if (event === 0) return 0;
    else return 1;
  } else {
    if (event === 0) return 1;
    else return 0;
  }
}

const events = new Uint8Array(ITERS);
for (let i = 0; i < ITERS; i++) {
  events[i] = Math.random() > 0.5 ? 1 : 0;
}

let state1 = 0;
let state2 = 0;

const startBranched = performance.now();
for (let i = 0; i < ITERS; i++) {
  state1 = branched(state1, events[i]);
}
const endBranched = performance.now();

const startBranchless = performance.now();
for (let i = 0; i < ITERS; i++) {
  state2 = branchless(state2, events[i]);
}
const endBranchless = performance.now();

const branchedMs = endBranched - startBranched;
const branchlessMs = endBranchless - startBranchless;

console.log("### Physics Layer Benchmark Results");
console.log("");
console.log(`**Iterations**: ${ITERS.toLocaleString()}`);
console.log("");
console.log("| Implementation | Latency (ms) | Ops/sec |");
console.log("|---|---|---|");
console.log(`| **Branched** (if/else) | ${branchedMs.toFixed(2)} | ${(ITERS / (branchedMs / 1000)).toLocaleString(undefined, {maximumFractionDigits: 2})} |`);
console.log(`| **Branchless** (bitwise) | ${branchlessMs.toFixed(2)} | ${(ITERS / (branchlessMs / 1000)).toLocaleString(undefined, {maximumFractionDigits: 2})} |`);
console.log("");
console.log(`*Branchless is ${(branchedMs / branchlessMs).toFixed(2)}x faster.*`);
