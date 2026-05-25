# Package: @truex/testing

> **Path:** `packages/testing/`
> **Gall Classification:** S₁ - Replay Primitive

## 1. Product Thesis

The Testing package provides the **Validation Utilities and Fixtures** for the entire substrate. It implements the `Harness` for CLI execution and the deterministic property-based testing wrappers. Its primary purpose is to prove that "lawful invariants survive and unlawful invariants fail" under admissible entropy.

## 2. Key Invariants

* **TST-1 (Deterministic Entropy):** All tests must use seeded random generators to ensure 100% replay parity.
* **TST-2 (Adversarial Coverage):** Every test suite must include "Refusal Tests" that intentionally attempt to break the law.

## 3. Verbs / Commands

* `test.harness.run(command)`: Executes a CLI command within a controlled, receipted environment.
* `test.fuzz(fn)`: Executes property-based tests using the Truex entropy provider.

## 4. Proof Command

```bash
pnpm --filter @truex/testing test
```