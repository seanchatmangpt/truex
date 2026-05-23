# TRUEX GALL TESTING POLICY v0

## Root Law

A primitive is not proven because it passes.
A primitive is proven because:
- it passes lawful invariants
- it fails unlawful invariants
- it survives admissible variability
- it converges under replay

## SECTION 1 — GALL TEST HIERARCHY

1. `S₋₁` primitive law tests
2. `S₀` deterministic replay tests
3. `S₁` persistence membrane tests
4. `S₂` boundary communication tests
5. `S₃` projection/avatar tests
6. `S₄` distributed reconciliation tests

No higher-layer tests allowed before lower-layer convergence.
`¬Works(Sₙ) ⇒ Forbidden(Test(Sₙ₊₁))`

## SECTION 2 — TEST CLASSIFICATION

1. **Example Tests**: Prove canonical happy path (Allowed only as seed proofs).
2. **Adversarial Tests**: Prove unlawful mutation fails (Mandatory).
3. **Property Tests**: Prove invariants survive deterministic admissible entropy (The Truex standard).
4. **Replay Tests**: Prove deterministic convergence (`same input + same law = same consequence`).
5. **Refusal Tests**: Prove invalid consequence is denied.

## SECTION 3 — TESTING INVARIANTS

Every Truex primitive must prove:

| Invariant | Meaning |
| :--- | :--- |
| **Determinism** | same admissible input = same output |
| **Replayability** | consequence recomputes |
| **Refusal** | invalid mutation fails |
| **Tamper Detection** | mutation changes proof |
| **Boundary Isolation** | unrelated layers cannot mutate primitive |
| **Persistence Integrity**| stored proof matches runtime proof |
| **Convergence** | replay hashes align |
| **Entropy Survival** | variability does not break lawful invariants |

## SECTION 4 — NO HARDCODED FOSSILS

Hardcoded values are prohibited except for:
* canonical fixtures
* regression reproductions
* known cryptographic vectors

Reason: *Hardcoded values create hidden ontology coupling.*
Instead use: *seeded admissible generators.*

## SECTION 5 — DETERMINISTIC ENTROPY

**Allowed:** `faker.seed(42)`, `fast-check` with fixed seeds.
**Forbidden:** `Math.random()`, unseeded faker, clock-dependent variability, network-dependent variability.
Reason: *Truex requires replayable variability.*

## SECTION 6 — PROPERTY CALCULUS

The future Truex direction is:
`∀ admissible inputs: invariant remains true`
instead of:
`input X → output Y`

## SECTION 7 — TEST LAYERING LAW

Tests must follow the Gall hierarchy.
Forbidden: `Expo E2E before replay convergence works`.
Required: `primitive → replay → persistence → communication → projection → distribution`.

## SECTION 8 — TEST FILE CALCULUS

Correct structure:
* `receipt-proof.test.ts`
* `replay-proof.test.ts`
* `engine-proof.test.ts`
* `sqlite-proof.test.ts`

## SECTION 9 — FAILURE-FIRST DESIGN

A Truex primitive is not complete until **it breaks correctly**.

| Primitive | Required failure |
| :--- | :--- |
| **receipt** | tamper fails |
| **replay** | divergence fails |
| **engine** | invalid delta fails |
| **sqlite** | rollback leaves no partial state |
| **telco** | reconciliation mismatch fails |

## SECTION 10 — THE TRUEX TESTING LAW

Final invariant:
> A test does not prove software correctness.
> A test proves that:
> - lawful invariants survive
> - unlawful invariants fail
> - consequence remains replayable
> under admissible entropy.
