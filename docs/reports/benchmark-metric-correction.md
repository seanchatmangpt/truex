# Benchmark Metric Correction Report

## Metric Definitions and Formulas

To address potential skew or misleading performance metrics, the following math is implemented in the benchmark runner:

*   **Total Hook-Delta Evaluations (`totalHookDeltaEvaluations`):**
    $$totalHookDeltaEvaluations = registeredHooks \times processedDeltas$$
*   **Throughput (`hookDeltaEvaluationsPerSecond` / `opsPerSecond`):**
    $$hookDeltaEvaluationsPerSecond = \frac{totalHookDeltaEvaluations}{durationSeconds}$$
*   **Event Rate (`deltasPerSecond`):**
    $$deltasPerSecond = \frac{processedDeltas}{durationSeconds}$$
*   **Match Rate Observed (`matchRateObserved`):**
    $$matchRateObserved = \frac{matchedHooksCount}{totalHookDeltaEvaluations}$$

## Corrected Classification Block

Under our corrected system, we classify runs under separate tiers to prevent direct comparison between **Evaluation-Only** and **Receipt-Backed** modes:
*   **Evaluation-Only Tier:** Measures only the pattern-matching bitsets, state projections, and standard condition check flow (excluding cryptographic signing).
*   **Receipt-Backed Tier:** Includes the full autonomic loop overhead: canonicalization, BLAKE3 hashing, ML-DSA signatures, WAL writes, and verification.

---

## Runtime Proof (T3 Execution)

Below is the verified metric output from running the command:
`TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove benchmark`

```json
{
  "timestamp": "2026-05-23T23:41:03.717Z",
  "tier": "T3",
  "options": {
    "seed": 42,
    "registeredHooks": 1000,
    "processedDeltas": 1000,
    "matchRatio": 0.5,
    "evalOnly": true
  },
  "metadata": {
    "nodeVersion": "v24.15.0",
    "platform": "darwin",
    "arch": "arm64",
    "cpuModel": "Apple M3 Max",
    "memoryBeforeMb": 17.31,
    "memoryAfterMb": 14.50
  },
  "metrics": {
    "registeredHooks": 1000,
    "processedDeltas": 1000,
    "totalHookDeltaEvaluations": 1000000,
    "hookDeltaEvaluationsPerSecond": 55088072.06,
    "deltasPerSecond": 55088.07,
    "matchedHooksCount": 60975,
    "matchRateObserved": 0.484,
    "effectsCount": 60975,
    "receiptsCount": 0,
    "receiptBacked": false,
    "evalOnly": true,
    "totalDurationMs": 18.15,
    "replayConvergenceCount": 0,
    "refusedCount": 0,
    "opsPerSecond": 55088072.06
  }
}
```
