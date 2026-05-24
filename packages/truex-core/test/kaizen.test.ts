import { describe, it, expect } from "vitest";
import { RefiningEngine, GembaInspector } from "../src/manufacturing/kaizen.js";
import type { HookDefinition, GraphDelta, Receipt } from "../src/runtime-law.js";

describe("Kaizen Manufacturing (Continuous Improvement)", () => {
  it("RefiningEngine suggests tightening predicates for 'always' hooks when a pattern is detected", () => {
    const engine = new RefiningEngine();
    const hookId = "kaizen-hook-1";
    const definition: HookDefinition = {
      id: hookId,
      name: "Broad Hook",
      condition: { kind: "always" },
      effects: []
    };

    const delta: GraphDelta = {
      id: "delta-1",
      adds: [{ subject: "urn:user:1", predicate: "schema:name", object: "Alice" }],
      deletes: []
    };
    const receipt: Receipt = {
      id: "receipt-1",
      eventId: "event-1",
      deltaId: "delta-1",
      inputHash: "hash-in",
      outputHash: "hash-out",
      previousReceiptHash: null,
      status: "confirmed",
      receiptHash: "hash-receipt"
    };

    // Record several executions that all happen to have the same predicate
    for (let i = 0; i < 6; i++) {
      engine.recordExecution(
        hookId,
        { ...delta, id: `delta-${i}` },
        { ...receipt, id: `receipt-${i}` }
      );
    }

    const suggestions = engine.analyze(hookId, definition);
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].suggestedCondition).toEqual({
      kind: "delta-match",
      predicate: "schema:name"
    });
    expect(suggestions[0].confidence).toBeGreaterThan(0);
    expect(suggestions[0].reason).toContain("schema:name");
  });

  it("RefiningEngine does not suggest anything if there is no common pattern", () => {
    const engine = new RefiningEngine();
    const hookId = "kaizen-hook-2";
    const definition: HookDefinition = {
      id: hookId,
      name: "Broad Hook",
      condition: { kind: "always" },
      effects: []
    };

    // Record executions with different predicates
    for (let i = 0; i < 10; i++) {
      engine.recordExecution(
        hookId,
        {
          id: `delta-${i}`,
          adds: [{ subject: "s", predicate: `predicate-${i}`, object: "o" }],
          deletes: []
        },
        {
          id: `receipt-${i}`,
          eventId: `e-${i}`,
          deltaId: `delta-${i}`,
          inputHash: "h",
          outputHash: "h",
          previousReceiptHash: null,
          status: "confirmed",
          receiptHash: "rh"
        }
      );
    }

    const suggestions = engine.analyze(hookId, definition);
    expect(suggestions.length).toBe(0);
  });

  it("GembaInspector tracks real-time hook execution state and metrics", async () => {
    const inspector = new GembaInspector();
    const hookId = "hook-42";
    const name = "Validator Hook";

    // Start execution
    inspector.onBeginExecute(hookId, name);
    let state = inspector.getHookState(hookId, name);
    expect(state.status).toBe("executing");
    expect(state.executionCount).toBe(0);

    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 10));

    // End execution
    inspector.onEndExecute(hookId, name, true);
    state = inspector.getHookState(hookId, name);
    expect(state.status).toBe("idle");
    expect(state.executionCount).toBe(1);
    expect(state.averageExecutionDurationMs).toBeGreaterThan(0);
    expect(state.lastExecutionTime).toBeDefined();

    // Another one
    inspector.onBeginExecute(hookId, name);
    inspector.onEndExecute(hookId, name, false);
    state = inspector.getHookState(hookId, name);
    expect(state.status).toBe("error");
    expect(state.executionCount).toBe(2);

    const snapshot = inspector.snapshot();
    expect(snapshot.find(s => s.hookId === hookId)).toBeDefined();
  });
});
