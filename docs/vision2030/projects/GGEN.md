# Project: GGEN (Tier 5)

> **Gall Classification:** Tier 5 — Autonomic Manufacturing
> **Truex Role:** Ontology-to-Execution Forge

## 1. Product Thesis

GGEN is the **Operational Manufacturing Forge** for the Truex stack. It solves the "Probabilistic LLM Gap" by acting as a generative compiler. It consumes semantic ontologies (UNRDF) and produces the deterministic, branchless Rust/TypeScript boilerplate required to run the enterprise. It ensures that no agent-written code touches the substrate without first being forged into a mathematically valid, typestate-enforced primitive.

## 2. Key Invariants

* **GG-1 (Typestate Enforcement):** Every generated function must include mandatory typestate guards derived from the ontology.
* **GG-2 (No Unproven Stubs):** GGEN is forbidden from generating code containing `TODO`s, mocks, or deferred logic.

## 3. Verbs / Commands

* `ggen sync`: Synchronizes the physical codebase with the semantic ontology.
* `ggen manufacture(skill)`: Produces a new proven operational primitive.

## 4. Refusal Conditions

GGEN refuses to forge code if:
* The proposed logic violates a partial ordering rule in the POWL model.
* The ontology contains conflicting or cyclic definitions.

## 5. Implementation Path

Leverage the `ostar-operator` and `unrdf sync` commands as the primary engine for `@truex/kernel` development.