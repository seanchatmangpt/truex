# TRUEX-REBRAND-BITACTOR

## 1. TRUEX CLASSIFICATION
**Tier:** Tier 1 — Concurrency Geometry
**Truex Role:** Lock-free Deterministic Actor Substrate
**Execution Function:** Distributed State Machine Admissibility

*   **Deterministic vs Probabilistic:** Strictly Deterministic.
*   **Runtime vs Manufacturing:** Runtime.
*   **Local vs Distributed:** Distributed.
*   **Admissibility vs Projection vs Replay vs Supervision:** Admissibility & Replay.
*   **Operational vs Infrastructural:** Infrastructural.

---

## 2. ORIGINAL PURPOSE
State coordination in highly concurrent systems (like HFT or Fortune 500 transaction engines) typically requires mutexes or database locks, leading to latency and deadlocks. `bitactor` (and `byteactor`) was created to solve the concurrency bottleneck by isolating state within individual actor memory arenas. By ensuring actors only communicate via message passing without shared memory, the system achieved lock-free, zero-variance state transitions at massive scale.

---

## 3. CHATMAN EQUATION ALIGNMENT
**R ⊢ A = μ(O*)**

*   **O* (Lawful Closure):** The isolated memory state of the individual actor.
*   **μ (Transformation):** The actor's message-handling reflex.
*   **Admissibility:** Only messages that conform to the actor's rigid interface are admitted into its mailbox.
*   **Replay:** Because actors process messages sequentially, logging the mailbox stream provides 100% perfect determinism for replay.

---

## 4. TRUEX EXECUTION ROLE
`Admission → Consequence → Replay`
`bitactor` executes the final admitted state change. It consumes the validated intent from the Truex Membrane and settles it into memory.

---

## 5. OPERATIONAL GEOMETRY
*   **Actor Geometry:** Pure implementation of the Actor Model optimized for bit-level memory layout.
*   **Concurrency Model:** Lock-free parallel execution.
*   **Failure Containment:** If an actor faults, only its isolated state is lost; the blast radius is mathematically contained.

---

## 6. RECEIPT & EVIDENCE SURFACES
*   Contributes to deterministic replay logs. The actor mailbox *is* the causal chain.

---

## 7. TRUEX REBRAND MAPPING
*   `bitactor` → `truex-actor` or `@truex/concurrency`

---

## 8. TRUEX TERMINOLOGY CONVERSION
| Old | Truex |
| --- | --- |
| Actor | Operational Particle |
| Mailbox | Intake Queue |
| Message Passing | Causal Propagation |

---

## 9. RELATION TO OTHER TRUEX PROJECTS
*   **Upstream:** Driven by `cns` (Chatman Nano Stack).
*   **Downstream:** Synchronizes with `bitstar` for multi-node consensus.

---

## 10. MISSING INVARIANTS
*   Currently lacks automatic FFI bindings to emit OCEL JSON natively for every mailbox processed.

---

## 11. TRUEX FUTURE EVOLUTION
Will become the standard compilation target for all POWL-defined operational geometries. Agents won't interact with "services"; they will interact with "Truex Actors."

---

## 12. FINAL TRUEX CLASSIFICATION
This repository is not fundamentally an Actor framework.
It is the lock-free concurrency geometry substrate for distributed operational stabilization inside the Truex execution-trust stack.
