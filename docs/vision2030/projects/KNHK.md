# Project: KNHK (Tier 2)

> **Gall Classification:** Tier 1/2 — Bounded Cognition
> **Truex Role:** High-Performance Knowledge Graph Hot Path Engine

## 1. Product Thesis

KNHK is the **High-Performance Object Memory** for the Truex substrate. While standard graph databases focus on persistent storage, KNHK is optimized for the **hot-path**. It provides sub-2ns graph relationship checks, allowing the Membrane to instantaneously verify multi-object dependencies (e.g., "Can User A mutate Document B through Project Cell C?") before passing the intent to the Kernel. It ensures that complex cognitive queries never block the sub-millisecond execution loop.

## 2. Key Invariants

* **K-1 (Zero-Latency Discovery):** Relationship lookups must be O(1) or O(log N) with microsecond tail latency.
* **K-2 (Strict Read-Only Projection):** KNHK is a projection of the receipted substrate; it is forbidden from mutating the raw state directly.

## 3. Verbs / Commands

* `knhk.query(relation)`: Performs a high-speed relationship check.
* `knhk.reconstruct(receipts)`: Builds the local hot-path memory from the persistent receipt chain.

## 4. Refusal Conditions

KNHK refuses a query if:
* The requested relationship exceeds the pre-computed graph depth.
* The local memory arena for the graph is corrupted or out of sync with the receipt head.

## 5. Implementation Path

Deployment as a high-speed relationship cache sitting between the `@truex/membrane` and `@truex/kernel`.