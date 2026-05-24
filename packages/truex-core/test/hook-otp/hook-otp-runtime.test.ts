import { describe, it, expect } from 'vitest';
import { 
  createHookOtpRuntime, 
  createHookProcess, 
  dispatchMessage, 
  generateHookOtpReport, 
  runHookOtpProof 
} from '../../src/hook-otp.gall.js';

describe('Hook OTP Runtime & Reporting', () => {
  it('should refuse capacity breach deltas', () => {
    const runtime = createHookOtpRuntime();
    const p = createHookProcess("p1", (s) => s, {});
    runtime.processes.set("p1", p);

    const massiveDelta = {
      id: "massive",
      adds: Array.from({ length: 101 }, (_, i) => ({ subject: `s:${i}`, predicate: "p", object: "o", graph: null })),
      deletes: []
    };

    const res = dispatchMessage(runtime, {
      id: "m-massive",
      targetProcessId: "p1",
      delta: massiveDelta
    });

    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("Capacity breach");
    expect(runtime.refusedReceipts).toHaveLength(1);
  });

  it('should include lifecycle transitions in full report', () => {
    const report = runHookOtpProof();
    expect(report.case).toBe("hook-otp-equivalence");
    expect(report.status).toBe("passed");
    expect(report.otpEquivalentNotOtp).toBe(true);

    expect(report.runtime.processes).toBeGreaterThan(0);
    expect(report.runtime.messagesDispatched).toBeGreaterThan(0);
    expect(report.runtime.messagesProcessed).toBeGreaterThan(0);
    expect(report.runtime.messagesConfirmed).toBeGreaterThan(0);
    expect(report.runtime.messagesRefused).toBeGreaterThan(0);
    expect(report.runtime.messagesQuarantined).toBeGreaterThan(0);
    expect(report.runtime.restarts).toBeGreaterThan(0);

    expect(report.receipts.confirmedReceiptVerified).toBe(true);
    expect(report.receipts.refusedReceiptVerified).toBe(true);
    expect(report.receipts.receiptChainVerified).toBe(true);
    expect(report.receipts.replayConvergenceVerified).toBe(true);

    expect(report.benchmark.rawHookOpsPerSecond).toBeGreaterThan(0);
    expect(report.benchmark.otpMessageOpsPerSecond).toBeGreaterThan(0);
    expect(report.benchmark.receiptBackedOtpOpsPerSecond).toBeGreaterThan(0);
    expect(report.benchmark.overheadRatio).toBeGreaterThan(0);

    expect(report.reportHash).toBeDefined();
  });

  it('should be deterministic and produce the same lifecycle report hash for the same seed, and a different hash for a mutated/tampered seed', () => {
    const report1 = runHookOtpProof(42);
    const report2 = runHookOtpProof(42);
    const report3 = runHookOtpProof(43); // mutated/tampered seed

    expect(report1.reportHash).toBe(report2.reportHash);
    expect(report1.reportHash).not.toBe(report3.reportHash);
  });
});
