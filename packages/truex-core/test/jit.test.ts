import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { KanbanSystem } from '../src/manufacturing/jit.js';
import { hookDefinitionArbitrary, graphDeltaArbitrary } from './utils/arbitraries.js';

describe('KanbanSystem (JIT/Kanban) - Property Tests', () => {
  it('should always pull correct hooks matching the delta predicates regardless of complexity', () => {
    fc.assert(
      fc.property(
        fc.array(hookDefinitionArbitrary, { minLength: 1, maxLength: 20 }),
        graphDeltaArbitrary,
        (hooks, delta) => {
          const kanban = new KanbanSystem(hooks);
          const pulled = kanban.pull(delta);

          // Get all predicates present in the delta
          const deltaPredicates = new Set([
            ...delta.adds.map(q => q.predicate),
            ...delta.deletes.map(q => q.predicate)
          ]);

          for (const hook of hooks) {
            const isAlways = hook.condition.kind === 'always';
            const isMatch = hook.condition.kind === 'delta-match' && deltaPredicates.has(hook.condition.predicate);
            
            const isPulled = pulled.some(h => h.definition === hook);
            
            if (isAlways || isMatch) {
              expect(isPulled, `Hook ${hook.id} should have been pulled`).toBe(true);
            } else {
              expect(isPulled, `Hook ${hook.id} should NOT have been pulled`).toBe(false);
            }
          }
        }
      )
    );
  });

  it('should maintain idempotency: pulling multiple times with same delta gives same hooks', () => {
    fc.assert(
      fc.property(
        fc.array(hookDefinitionArbitrary, { minLength: 1, maxLength: 10 }),
        graphDeltaArbitrary,
        (hooks, delta) => {
          const kanban = new KanbanSystem(hooks);
          const pulled1 = kanban.pull(delta).map(h => h.definition.id).sort();
          const pulled2 = kanban.pull(delta).map(h => h.definition.id).sort();
          
          expect(pulled1).toEqual(pulled2);
        }
      )
    );
  });
});
