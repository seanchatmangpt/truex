import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { TruexHook, createDeterministicContext, hash } from "../packages/membrane/src/index.js";
import type { HookDefinition, GraphDelta, Quad } from "../packages/membrane/src/runtime-law.js";

describe("Truex Property Standard (TPS) - Hook Counter-Examples", () => {
  const quadArb = fc.record({
    subject: fc.string({ minLength: 1 }),
    predicate: fc.string({ minLength: 1 }),
    object: fc.string({ minLength: 1 }),
    graph: fc.option(fc.string({ minLength: 1 }))
  }) as fc.Arbitrary<Quad>;

  const deltaArb = fc.record({
    id: fc.uuid(),
    adds: fc.array(quadArb),
    deletes: fc.array(quadArb)
  }) as fc.Arbitrary<GraphDelta>;

  const conditionArb = fc.oneof(
    fc.constant({ kind: "always" as const }),
    fc.record({ kind: fc.constant("delta-match" as const), predicate: fc.string({ minLength: 1 }) })
  );

  const effectArb = fc.oneof(
    fc.record({ kind: fc.constant("emit-event" as const), type: fc.string({ minLength: 1 }) }),
    fc.record({ kind: fc.constant("add-quad" as const), quad: quadArb })
  );

  const definitionArb = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1 }),
    condition: conditionArb,
    effects: fc.array(effectArb, { minLength: 1 })
  }) as fc.Arbitrary<HookDefinition>;

  it("∀ valid execution, replay MUST converge (TPS-1)", () => {
    fc.assert(
      fc.property(fc.nat(), definitionArb, deltaArb, (seed, definition, delta) => {
        const hook = new TruexHook(definition);
        
        // Only test if it matches
        if (hook.matches(delta)) {
          const ctx = createDeterministicContext(seed);
          const { receipt } = hook.execute(ctx, delta, undefined);
          
          const replayCtx = createDeterministicContext(seed);
          expect(hook.replay(replayCtx, delta, receipt)).toBe(true);
        }
      })
    );
  });

  it("∀ tampered receipt, replay MUST fail (TPS-2)", () => {
    fc.assert(
      fc.property(
        fc.nat(), 
        definitionArb, 
        deltaArb, 
        fc.constantFrom("inputHash", "outputHash", "receiptHash", "status", "eventId"),
        (seed, definition, delta, fieldToTamper) => {
          const hook = new TruexHook(definition);
          
          if (hook.matches(delta)) {
            const ctx = createDeterministicContext(seed);
            const { receipt } = hook.execute(ctx, delta, undefined);
            
            // Tamper the receipt
            const tamperedReceipt = { ...receipt };
            if (fieldToTamper === "status") {
              tamperedReceipt.status = receipt.status === "confirmed" ? "refused" : "confirmed";
            } else {
              (tamperedReceipt as any)[fieldToTamper] += "_TAMPERED";
            }

            const replayCtx = createDeterministicContext(seed);
            // Replay must detect the tamper
            expect(hook.replay(replayCtx, delta, tamperedReceipt)).toBe(false);
          }
        }
      )
    );
  });

  it("∀ divergent execution context (clock/uuid), replay MUST fail (TPS-3)", () => {
    fc.assert(
      fc.property(fc.nat(), definitionArb, deltaArb, (seed, definition, delta) => {
        const hook = new TruexHook(definition);
        
        if (hook.matches(delta)) {
          const ctx = createDeterministicContext(seed);
          const { receipt } = hook.execute(ctx, delta, undefined);
          
          // Replay with a DIFFERENT seed (divergent entropy)
          const replayCtx = createDeterministicContext(seed + 1);
          expect(hook.replay(replayCtx, delta, receipt)).toBe(false);
        }
      })
    );
  });

  it("∀ mismatched delta, execute MUST throw (Refusal Proof)", () => {
    fc.assert(
      fc.property(fc.nat(), definitionArb, deltaArb, (seed, definition, delta) => {
        const hook = new TruexHook(definition);
        
        // Force a non-match if possible
        if (definition.condition.kind === "delta-match") {
          const predicate = definition.condition.predicate;
          const adds = delta.adds.filter(q => q.predicate !== predicate);
          const deletes = delta.deletes.filter(q => q.predicate !== predicate);
          const nonMatchingDelta = { ...delta, adds, deletes };
          
          const ctx = createDeterministicContext(seed);
          expect(() => hook.execute(ctx, nonMatchingDelta, undefined)).toThrow();
        }
      })
    );
  });
});
