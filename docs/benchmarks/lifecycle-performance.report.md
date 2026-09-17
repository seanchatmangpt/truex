# TRUEX Unified E2E Lifecycle Performance & Leak Report

Generated: 2026-06-08T07:45:54.762Z
Loops Run: 50
Total Execution Time: 2710.38 ms

## 1. Memory Analysis & Leak Detection
To assert operational stability and verify the lack of state leaks, heap memory is measured before and after the test loop execution.

| Metric | Value |
| --- | --- |
| Heap Used Before | 11.67 MB |
| Heap Used After | 13.31 MB |
| **Heap Delta** | **1.64 MB** |
| GC Forced | No |
| **Status** | **PASSED (Stable)** |

## 2. CPU Consumption
- **User CPU Time:** 928.99 ms
- **System CPU Time:** 2015.38 ms
- **Total CPU time:** 2944.37 ms

## 3. Verb Benchmarks
Each individual verb in the S11 (Wizard) and S13 (Telco) lifecycles was profiled over 50 loops.

| Verb | Avg Duration (ms) | Median (ms) | Min (ms) | Max (ms) | Throughput (ops/sec) |
| --- | --- | --- | --- | --- | --- |
| `init` | 1.2678 | 1.1931 | 1.1289 | 3.6977 | 788.8 |
| `map` | 1.0153 | 0.9434 | 0.9149 | 2.6854 | 984.9 |
| `plan` | 1.2308 | 1.1559 | 1.1025 | 2.6620 | 812.5 |
| `forge` | 3.5818 | 3.6626 | 3.1371 | 4.7429 | 279.2 |
| `bind` | 10.7331 | 10.5124 | 9.7836 | 16.2093 | 93.2 |
| `prove` | 30.1960 | 29.3486 | 28.8016 | 39.6265 | 33.1 |
| `listen` | 0.0046 | 0.0026 | 0.0022 | 0.0386 | 216379.0 |
| `dial` | 0.0051 | 0.0021 | 0.0014 | 0.0383 | 195920.9 |
| `handshake` | 0.0085 | 0.0038 | 0.0028 | 0.0820 | 117257.5 |
| `encode` | 0.0195 | 0.0142 | 0.0109 | 0.1342 | 51262.3 |
| `route` | 0.0035 | 0.0019 | 0.0016 | 0.0383 | 284965.2 |
| `transmit` | 0.0121 | 0.0099 | 0.0077 | 0.0573 | 82930.2 |
| `verify` | 0.0105 | 0.0082 | 0.0066 | 0.0412 | 95260.6 |
| `settle` | 0.0026 | 0.0016 | 0.0013 | 0.0272 | 379616.1 |
| `handoff` | 0.8086 | 0.7829 | 0.7495 | 1.2692 | 1236.8 |

## 4. Invariant & Conservation Verification
- **W1 - W5 Conservation:** Confirmed conserved by `MissionController.verifyHandoff` and `MissionController.finalize` on every iteration.
- **T1 - T6 Conservation:** Evaluated and verified valid by `TelcoLifecycleManager.verifyLedgerConservation` on every iteration.