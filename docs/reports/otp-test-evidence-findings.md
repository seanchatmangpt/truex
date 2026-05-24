# Hook OTP Test Evidence Audit Findings

This report documents the verification audit of the hook OTP system tests within the `@unjs/proxyable` (TRUEX) codebase. The audit mapped individual test cases across all test suites under `packages/truex-core/test/hook-otp/` to the 13 core system invariants.

## Summary of Verification
- **Total Test Files Audited**: 5
- **Total Test Cases Mapped**: 23
- **Overall Status**: **PASSED** (All 23 tests execute and pass successfully)

---

## 13 Core Invariant Mapping Table

| Invariant | Test File | Test Block | Test Name | Assertion Snippet | Status |
|---|---|---|---|---|---|
| **FIFO ordering** | `hook-otp-mailbox.test.ts` | `Hook OTP Mailbox & Actor Runtime` | `should process messages in FIFO order` | `expect(mailbox.pop()?.id).toBe("msg1");`<br>`expect(mailbox.pop()?.id).toBe("msg2");` | PASS |
| | `hook-otp-nonmockable-stress.test.ts` | `Hook OTP Non-Mockable Stress Tests` | `FIFO Causal Chain Stress: should process 1,000 messages in exact order with correct receipt chain linkage` | `expect(processedOrder[i]).toBe("msg_" + i);`<br>`expect(receipts[i].previousReceiptHash).toBe(receipts[i-1].receiptHash);` | PASS |
| **unknown process refusal** | `hook-otp-mailbox.test.ts` | `Hook OTP Mailbox & Actor Runtime` | `should refuse unknown process target` | `expect(res.allowed).toBe(false);`<br>`expect(res.reason).toContain("Unknown or halted process");` | PASS |
| **process state isolation** | `hook-otp-mailbox.test.ts` | `Hook OTP Mailbox & Actor Runtime` | `should isolate state between different processes` | `expect(p2.state.counter).toBe(20);` | PASS |
| | `hook-otp-mailbox.test.ts` | `Hook OTP Mailbox & Actor Runtime` | `should route messages only to the addressed process` | `expect(p1.state.received).toBe("msg-for-p1");`<br>`expect(p2.state.received).toBe("");` | PASS |
| **transient crash restart** | `hook-otp-supervisor.test.ts` | `Hook OTP Supervisor & Quarantine` | `should restart process on transient crash` | `expect(res.reason).toContain("Process crashed and restarted");`<br>`expect(p.restartCount).toBe(1);` | PASS |
| **restart budget exhaustion** | `hook-otp-supervisor.test.ts` | `Hook OTP Supervisor & Quarantine` | `should exhaust restart budget and halt process` | `expect(p.isHalted).toBe(true);`<br>`expect(res.reason).toContain("Process halted: restart budget exhausted");` | PASS |
| | `hook-otp-nonmockable-stress.test.ts` | `Hook OTP Non-Mockable Stress Tests` | `Restart Budget Exhaustion Stress: should quarantine process and cease execution after budget is exceeded` | `expect(p.isHalted).toBe(true);`<br>`expect(res4.reason).toContain("Process halted");` | PASS |
| **poison quarantine** | `hook-otp-supervisor.test.ts` | `Hook OTP Supervisor & Quarantine` | `should restart process on transient crash` | `expect(runtime.quarantine).toHaveLength(1);` | PASS |
| | `hook-otp-nonmockable-stress.test.ts` | `Hook OTP Non-Mockable Stress Tests` | `Poison Message Quarantine Stress: should isolate only the poison message and allow other messages to process normally` | `expect(runtime.quarantine).toHaveLength(1);`<br>`expect(runtime.quarantine[0].message.id).toBe("m_poison");` | PASS |
| **sibling crash containment** | `hook-otp-supervisor.test.ts` | `Hook OTP Supervisor & Quarantine` | `should continue sibling process execution after one process crashes` | `expect(p1.isHalted).toBe(true);`<br>`expect(p2.state.value).toBe("stable");` | PASS |
| | `hook-otp-nonmockable-stress.test.ts` | `Hook OTP Non-Mockable Stress Tests` | `Sibling Crash Containment Stress: sibling processes should continue normally when one sibling crashes` | `expect(pA.state.val).toBe("msgA1msgA2");`<br>`expect(pC.state.val).toBe("msgC1");` | PASS |
| **capacity breach refusal** | `hook-otp-runtime.test.ts` | `Hook OTP Runtime & Reporting` | `should refuse capacity breach deltas` | `expect(res.allowed).toBe(false);`<br>`expect(res.reason).toContain("Capacity breach");` | PASS |
| | `hook-otp-nonmockable-stress.test.ts` | `Hook OTP Non-Mockable Stress Tests` | `Capacity Breach / Backpressure Stress: should refuse messages that exceed capacity bounds without mutating state` | `expect(resBreach.allowed).toBe(false);`<br>`expect(p.state.count).toBe(0);` | PASS |
| **confirmed receipt verifies** | `hook-otp-receipt-replay.test.ts` | `Hook OTP Receipts & Replay` | `should emit verifying receipts and converge on replay` | `expect(verifyReceipt(receipt)).toBe(true);`<br>`expect(receipt.status).toBe("confirmed");` | PASS |
| | `hook-otp-runtime.test.ts` | `Hook OTP Runtime & Reporting` | `should include lifecycle transitions in full report` | `expect(report.receipts.confirmedReceiptVerified).toBe(true);` | PASS |
| **refused receipt verifies** | `hook-otp-receipt-replay.test.ts` | `Hook OTP Receipts & Replay` | `should verify refused receipts and linkage chain` | `expect(verifyReceipt(res2.receipt)).toBe(true);`<br>`expect(res2.receipt.status).toBe("refused");` | PASS |
| | `hook-otp-runtime.test.ts` | `Hook OTP Runtime & Reporting` | `should include lifecycle transitions in full report` | `expect(report.receipts.refusedReceiptVerified).toBe(true);` | PASS |
| **replay convergence** | `hook-otp-receipt-replay.test.ts` | `Hook OTP Receipts & Replay` | `should emit verifying receipts and converge on replay` | `expect(replayMessage({ sum: 10 }, msg, receipt, behavior)).toBe(true);` | PASS |
| | `hook-otp-nonmockable-stress.test.ts` | `Hook OTP Non-Mockable Stress Tests` | `FIFO Causal Chain Stress: should process 1,000 messages in exact order with correct receipt chain linkage` | `expect(replayMessage(stateBefore, msg, receipts[idx], p.behavior)).toBe(true);` | PASS |
| | `hook-otp-nonmockable-stress.test.ts` | `Hook OTP Non-Mockable Stress Tests` | `Replay Under Schedule Noise Stress: receipt chains should remain valid across schedule interleaving` | `expect(r2A.receipt.receiptHash).toBe(r2B.receipt.receiptHash);` | PASS |
| **tamper divergence** | `hook-otp-receipt-replay.test.ts` | `Hook OTP Receipts & Replay` | `should fail replay on mutated message inputs or tampered receipts` | `expect(convergedWithMutatedInput).toBe(false);`<br>`expect(convergedWithTamperedReceipt).toBe(false);` | PASS |
| | `hook-otp-nonmockable-stress.test.ts` | `Hook OTP Non-Mockable Stress Tests` | `Tamper-After-Process Stress: verification must fail on any modified message payload or receipt properties` | `expect(replayMessage({ count: 0 }, mutatedMsg, receipt, p.behavior)).toBe(false);` | PASS |
| **deterministic lifecycle hash** | `hook-otp-runtime.test.ts` | `Hook OTP Runtime & Reporting` | `should be deterministic and produce the same lifecycle report hash for the same seed` | `expect(report1.reportHash).toBe(report2.reportHash);` | PASS |
| | `hook-otp-nonmockable-stress.test.ts` | `Hook OTP Non-Mockable Stress Tests` | `Deterministic Lifecycle Hash Stress: same seed must produce identical report hashes, timing/memory excluded` | `expect(report1.reportHash).toBe(report2.reportHash);` | PASS |

