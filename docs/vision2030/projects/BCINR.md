# Project: BCINR (Tier 0)

> **Gall Classification:** Tier 0 — Deterministic Substrate
> **Truex Role:** Branchless Operational Calculus Core

## 1. Product Thesis

BCINR (Branchless Calculus for Invariant Refinement) provides the **Mathematical Calculus** for the Truex substrate. It implements O(1) constant-time logical and mathematical operations required for zero-variance admission logic. By eliminating `if/else` branches in critical security checks, BCINR prevents timing-analysis attacks and ensures that the system's performance profile is completely independent of the input data shape. It is the "Hard Logic" core that powers the higher-tier Invariants and ACLs.

## 2. Key Invariants

* **B-1 (Constant-Time Enforcement):** All core BCINR functions must execute in a fixed number of CPU cycles.
* **B-2 (Side-Effect Immunity):** BCINR operations must be pure mathematical transforms with zero memory side-effects outside the target bitset.

## 3. Verbs / Commands

* `bcinr.mask(state, rule)`: Evaluates a rule against a state using bitwise logic.
* `bcinr.refine(delta)`: Mathematically reduces an operational delta into its simplest primitive form.

## 4. Refusal Conditions

BCINR refuses a calculation if:
* The input bitset violates the hardware-aligned word size.
* The mathematical transformation results in an undefined logical state.

## 5. Implementation Path

Integrated as a foundational crate within the `@truex/kernel`.