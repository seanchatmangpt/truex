# OTP Breakpoints & Accounting Domains Report

**Timestamp:** `2026-05-24T05:34:49.528Z`
**Report Hash:** `1df806438aac680616e698d299cd5020341239f891b839e82488f48f0fbdffdc`

## 1. Domain Accounting Summary (182 Stress Scenarios)

| Domain | Attempted | Succeeded / Confirmed | Refused / Halted / Degraded | Failed | Other / Skipped | Status/Formula | Terminology & Telemetry |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- |
| **O1 — Mailbox Pressure** | 445200.000 | 445200.000 | 0.000 | 0.000 | 0.000 | `confirmed + refused + failed + skipped == attempted` | Interleaving & configuration-specific queue limit rejections |
| **O2 — Supervisor Pressure** | 1112.000 | 992.000 | 120.000 | 0.000 | 0.000 | `restarted + halted + quarantined + failed == attempted` | Restart budget & crash limits under persistent crashes |
| **O3 — Quarantine Pressure** | 1112.000 | 1112.000 | 0.000 | 0.000 | 0.000 | `quarantined + leaked + refused + failed == attempted` | Poison message isolation & quarantine queue limits |
| **O4 — Replay Pressure** | 1000.000 | 1000.000 | 0.000 | 0.000 | 0.000 | `converged + diverged + timedOut + notAttempted == attempted` | Cryptographic replay validation & tamper detection under mutations |
| **O5 — Runtime Resource Pressure** | 182.000 | 126.000 | 48.000 | 0.000 | 8.000 | `tolerated + degraded + refused + unsafe + failed == attempted` | Resource consumption & overhead thresholds (182 scenarios) |

## 2. Invariant Verification

1. **Domain O1 Invariant:** `confirmed + refused + failed + skipped == attempted` (445200.000 + 0.000 + 0.000 + 0.000 == 445200.000) ✅ Verified.
2. **Domain O2 Invariant:** `restarted + halted + quarantined + failed == attempted` (992.000 + 120.000 + 0.000 + 0.000 == 1112.000) ✅ Verified.
3. **Domain O3 Invariant:** `quarantined + leaked + refused + failed == attempted` (1112.000 + 0.000 + 0.000 + 0.000 == 1112.000) ✅ Verified.
4. **Domain O4 Invariant:** `converged + diverged + timedOut + notAttempted == attempted` (1000.000 + 0.000 + 0.000 + 0.000 == 1000.000) ✅ Verified.
5. **Domain O5 Invariant:** `tolerated + degraded + refused + unsafe + failed == attempted` (126.000 + 8.000 + 48.000 + 0.000 + 0.000 == 182.000) ✅ Verified.

## 3. Telemetry Points & Breakdown

### Memory Breakpoint Metrics
- **Initial Heap (heapBefore):** 18.182 MB
- **Final Heap (heapAfter):** 134.299 MB
- **Peak Heap (heapPeak):** 217.915 MB
- **Initial RSS (rssBefore):** 79.641 MB
- **Final RSS (rssAfter):** 377.094 MB
- **Peak RSS (rssPeak):** 377.094 MB
- **Average Bytes Per Message (bytesPerMessageApprox):** 23864.774 bytes

### Supervisor Breakpoint Metrics
- **Tested maxRestarts Settings:** [0, 1, 2, 5]
- **Evaluation periodMs:** 10000000 ms
- **Total Restart Attempts:** 992
- **Expected Halt Crash Index Sum:** 184
- **Actual Halt Crash Index Sum:** 184
- **Total Halts Triggered:** 120

### Performance & Overhead Details
- **Raw Throughput:** 8522678.848 ops/sec
- **Receipt-Backed Throughput:** 28994.332 ops/sec
- **Overhead Ratio:** 293.943x
- **Divergence / Tamper Detection:** Replay converged: 100%, Tamper detected: 100%
- **Max Cascade Depth:** 101 levels

> [!WARNING]
> **Overhead warning:** Receipt-backed execution violates the <80.000x CTQ (observed overhead is 293.943x). The runtime operates in degraded-but-correct mode.

## 4. Refusal Framing & Structural Limits
Rather than globally enforcing static mailbox depth bounds, Truex employs configuration-specific queue limits associated with individual actor processes. Under stress, whenever a mailbox depth matches or exceeds its target limit, queue overflows generate and sign refused receipts prior to any state mutation.

## 5. Next Gall Checkpoint
- **Next Gall Layer:** S9 Scheduler / Runaway Behavior Containment (preemption, timeout, worker isolation).

---
*Report generated automatically by Truex Doctor.*