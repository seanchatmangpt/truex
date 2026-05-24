# OTP Replay & Topology Cascade Stress Test Report (Breakpoint Analysis)

Generated on: `2026-05-24T07:47:40.491Z`

## Executive Summary
This report analyzes the performance boundaries and breakpoint limits of the Truex Receipt-backed message execution, Replay verification, and Topology Cascades. The engine was put under stress with up to 10,000 operations, deep recursive call cascades, and high fanout loads.

---

## 1. Receipt-Backed Message Processing Stress
Measures the throughput (ops/sec) and memory delta of registering and receipting incoming transactions at scale.

| Message/Receipt Count | Processing Speed (ops/sec) | Duration (ms) | Memory Delta (KB) |
| :------------------- | :------------------------- | :------------ | :---------------- |
| 10 | 3813.52 | 2.62 ms | 1418.05 KB |
| 100 | 14261.86 | 7.01 ms | 4610.13 KB |
| 1,000 | 24546.10 | 40.74 ms | 127.27 KB |
| 10,000 | 28044.92 | 356.57 ms | 8698.29 KB |


---

## 2. Replay Performance & Tamper Resistance
Replay verification ensures determinism and causal accountability by verifying receipt lineages.

- **Replay Sample Count**: `1000`
- **Replay Throughput**: `43784.44 ops/sec` (duration: `22.84 ms`)
- **Replay Convergence %**: `100.00%` (Replaying valid receipts matches the target state exactly)
- **Convergence % Under Mutations**: `0.00%` (Expected: 0.00% under tampering)
- **Tamper Detection %**: `100.00%`
- **Tampering Note**: `cryptographic receipt integrity checks detected tested tampering cases`

---

## 3. Topology Cascade & Storm Protection
Tests recursive depth triggers, cyclic storm detection, and fanout limit safeguards.

### Depth Limits Refusal Check
| Max Depth Limit | Actual Cascade Depth | Refusal Status |
| :-------------- | :------------------- | :------------- |
| 1 | 2 | ✅ Refused (Expected) |
| 3 | 4 | ✅ Refused (Expected) |
| 10 | 11 | ✅ Refused (Expected) |
| 100 | 101 | ✅ Refused (Expected) |


### Cyclic Hook Storm Protection
- **Attempted cyclic runs**: `10`
- **Refused cyclic runs**: `10`
- **Storm Refusal Rate**: `100.00%` (A -> B -> A cycles are correctly halted before stack overflow)

### Fanout Limit Enforcement
| Max Fanout Limit | Actual Targets | Refusal Status |
| :--------------- | :------------- | :------------- |
| 1 | 2 | ✅ Refused (Expected) |
| 7 | 8 | ✅ Refused (Expected) |
| 31 | 32 | ✅ Refused (Expected) |


---

## 4. Rollback Propagation
- **Rollback Attempts**: `1`
- **Successful Rollback & downstream prevention**: `1`
- **Rollback Propagation Correctness**: `100.00%` (Downstream authority is prevented when an upstream hook crashes)

---

## 5. Cryptographic Overhead Analysis (CTQ Safe Threshold Evaluation)
We evaluated the overhead ratio of receipt-backed execution versus raw, non-receipted execution.

- **Raw Execution Speed**: `8083486.25 ops/sec`
- **Receipt-Backed Execution Speed**: `26625.57 ops/sec`
- **Measured Overhead Ratio**: `303.599x`
- **CTQ Threshold Check (<80.000x)**: `❌ VIOLATED`
- **Operating Mode**: `DEGRADED`

> [!WARNING]
> Receipt-backed process execution violates the `<80.000x` safe overhead CTQ threshold due to the intense cryptographic hashing operations required per step (cloning state, computing multiple hashes, verifying signatures/receipts, and deterministic context initialization). The runtime therefore operates in **degraded mode** regarding raw execution overhead.

---

## Invariants Checked & Proved
1. **Mutated middle receipt fails**: Tampered output hashes are instantly rejected by `replayMessage`.
2. **Missing previous receipt fails**: Receipt chain link verification breaks if any link is skipped.
3. **Cycle is detected and refused**: Hook storms throw `TopologyRefusalError` and emit refused receipts.
4. **Max depth limit is refused**: Exceeding depth budgets throws immediately.
5. **Fanout limit is refused**: Delta matching checks enforce fanout limits and refuse execution.
6. **Rollback prevents downstream authority**: Failing in the middle of a cascade rolls back completed states and prevents downstream execution.
7. **Adversarial Tamper Defense**: cryptographic receipt integrity checks detected tested tampering cases successfully.
