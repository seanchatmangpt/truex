import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { TruexHook, createDeterministicContext, hash } from "../packages/truex-core/src/index.js";

describe("Truex Core - Hook Primitive Property Tests", () => {
  it("proves receipted lineage and deterministic convergence across random deltas", () => {
    fc.assert(
      fc.property(
        fc.integer(), // seed for context
        fc.record({
          id: fc.string({ minLength: 1 }),
          adds: fc.array(fc.record({ 
            subject: fc.string({ minLength: 1 }), 
            predicate: fc.string({ minLength: 1 }), 
            object: fc.string({ minLength: 1 }) 
          })),
          deletes: fc.array(fc.record({ 
            subject: fc.string({ minLength: 1 }), 
            predicate: fc.string({ minLength: 1 }), 
            object: fc.string({ minLength: 1 }) 
          }))
        }), // delta
        fc.record({
          id: fc.string({ minLength: 1 }),
          name: fc.string({ minLength: 1 }),
          condition: fc.oneof(
            fc.constant({ kind: 'always' as const }),
            fc.record({ kind: fc.constant('delta-match' as const), predicate: fc.string({ minLength: 1 }) })
          ),
          effects: fc.array(fc.oneof(
            fc.record({ kind: fc.constant('emit-event' as const), type: fc.string({ minLength: 1 }) }),
            fc.record({ kind: fc.constant('add-quad' as const), quad: fc.record({ 
              subject: fc.string({ minLength: 1 }), 
              predicate: fc.string({ minLength: 1 }), 
              object: fc.string({ minLength: 1 }) 
            }) })
          ))
        }), // hook definition
        (seed, delta, definition) => {
          const ctx = createDeterministicContext(seed);
          const hook = new TruexHook(definition);

          if (hook.matches(delta)) {
            const { effects, receipt, events } = hook.execute(ctx, delta, undefined);
            
            // 1. Strict Isolation & Lineage Verification
            expect(receipt.status).toBe("confirmed");
            expect(receipt.inputHash).toBe(hash(delta));
            expect(receipt.outputHash).toBe(hash({ effects, events }));
            expect(receipt.deltaId).toBe(delta.id);

            // 2. Deterministic Convergence (Replay)
            // Replay must yield the exact same receipt hash given the same seed and input
            const replayCtx = createDeterministicContext(seed);
            const converged = hook.replay(replayCtx, delta, receipt);
            expect(converged).toBe(true);

            // 3. Negative Replay Verification (Tamper Resistance)
            // If the delta is changed, the receipt should no longer be valid for it
            const tamperedDelta = { ...delta, id: delta.id + "-tampered" };
            const tamperedConverged = hook.replay(replayCtx, tamperedDelta, receipt);
            expect(tamperedConverged).toBe(false);
          } else {
            // If it doesn't match, execute should throw
            expect(() => hook.execute(ctx, delta, undefined)).toThrow();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("maintains unforgeable lineage through previousReceiptHash chaining", () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.string({ minLength: 1 }), // previousReceiptHash
        (seed, prevHash) => {
          const ctx = createDeterministicContext(seed);
          const delta = { id: "d1", adds: [], deletes: [] };
          const hook = new TruexHook({
            id: "h1",
            name: "Always Hook",
            condition: { kind: 'always' },
            effects: []
          });

          const { receipt } = hook.execute(ctx, delta, prevHash);
          expect(receipt.previousReceiptHash).toBe(prevHash);
          
          // Verify that receiptHash depends on previousReceiptHash
          const { receipt: receiptNoPrev } = hook.execute(ctx, delta, undefined);
          expect(receipt.receiptHash).not.toBe(receiptNoPrev.receiptHash);
        }
      )
    );
  });
});
