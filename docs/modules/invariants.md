# Module: Invariants

> **Path:** `src/invariants/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Invariants module establishes the deterministic guard surface (`C` in the hook equation `H = (Δ, C, E, R, Π)`) within the Truex consequence membrane. It enforces state constraints *before* any operation becomes a durable consequence, guaranteeing fail-closed boundary protection. An invariant does not warn; it refuses.

## 2. Accounting Domains

* **Execution Fuel:** Each invariant evaluation consumes deterministic fuel to prevent infinite execution and runaway recursion. `evaluations <= fuel_allocated`.
* **Stack Depth:** Recursive evaluations are strictly bounded. `depth <= max_depth`.

## 3. Key Invariants

* **INV-1 (Fail-Closed):** All operations are terminally refused unless all registered invariants explicitly evaluate to true or pass.
* **INV-2 (Pre-State Enforcement):** Invariants evaluate the proposed operational delta (`set`, `deleteProperty`, `apply`, `construct`) before the target substrate is mutated.
* **INV-3 (Deterministic Execution):** Invariants must be pure functions. They evaluate the proposed `operation` and the `target` state without unstructured IO.
* **INV-4 (Circular Dependency Block):** Invariant networks cannot evaluate themselves in a loop. Re-entry into the same invariant within a single call stack yields an immediate `CircularDependencyError`.

## 4. Verbs / Commands

* `createInvariantContext(target, invariants, options)`: Creates the enforcement boundary and allocates the fuel/depth budget.
* `validateState(operation)`: Evaluates a proposed delta (`Δ`) against all registered rules.
* `call(fn)`: Executes a synchronous or asynchronous block within the bounded invariant membrane.

## 5. Refusal Conditions

The Invariant Context will explicitly refuse an operation (via `[JIDOKA FATAL ERROR]` or `RecursionRefusalError`) if:
* The proposed value violates type constraints (`typeInvariant`).
* A numeric delta exceeds allowed boundaries (`rangeInvariant`).
* A mutation is attempted on a frozen field (`immutableInvariant`).
* A unique property constraint is breached (`uniquenessInvariant`).
* Required properties are targeted for deletion (`requiredInvariant`).
* The validation sequence loops (`CircularDependencyError`).
* The recursion depth or evaluation fuel budget is exhausted (`RecursionRefusalError`).

## 6. Proof Command

To prove the invariant boundary laws hold against both happy-path execution and adversarial mutation:

```bash
npx vitest run test/invariants/
```