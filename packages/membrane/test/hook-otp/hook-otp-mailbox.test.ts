import { describe, it, expect } from 'vitest';
import { 
  createHookOtpRuntime, 
  createHookProcess, 
  dispatchMessage, 
  createHookMailbox 
} from '../../src/hook-otp.gall.js';

describe('Hook OTP Mailbox & Actor Runtime', () => {
  it('should process messages in FIFO order', () => {
    const mailbox = createHookMailbox();
    mailbox.push({ id: "msg1", targetProcessId: "p1", delta: { id: "d1", adds: [], deletes: [] } });
    mailbox.push({ id: "msg2", targetProcessId: "p1", delta: { id: "d2", adds: [], deletes: [] } });
    
    expect(mailbox.pop()?.id).toBe("msg1");
    expect(mailbox.pop()?.id).toBe("msg2");
    expect(mailbox.isEmpty()).toBe(true);
  });

  it('should isolate state between different processes', () => {
    const p1 = createHookProcess("p1", (s) => s, { counter: 10 });
    const p2 = createHookProcess("p2", (s) => s, { counter: 20 });

    p1.state.counter = 99;
    expect(p2.state.counter).toBe(20);
  });

  it('should route messages only to the addressed process', () => {
    const runtime = createHookOtpRuntime();
    const behavior = (state: any, msg: any) => ({
      nextState: { received: msg.id },
      effects: []
    });

    const p1 = createHookProcess("p1", behavior, { received: "" });
    const p2 = createHookProcess("p2", behavior, { received: "" });

    runtime.processes.set("p1", p1);
    runtime.processes.set("p2", p2);

    dispatchMessage(runtime, {
      id: "msg-for-p1",
      targetProcessId: "p1",
      delta: { id: "d1", adds: [], deletes: [] }
    });

    expect(p1.state.received).toBe("msg-for-p1");
    expect(p2.state.received).toBe("");
  });

  it('should refuse unknown process target', () => {
    const runtime = createHookOtpRuntime();
    const res = dispatchMessage(runtime, {
      id: "msg-unk",
      targetProcessId: "unknown-process",
      delta: { id: "d1", adds: [], deletes: [] }
    });

    expect(res.allowed).toBe(false);
    expect(res.reason).toContain("Unknown or halted process");
    expect(runtime.refusedReceipts).toHaveLength(1);
    expect(runtime.refusedReceipts[0].status).toBe("refused");
  });
});
