import { describe, it, expect } from 'vitest';
import { runMillionHookBenchmark, generateChurchDeltas } from '../../src/benchmark/million-hook-church.js';
import { TruexHook } from '../../src/hook.js';
import { hash } from '../../src/index.js';
import { AndonSystem, PokaYoke } from '../../src/manufacturing/jidoka.js';
import { runStressTests } from '../../src/benchmark/stress-tests.js';

describe('Million Hook Church Benchmark Corrections', () => {
  it('should run a minimal benchmark deterministically with corrected naming', () => {
    const options = {
      seed: 42,
      registeredHooks: 10,
      processedDeltas: 50,
      matchRatio: 0.5,
      evalOnly: false
    };

    const result1 = runMillionHookBenchmark(options);
    const result2 = runMillionHookBenchmark(options);

    // Determinism check
    expect(result1.metrics.matchedHooksCount).toBe(result2.metrics.matchedHooksCount);
    expect(result1.metrics.receiptsCount).toBe(result2.metrics.receiptsCount);
    expect(result1.metrics.effectsCount).toBe(result2.metrics.effectsCount);

    expect(result1.metrics.totalHookDeltaEvaluations).toBe(500);
    expect(result1.metrics.matchedHooksCount).toBeGreaterThan(0);
    expect(result1.metrics.receiptsCount).toBeGreaterThan(0);
    
    // Check metadata presence
    expect(result1.metadata.nodeVersion).toBeDefined();
    expect(result1.metadata.cpuModel).toBeDefined();
  });

  it('should approximate match ratio within tolerance', () => {
    const options = {
      seed: 42,
      registeredHooks: 50,
      processedDeltas: 200,
      matchRatio: 0.7,
      evalOnly: false
    };

    const result = runMillionHookBenchmark(options);
    // Observed match rate should approximate target matchRatio of 0.7
    expect(result.metrics.matchRateObserved).toBeGreaterThanOrEqual(0.5);
    expect(result.metrics.matchRateObserved).toBeLessThanOrEqual(0.9);
  });

  it('should vary outputs for different seeds (entropy verification)', () => {
    const deltas1 = generateChurchDeltas(42, 10, 0.5, ['rdf:type']);
    const deltas2 = generateChurchDeltas(12345, 10, 0.5, ['rdf:type']);

    expect(hash(deltas1)).not.toBe(hash(deltas2));
  });

  it('should verify replay convergence on matched hooks', () => {
    const options = {
      seed: 99,
      registeredHooks: 20,
      processedDeltas: 100,
      matchRatio: 0.5,
      evalOnly: false
    };

    const result = runMillionHookBenchmark(options);
    expect(result.metrics.replayConvergenceCount).toBeGreaterThan(0);
  });

  it('should trigger Muri halt on capacity breach through actual PokaYoke precheck', () => {
    const andon = new AndonSystem();
    const pokaYoke = new PokaYoke(andon);

    const hook = new TruexHook({
      id: 'hook-1',
      name: 'h',
      condition: { kind: 'always' },
      effects: [{ kind: 'emit-event', type: 'event-type' }]
    });

    const ctx = {
      uuid: () => 'uuid',
      clock: () => 123,
      sign: () => new Uint8Array()
    } as any;

    const massiveDelta = {
      id: 'massive-delta',
      adds: Array.from({ length: 101 }, (_, i) => ({
        subject: `s:${i}`,
        predicate: 'p',
        object: 'o',
        graph: null
      })),
      deletes: []
    };

    expect(() => 
      pokaYoke.guardExecution(hook, ctx, massiveDelta, () => ({ effects: [], receipt: {} as any, events: [] }))
    ).toThrow(/processing capacity/);

    expect(andon.isStopped()).toBe(true);
  });

  it('should pass all stress-failure suite checks', async () => {
    const stress = await runStressTests();
    if (!stress.passed) {
      console.error('Stress Test Failures:', stress.failures);
    }
    expect(stress.passed).toBe(true);
    expect(stress.failures.length).toBe(0);
    expect(stress.invariants.length).toBeGreaterThan(0);
    
    // Verify specific invariants we expect
    expect(stress.invariants).toContain("malformed delta correctly refused by parser (parseGraphDelta)");
    expect(stress.invariants).toContain("receipt tamper correctly detected");
    expect(stress.invariants).toContain("replay divergence correctly detected (seed mismatch)");
    expect(stress.invariants).toContain("replay divergence correctly detected (input mutation)");
    expect(stress.invariants).toContain("capacity breach (Muri) correctly blocked by Jidoka line stop");
    expect(stress.invariants).toContain("non-matching predicate correctly blocked by Muda check");
  });

  it('should complete T3 (Million Evaluations) under memory bounds', () => {
    const options = {
      seed: 88,
      registeredHooks: 1000,
      processedDeltas: 1000,
      matchRatio: 0.1,
      evalOnly: true // evaluation-only path
    };

    const result = runMillionHookBenchmark(options);
    expect(result.metrics.matchedHooksCount).toBeGreaterThan(0);
    expect(result.metrics.hookDeltaEvaluationsPerSecond).toBeGreaterThan(0);
    
    // Heap usage should not run out of bound
    expect(result.metadata.memoryAfterMb).toBeLessThan(1024);
  });
});
