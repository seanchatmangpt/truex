# TRUEX-REBRAND-WASM4PM

## 1. TRUEX CLASSIFICATION
**Tier:** Tier 1 — Process Geometry
**Truex Role:** Portable Process Intelligence & Conformance Kernel
**Execution Function:** Structural Admissibility & Trajectory Validation

*   **Deterministic vs Probabilistic:** Deterministic. Evaluates process geometry and OCEL conformance.
*   **Runtime vs Manufacturing:** Both. Used to manufacture models and at runtime to block invalid transitions.
*   **Local vs Distributed:** Portable WASM (executes everywhere).
*   **Admissibility vs Projection vs Replay vs Supervision:** Admissibility and Conformance Supervision.
*   **Operational vs Infrastructural:** Operational Intelligence.

---

## 2. ORIGINAL PURPOSE
Process mining typically occurs post-hoc in batch data lakes using Python (e.g., pm4py). This architectural contradiction meant organizations only discovered compliance violations *after* the damage was done. `wasm4pm` was created to compress heavy process mining algorithms into a WebAssembly substrate so they could run synchronously at the edge, blocking unlawful transitions in real-time.

---

## 3. CHATMAN EQUATION ALIGNMENT
**R ⊢ A = μ(O*)**

*   **O* (Lawful Closure):** The YAWL/POWL geometrical models defining what transitions are possible.
*   **μ (Transformation):** The conformance checking algorithms.
*   **A (Artifact/Consequence):** The boolean admission decision returned to the membrane.
*   **Receipt Lineage:** Signs the admission decision into the Truex Envelope.
*   **Admissibility:** The exact implementation of the `Accept(ΔO)` function.

---

## 4. TRUEX EXECUTION ROLE
`Closure → Admission → Conformance → Supervision`
`wasm4pm` is the brain of the Truex system. It receives OCEL streams from the membrane (`proxyable`), evaluates them against the compiled POWL models, and returns an immediate admission or refusal.

---

## 5. OPERATIONAL GEOMETRY
*   **Process Geometry:** Implements POWL 2.0 (Partially Ordered Workflow Language).
*   **Concurrency Geometry:** Models true concurrency without the state-explosion of traditional Petri nets.
*   **Transition Law:** Evaluates if a proposed event exists within the admissible trajectory cone.

---

## 6. RECEIPT & EVIDENCE SURFACES
*   Consumes **OCEL 2.0**.
*   Outputs Conformance metrics, fitness, and precision.
*   Contributes the `T` (lawful transition) and `H` (invariant preservation) checks to the Truex Acceptance Function.

---

## 7. TRUEX REBRAND MAPPING
*   `wasm4pm` → `truex-kernel`
*   `pm4wasm` → `@truex/process-intelligence`

---

## 8. TRUEX TERMINOLOGY CONVERSION
| Old | Truex |
| --- | --- |
| Process Mining | Process Geometry Validation |
| Conformance Checking | Transition Admissibility Evaluation |
| XES/Event Logs | OCEL Evidence Chains |
| Workflow | Operational Trajectory |

---

## 9. RELATION TO OTHER TRUEX PROJECTS
*   **Upstream:** Receives candidate transitions from `@truex/membrane` (`proxyable`).
*   **Downstream:** Directs `bcinr` and `cns` on what memory states to commit.
*   **Supervision:** Acts as the governor over `dspygen` agents.

---

## 10. MISSING INVARIANTS
*   Needs direct FFI (Foreign Function Interface) linkage to the `proxyable` membrane for zero-copy OCEL evaluation, rather than relying on JSON serialization across the WASM boundary.

---

## 11. TRUEX FUTURE EVOLUTION
Will evolve from an "analysis" tool into a strict "compiler." Organizations will compile their operational law into a WASM binary using this kernel, and that binary will physically dictate what the database is allowed to store.

---

## 12. FINAL TRUEX CLASSIFICATION
This repository is not fundamentally a process mining library.
It is the process-geometry runtime for replayable operational consequence inside the Truex execution-trust stack.
