# Project: NAUT (Tier 6)

> **Gall Classification:** Tier 6 — Hostile Proving Ground
> **Truex Role:** extreme-latency proving ground for verifying autonomic operational closure

## 1. Product Thesis

NAUT (Nautilus Trader) serves as the ultimate **Hostile Proving Ground** for the Truex substrate. By deploying Truex generated code into a high-frequency trading (HFT) environment, we prove that our "Industrial Cost Floor" and zero-variance admission logic can survive the most aggressive, latency-sensitive production conditions in existence. If Truex can safely manage live financial state transitions in NAUT, it can manage any organizational consequence.

## 2. Key Invariants

* **NAUT-1 (Zero-Variance Admission):** Admission decisions must be constant-time to ensure deterministic execution in microsecond windows.
* **NAUT-2 (Halt-on-Drift):** Any detected drift between the trading state and the Truex receipt chain triggers an immediate, atomic halt to protect capital.

## 3. Verbs / Commands

* `naut.deploy(kernel)`: Plugs a specific Truex kernel into the trading engine.
* `naut.backtest(logs)`: Executes a counterfactual simulation of a kernel against historical market data.

## 4. Refusal Conditions

NAUT refuses an order if:
* The proposed trade violates a risk invariant in the `PowlExecutionEngine`.
* The kernel adjudication exceeds the microsecond temporal budget.

## 5. Implementation Path

Integration of `@truex/kernel` into the Nautilus Trader Rust/Python bridge.