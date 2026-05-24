import { describe, it, expect } from "vitest";
import { RecursiveHookEngine } from "../../src/manufacturing/topology.js";
import { createDeterministicContext } from "../../src/context.js";
import { TruexHook } from "../../src/hook.js";
import type { GraphDelta, HookDefinition } from "../../src/runtime-law.js";

describe("RecursiveHookEngine Topology Tests", () => {
  it("should execute a single hook activation and produce a simple topology", async () => {
    const ctx = createDeterministicContext(42);
    const engine = new RecursiveHookEngine(ctx);

    const initialDelta: GraphDelta = {
      id: "delta-root",
      adds: [{ subject: "actor1", predicate: "prov:hasStatus", object: "active" }],
      deletes: []
    };

    const hookDef: HookDefinition = {
      id: "hook-1",
      name: "Simple Status Reporter",
      condition: { kind: "delta-match", predicate: "prov:hasStatus" },
      effects: [{ kind: "emit-event", type: "status-reported" }]
    };
    const hook = new TruexHook(hookDef);

    const pullHooks = (d: GraphDelta) => {
      if (hook.matches(d)) return [hook];
      return [];
    };

    const execute = (h: TruexHook, d: GraphDelta, prevHash?: string) => {
      return h.execute(ctx, d, prevHash);
    };

    const topology = await engine.process(initialDelta, pullHooks, execute);

    expect(topology.rootDeltaId).toBe("delta-root");
    expect(topology.activations).toHaveLength(1);
    expect(topology.activations[0].hookId).toBe("hook-1");
    expect(topology.activations[0].depth).toBe(0);
    expect(topology.activations[0].receipt.status).toBe("confirmed");
    expect(topology.activations[0].producedDeltaId).toBeUndefined();
  });

  it("should support cascading hook activations with receipt chain lineage", async () => {
    const ctx = createDeterministicContext(42);
    const engine = new RecursiveHookEngine(ctx);

    const initialDelta: GraphDelta = {
      id: "delta-root",
      adds: [{ subject: "actor1", predicate: "action:trigger", object: "stage1" }],
      deletes: []
    };

    const hookDef1: HookDefinition = {
      id: "hook-stage1",
      name: "Stage 1 Processor",
      condition: { kind: "delta-match", predicate: "action:trigger" },
      effects: [{ kind: "add-quad", quad: { subject: "actor1", predicate: "action:next-stage", object: "stage2" } }]
    };

    const hookDef2: HookDefinition = {
      id: "hook-stage2",
      name: "Stage 2 Processor",
      condition: { kind: "delta-match", predicate: "action:next-stage" },
      effects: [{ kind: "emit-event", type: "cascade-complete" }]
    };

    const hook1 = new TruexHook(hookDef1);
    const hook2 = new TruexHook(hookDef2);

    const pullHooks = (d: GraphDelta) => {
      const matched = [];
      if (hook1.matches(d)) matched.push(hook1);
      if (hook2.matches(d)) matched.push(hook2);
      return matched;
    };

    const execute = (h: TruexHook, d: GraphDelta, prevHash?: string) => {
      return h.execute(ctx, d, prevHash);
    };

    const topology = await engine.process(initialDelta, pullHooks, execute);

    expect(topology.rootDeltaId).toBe("delta-root");
    expect(topology.activations).toHaveLength(2);
    
    const activation1 = topology.activations.find(a => a.hookId === "hook-stage1")!;
    const activation2 = topology.activations.find(a => a.hookId === "hook-stage2")!;

    expect(activation1.depth).toBe(0);
    expect(activation2.depth).toBe(1);

    expect(activation1.producedDeltaId).toBeDefined();
    expect(activation2.triggerDeltaId).toBe(activation1.producedDeltaId);

    expect(activation2.receipt.previousReceiptHash).toBe(activation1.receipt.receiptHash);
  });

  it("should enforce maximum depth limits to prevent infinite hook storms", async () => {
    const ctx = createDeterministicContext(42);
    const maxDepth = 3;
    const engine = new RecursiveHookEngine(ctx, { maxDepth, refuseOnBreach: true });

    const initialDelta: GraphDelta = {
      id: "delta-root",
      adds: [{ subject: "chain", predicate: "action:1", object: "start" }],
      deletes: []
    };

    const hooks = [
      new TruexHook({
        id: "hook-1",
        name: "Hook 1",
        condition: { kind: "delta-match", predicate: "action:1" },
        effects: [{ kind: "add-quad", quad: { subject: "chain", predicate: "action:2", object: "next" } }]
      }),
      new TruexHook({
        id: "hook-2",
        name: "Hook 2",
        condition: { kind: "delta-match", predicate: "action:2" },
        effects: [{ kind: "add-quad", quad: { subject: "chain", predicate: "action:3", object: "next" } }]
      }),
      new TruexHook({
        id: "hook-3",
        name: "Hook 3",
        condition: { kind: "delta-match", predicate: "action:3" },
        effects: [{ kind: "add-quad", quad: { subject: "chain", predicate: "action:4", object: "next" } }]
      }),
      new TruexHook({
        id: "hook-4",
        name: "Hook 4",
        condition: { kind: "delta-match", predicate: "action:4" },
        effects: [{ kind: "add-quad", quad: { subject: "chain", predicate: "action:5", object: "next" } }]
      })
    ];

    const pullHooks = (d: GraphDelta) => {
      return hooks.filter(h => h.matches(d));
    };

    const execute = (h: TruexHook, d: GraphDelta, prevHash?: string) => {
      return h.execute(ctx, d, prevHash);
    };

    let errorThrown = false;
    try {
      await engine.process(initialDelta, pullHooks, execute);
    } catch (err: any) {
      if (err.message.includes("Max depth breach")) {
        errorThrown = true;
      }
    }

    expect(errorThrown).toBe(true);
  });
});