---

## Detailed Test Mapping Breakdown

### 1. `hook-otp-mailbox.test.ts`
- **Path**: `packages/truex-core/test/hook-otp/hook-otp-mailbox.test.ts`
- **Block**: `Hook OTP Mailbox & Actor Runtime`
- **Tests**:
  1. **FIFO ordering**:
     - **Name**: `should process messages in FIFO order`
     - **Assertion**:
       ```typescript
       expect(mailbox.pop()?.id).toBe("msg1");
       expect(mailbox.pop()?.id).toBe("msg2");
       expect(mailbox.isEmpty()).toBe(true);
       ```
     - **Status**: PASS
  2. **process state isolation**:
     - **Name**: `should isolate state between different processes`
     - **Assertion**:
       ```typescript
       expect(p2.state.counter).toBe(20);
       ```
     - **Status**: PASS
  3. **process routing isolation (state isolation aspect)**:
     - **Name**: `should route messages only to the addressed process`
     - **Assertion**:
       ```typescript
       expect(p1.state.received).toBe("msg-for-p1");
       expect(p2.state.received).toBe("");
       ```
     - **Status**: PASS
  4. **unknown process refusal**:
     - **Name**: `should refuse unknown process target`
     - **Assertion**:
       ```typescript
       expect(res.allowed).toBe(false);
       expect(res.reason).toContain("Unknown or halted process");
       expect(runtime.refusedReceipts).toHaveLength(1);
       ```
     - **Status**: PASS

