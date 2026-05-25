# TRUEX Unified E2E Lifecycle Performance & Leak Report

Generated: 2026-05-25T18:56:00.611Z
Loops Run: 50
Total Execution Time: 3336.43 ms

## 1. Memory Analysis & Leak Detection
To assert operational stability and verify the lack of state leaks, heap memory is measured before and after the test loop execution.

| Metric | Value |
| --- | --- |
| Heap Used Before | 13.05 MB |
| Heap Used After | 21.77 MB |
| **Heap Delta** | **8.72 MB** |
| GC Forced | No |
| **Status** | **PASSED (Stable)** |

## 2. CPU Consumption
- **User CPU Time:** 794.96 ms
- **System CPU Time:** 2565.40 ms
- **Total CPU time:** 3360.36 ms

## 3. Verb Benchmarks
Each individual verb in the S11 (Wizard) and S13 (Telco) lifecycles was profiled over 50 loops.

| Verb | Avg Duration (ms) | Median (ms) | Min (ms) | Max (ms) | Throughput (ops/sec) |
| --- | --- | --- | --- | --- | --- |
| `init` | 1.7817 | 1.7381 | 1.5056 | 3.8576 | 561.3 |
| `map` | 1.2101 | 1.1840 | 1.0621 | 2.2124 | 826.4 |
| `plan` | 1.5274 | 1.5072 | 1.2958 | 2.2595 | 654.7 |
| `forge` | 4.6090 | 4.1555 | 3.5277 | 27.0623 | 217.0 |
| `bind` | 12.3705 | 12.2559 | 11.1457 | 16.3667 | 80.8 |
| `prove` | 36.7095 | 35.9086 | 33.5900 | 51.2080 | 27.2 |
| `listen` | 0.0063 | 0.0039 | 0.0027 | 0.0541 | 158292.0 |
| `dial` | 0.0037 | 0.0022 | 0.0017 | 0.0388 | 269238.4 |
| `handshake` | 0.0075 | 0.0046 | 0.0040 | 0.0755 | 133898.6 |
| `encode` | 0.0174 | 0.0138 | 0.0105 | 0.0813 | 57317.3 |
| `route` | 0.0030 | 0.0017 | 0.0015 | 0.0401 | 329129.3 |
| `transmit` | 0.0118 | 0.0094 | 0.0082 | 0.0602 | 84913.4 |
| `verify` | 0.0100 | 0.0073 | 0.0063 | 0.0424 | 99809.2 |
| `settle` | 0.0025 | 0.0015 | 0.0014 | 0.0283 | 406911.0 |
| `handoff` | 1.3581 | 0.9662 | 0.8383 | 19.2009 | 736.3 |

## 4. Invariant & Conservation Verification
- **W1 - W5 Conservation:** Confirmed conserved by `MissionController.verifyHandoff` and `MissionController.finalize` on every iteration.
- **T1 - T6 Conservation:** Evaluated and verified valid by `TelcoLifecycleManager.verifyLedgerConservation` on every iteration.