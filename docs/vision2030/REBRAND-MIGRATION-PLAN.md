# Truex Strategic Rebrand & Migration Plan

> **Path:** `docs/vision2030/REBRAND-MIGRATION-PLAN.md`
> **Status:** Selective Adoption (Governed by Gall Law)

## 1. The Gall Axiom for Rebranding
In Truex, we do not adopt architecture simultaneously. As defined in `AGENTS.md`:
> *"A complex system that works evolves from a simple system that worked. No speculative architecture is allowed above a non-working primitive."*

While the `docs/truex-rebrands/` directory contains 20+ theoretical rebrands and integrations, adopting them all at once violates the foundational **Decomposition Law**. We will perform a strict, phased triage: **Adopt, Defer, or Refuse**.

---

## 2. Phase 1: ADOPT (The Kernel & Membrane)
These components form the absolute `S0` and `S1` primitives. They provide the physics engine and boundary interception required for the *Chatman Equation*.

### A. `@truex/membrane` (Formerly `proxyable`)
* **Status:** In progress.
* **Role:** The JS/TS execution boundary. It intercepts intent (VKG Hooks) and generates the `HookedConsequenceAttempt`.
* **Action:** Finalize the terminology shift within the codebase. Ensure all exports reflect the "Membrane" and "Substrate" vocabulary.

### B. `@truex/kernel` (Formerly `wasm4pm`)
* **Status:** Ready for integration.
* **Role:** The Tier 0 Rust/WASM consequence engine. It takes the OCEL payload from the Membrane, evaluates it against the POWL geometry, and stamps the BLAKE3 cryptographic receipt.
* **Action:** Move the `wasm4pm` codebase into a formal `packages/truex-kernel` monorepo workspace. Wire the JavaScript Membrane to synchronously pass intents to the WASM binary for adjudication.

### C. `POWL v2` Integration
* **Status:** Prototype stage.
* **Role:** The geometric workflow law replacing linear arrays.
* **Action:** Adopt the core `validatePowlNode` logic. Extract the discovery logic to the Antigravity CLI MCP tools, keeping the runtime lean.

---

## 3. Phase 1b: ADOPT (The Generative Forge)

### A. `unrdf sync` / `GGEN`
* **Status:** Adopted as Build-Time Tooling.
* **Role:** While raw RDF is dead as a *runtime* database, the `unrdf sync` command (driven by the Ostar operator skills) is the actual generative forge that compiles the `@truex/kernel` (`wasm4pm`). It parses `.ttl` ontologies to manufacture the 60+ Rust algorithms and boilerplate.
* **Action:** Retain `unrdf sync` exclusively as the build-step compiler for the Rust kernel. Rename the conceptual pipeline to `truex-forge` in documentation to clarify its build-time-only role.

---

## 4. Phase 2: DEFER (Speculative Architecture & Actors)
These are valid concepts, but they sit at `S2`, `S3`, or higher. They cannot be built until the `@truex/kernel` successfully refuses bad motion and emits verifiable receipts in production.

### A. `BitActor` / `BitStar`
* **Concept:** Actor models and consensus networks.
* **Reason for Deferral:** The `vendors/ReactiveMessagingPatterns_ActorModel` directory already provides the necessary reactive primitives. We do not need a named "BitActor" network until single-node concurrency is mathematically proven.

### B. `SOS` (Synthetic Operations Simulator)
* **Concept:** Field stabilization testing geometries against historical logs.
* **Reason for Deferral:** We already have the `mcp_pm4py_*` CLI tools for simulation and discovery.

---

## 5. Phase 3: REFUSE & QUARANTINE (Ontological Drift)
These modules represent older paradigms that conflict with the Post-Gall architecture or violate the restricted CLI noun policy (`doctor`, `wizard`, `telco`).

### A. Orchestration UIs (`BusinessOS`, `DesktopCommanderMCP`)
* **Status:** Quarantined.
* **Reason:** Truex is an operational substrate, not a UI framework. The `AGENTS.md` explicitly forbids building dashboard systems or orchestration platforms. The Antigravity CLI serves as our primary operational TUI.

---

## 6. Immediate Execution Directive
Our immediate engineering focus will be entirely on **Phase 1 and 1b**.
We will utilize `unrdf sync` to compile the `wasm4pm` kernel, extract the binary, and wire it into the `truex-core` membrane to achieve the first true end-to-end receipted consequence.