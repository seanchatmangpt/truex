# TRUEX Unified E2E Lifecycle Performance & Leak Report

Generated: 2026-05-26T05:20:08.501Z
Loops Run: 50
Total Execution Time: 3874.26 ms

## 1. Memory Analysis & Leak Detection
To assert operational stability and verify the lack of state leaks, heap memory is measured before and after the test loop execution.

| Metric | Value |
| --- | --- |
| Heap Used Before | 13.15 MB |
| Heap Used After | 21.69 MB |
| **Heap Delta** | **8.54 MB** |
| GC Forced | No |
| **Status** | **PASSED (Stable)** |

## 2. CPU Consumption
- **User CPU Time:** 866.16 ms
- **System CPU Time:** 2761.02 ms
- **Total CPU time:** 3627.18 ms

## 3. Verb Benchmarks
Each individual verb in the S11 (Wizard) and S13 (Telco) lifecycles was profiled over 50 loops.

| Verb | Avg Duration (ms) | Median (ms) | Min (ms) | Max (ms) | Throughput (ops/sec) |
| --- | --- | --- | --- | --- | --- |
| `init` | 2.2887 | 1.8012 | 1.4563 | 21.4130 | 436.9 |
| `map` | 1.4160 | 1.3550 | 1.0865 | 2.5327 | 706.2 |
| `plan` | 1.6757 | 1.6763 | 1.2760 | 2.3212 | 596.8 |
| `forge` | 4.9953 | 4.9074 | 3.8967 | 6.8769 | 200.2 |
| `bind` | 13.9273 | 13.5785 | 11.7560 | 18.0471 | 71.8 |
| `prove` | 43.0899 | 40.3504 | 36.4187 | 93.1313 | 23.2 |
| `listen` | 0.0075 | 0.0052 | 0.0030 | 0.0473 | 133083.1 |
| `dial` | 0.0043 | 0.0023 | 0.0018 | 0.0394 | 230546.5 |
| `handshake` | 0.0076 | 0.0046 | 0.0039 | 0.0753 | 131563.4 |
| `encode` | 0.0205 | 0.0166 | 0.0123 | 0.0748 | 48891.8 |
| `route` | 0.0031 | 0.0017 | 0.0015 | 0.0385 | 327681.9 |
| `transmit` | 0.0123 | 0.0100 | 0.0084 | 0.0585 | 81482.9 |
| `verify` | 0.0100 | 0.0073 | 0.0066 | 0.0427 | 99618.7 |
| `settle` | 0.0025 | 0.0015 | 0.0014 | 0.0280 | 408163.3 |
| `handoff` | 1.1228 | 1.0752 | 0.8466 | 2.0984 | 890.6 |

## 4. Invariant & Conservation Verification
- **W1 - W5 Conservation:** Confirmed conserved by `MissionController.verifyHandoff` and `MissionController.finalize` on every iteration.
- **T1 - T6 Conservation:** Evaluated and verified valid by `TelcoLifecycleManager.verifyLedgerConservation` on every iteration.