# Package: @truex/planner

> **Path:** `packages/planner/`
> **Gall Classification:** S₄ - Process Intelligence

## 1. Product Thesis

The Planner package handles **Process Mining Planning and Optimization**. It is responsible for generating optimal execution routes (POWL models) based on mission objectives and historical performance data. It acts as the "Pre-Cognition" layer, ensuring that the system always attempts the most efficient path to operational closure while maintaining strict adherence to safety laws.

## 2. Key Invariants

* **PLN-1 (Plan Admissibility):** Any generated plan must be statically validated for mathematical soundness (no deadlocks or infinite loops) before being promoted to the Kernel.
* **PLN-2 (Objective Conservation):** The planner must prove that the proposed path satisfies the mission's conserved accounting domains.

## 3. Verbs / Commands

* `planner.generate(mission)`: Produces a candidate POWL graph for a given objective.
* `planner.optimize(model)`: Refines an existing process model for lower latency or higher throughput.

## 4. Refusal Conditions

The Planner refuses a plan if:
* The static analysis detects a potential deadlock or unreachable state.
* The plan violates a core system invariant defined in the ontology.

## 5. Proof Command

```bash
pnpm --filter @truex/planner test
```