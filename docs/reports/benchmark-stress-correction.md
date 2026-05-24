# Benchmark Stress & Failure Correction Report

## Implementation of Real Runtime Checks

Rather than utilizing simulated mock checks or manual `if` branches, the benchmark stress-failure harness is now fully integrated with the core Jidoka and parser components:

### 1. Parser Refusal (Malformed Deltas)
Malformed delta validation is routed through `parseGraphDelta`. Passing a delta with invalid quad fields (e.g. `adds` as a non-array) throws parsing errors natively, proving that defective payloads are filtered before reaching the engine memory space.

### 2. Capacity Breach Refusal (Muri)
Capacity checks are routed through the `PokaYoke` precheck layer. A delta with over 100 quads (an addition/deletion capacity breach) is rejected by `validateSemanticLaws` under Law 4 (Muri/Input Capacity), triggering an immediate Andon line-stop condition.

### 3. Relevance / Muda Checks
Predicate matching is validated honestly. A hook configured with a delta-matching predicate condition (e.g. looking for `schema:assignedTo`) will throw an execution-blocked error under Law 3 (Muda/Relevance Check) if evaluated against a delta that does not contain that predicate.

### 4. Replay Divergence Validation
Replay divergence is tested via two vectors:
*   **Seed Mismatch:** Evaluation context seeds are mismatched during replay, validating that context-sensitive hooks detect divergence.
*   **Input Mutation:** The delta contents are mutated before replay execution, producing a mismatch between `hash(delta)` and `expectedReceipt.inputHash`, leading to a deterministic replay failure.

### 5. Receipt Tamper Detection
Modifying any cryptographic signature, lineage fields, or hashes in a receipt will result in a failure during verification via `verifyReceipt`.

---

## Verification Evidence

All stress/failure paths are verified automatically by the test suite.

```bash
npx vitest run packages/truex-core/test/benchmark
```

```text
 ✓ packages/truex-core/test/benchmark/generator.test.ts (6 tests)
 ✓ packages/truex-core/test/benchmark-entropy.test.ts (5 tests)
 ✓ packages/truex-core/test/benchmark/million-hook-church.test.ts (7 tests)

 Test Files  3 passed (3)
      Tests  18 passed (18)
```
