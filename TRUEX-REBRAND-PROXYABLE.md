# TRUEX-REBRAND-PROXYABLE

## 1. TRUEX CLASSIFICATION

**Tier:** Tier 3 — Membrane & Telemetry
**Truex Role:** OCEL 2.0 Object-Motion Capturer & Counterfactual Isolation Membrane
**Execution Function:** Proxied Intent Admissibility & Receipt Evidence Emission

*   **Deterministic vs. Probabilistic:** Deterministic. Evaluates intercepted traps against defined rule families (ACL, Invariants) with binary admission/refusal outcomes.
*   **Runtime vs. Manufacturing:** Runtime. Acts continuously on live operational state transitions.
*   **Local vs. Distributed:** Local execution boundary bridging to distributed causal event stores (via `OcelCollector`).
*   **Admissibility vs. Projection vs. Replay vs. Supervision:** Admissibility (validates traps), Projection (Sandboxing/Virtual properties), Replay (deterministic event sourcing), and Evidence Emission (OCEL).
*   **Operational vs. Infrastructural:** Infrastructural. It forms the unseen execution boundary around operational objects.

---

## 2. ORIGINAL PURPOSE

The `proxyable` repository was originally conceived to simplify the creation of JavaScript Proxies by allowing multiple interceptors per trap.

The actual operational pressure that forced its creation was the inability to construct **secure, composable governance boundaries** around raw JavaScript objects. Classical JavaScript application architectures mutate objects directly across disjointed functions, resulting in a loss of causal history, untracked side-effects, and an inability to assert pre/post-conditions reliably. `proxyable` emerged to solve the structural impossibility of enforcing ACID-like transactions, rigid invariants, and verifiable audit logging atop mutable state without fundamentally rewriting the host application. It became a necessity to wrap raw memory in an interceptable membrane.

---

## 3. CHATMAN EQUATION ALIGNMENT

The repository acts as the operational checkpoint for the Receipted Chatman Equation:
**R ⊢ A = μ(O*)**

*   **What is O* in this repository?**
    The `target` object wrapped by the proxy. It represents the raw operational state attempting to achieve lawful closure through intercepted mutations.
*   **What is μ?**
    The aggregate effect of the 10 built-in capability interceptors (ACL, Invariants, Contracts, Transactions, etc.). `μ` is the branchless execution of `runBooleanInterceptors`, which determines if a proposed transition is admissible.
*   **What is A?**
    The settled operational state (mutated `target`) AND the emitted `OCEL 2.0` object-change record documenting the successful transition.
*   **What constitutes receipt lineage?**
    The Truex Envelope generated via `ocel.exportEnvelope()`, linking `traceId`, `spanId`, the canonical OCEL JSON hash, and the prior receipt hash into a continuous cryptographic chain.
*   **What constitutes admissibility?**
    The successful traversal of all registered proxy interceptors without throwing an error or returning `false` (immediate denial).
*   **What constitutes replay?**
    The `src/replay/replay-context.js` subsystem, which chronologically re-applies trapped mutations against an empty `target` to verifiably reconstruct `O*`.

---

## 4. TRUEX EXECUTION ROLE

`proxyable` sits at the very heart of the Truex execution lifecycle:

`Intake → Closure → Admission → Projection → Consequence → Receipt → Replay`

*   **Intake:** Receives raw object property assignments (`set`, `deleteProperty`, `apply`).
*   **Closure / Admission:** Evaluates the `target` against `Capability ACL` and `Invariant Enforcement` interceptors. Refuses invalid transitions before memory is modified.
*   **Projection:** Mutates the perspective of the object via `Sandboxing` and `Virtualization` without altering underlying reality.
*   **Consequence:** The final `Reflect.set()` applied to memory.
*   **Receipt:** Emits the canonicalized OCEL 2.0 event batch and Truex envelope via the `OcelCollector`.
*   **Replay:** Captures exact execution traps into a deterministic journal.

---

## 5. OPERATIONAL GEOMETRY

This repository implements **Process Geometry** and **Operational Field Stabilization**.

*   **Concurrency Model:** JavaScript's single-threaded nature requires synchronous trap resolution. However, context separation is achieved globally via `unctx` dependency injection, preventing asynchronous execution bleed between operational spaces.
*   **Replayability:** Natively supported via the `replay-context` which journals traps.
*   **Causality Handling:** Handled via the `OcelCollector` wrapping multiple proxy traps within a singular `ocel.event()` context closure, binding raw property changes to a unified semantic activity and actor.
*   **Boundedness:** Mutations are strictly bounded by declarative invariants and possession-based capability graphs.
*   **Mutation Surfaces:** Completely intercepted via the 8 standard ES6 Proxy traps.
*   **Transition Law:** Governed by `runBooleanInterceptors`, which dictates that any `false` return immediately blocks the transition, while `true` asserts full responsibility (bypassing Reflect).
*   **Failure Containment:** Achieved via `Simulation/Counterfactuals` (which divert mutations to a `structuredClone` shadow target) and `Transactions` (which rollback previous property states on error).

