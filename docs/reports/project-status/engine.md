# Project Status: engine
> **Path:** `packages/engine`
> **Status:** Stable

## Current State
The **engine** is the core reactive dispatcher of the Truex substrate, responsible for the high-frequency matching of graph deltas against defined laws. It is currently in a **Stable** state, having passed exhaustive deterministic replay and stress testing.

## Proven Invariants
- **Graph Delta Acceptance:** Every well-formed graph delta is accepted and processed into an effect set without side-effects.
- **Deterministic Hook Matching:** Hook matching logic is purely functional, ensuring that the same delta always triggers the same law activation.
- **Atomic Effect Generation:** Effects are generated as a discrete batch, preventing partial state transitions during engine execution.

## Combinatorial Role
The engine acts as the **Reactive Intermediary**. It consumes raw deltas emitted by the **Membrane** (Tier 2) and produces the effect set required by the **Kernel** (Tier 1) to issue a cryptographic receipt.

## Final Execution Path
- **Phase 1: Branchless Refinement:** Refactoring the admission logic using `bcinr` calculus primitives to ensure constant-time admission and remove branch-based side-channel risks.

## Jidoka Status
Upon defect detection (e.g., malformed input or non-deterministic output), the engine triggers a **Structural Refusal**. Speculative failures yield a signed `Refused` receipt, preserving the integrity of the audit trail while halting the faulty transition.
