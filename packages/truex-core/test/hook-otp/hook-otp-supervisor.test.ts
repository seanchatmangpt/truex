import { describe, it, expect } from 'vitest';
import { 
  createHookOtpRuntime, 
  createHookProcess, 
  createHookSupervisor, 
  dispatchMessage 
} from '../../src/hook-otp.gall.js';

describe('Hook OTP Supervisor & Quarantine', () => {
  it('should restart process on transient crash', () => {
    const runtime = createHookOtpRuntime();
    const supervisor = createHookSupervisor("sup1", { maxRestarts: 3, withinMs: 5000 });
    runtime.supervisors.set("sup1", supervisor);

    let crashCounter = 0;
    const crashingBehavior = (state: any, msg: any) => {
      if (msg.delta.id === 'crash-me' && crashCounter === 0) {
        crashCounter++;
        throw new Error("Transient crash");
      }
      return {
        nextState: { count: (state.count || 0) + 1 },
        effects: []
      };
    };

    const p = createHookProcess("p1", crashingBehavior, { count: 0 });
    p.supervisorId = "sup1";
    runtime.processes.set("p1", p);
    supervisor.processes.set("p1", p);
    supervisor.initialStates.set("p1", { count: 0 });

    const res = dispatchMessage(runtime, {
      id: "m1",
      targetProcessId: "p1",
      delta: { id: "crash-me", adds: [], deletes: [] }
    });

    expect(res.allowed).toBe(false); // First dispatch crashes
    expect(res.reason).toContain("Process crashed and restarted");
    expect(p.restartCount).toBe(1);
    expect(runtime.quarantine).toHaveLength(1); // Poison message quarantined
  });

  it('should exhaust restart budget and halt process', () => {
    const runtime = createHookOtpRuntime();
    const supervisor = createHookSupervisor("sup1", { maxRestarts: 1, withinMs: 10000 });
    runtime.supervisors.set("sup1", supervisor);

    const behavior = () => {
      throw new Error("Permanent crash");
    };

    const p = createHookProcess("p1", behavior, {});
    p.supervisorId = "sup1";
    runtime.processes.set("p1", p);
    supervisor.processes.set("p1", p);
    supervisor.initialStates.set("p1", {});

    // First crash -> restarts
    dispatchMessage(runtime, { id: "m1", targetProcessId: "p1", delta: { id: "d1", adds: [], deletes: [] } });
    expect(p.restartCount).toBe(1);
    expect(p.isHalted).toBe(false);

    // Second crash -> budget exhausted -> halts
    const res = dispatchMessage(runtime, { id: "m2", targetProcessId: "p1", delta: { id: "d2", adds: [], deletes: [] } });
    expect(res.allowed).toBe(false);
    expect(p.isHalted).toBe(true);
    expect(res.reason).toContain("Process halted: restart budget exhausted");
  });

  it('should continue sibling process execution after one process crashes', () => {
    const runtime = createHookOtpRuntime();
    const supervisor = createHookSupervisor("sup1", { maxRestarts: 1, withinMs: 10000 });
    runtime.supervisors.set("sup1", supervisor);

    const behaviorCrashing = () => {
      throw new Error("Crash");
    };
    const behaviorStable = (state: any) => ({
      nextState: { value: "stable" },
      effects: []
    });

    const p1 = createHookProcess("p1", behaviorCrashing, {});
    const p2 = createHookProcess("p2", behaviorStable, { value: "init" });

    p1.supervisorId = "sup1";
    p2.supervisorId = "sup1";

    runtime.processes.set("p1", p1);
    runtime.processes.set("p2", p2);
    supervisor.processes.set("p1", p1);
    supervisor.processes.set("p2", p2);

    // Trigger crash in p1 (restarts)
    dispatchMessage(runtime, { id: "m1", targetProcessId: "p1", delta: { id: "d1", adds: [], deletes: [] } });
    // Trigger halt in p1 (halts)
    dispatchMessage(runtime, { id: "m2", targetProcessId: "p1", delta: { id: "d2", adds: [], deletes: [] } });

    expect(p1.isHalted).toBe(true);

    // Sibling process p2 continues functioning normally
    const res2 = dispatchMessage(runtime, { id: "m3", targetProcessId: "p2", delta: { id: "d3", adds: [], deletes: [] } });
    expect(res2.allowed).toBe(true);
    expect(p2.state.value).toBe("stable");
  });
});
