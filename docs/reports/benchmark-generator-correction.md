# Benchmark Generator Correction Report

## Seeded Data Generation Invariants

To guarantee that benchmark results are reproducible and not subject to environment or clock skew, Truex uses a custom, deterministic, local-only data generator.

### Linear Congruential Generator (LCG)

The generator is powered by the `SeededPRNG` class, which implements a linear congruential generator:
```typescript
export class SeededPRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    return (this.state >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }
}
```

### Deterministic Rules (Hard Rules)

1.  **No `Math.random()`**: All random numbers are derived from `SeededPRNG.next()`.
2.  **No `Date.now()` or clock dependencies**: Timestamp/ordering is independent of execution clock.
3.  **No ambient `randomUUID()`**: All IDs (e.g. delta IDs, subject/object IDs) are derived sequentially or via the PRNG state.

---

## Verifications & Proofs

The generator is covered by tests in [generator.test.ts](file:///Users/sac/truex/packages/membrane/test/benchmark/generator.test.ts), which verify:
*   **Determinism:** Two generators initialized with the same seed produce identical lists of hooks and deltas.
*   **Entropy:** Changing the seed creates entirely different delta contents, resulting in unique cryptographic hashes.
*   **Match Ratio Control:** `generateChurchDeltas` uses the PRNG state to control whether a generated delta's predicate matches the pool of registered hook predicates. The observed match rate closely approximates the configured `matchRatio` within statistical tolerance (e.g. $\pm 0.2$).
*   **Delta Integrity:** All generated deltas are strictly valid `GraphDelta` objects containing proper `id`, `adds`, and `deletes` arrays.
