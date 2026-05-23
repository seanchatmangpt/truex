# TRUEX-REBRAND-PICTL

## 1. TRUEX CLASSIFICATION
**Tier:** Tier 1 — Process Geometry
**Truex Role:** Process Intelligence Control
**Execution Function:** Process tree evaluation algorithms

*   **Deterministic vs Probabilistic:** Deterministic.
*   **Runtime vs Manufacturing:** Runtime & Analysis.
*   **Operational vs Infrastructural:** Operational Intelligence.

---

## 2. ORIGINAL PURPOSE
Managing and querying large process models requires strict algorithmic control. `pictl` (Process Intelligence Control) was built to evaluate process trees, validate their structural soundness, and compute process metrics (like fitness and precision) mathematically, separate from the main `wasm4pm` execution context.

---

## 3. CHATMAN EQUATION ALIGNMENT
**R ⊢ A = μ(O*)**

*   **O* (Lawful Closure):** The process model geometries.
*   **μ (Transformation):** The algorithmic verification of the process trees.

---

## 4. TRUEX EXECUTION ROLE
`Conformance → Supervision`
Provides the deep mathematical algorithms that prove a process model is structurally sound before it is loaded into the active membrane.

---

## 5. OPERATIONAL GEOMETRY
*   **Process Geometry:** Tree-based workflow net reduction and decomposition.
*   **Failure Containment:** Prevents structurally unsound models (deadlocks, livelocks) from being deployed.

---

## 6. RECEIPT & EVIDENCE SURFACES
*   Generates proofs of structural soundness.

---

## 7. TRUEX REBRAND MAPPING
*   `pictl` → `truex-geometry-control` or `@truex/process-algos`

---

## 8. TRUEX TERMINOLOGY CONVERSION
| Old | Truex |
| --- | --- |
| Process Intelligence Control | Process Geometry Verification |
| Process Tree | Trajectory Model |

---

## 9. RELATION TO OTHER TRUEX PROJECTS
*   **Upstream:** Receives YAWL/POWL models from `wasm4pm`.
*   **Downstream:** Provides mathematical confidence back to the runtime.

---

## 10. MISSING INVARIANTS
*   Needs to be natively merged into the \`wasm4pm\` kernel to reduce context switching during live conformance checks.

---

## 11. TRUEX FUTURE EVOLUTION
Will act as the static analyzer for Truex. Just as a compiler checks types, \`pictl\` will check organizational law for deadlocks before allowing deployment.

---

## 12. FINAL TRUEX CLASSIFICATION
This repository is not fundamentally a process script runner.
It is the mathematical process geometry validator for structural soundness inside the Truex execution-trust stack.
