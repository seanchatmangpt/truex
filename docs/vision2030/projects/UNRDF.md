# Project: UNRDF (Tier 3)

> **Gall Classification:** Tier 3 — Semantic Ontology
> **Truex Role:** The Lawful Vocabulary (O*)

## 1. Product Thesis

UNRDF provides the **Semantic Infrastructure** for the Truex substrate. It is the repository of "The Law." While static RDF databases proved too slow for runtime execution, the *definitions* stored in UNRDF (classes, properties, relations, and Horn clauses) form the foundational vocabulary used by the entire system. `unrdf sync` serves as the generative forge that translates these static semantic triples into the dynamic OCEL 2.0 types and Rust predicates consumed by the Kernel.

## 2. Key Invariants

* **UN-1 (Ontological Consistency):** No new operational law is admitted if it contradicts an existing axiom in the core ontology.
* **UN-2 (Source of Truth):** UNRDF is the only allowed source for generating typestates, enums, and validation guards.

## 3. Verbs / Commands

* `unrdf.sync()`: Generates the `@truex/kernel` boilerplate from the `.ttl` ontology.
* `unrdf.query(clause)`: Evaluates a Horn clause against the semantic state.

## 4. Refusal Conditions

UNRDF refuses a synchronization if:
* The ontology contains unreachable states or logical contradictions.
* A property definition lacks the required "consequence accounting" metadata.

## 5. Implementation Path

Used as the primary build-time tool for the `@truex/kernel` and `@truex/membrane`.