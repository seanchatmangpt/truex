# Project: PROLOG8 (Tier 2)

> **Gall Classification:** Tier 1/2 — Bounded Cognition
> **Truex Role:** Declarative Admissibility Inference Engine

## 1. Product Thesis

PROLOG8 is the **Hard Logic Layer** of the Truex substrate. It implements a deterministic logic programming environment supporting Horn clauses, unification, and backtracking. Unlike imperative JS code which is prone to branching errors, PROLOG8 allows for the declaration of complex organizational rules (e.g., "Access is admitted only if User has Role X AND Project is in Epoch Y"). It provides the mathematical certainty required for cross-object relationship checks within the consequence membrane.

## 2. Key Invariants

* **P-1 (Logical Soundness):** All queries must be evaluated using pure unification; no side-effects or unstructured IO are allowed within the logic engine.
* **P-2 (Bounded Backtracking):** The engine enforces a strict "Unification Fuel" limit to prevent infinite loops during complex recursive queries.

## 3. Verbs / Commands

* `prolog8.assert(rule)`: Adds a new Horn clause or fact to the active rule-set.
* `prolog8.query(goal)`: Evaluates a logical goal and returns the set of valid substitutions.

## 4. Refusal Conditions

PROLOG8 refuses a query if:
* The goal cannot be unified with the current rule-set (Refusal).
* The backtracking depth or unification fuel budget is exhausted.

## 5. Implementation Path

Integrated as a core declarative evaluator inside `packages/cognition` and accessible via the `Membrane` capability context.