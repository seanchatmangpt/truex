import { describe, expect, it } from "vitest";
import { 
  mapHookInterference, 
  detectRaceConditions, 
  verifyPartialOrderConvergence 
} from "../packages/membrane/src/concurrency.js";
import { HookDefinition, GraphDelta } from "../packages/membrane/src/runtime-law.js";
import { TruexHook } from "../packages/membrane/src/hook.js";
import { createDeterministicContext } from "../packages/membrane/src/index.js";

describe("Truex Concurrency - Partial-Order Convergence", () => {
  const hookA: HookDefinition = {
    id: "hookA",
    name: "Hook A",
    condition: { kind: "delta-match", predicate: "p1" },
    effects: [{ kind: "add-quad", quad: { subject: "s1", predicate: "p2", object: "o1" } }]
  };

  const hookB: HookDefinition = {
    id: "hookB",
    name: "Hook B",
    condition: { kind: "delta-match", predicate: "p2" },
    effects: [{ kind: "add-quad", quad: { subject: "s2", predicate: "p3", object: "o2" } }]
  };

  const hookC: HookDefinition = {
    id: "hookC",
    name: "Hook C",
    condition: { kind: "delta-match", predicate: "p3" },
    effects: [{ kind: "add-quad", quad: { subject: "s1", predicate: "p1", object: "o3" } }]
  };

  it("identifies read-write interference (A writes what B reads)", () => {
    const interference = mapHookInterference(hookA, hookB);
    expect(interference.pattern).toBe("write-read");
    expect(interference.details[0].predicate).toBe("p2");
  });

  it("identifies write-read interference (B reads what A writes)", () => {
    const interference = mapHookInterference(hookB, hookA);
    expect(interference.pattern).toBe("read-write");
    expect(interference.details[0].predicate).toBe("p2");
  });

  it("identifies circular interference (A -> B -> C -> A)", () => {
    // A writes p2, B reads p2 and writes p3, C reads p3 and writes p1, A reads p1
    const interferenceAB = mapHookInterference(hookA, hookB);
    const interferenceBC = mapHookInterference(hookB, hookC);
    const interferenceCA = mapHookInterference(hookC, hookA);

    expect(interferenceAB.pattern).toBe("write-read");
    expect(interferenceBC.pattern).toBe("write-read");
    expect(interferenceCA.pattern).toBe("write-read");
  });

  it("identifies write-write interference", () => {
    const hookA2: HookDefinition = {
      id: "hookA2",
      name: "Hook A2",
      condition: { kind: "always" },
      effects: [{ kind: "add-quad", quad: { subject: "s1", predicate: "p1", object: "v1" } }]
    };
    const hookB2: HookDefinition = {
      id: "hookB2",
      name: "Hook B2",
      condition: { kind: "always" },
      effects: [{ kind: "add-quad", quad: { subject: "s1", predicate: "p1", object: "v2" } }]
    };

    const interference = mapHookInterference(hookA2, hookB2);
    expect(interference.pattern).toBe("write-write");
  });

  it("detects race conditions in a set of hooks", () => {
    const hookA2: HookDefinition = {
      id: "hookA2",
      name: "Hook A2",
      condition: { kind: "always" },
      effects: [{ kind: "add-quad", quad: { subject: "s1", predicate: "p1", object: "v1" } }]
    };
    const hookB2: HookDefinition = {
      id: "hookB2",
      name: "Hook B2",
      condition: { kind: "always" },
      effects: [{ kind: "add-quad", quad: { subject: "s1", predicate: "p1", object: "v2" } }]
    };

    const races = detectRaceConditions([hookA2, hookB2]);
    expect(races.length).toBe(1);
    expect(races[0].pattern).toBe("write-write");
  });

  it("verifies partial-order convergence for independent hooks", () => {
    const ctx = createDeterministicContext(1);
    const delta: GraphDelta = {
      id: "d1",
      adds: [{ subject: "s1", predicate: "p1", object: "o1" }],
      deletes: []
    };

    const hook1 = new TruexHook({
      id: "h1",
      name: "H1",
      condition: { kind: "delta-match", predicate: "p1" },
      effects: [{ kind: "emit-event", type: "e1" }]
    });

    const hook2 = new TruexHook({
      id: "h2",
      name: "H2",
      condition: { kind: "delta-match", predicate: "p1" },
      effects: [{ kind: "emit-event", type: "e2" }]
    });

    const r1 = hook1.execute(ctx, delta, undefined);
    const r2 = hook2.execute(ctx, delta, undefined);

    const replayCtx = createDeterministicContext(1);
    const converged = verifyPartialOrderConvergence(replayCtx, delta, [hook1, hook2], [r1.receipt, r2.receipt]);
    expect(converged).toBe(true);
  });

  it("refuses convergence for interfering hooks (write-write)", () => {
    const ctx = createDeterministicContext(1);
    const delta: GraphDelta = {
      id: "d1",
      adds: [{ subject: "s1", predicate: "p1", object: "o1" }],
      deletes: []
    };

    const hook1 = new TruexHook({
      id: "h1",
      name: "H1",
      condition: { kind: "delta-match", predicate: "p1" },
      effects: [{ kind: "add-quad", quad: { subject: "x", predicate: "y", object: "z1" } }]
    });

    const hook2 = new TruexHook({
      id: "h2",
      name: "H2",
      condition: { kind: "delta-match", predicate: "p1" },
      effects: [{ kind: "add-quad", quad: { subject: "x", predicate: "y", object: "z2" } }]
    });

    const r1 = hook1.execute(ctx, delta, undefined);
    const r2 = hook2.execute(ctx, delta, undefined);

    const converged = verifyPartialOrderConvergence(ctx, delta, [hook1, hook2], [r1.receipt, r2.receipt]);
    expect(converged).toBe(false); // Refused due to write-write interference
  });
});
