import { describe, it, expect } from 'vitest';
import { 
  createHookOtpRuntime, 
  createHookProcess, 
  dispatchMessage, 
  replayMessage 
} from '../../src/hook-otp.gall.js';
import { verifyReceipt } from '../../src/index.js';

describe('Hook OTP Receipts & Replay', () => {
  it('should emit verifying receipts and converge on replay', () => {
    const runtime = createHookOtpRuntime();
    const behavior = (state: any, msg: any) => ({
      nextState: { sum: (state.sum || 0) + 1 },
      effects: []
    });

    const p = createHookProcess("p1", behavior, { sum: 10 });
    runtime.processes.set("p1", p);

    const msg = {
      id: "m1",
      targetProcessId: "p1",
      delta: { id: "d1", adds: [], deletes: [] }
    };

    const res = dispatchMessage(runtime, msg);
    expect(res.allowed).toBe(true);

    const receipt = res.receipt;
    expect(verifyReceipt(receipt)).toBe(true);
    expect(receipt.status).toBe("confirmed");

    // Replay should converge
    const converged = replayMessage({ sum: 10 }, msg, receipt, behavior);
    expect(converged).toBe(true);
  });

  it('should verify refused receipts and linkage chain', () => {
    const runtime = createHookOtpRuntime();
    const behavior = (state: any, msg: any) => ({
      nextState: { count: state.count + 1 },
      effects: []
    });

    const p = createHookProcess("p1", behavior, { count: 0 });
    runtime.processes.set("p1", p);

    // 1st: Valid message
    const res1 = dispatchMessage(runtime, { id: "m1", targetProcessId: "p1", delta: { id: "d1", adds: [], deletes: [] } });
    
    // 2nd: Malformed message (should refuse)
    const res2 = dispatchMessage(runtime, { id: "m2", targetProcessId: "p1", delta: { id: "bad", adds: "not-an-array" } as any });

    expect(res1.allowed).toBe(true);
    expect(res2.allowed).toBe(false);

    expect(verifyReceipt(res1.receipt)).toBe(true);
    expect(verifyReceipt(res2.receipt)).toBe(true);

    // Check chain link
    expect(res2.receipt.previousReceiptHash).toBe(res1.receipt.receiptHash);
  });

  it('should fail replay on mutated message inputs or tampered receipts', () => {
    const runtime = createHookOtpRuntime();
    const behavior = (state: any, msg: any) => ({
      nextState: { sum: state.sum + 1 },
      effects: []
    });

    const p = createHookProcess("p1", behavior, { sum: 0 });
    runtime.processes.set("p1", p);

    const msg = { id: "m1", targetProcessId: "p1", delta: { id: "d1", adds: [], deletes: [] } };
    const res = dispatchMessage(runtime, msg);
    const receipt = res.receipt;

    // Mutated message input replay fails
    const mutatedMsg = { ...msg, delta: { id: "d1", adds: [{ subject: "s", predicate: "p", object: "o", graph: null }], deletes: [] } };
    const convergedWithMutatedInput = replayMessage({ sum: 0 }, mutatedMsg, receipt, behavior);
    expect(convergedWithMutatedInput).toBe(false);

    // Tampered receipt verifies as false
    const tamperedReceipt = { ...receipt, outputHash: "0".repeat(64) };
    const convergedWithTamperedReceipt = replayMessage({ sum: 0 }, msg, tamperedReceipt, behavior);
    expect(convergedWithTamperedReceipt).toBe(false);
  });
});
