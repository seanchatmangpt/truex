# Project: POWL v2 (Tier 1)

> **Gall Classification:** Tier 1 — Process Geometry
> **Truex Role:** Partially Ordered Workflow Language Governor

## 1. Product Thesis

POWL v2 is the **Operational Governor** of the Truex substrate. It replaces rigid linear sequence arrays with mathematical graph-based partial ordering. It allows the system to natively model concurrency (AND), choices (XOR), and silent skips ($\tau$). Every operational intent must be checked against the active POWL graph to ensure that it follows the mathematically proven trajectory of the project cell. POWL ensures that the system is always in a "Safe" and "Live" state.

## 2. Key Invariants

* **POW-1 (Geometric Admissibility):** An operation is refused if its transition is not reachable or valid within the current partial-order state.
* **POW-2 (Non-Block Soundness):** Models are strictly validated to ensure they are free from deadlocks and infinite sink states.

## 3. Verbs / Commands

* `powl.step(activity)`: Transitions the process state machine forward.
* `powl.verify_trace(trace)`: Replays an entire execution trace against the graph to prove conformance.

## 4. Refusal Conditions

POWL refuses an attempt if:
* The activity is attempted out of order (Sequence Violation).
* The activity belongs to a choice branch that has already been closed.
* A parallel dependency has not yet been satisfied.

## 5. Implementation Path

Implemented as the core geometric logic in `@truex/kernel` and bridged to `@truex/membrane`.