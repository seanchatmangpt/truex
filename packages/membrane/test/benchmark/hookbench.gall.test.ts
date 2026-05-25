import { describe, it, expect } from 'vitest';
import { 
  runGallHookBench, 
  runHookTier, 
  runStressCases 
} from '../../src/benchmark/hookbench.gall.js';

describe('HookBench Gall Microframework', () => {
  it('should run T0 successfully', () => {
    const result = runHookTier('T0', { seed: 42 });
    expect(result.tier).toBe('T0');
    expect(result.metrics.registeredHooks).toBe(1);
    expect(result.metrics.processedDeltas).toBe(1);
    expect(result.metrics.totalHookDeltaEvaluations).toBe(1);
    expect(result.metrics.matchedHooks).toBe(1);
    expect(result.metrics.receipts).toBe(1);
    expect(result.metrics.replayConverged).toBe(1);
  });

  it('should be deterministic with the same seed', () => {
    const run1 = runGallHookBench({ seed: 100 });
    const run2 = runGallHookBench({ seed: 100 });

    expect(run1.reportHash).toBe(run2.reportHash);
    expect(run1.results[0].reportHash).toBe(run2.results[0].reportHash);
  });

  it('should change hashes with different seeds', () => {
    const run1 = runGallHookBench({ seed: 200 });
    const run2 = runGallHookBench({ seed: 201 });

    expect(run1.reportHash).not.toBe(run2.reportHash);
  });

  it('should run and verify all 15 stress failure cases', () => {
    const stress = runStressCases({
      seed: 42,
      registeredHooks: 5,
      processedDeltas: 5,
      matchRatio: 0.5,
      evalOnly: false
    });

    expect(stress).toHaveLength(19);

    // Assert that each has the required structure and passes
    for (const item of stress) {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.category).toBeDefined();
      expect(item.passed).toBe(true);
      expect(item.observedBehavior).toBeDefined();
      expect(item.evidence).toBeDefined();
    }

    const malformed = stress.find(s => s.name === 'malformed input');
    expect(malformed).toBeDefined();
    expect(malformed?.passed).toBe(true);

    const tamper = stress.find(s => s.name === 'receipt tamper');
    expect(tamper).toBeDefined();
    expect(tamper?.passed).toBe(true);

    const replayDiv = stress.find(s => s.name === 'replay input divergence');
    expect(replayDiv).toBeDefined();
    expect(replayDiv?.passed).toBe(true);

    const capacity = stress.find(s => s.name === 'capacity breach / Muri');
    expect(capacity).toBeDefined();
    expect(capacity?.passed).toBe(true);

    const wal = stress.find(s => s.name === 'WAL persistence mismatch');
    expect(wal).toBeDefined();
    expect(wal?.passed).toBe(true);

    const rollback = stress.find(s => s.name === 'rollback failure');
    expect(rollback).toBeDefined();
    expect(rollback?.passed).toBe(true);
  });

  it('should calculate metrics correctly', () => {
    const result = runHookTier('T1', { seed: 10, registeredHooks: 50, processedDeltas: 50 });
    const m = result.metrics;
    expect(m.totalHookDeltaEvaluations).toBe(2500);
    expect(m.hookDeltaEvaluationsPerSecond).toBeGreaterThanOrEqual(0);
    expect(m.deltasPerSecond).toBeGreaterThanOrEqual(0);
  });

  it('should classify eval-only and receipt-backed runs separately', () => {
    const evalRun = runHookTier('T3', { seed: 99, registeredHooks: 10, processedDeltas: 10, evalOnly: true });
    const receiptRun = runHookTier('T3', { seed: 99, registeredHooks: 10, processedDeltas: 10, evalOnly: false });

    expect(receiptRun.metrics.receipts).toBeGreaterThan(0);
    expect(evalRun.metrics.receipts).toBe(0);
    expect(evalRun.options.evalOnly).toBe(true);
    expect(receiptRun.options.evalOnly).toBe(false);
  });
});
