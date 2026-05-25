# Package: @truex/engine

> **Path:** `packages/engine/`
> **Gall Classification:** S₂ - Engine Primitive

## 1. Product Thesis

The Engine package manages the **Operational Lifecycle and State Machine** of the Truex substrate. It is the central coordinator that binds the Membrane's intent to the Kernel's adjudication. It manages the 10-step `AutonomicGallLoop`, ensuring that every filesystem write or shell command passes through the full admission/refusal pipeline.

## 2. Key Invariants

* **ENG-1 (Operational Closure):** No operation proceeds to execution until it has been successfully journaled as a `GraphDelta` and passed all pre-execution invariants.
* **ENG-2 (Atomic Stabilization):** If any step in the 10-step loop fails, the engine forces a complete rollback to the last stabilized state.

## 3. Verbs / Commands

* `engine.step()`: Progresses the Autonomic Gall Loop by one transition.
* `engine.stabilize()`: Forces a commit of all pending transactions and persists state quads.

## 4. Refusal Conditions

The Engine refuses a transition if:
* A `JIDOKA FATAL ERROR` is triggered by any interceptor.
* The delta WAL (Write-Ahead Log) cannot be persisted to SQLite.
* Post-execution invariants fail to converge within the allowed iterations.

## 5. Proof Command

```bash
pnpm --filter @truex/engine test
```