# TRUEX-REBRAND-CLNRM

## 1. TRUEX CLASSIFICATION
**Tier:** Tier 3 — Isolation Boundary
**Truex Role:** Cryptographic Cleanroom Membrane
**Execution Function:** Hardware/Software Isolation for Untrusted Agents

*   **Deterministic vs Probabilistic:** Strictly Deterministic.
*   **Runtime vs Manufacturing:** Runtime & Environment.
*   **Operational vs Infrastructural:** Infrastructural.

---

## 2. ORIGINAL PURPOSE
LLMs and autonomous agents often execute arbitrary code to solve problems. Running this code on the host machine is a catastrophic security vulnerability. `clnrm` (Cleanroom) was built to provide an absolute, cryptographically sealed boundary where generated code could be compiled, tested, and analyzed for malicious intent or side-effects before being admitted into the host system.

---

## 3. CHATMAN EQUATION ALIGNMENT
**A = μ(O*)**

*   **Admissibility:** The entire purpose of `clnrm`. It acts as the physical `Accept()` gate for third-party or LLM-generated code.
*   **O*:** The sandboxed execution context.

---

## 4. TRUEX EXECUTION ROLE
`Intake → Closure → Admission`
Agents submit code. `clnrm` builds and runs it in the dark. If it passes structural closure, it emits a receipt allowing deployment.

---

## 5. OPERATIONAL GEOMETRY
*   **Failure Containment:** Maximum. Complete execution quarantine.

---

## 6. RECEIPT & EVIDENCE SURFACES
*   Emits compilation receipts and side-effect telemetry.

---

## 7. TRUEX REBRAND MAPPING
*   `clnrm` → `truex-cleanroom` or `truex-quarantine`

---

## 8. TRUEX TERMINOLOGY CONVERSION
| Old | Truex |
| --- | --- |
| Cleanroom | Isolation Membrane |
| Sandboxing | Execution Containment |

---

## 9. RELATION TO OTHER TRUEX PROJECTS
*   **Upstream:** Commanded by `ggen` and `DesktopCommanderMCP`.

---

## 10. MISSING INVARIANTS
*   Needs to emit OCEL 2.0 evidence detailing *what* the quarantined code attempted to do, not just if it passed/failed.

---

## 11. TRUEX FUTURE EVOLUTION
Will become the default execution context for all FFI and Agentic code execution, structurally preventing any autonomous operator from altering the host system without a Truex receipt.

---

## 12. FINAL TRUEX CLASSIFICATION
This repository is not fundamentally a sandboxing utility.
It is the cryptographic execution containment boundary for autonomic agents inside the Truex execution-trust stack.