---

## 6. RECEIPT & EVIDENCE SURFACES

The repository has been recently upgraded to explicitly emit **Truex Object-Centric Event Logs (OCEL 2.0)**.

*   **What operational evidence is emitted?**
    `objectChanges` (field-level mutations), `events` (activities), `objects` (entities), and relation tables (`event-object`).
*   **What constitutes proof?**
    The `exportEnvelope()` function generates a BLAKE3/SHA256 hash of the strictly canonicalized JSON representation of the OCEL batch.
*   **What constitutes replay?**
    The deterministic reconstruction of the object state via the `replay` capability.

This repository natively contributes to **OCEL**, **Receipts**, and **Deterministic Replay**. It bridges raw code execution into process-intelligence evidence.

---

## 7. TRUEX REBRAND MAPPING

**Repository & NPM Scope**
*   `proxyable` → `@truex/membrane`
*   `proxyable` (repo name) → `truex-membrane`

**Internal Modules & Capabilities**
*   `src/ocel2/index.js` → `src/membrane/ocel-collector.ts`
*   `src/proxy/create-proxy.js` → `src/membrane/create-boundary.ts`
*   `src/invariants/` → `src/governance/invariants/`
*   `src/security/capability-acl.js` → `src/governance/authority-graph.ts`
*   `src/simulation/simulation-context.js` → `src/counterfactual/simulation.ts`

**Code & Documentation Terminology**
*   "Proxyable simplifies creating JavaScript Proxies" → "Truex Membrane establishes execution boundaries and emits receipted operational evidence."

---

## 8. TRUEX TERMINOLOGY CONVERSION

| Old Concept | Truex Concept |
| :--- | :--- |
| proxy target | raw memory / operational state |
| interceptor | admissibility constraint |
| proxyable namespace | isolation context |
| get/set traps | operational motion observation |
| audit logging | OCEL evidence emission |
| transaction rollback | trajectory stabilization |
| capability ACL | avatar-relative authority projection |
| simulation | counterfactual execution |

---

## 9. RELATION TO OTHER TRUEX PROJECTS

`@truex/membrane` is the connective tissue between the host language (Node/JS) and the Truex intelligence layers.

*   **Upstream:** Driven by application logic, AI Agents (`dspygen`, `desktop_commander`), or generative manufacturing pipelines (`truex-forge`).
*   **Downstream:** Feeds strict, verified OCEL 2.0 JSON structures to `truex-kernel` (`wasm4pm`) for Process Geometry validation and conformance checking.
*   **Evidence Relationships:** Passes canonicalized data to Truex Receipt mechanisms to establish execution trust chains.
*   **Replay Relationships:** Emits deterministic journals consumed by `sos` (Simulation OS) for divergence testing.

---

## 10. MISSING INVARIANTS

*   **Weak Boundaries:** While memory is protected, JavaScript runtime reflection (e.g., `Object.getOwnPropertySymbols`) can sometimes pierce naive proxies. The `Sandboxing` capability needs formal mathematical verification against prototype pollution attacks.
*   **Absent Receipts in Sub-Capabilities:** While the OCEL collector generates receipts, the underlying `Transaction` and `Invariant` contexts do not individually sign their admission/refusal outcomes.
*   **Non-deterministic Regions:** JavaScript's `Date.now()` and `Math.random()` are used internally for UUID generation and timestamping. For true Level-1 deterministic replay across distributed nodes, these must be injected via a controlled, clock-synced Truex temporal context.
*   **Missing Conformance Checks:** The membrane emits OCEL, but currently lacks an immediate sync mechanism to pass the payload to the local `wasm4pm` kernel for real-time (blocking) process conformance validation before the transaction settles.

---

## 11. TRUEX FUTURE EVOLUTION

This repository will evolve from a passive proxy wrapper into an **Active Computational Membrane**. 

Currently, the `OcelCollector` is passive: it watches `set` and `deleteProperty` traps and generates logs. 
**Next Evolution:** The membrane will tightly couple with the Rust-based `truex-kernel` (`wasm4pm`). When a `set` trap fires, the membrane will pause the thread, pass the intent to WASM for POWL geometry validation, and only allow the `Reflect.set` to execute if the transition strictly conforms to the compiled process law. 

The pressure forcing this evolution is the necessity for **Runtime Ambiguity Elimination**. We cannot just log errors after the fact; we must physically prevent the memory mutation if it violates organizational geometry.

---

## 12. FINAL TRUEX CLASSIFICATION

This repository is not fundamentally a proxy utility library.

It is a **Tier 3 isolation membrane for capturing operational motion and emitting receipted OCEL evidence** inside the Truex execution-trust stack.
