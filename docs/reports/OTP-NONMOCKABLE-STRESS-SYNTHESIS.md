# OTP-NONMOCKABLE-STRESS-SYNTHESIS (Gall S5)

This synthesis report documents the validation of the Truex Hook OTP (concurrency and fault-tolerance) runtime under non-mockable stress conditions.

---

## 1. What Was Tested
We implemented and executed a suite of **10 non-mockable stress scenarios** targetting local Erlang/OTP equivalence:
1. **FIFO Causal Chain Stress:** Dispatched 1,000 messages sequentially and verified exact FIFO ordering and cryptographic linkage of previous receipt hashes.
2. **Sibling Crash Containment Stress:** Ran parallel processes and proved that process restarts/quarantines do not affect stable siblings.
3. **Restart Budget Exhaustion Stress:** Supervisor budget of 2 restarts is strictly enforced, after which processes quarantine their messages and halt.
4. **Poison Message Quarantine Stress:** Poison inputs are isolated in a quarantine queue while clean inputs process before/after them normally.
5. **Capacity Breach / Backpressure Stress:** GraphDeltas with > 100 changes are refused before state mutation, emitting refused receipts.
6. **Replay Under Schedule Noise Stress:** Replaying interleaved schedules converges to matching receipt hashes, confirming lack of cross-process state bleed.
7. **Tamper-After-Process Stress:** Mutating any part of the message or receipt successfully blocks replay/verification.
8. **Deterministic Lifecycle Hash Stress:** Verified that identical scenarios generate identical report hashes, timing/memory excluded.
9. **Observable Artifact Stress:** Confirmed the presence, status, and contents of `hook-otp.report.json` and its markdown counterpart.
10. **AGY Bridge Hook Visibility Stress:** Invocations via `truex-agy-bridge.ts` intercept tool commands, blocking FOSSIL mutations (exit code 1) and writing WAL entries for admitted mutations (exit code 0).

---

## 2. Why These Tests Cannot Be Mocked
These tests are non-mockable because they assert on real runtime transitions and side-effects:
- **True Database State:** Verified against a physical SQLite WAL database (`gall_truex.db`).
- **Cryptographic Signatures:** ML-DSA key generation, signing, and verification are evaluated natively on every transition.
- **Process Boundaries:** Mailbox FIFO queuing and memory isolation are enforced in code rather than mocked with spies.
- **Actual Child Processes:** The AGY bridge tests run a separate process (`tsx scripts/truex-agy-bridge.ts`) and verify its OS-level exit code.

---

## 3. Runtime Evidence
Ecosystem proof command exit codes and output:
- **Stress Test Suite Command:** `npx vitest run packages/truex-core/test/hook-otp/hook-otp-nonmockable-stress.test.ts`
  - **Exit Code:** 0
  - **Passed Tests:** 10 / 10
- **Ecosystem Command:** `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove ecosystem`
  - **Exit Code:** 0

---

## 4. Receipt Evidence
Confirmed and refused receipts were verified for cryptographic integrity:
- Confirmed receipts require a matching `inputHash` and `outputHash` based on state transformations.
- Refused receipts record the precise error/refusal reason hashed as output.
- Every receipt was validated using the core `verifyReceipt()` validator.

---

## 5. Replay Evidence
Replay convergence was proved using `replayMessage()`:
- Replaying a valid message against the correct `stateBefore` converges identically to the receipt's `outputHash`.
- Modifying any part of the message payload or the receipt's expected output hash causes replay to fail.

---

## 6. Crash/Restart Evidence
Supervision rules successfully restarted processes on transient failures:
- Standard budget: 2 restarts within 10,000ms.
- 1st & 2nd crash: Process state rolled back to initial state, `restartCount` incremented.
- 3rd crash: Process marked as halted (`isHalted = true`), message quarantined, and subsequent dispatches refused.

---

## 7. Quarantine Evidence
When a process crashed or halted, the offending message was isolated:
- Quarantined records were stored in `runtime.quarantine`.
- Each quarantine record contains the process ID, complete `HookMessage` object, error message string, and occurrence timestamp.

---

## 8. Backpressure Evidence
Backpressure limit is set at 100 changes per `GraphDelta` (adds + deletes):
- Sending a message with 101 changes was immediately refused with `Capacity breach`.
- The process state remained unmutated, proving backpressure refusal prevents state drift.

---

## 9. Determinism Evidence
Seeded execution was proven to be 100% deterministic:
- Report hash: `c7031e5ce3d24089024944638dfafccb916f72027a0ab551d658062ae894fd74`
- Identical runs produce matching hashes.
- Timing-dependent fields (such as `rawHookOpsPerSecond` and execution durations) are excluded from the canonical hash computation.

---

## 10. AGY Bridge Evidence
Live execution of the Antigravity Bridge wrapper verified:
- Refused mutation (`"CodeContent":"FOSSIL"`) exited with code 1.
- Admitted mutation (`"CodeContent":"Clean code"`) exited with code 0.
- Database validation confirmed new rows were written to `wal_deltas` and `receipts` tables.

---

## 11. Performance Summary
Local OTP-equivalent concurrency benchmark throughput:
- **Raw Hook Execution:** 1488467.355 ops/sec
- **OTP Mailbox (Eval-Only):** 6386348.541 ops/sec
- **Receipt-Backed OTP (Full Loop):** 28502.886 ops/sec
- **Overhead Ratio:** 52.222x

---

## 12. Remaining Gaps
- **Distributed Concurrency:** Primitives are restricted to a single local Node.js process (no BEAM/network clustering).
- **Scheduler Fairness:** Mailbox processing currently runs sequentially per-process; there is no preemptive timeslicing.

---

```text
Truex OTP Non-Mockable Stress State:
- FIFO Causal Chain: ✅ Passed (1,000 messages processed in exact order)
- Sibling Crash Containment: ✅ Passed (crashed process B isolated, A/C unaffected)
- Restart Budget Exhaustion: ✅ Passed (exhausts budget at exactly 2 restarts)
- Poison Quarantine: ✅ Passed (crashing message isolated to quarantine)
- Capacity Backpressure: ✅ Passed (deltas with > 100 changes refused before state mutation)
- Replay Under Schedule Noise: ✅ Passed (receipt chains converge regardless of schedule order)
- Tamper Detection: ✅ Passed (tampered payloads/receipts fail validation)
- Deterministic Lifecycle Hash: ✅ Passed (stable hashes across runs with timing excluded)
- Observable Artifact Integrity: ✅ Passed (json/markdown reports exist in docs/benchmarks)
- AGY Bridge Visibility: ✅ Passed (BeforeTool block exits 1 on FOSSIL write, 0 on clean write)
- Ecosystem Report: ✅ Passed (docs/reports/truex-ecosystem-runtime-report.json generated)
- Strongest Proven Boundary: Process state isolation and message serialization (Jidoka)
- Weakest Remaining Boundary: Lack of preemptive timeslicing for run-away behaviors
- Next Lawful Stress Layer: Preemptive behavioral scheduler and local network replay node
```