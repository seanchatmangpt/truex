# Agent Report: OTP Replay & Topology Cascade Breakpoint Stress
**Truex Core Conformance and Benchmark Analysis**

## 1. Objectives & Scope
We executed a complete stress test targeting receipt-backed execution, replay verification, and topology cascades. The goal is to determine performance breakpoints and verify strict compliance with the **AGENTS.md** axioms (deterministic replay, causal accountability, and zero-compromise security).

## 2. Invariant Verification & Test Coverage
Our test suite validates all core invariants using actual runtimes under Vitest:
1. **Mutated middle receipt fails**: Replaying a mutated middle receipt returns `false` in `replayMessage`.
2. **Missing previous receipt fails**: Shuffling or omitting a receipt breaks the causal chain link (`previousReceiptHash`).
3. **Cycle is detected and refused**: A cyclic loop (A -> B -> A) is caught by the storm detector and raises a `TopologyRefusalError`.
4. **Max depth limit is refused**: Deep cascades are refused as soon as the recursive call stack hits the configured depth budget.
5. **Fanout limit is refused**: A single delta triggering too many hook targets triggers a fanout breach.
6. **Rollback prevents downstream authority**: Upstream failures trigger recursive rollback receipts and halt downstream activations before they run.
7. **Adversarial Tamper Defense**: cryptographic receipt integrity checks detected tested tampering cases successfully.

## 3. Benchmark Metrics
- **Receipt Processing Throughput**: Scaled up to 10,000 receipts. Average throughput is recorded in the benchmark JSON.
- **Replay Performance**: Processing speed and convergence verified.
- **Tamper Detection**: Tested under adversarial mutation, reordering, and missing parent receipts.
- **Cascade Limits**: Limits evaluated at depth bounds of 1, 3, 10, and 100.
- **Rollback Correctness**: 100% of failed runs successfully rolled back and blocked downstream side-effects.

## 4. Cryptographic Overhead Analysis (CTQ Safe Threshold)
The system's performance was evaluated against the Critical-to-Quality (CTQ) threshold of **<80.000x** safe overhead:
- **Raw Execution Speed**: `8885650.56 ops/sec`
- **Receipt-Backed Execution Speed**: `26386.41 ops/sec`
- **Measured Overhead Ratio**: `336.751x`
- **Safe Threshold Status**: **VIOLATED** (overhead exceeds the 80x budget due to serial hashing, cloning, and cryptographic integrity management).
- **Operating Mode**: **degraded**

We acknowledge that receipt-backed process execution violates the `<80.000x` safe overhead CTQ and therefore operates in **degraded mode** under heavy loads, requiring further optimizations or hardware acceleration to bring the overhead within nominal bounds.

## 5. Deliverables
All reports have been successfully generated and written:
- **JSON Report**: [otp-replay-topology-breakpoint.report.json](file:///Users/sac/truex/docs/benchmarks/otp-replay-topology-breakpoint.report.json)
- **Markdown Report**: [otp-replay-topology-breakpoint.report.md](file:///Users/sac/truex/docs/benchmarks/otp-replay-topology-breakpoint.report.md)
- **Agent Report**: [otp-replay-topology-breakpoint-agent.md](file:///Users/sac/truex/docs/reports/otp-replay-topology-breakpoint-agent.md)

---
*Truex Core: deterministic operational convergence proven under adversarial execution.*
