import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { ProductionScheduler } from '../src/manufacturing/heijunka.js';
import { KanbanSystem } from '../src/manufacturing/jit.js';
import { hookDefinitionArbitrary, graphDeltaArbitrary } from './utils/arbitraries.js';
import type { TruexContext } from '../src/context.js';

const isFastTest = process.env.FAST_TEST !== "0";
const numRuns = isFastTest ? 5 : 100;

describe('ProductionScheduler (Heijunka) - Property Tests', () => {
  let uuidCounter = 0;
  const mockContext: TruexContext = {
    seed: 42,
    clock: () => 1_716_595_200_000,
    uuid: () => `mock-uuid-${++uuidCounter}`,
  };

  it('should group deltas by hooks and execute them regardless of delta complexity', async () => {
    const maxHooks = isFastTest ? 3 : 10;
    const maxDeltas = isFastTest ? 5 : 20;
    await fc.assert(
      fc.asyncProperty(
        fc.array(hookDefinitionArbitrary, { minLength: 1, maxLength: maxHooks }),
        fc.array(graphDeltaArbitrary, { minLength: 1, maxLength: maxDeltas }),
        async (hooks, deltas) => {
          const line = new KanbanSystem(hooks);
          const scheduler = new ProductionScheduler(mockContext, line);
          
          const results = await scheduler.schedule(deltas);
          
          // Calculate expected number of executions
          let expectedExecutions = 0;
          const deltaHookMappings: Record<string, string[]> = {};
          
          for (const delta of deltas) {
             const pulled = line.pull(delta);
             expectedExecutions += pulled.length;
             deltaHookMappings[delta.id] = pulled.map(h => h.definition.id);
          }

          expect(results.length).toBe(expectedExecutions);

          // Verify each execution result matches a pulled hook for that delta
          for (const result of results) {
            expect(deltaHookMappings[result.deltaId]).toContain(result.hookId);
          }
        }
      ),
      { numRuns }
    );
  });

  it('should respect batchSize and yield to event loop', async () => {
    const maxHooks = isFastTest ? 2 : 5;
    const maxDeltas = isFastTest ? 4 : 10;
    await fc.assert(
      fc.asyncProperty(
        fc.array(hookDefinitionArbitrary, { minLength: 1, maxLength: maxHooks }),
        fc.array(graphDeltaArbitrary, { minLength: isFastTest ? 2 : 5, maxLength: maxDeltas }),
        fc.integer({ min: 1, max: 5 }), // batchSize
        async (hooks, deltas, batchSize) => {
          const line = new KanbanSystem(hooks);
          const scheduler = new ProductionScheduler(mockContext, line, { batchSize, intervalMs: 0 });
          
          const results = await scheduler.schedule(deltas);
          
          let expectedExecutions = 0;
          for (const delta of deltas) {
             expectedExecutions += line.pull(delta).length;
          }

          expect(results.length).toBe(expectedExecutions);
          // If we could spy on yieldToEventLoop, we'd check it was called floor(expectedExecutions / batchSize) times.
          // But since we are testing property-based, we mainly care that it completes and the results are correct.
        }
      ),
      { numRuns }
    );
  });

  it('should respect intervalMs and roughly take enough time', async () => {
    // Only run this for a small set of data to avoid slowing down tests too much
    const maxHooks = isFastTest ? 1 : 2;
    const maxDeltas = isFastTest ? 2 : 4;
    const intervalMs = isFastTest ? 1 : 10;
    await fc.assert(
      fc.asyncProperty(
        fc.array(hookDefinitionArbitrary, { minLength: 1, maxLength: maxHooks }),
        fc.array(graphDeltaArbitrary, { minLength: 2, maxLength: maxDeltas }),
        async (hooks, deltas) => {
          const line = new KanbanSystem(hooks);
          const batchSize = 1;
          const scheduler = new ProductionScheduler(mockContext, line, { batchSize, intervalMs });
          
          const start = Date.now();
          const results = await scheduler.schedule(deltas);
          const duration = Date.now() - start;
          
          let totalExecutions = 0;
          for (const delta of deltas) {
            totalExecutions += line.pull(delta).length;
          }

          if (totalExecutions > 0) {
            // It should have yielded totalExecutions times (since batchSize=1)
            // Each yield takes at least intervalMs.
            expect(duration).toBeGreaterThanOrEqual(totalExecutions * intervalMs * 0.8); // 0.8 to account for timer inaccuracy
          }
          
          expect(results.length).toBe(totalExecutions);
        }
      ),
      { numRuns: isFastTest ? 3 : 10 } // Limited runs for time-sensitive test
    );
  });
});
