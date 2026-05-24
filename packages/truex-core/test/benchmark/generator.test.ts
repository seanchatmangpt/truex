import { describe, it, expect } from 'vitest';
import { SeededPRNG, generateChurchDeltas, generateChurchHooks } from '../../src/benchmark/million-hook-church.js';
import { TruexHook } from '../../src/hook.js';

describe('Benchmark Data Generator', () => {
  describe('SeededPRNG', () => {
    it('should produce the same sequence for the same seed', () => {
      const prng1 = new SeededPRNG(42);
      const prng2 = new SeededPRNG(42);

      for (let i = 0; i < 100; i++) {
        expect(prng1.next()).toBe(prng2.next());
      }
    });

    it('should produce different sequences for different seeds', () => {
      const prng1 = new SeededPRNG(42);
      const prng2 = new SeededPRNG(43);

      let matches = 0;
      for (let i = 0; i < 100; i++) {
        if (prng1.next() === prng2.next()) {
          matches++;
        }
      }
      // Extremely unlikely to have many matches
      expect(matches).toBeLessThan(10);
    });
  });

  describe('generateChurchDeltas', () => {
    it('should be deterministic with the same seed', () => {
      const deltas1 = generateChurchDeltas(123, 50);
      const deltas2 = generateChurchDeltas(123, 50);

      expect(JSON.stringify(deltas1)).toBe(JSON.stringify(deltas2));
    });

    it('should be different with different seeds', () => {
      const deltas1 = generateChurchDeltas(123, 50);
      const deltas2 = generateChurchDeltas(456, 50);

      expect(JSON.stringify(deltas1)).not.toBe(JSON.stringify(deltas2));
    });
  });

  describe('generateChurchHooks', () => {
    it('should be deterministic with the same seed', () => {
      const hooks1 = generateChurchHooks(123, 20);
      const hooks2 = generateChurchHooks(123, 20);

      expect(JSON.stringify(hooks1)).toBe(JSON.stringify(hooks2));
    });
  });

  describe('Match Ratio', () => {
    it('should approximate the requested match ratio', () => {
      const seed = 777;
      const hookCount = 10;
      const deltaCount = 1000;
      const matchRatio = 0.5;

      const hookDefs = generateChurchHooks(seed, hookCount);
      const hooks = hookDefs.map(def => new TruexHook(def));
      const targetedPredicates = [...new Set(hookDefs.map(h => (h.condition as any).predicate))];
      const deltas = generateChurchDeltas(seed, deltaCount, matchRatio, targetedPredicates);

      let matchedDeltas = 0;
      for (const delta of deltas) {
        const isMatched = hooks.some(hook => hook.matches(delta));
        if (isMatched) matchedDeltas++;
      }

      const actualRatio = matchedDeltas / deltaCount;

      // With deltaCount = 1000, actual ratio should be extremely close to 0.5 (e.g. between 0.45 and 0.55)
      expect(actualRatio).toBeGreaterThanOrEqual(0.45);
      expect(actualRatio).toBeLessThanOrEqual(0.55);

      // Verify that it behaves deterministically (same seed -> same matches)
      const deltas2 = generateChurchDeltas(seed, deltaCount, matchRatio, targetedPredicates);
      let matchedDeltas2 = 0;
      for (const delta of deltas2) {
        const isMatched = hooks.some(hook => hook.matches(delta));
        if (isMatched) matchedDeltas2++;
      }
      expect(matchedDeltas).toBe(matchedDeltas2);

      // Verify that with a different seed, we get a different set of matches or ratio
      const seed2 = 999;
      const deltas3 = generateChurchDeltas(seed2, deltaCount, matchRatio, targetedPredicates);
      let matchedDeltas3 = 0;
      for (const delta of deltas3) {
        const isMatched = hooks.some(hook => hook.matches(delta));
        if (isMatched) matchedDeltas3++;
      }
      const actualRatio3 = matchedDeltas3 / deltaCount;
      expect(actualRatio3).toBeGreaterThanOrEqual(0.45);
      expect(actualRatio3).toBeLessThanOrEqual(0.55);

      // Compare actual stringified deltas to verify seed uniqueness/determinism
      expect(JSON.stringify(deltas)).not.toBe(JSON.stringify(deltas3));
    });
  });
});
