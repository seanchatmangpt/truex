# Package: @truex/cognition

> **Path:** `packages/cognition/`
> **Gall Classification:** S₀/S₁ - Operational Primitive

## 1. Product Thesis

The Cognition package serves as the **Old-AI cognition kernel**. It handles the "Brain" functions of the Truex system: rule evaluation, constraint solving, and receipt validation. It bridges the gap between the probabilistic LLM layer and the deterministic execution substrate by providing a formal language for frames, rules, and causal scoring.

## 2. Key Invariants

* **COG-1 (Lawful Closure):** All cognitive transitions must be verifiable against the project's semantic ontology.
* **COG-2 (Zero Variance):** Identical rule sets and inputs must yield identical cognitive scores and receipts across all nodes.

## 3. Verbs / Commands

* `cognition.verify(state, rules)`: Evaluates a state transition against the registered rule set.
* `cognition.receipt(chain)`: Validates the cryptographic integrity of a causal receipt chain.

## 4. Refusal Conditions

The Cognition engine refuses a transition if:
* The proposed motion violates a Horn clause in the logic engine.
* The input data shape mismatches the expected semantic frame.
* The cryptographic signature of a parent receipt is invalid.

## 5. Proof Command

```bash
pnpm --filter @truex/cognition test
```