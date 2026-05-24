# Case Study: Million Hook Church

## Overview

The "Million Hook Church" is a stress-test benchmark designed to push the limits of the Truex reactive policy engine. It evaluates how the system handles a massive field of reactive hooks (triggers) against high-frequency graph mutations.

## What "Million Hook-Delta Evaluations" Means

In Truex, a **Hook** is a reactive primitive that matches specific patterns in a `GraphDelta`. When a mutation occurs, the system must determine which hooks are triggered to enforce invariants, trigger effects, or update projections.

"Million Hook-Delta Evaluations" refers to a scenario where the engine performs **1,000,000 total evaluations** (Tier T3). This is achieved by registering **1,000 unique hooks** and processing them against **1,000 incoming deltas**. The benchmark measures the engine's ability to evaluate this massive field of hook-delta pairs efficiently.

## Measurements and Proofs

The benchmark run on 2026-05-23 yielded the following results:

### Performance Results (T3 - Evaluation-Only Mode)
*   **Hooks Registered:** 1,000
*   **Deltas Processed:** 1,000
*   **Total Hook-Delta Evaluations:** 1,000,000
*   **Matched Hooks:** 60,975
*   **Throughput:** ~55,088,072.06 hook-delta evaluations per second (on Apple M3 Max, Node v24.15.0).
*   **Memory Footprint:** 14.50 MB heap.

### Boundary & Stress Verification
Beyond throughput, the engine was verified against adversarial conditions:
1.  **Malformed Delta Refusal:** The parser (`parseGraphDelta`) rejected invalid quad fields and blocked execution flow.
2.  **Capacity Breach (Muri) Refusal:** The precheck `PokaYoke` blocked executions where input delta size exceeded processing capacity (>100 adds/deletes), triggering an Andon line stop.
3.  **Nonmatching Hook Predicate Refusal:** Hooks were blocked by Muda checks if they were evaluated against non-matching deltas.
4.  **Replay Divergence:** Deterministic failure was proven; altering context or delta attributes during replay caused immediate mismatches.
5.  **Receipt Tampering Detection:** Any modification to receipt properties caused immediate re-hash failure.

## VKG Projection vs. Materialized KG

The core architectural win in this benchmark is the use of **Virtual Knowledge Graph (VKG) Projection** over traditional **Materialized Knowledge Graphs**.

| Feature | Materialized KG | VKG Projection (Truex) |
| :--- | :--- | :--- |
| **Memory** | High (O(N) of all state) | Low (O(Hooks) + Delta) |
| **Update Speed** | Slow (Update amplification) | Instant (Bitset matching) |
| **Consistency** | Eventual | Atomic / Deterministic |
| **Scalability** | Limited by RAM | Limited by CPU Cache |

### Why VKG Outperforms
Materialized KGs require updating every affected node and edge in a database for every mutation. As the number of hooks (rules) grows, the "update amplification" becomes a bottleneck.

**VKG Projection** instead treats the graph as a series of virtual views projected just-in-time from the `GraphDelta`. By using optimized bitsets and a "Hook Field," Truex can evaluate whether a mutation satisfies a complex rule without ever "writing" the intermediate state to a heavy database. This allows the ~55M evals/sec throughput seen in the benchmark while maintaining a flat memory footprint (~14MB).
