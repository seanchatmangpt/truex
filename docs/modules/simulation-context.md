# Module: Counterfactual Simulation

> **Path:** `src/simulation/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Simulation module provides **counterfactual execution** for Truex consequence cells. It creates a structurally isolated, speculative clone of a membrane where downstream modules, algorithms, or agents can perform full operations (reads, mutations, iterations) without modifying the actual raw substrate. It enables safe "what-if" testing, deep execution trees, and bounded hypotheticals that can either be committed as a singular operational delta or completely aborted.

## 2. Accounting Domains

* **Execution Branch Tracking:** Generates a deterministic `executionTree` tracking all divergent branches and checkpoints to guarantee state history can be audited.

## 3. Key Invariants

* **SIM-1 (Strict Isolation):** While an operation is wrapped in a `speculate()` closure, all mutations (`set`, `deleteProperty`, `defineProperty`, `preventExtensions`) are forcefully diverted to the speculative clone. The real target substrate is immune.
* **SIM-2 (Nesting Boundary):** Top-level simulations inherently auto-abort prior unfinished speculation blocks. Explicit nested simulations (simulation inside a simulation) are only admitted if `nested: true` is configured; otherwise, they are terminally refused.
* **SIM-3 (State Restorability):** Checkpoints represent exact, deep/shallow-cloned hashes of a moment in speculative time. Restoring a checkpoint deterministically overwrites the active simulation branch with the exact archived mutations.

## 4. Verbs / Commands

* `createSimulationContext(target, options)`: Establishes the simulation boundary, mapping isolation behavior, depth limits, and clone types (`deepClone` vs `shallowClone`).
* `speculate(fn)`: Executes the workload. Any membrane interactions inside this block are trapped and applied to the clone.
* `getChangeSet()`: Projects the exact operational delta (`added`, `modified`, `deleted`) that the simulation *would* apply if committed.
* `checkpoint()`: Stamps the current speculative timeline, generating a restore-point receipt ID.
* `restore(checkpointId)`: Inverts the simulation timeline back to the referenced checkpoint.
* `commit()`: Flushes the speculative changeset into the real target substrate and terminates the simulation block.
* `abort()`: Shreds the speculative clone.

## 5. Refusal Conditions

The Simulation Context explicitly refuses operations (throwing an `Error`) if:
* A nested simulation is attempted but explicitly forbidden by configuration (`Nested simulations not allowed with nested=false option`).
* `commit()`, `abort()`, or `checkpoint()` is called when no simulation is actively running (`No active simulation`).
* A `restore()` is attempted on a non-existent or corrupted checkpoint ID.

## 6. Proof Command

To prove the isolation limits and speculative changeset mechanics:

```bash
npx vitest run test/transactions/cap-tx-replay-sim-breakpoint.test.ts
```