### 2. `hook-otp-runtime.test.ts`
- **Path**: `packages/truex-core/test/hook-otp/hook-otp-runtime.test.ts`
- **Block**: `Hook OTP Runtime & Reporting`
- **Tests**:
  1. **capacity breach refusal**:
     - **Name**: `should refuse capacity breach deltas`
     - **Assertion**:
       ```typescript
       expect(res.allowed).toBe(false);
       expect(res.reason).toContain("Capacity breach");
       ```
     - **Status**: PASS
  2. **receipt verification audit metrics**:
     - **Name**: `should include lifecycle transitions in full report`
     - **Assertion**:
       ```typescript
       expect(report.receipts.confirmedReceiptVerified).toBe(true);
       expect(report.receipts.refusedReceiptVerified).toBe(true);
       expect(report.receipts.receiptChainVerified).toBe(true);
       expect(report.receipts.replayConvergenceVerified).toBe(true);
       ```
     - **Status**: PASS
  3. **deterministic lifecycle hash**:
     - **Name**: `should be deterministic and produce the same lifecycle report hash for the same seed`
     - **Assertion**:
       ```typescript
       expect(report1.reportHash).toBe(report2.reportHash);
       ```
     - **Status**: PASS

### 3. `hook-otp-supervisor.test.ts`
- **Path**: `packages/truex-core/test/hook-otp/hook-otp-supervisor.test.ts`
- **Block**: `Hook OTP Supervisor & Quarantine`
- **Tests**:
  1. **transient crash restart & poison quarantine**:
     - **Name**: `should restart process on transient crash`
     - **Assertion**:
       ```typescript
       expect(res.allowed).toBe(false);
       expect(p.restartCount).toBe(1);
       expect(runtime.quarantine).toHaveLength(1);
       ```
     - **Status**: PASS
  2. **restart budget exhaustion**:
     - **Name**: `should exhaust restart budget and halt process`
     - **Assertion**:
       ```typescript
       expect(p.isHalted).toBe(true);
       expect(res.reason).toContain("Process halted: restart budget exhausted");
       ```
     - **Status**: PASS
  3. **sibling crash containment**:
     - **Name**: `should continue sibling process execution after one process crashes`
     - **Assertion**:
       ```typescript
       expect(p1.isHalted).toBe(true);
       expect(res2.allowed).toBe(true);
       expect(p2.state.value).toBe("stable");
       ```
     - **Status**: PASS

### 4. `hook-otp-receipt-replay.test.ts`
- **Path**: `packages/truex-core/test/hook-otp/hook-otp-receipt-replay.test.ts`
- **Block**: `Hook OTP Receipts & Replay`
- **Tests**:
  1. **confirmed receipt verifies & replay convergence**:
     - **Name**: `should emit verifying receipts and converge on replay`
     - **Assertion**:
       ```typescript
       expect(verifyReceipt(receipt)).toBe(true);
       expect(converged).toBe(true);
       ```
     - **Status**: PASS
  2. **refused receipt verifies & linkage chain**:
     - **Name**: `should verify refused receipts and linkage chain`
     - **Assertion**:
       ```typescript
       expect(verifyReceipt(res2.receipt)).toBe(true);
       expect(res2.receipt.previousReceiptHash).toBe(res1.receipt.receiptHash);
       ```
     - **Status**: PASS
  3. **tamper divergence**:
     - **Name**: `should fail replay on mutated message inputs or tampered receipts`
     - **Assertion**:
       ```typescript
       expect(convergedWithMutatedInput).toBe(false);
       expect(convergedWithTamperedReceipt).toBe(false);
       ```
     - **Status**: PASS

