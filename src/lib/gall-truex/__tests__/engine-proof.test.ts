import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { GallTruexPureEngine, MemoryReceiptStore } from '../engine-proof.js';
import type { HookDefinition, GraphDelta } from '../engine-proof.js';


describe('Engine Primitive', () => {
  const hooks: HookDefinition[] = [
    {
      id: 'test.hook',
      name: 'Test Hook',
      condition: { kind: 'always' },
      effects: [
        { kind: 'emit-event', type: 'always_event' }
      ]
    }
  ];

  const quadArb = fc.record({
    subject: fc.string({ minLength: 1 }),
    predicate: fc.string({ minLength: 1 }),
    object: fc.string({ minLength: 1 }),
    graph: fc.option(fc.string())
  });

  const validDeltaArb = fc.record({
    id: fc.string({ minLength: 1 }),
    adds: fc.array(quadArb, { maxLength: 5 }),
    deletes: fc.array(quadArb, { maxLength: 5 })
  });

  it('Validates admissible variability (all valid deltas converge)', () => {
    fc.assert(
      fc.property(validDeltaArb, (delta) => {
        const store = new MemoryReceiptStore();
        const engine = new GallTruexPureEngine(hooks, store);
        
        const result = engine.evaluate(delta);
        
        expect(result.receipt.status).toBe('confirmed');
        expect(engine.replay(delta, result.receipt)).toBe(true);
      })
    );
  });

  it('Fails unlawful invariants (missing required fields)', () => {
    fc.assert(
      fc.property(validDeltaArb, (delta) => {
        const store = new MemoryReceiptStore();
        const engine = new GallTruexPureEngine(hooks, store);
        
        const badDelta = { ...delta, id: '' };
        expect(() => engine.evaluate(badDelta)).toThrow('GraphDelta.id is required');
      })
    );
  });
});