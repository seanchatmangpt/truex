# Hook OTP Equivalence Report

## Executive Summary
- **Case:** hook-otp-equivalence
- **Status:** ✅ Passed
- **OTP Equivalent (Not Erlang OTP):** true
- **Report Hash:** c7031e5ce3d24089024944638dfafccb916f72027a0ab551d658062ae894fd74

## Core Processes & Runtime Telemetry
| Metric | Value |
|--------|-------|
| Active Processes | 2 |
| Processes Started | 1 |
| Processes Alive | 0 |
| Processes Quarantined | 1 |
| Messages Dispatched | 5 |
| Messages Processed | 4 |
| Messages Confirmed | 1 |
| Messages Refused | 4 |
| Messages Quarantined (Poison) | 3 |
| Process Restarts | 2 |
| Budget Exhausted Halted Processes | 1 |

## Validated Invariants
*   **FIFO Ordering:** ✅ Verified
*   **State Isolation:** ✅ Verified
*   **Sibling Crash Containment:** ✅ Verified
*   **Confirmed Receipt Verification:** ✅ Verified
*   **Refused Receipt Verification:** ✅ Verified
*   **Receipt Chain Verification:** ✅ Verified
*   **Replay Convergence:** ✅ Verified
*   **Tamper Divergence:** ✅ Verified

## Benchmarking Operations
*   **Raw Hook Execution:** 1330965.988 ops/sec
*   **OTP Mailbox Dispatch (Eval-Only):** 5086935.732 ops/sec
*   **Receipt-Backed OTP Dispatch (Full Loop):** 18377.595 ops/sec
*   **Overhead Ratio:** 72.423x