### 5. `hook-otp-nonmockable-stress.test.ts`
- **Path**: `packages/truex-core/test/hook-otp/hook-otp-nonmockable-stress.test.ts`
- **Block**: `Hook OTP Non-Mockable Stress Tests`
- **Tests**:
  1. **FIFO ordering & replay convergence**:
     - **Name**: `FIFO Causal Chain Stress: should process 1,000 messages in exact order with correct receipt chain linkage`
     - **Assertion**:
       ```typescript
       expect(processedOrder[i]).toBe(`msg_${i}`);
       expect(receipts[i].previousReceiptHash).toBe(receipts[i-1].receiptHash);
       expect(replayMessage(stateBefore, msg, receipts[idx], p.behavior)).toBe(true);
       ```
     - **Status**: PASS
  2. **sibling crash containment**:
     - **Name**: `Sibling Crash Containment Stress: sibling processes should continue normally when one sibling crashes`
     - **Assertion**:
       ```typescript
       expect(pA.state.val).toBe("msgA1msgA2");
       expect(pC.state.val).toBe("msgC1");
       ```
     - **Status**: PASS
  3. **restart budget exhaustion**:
     - **Name**: `Restart Budget Exhaustion Stress: should quarantine process and cease execution after budget is exceeded`
     - **Assertion**:
       ```typescript
       expect(p.isHalted).toBe(true);
       expect(res4.reason).toContain("Process halted");
       ```
     - **Status**: PASS
  4. **poison quarantine**:
     - **Name**: `Poison Message Quarantine Stress: should isolate only the poison message and allow other messages to process normally`
     - **Assertion**:
       ```typescript
       expect(runtime.quarantine).toHaveLength(1);
       expect(runtime.quarantine[0].message.id).toBe("m_poison");
       ```
     - **Status**: PASS
  5. **capacity breach refusal**:
     - **Name**: `Capacity Breach / Backpressure Stress: should refuse messages that exceed capacity bounds without mutating state`
     - **Assertion**:
       ```typescript
       expect(resBreach.allowed).toBe(false);
       expect(p.state.count).toBe(0);
       ```
     - **Status**: PASS
  6. **replay convergence**:
     - **Name**: `Replay Under Schedule Noise Stress: receipt chains should remain valid across schedule interleaving`
     - **Assertion**:
       ```typescript
       expect(r2A.receipt.receiptHash).toBe(r2B.receipt.receiptHash);
       ```
     - **Status**: PASS
  7. **tamper divergence**:
     - **Name**: `Tamper-After-Process Stress: verification must fail on any modified message payload or receipt properties`
     - **Assertion**:
       ```typescript
       expect(replayMessage({ count: 0 }, mutatedMsg, receipt, p.behavior)).toBe(false);
       ```
     - **Status**: PASS
  8. **deterministic lifecycle hash**:
     - **Name**: `Deterministic Lifecycle Hash Stress: same seed must produce identical report hashes, timing/memory excluded`
     - **Assertion**:
       ```typescript
       expect(report1.reportHash).toBe(report2.reportHash);
       ```
     - **Status**: PASS
  9. **artifact & metrics reporting integrity**:
     - **Name**: `Observable Artifact Stress: report files should exist, verify status and FIFO/restart/quarantine metrics`
     - **Assertion**:
       ```typescript
       expect(contents.status).toBe("passed");
       expect(contents.runtime.fifoOrderingVerified).toBe(true);
       ```
     - **Status**: PASS
  10. **AGY bridge visibility & database WAL deltas**:
      - **Name**: `AGY Bridge Hook Visibility Stress: BeforeTool should reject fossil writes and admit clean writes producing WAL deltas`
      - **Assertion**:
        ```typescript
        expect(refusedError).toBeDefined();
        expect(count.count).toBeGreaterThan(0);
        ```
      - **Status**: PASS
