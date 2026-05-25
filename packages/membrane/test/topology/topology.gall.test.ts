/* eslint-disable unicorn/no-null, unicorn/prefer-structured-clone, unicorn/numeric-separators-style, @typescript-eslint/no-unused-vars */
import { describe, it, expect } from "vitest";
import {
  createTopologyRuntime,
  registerTopologyHook,
  emitTopologyDelta,
  runTopologyChain,
  replayTopologyChain,
  generateTopologyReport,
  type TopologyDelta,
} from "../../src/topology.gall.js";
import { type HookEffect } from "../../src/runtime-law.js";

describe("Topology Gall Runtime & Causal Topology", () => {
  it("should successfully execute a cascade of hooks with causal lineage", () => {
    const runtime = createTopologyRuntime(42);

    // Register Hook 1: matches predicate "action:start", increments counter, emits "action:step"
    registerTopologyHook(
      runtime,
      "hook-start",
      "Start Hook",
      { kind: "delta-match", predicate: "action:start" },
      (state, delta) => {
        const count = (state.count || 0) + 1;
        const nextState = { count };
        const effects: HookEffect[] = [
          {
            kind: "add-quad",
            quad: { subject: "ping", predicate: "action:step", object: "pong", graph: null },
          },
        ];
        return { nextState, effects };
      },
      { count: 0 }
    );

    // Register Hook 2: matches predicate "action:step", multiplies counter, emits event
    registerTopologyHook(
      runtime,
      "hook-step",
      "Step Hook",
      { kind: "delta-match", predicate: "action:step" },
      (state, delta) => {
        const value = (state.value || 2) * 5;
        const nextState = { value };
        const effects: HookEffect[] = [{ kind: "emit-event", type: "completed" }];
        return { nextState, effects };
      },
      { value: 2 }
    );

    const rootDelta: TopologyDelta = {
      id: "delta-start-id",
      adds: [{ subject: "user1", predicate: "action:start", object: "now", graph: null }],
      deletes: [],
    };

    const chain = emitTopologyDelta(runtime, rootDelta);
    const run = runTopologyChain(runtime, chain);

    expect(run.status).toBe("success");
    expect(run.receipts).toHaveLength(2);

    const r1 = run.receipts.find((r) => r.nodeId === "hook-start")!;
    const r2 = run.receipts.find((r) => r.nodeId === "hook-step")!;

    expect(r1.stateBefore.count).toBe(0);
    expect(r1.stateAfter.count).toBe(1);
    expect(r2.stateBefore.value).toBe(2);
    expect(r2.stateAfter.value).toBe(10);

    // Verify causal lineage chain: hook-step is triggered by delta produced by hook-start
    expect(r2.previousReceiptHash).toBe(r1.receiptHash);
    expect(r2.deltaId).toBeDefined();

    // Verify final states on runtime
    expect(runtime.nodes.get("hook-start")?.state.count).toBe(1);
    expect(runtime.nodes.get("hook-step")?.state.value).toBe(10);
  });

  it("should verify replay convergence on identical runs and detect tampering", () => {
    const runtime = createTopologyRuntime(42);

    registerTopologyHook(
      runtime,
      "hook-start",
      "Start Hook",
      { kind: "delta-match", predicate: "action:start" },
      (state, delta) => {
        const count = (state.count || 0) + 1;
        return { nextState: { count }, effects: [] };
      },
      { count: 10 }
    );

    const rootDelta: TopologyDelta = {
      id: "delta-start-id-2",
      adds: [{ subject: "user1", predicate: "action:start", object: "now", graph: null }],
      deletes: [],
    };

    const chain = emitTopologyDelta(runtime, rootDelta);
    
    // Save run details
    const expectedRun = runTopologyChain(runtime, chain);
    expect(expectedRun.status).toBe("success");

    // Replay the run on runtime, verify convergence passes
    const report = replayTopologyChain(runtime, chain, expectedRun);
    expect(report.status).toBe("passed");
    expect(report.replayConvergenceVerified).toBe(true);
    expect(report.accounting.succeeded).toBe(1);

    // Adversarial Tampering: mutated receipt hash
    const tamperedRun1 = JSON.parse(JSON.stringify(expectedRun));
    tamperedRun1.receipts[0].receiptHash = "tampered-hash-value";
    const reportTampered1 = replayTopologyChain(runtime, chain, tamperedRun1);
    expect(reportTampered1.replayConvergenceVerified).toBe(false);
    expect(reportTampered1.status).toBe("failed");

    // Adversarial Tampering: mutated stateAfter values
    const tamperedRun2 = JSON.parse(JSON.stringify(expectedRun));
    tamperedRun2.receipts[0].stateAfter.count = 999;
    const reportTampered2 = replayTopologyChain(runtime, chain, tamperedRun2);
    expect(reportTampered2.replayConvergenceVerified).toBe(false);
  });

  it("should rollback node states to pre-run values when execution fails", () => {
    const runtime = createTopologyRuntime(100);

    registerTopologyHook(
      runtime,
      "hook-ok",
      "Successful Hook",
      { kind: "delta-match", predicate: "action:start" },
      (state) => {
        return {
          nextState: { value: "mutated" },
          effects: [
            {
              kind: "add-quad",
              quad: { subject: "sub", predicate: "action:fail", object: "obj", graph: null },
            },
          ],
        };
      },
      { value: "original" }
    );

    registerTopologyHook(
      runtime,
      "hook-fail",
      "Failing Hook",
      { kind: "delta-match", predicate: "action:fail" },
      () => {
        throw new Error("Deliberate execution failure for rollback testing");
      },
      { stateVal: 42 }
    );

    const rootDelta: TopologyDelta = {
      id: "delta-start",
      adds: [{ subject: "s", predicate: "action:start", object: "o", graph: null }],
      deletes: [],
    };

    const chain = emitTopologyDelta(runtime, rootDelta);
    const run = runTopologyChain(runtime, chain);

    // Run status must be rollback
    expect(run.status).toBe("rollback");
    expect(run.error).toContain("Deliberate execution failure");

    // Verify states rolled back perfectly to their original values
    expect(runtime.nodes.get("hook-ok")?.state.value).toBe("original");
    expect(runtime.nodes.get("hook-ok")?.lastReceiptHash).toBeNull();
    expect(runtime.nodes.get("hook-fail")?.state.stateVal).toBe(42);

    // Verify rollback receipts are appended (for both hook-fail and hook-ok)
    const rollbacks = run.receipts.filter((r) => r.eventId.startsWith("evt_rollback_"));
    expect(rollbacks).toHaveLength(2);
    // The second rollback in reverse order corresponds to hook-ok
    expect(rollbacks[1].nodeId).toBe("hook-ok");
    expect(rollbacks[1].stateBefore).toEqual({ value: "mutated" });
    expect(rollbacks[1].stateAfter).toEqual({ value: "original" });
  });

  it("should contain and rollback infinite loops (hook storms)", () => {
    const runtime = createTopologyRuntime(999);

    // Loop Hook A: triggers on action:ping, emits action:pong
    registerTopologyHook(
      runtime,
      "hook-a",
      "Ping Hook",
      { kind: "delta-match", predicate: "action:ping" },
      (state) => {
        return {
          nextState: { pingCount: (state.pingCount || 0) + 1 },
          effects: [
            {
              kind: "add-quad",
              quad: { subject: "s", predicate: "action:pong", object: "o", graph: null },
            },
          ],
        };
      },
      { pingCount: 0 }
    );

    // Loop Hook B: triggers on action:pong, emits action:ping
    registerTopologyHook(
      runtime,
      "hook-b",
      "Pong Hook",
      { kind: "delta-match", predicate: "action:pong" },
      (state) => {
        return {
          nextState: { pongCount: (state.pongCount || 0) + 1 },
          effects: [
            {
              kind: "add-quad",
              quad: { subject: "s", predicate: "action:ping", object: "o", graph: null },
            },
          ],
        };
      },
      { pongCount: 0 }
    );

    const rootDelta: TopologyDelta = {
      id: "delta-ping-root",
      adds: [{ subject: "s", predicate: "action:ping", object: "o", graph: null }],
      deletes: [],
    };

    const chain = emitTopologyDelta(runtime, rootDelta);
    const run = runTopologyChain(runtime, chain);

    expect(run.status).toBe("rollback");
    expect(run.error).toContain("Cyclic hook storm detected");

    // Verify loop storm record exists
    expect(runtime.storms).toHaveLength(1);
    expect(runtime.storms[0].path).toContain("hook-a");
    expect(runtime.storms[0].path).toContain("hook-b");

    // Verify states rolled back to initial state 0
    expect(runtime.nodes.get("hook-a")?.state.pingCount).toBe(0);
    expect(runtime.nodes.get("hook-b")?.state.pongCount).toBe(0);
  });

  it("should be deterministic for the same parentSeed and different for other seeds", () => {
    const rootDelta: TopologyDelta = {
      id: "delta-deterministic",
      adds: [{ subject: "s", predicate: "action:ping", object: "o", graph: null }],
      deletes: [],
    };

    const behavior = (state: any) => ({ nextState: { ok: true }, effects: [] });

    // Seed 42 execution
    const rt1 = createTopologyRuntime(42);
    registerTopologyHook(rt1, "h1", "h1", { kind: "always" }, behavior, {});
    const run1 = runTopologyChain(rt1, emitTopologyDelta(rt1, rootDelta));

    // Seed 42 identical rerun
    const rt2 = createTopologyRuntime(42);
    registerTopologyHook(rt2, "h1", "h1", { kind: "always" }, behavior, {});
    const run2 = runTopologyChain(rt2, emitTopologyDelta(rt2, rootDelta));

    // Seed 43 execution
    const rt3 = createTopologyRuntime(43);
    registerTopologyHook(rt3, "h1", "h1", { kind: "always" }, behavior, {});
    const run3 = runTopologyChain(rt3, emitTopologyDelta(rt3, rootDelta));

    // Deterministic matching receipt hashes
    expect(run1.receipts[0].receiptHash).toBe(run2.receipts[0].receiptHash);
    
    // Mutation/entropy dependency causes different receipt hash
    expect(run1.receipts[0].receiptHash).not.toBe(run3.receipts[0].receiptHash);
  });

  it("should produce a correct diagnostic report from generateTopologyReport", () => {
    const runtime = createTopologyRuntime(12345);

    registerTopologyHook(
      runtime,
      "hook-report",
      "Report Hook",
      { kind: "always" },
      () => ({ nextState: { done: true }, effects: [] }),
      {}
    );

    const rootDelta: TopologyDelta = {
      id: "delta-report",
      adds: [{ subject: "s", predicate: "p", object: "o", graph: null }],
      deletes: [],
    };

    const chain = emitTopologyDelta(runtime, rootDelta);
    const run = runTopologyChain(runtime, chain);
    const replayReport = replayTopologyChain(runtime, chain, run);

    const report = generateTopologyReport(runtime, run, replayReport);

    expect(report.runId).toBe(run.id);
    expect(report.status).toBe("success");
    expect(report.receiptsCount).toBe(1);
    expect(report.nodes).toHaveLength(1);
    expect(report.nodes[0].id).toBe("hook-report");
    expect(report.replay).toBeDefined();
    expect(report.replay.status).toBe("passed");
    expect(report.replay.replayConvergenceVerified).toBe(true);
    expect(report.replay.accounting.attempted).toBe(1);
    expect(report.reportHash).toBeDefined();
  });
});
