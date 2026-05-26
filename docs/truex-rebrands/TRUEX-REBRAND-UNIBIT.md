# TRUEX-REBRAND-UNIBIT

## 1. TRUEX CLASSIFICATION
**Tier:** Tier 0 — Deterministic Substrate
**Truex Role:** Bit-Native L1 Execution Substrate & Causal Chain
**Execution Function:** Hardware-Level Cryptographic Receipt Generation

*   **Deterministic vs Probabilistic:** Strictly Deterministic.
*   **Runtime vs Manufacturing:** Runtime.
*   **Local vs Distributed:** Highly distributed L1 Substrate.
*   **Admissibility vs Projection vs Replay vs Supervision:** Replay & Receipt Evidence.
*   **Operational vs Infrastructural:** Extreme Infrastructural.

---

## 2. ORIGINAL PURPOSE
Operating systems (Linux, macOS) and standard runtimes introduce entropy: context switching, memory fragmentation, non-deterministic I/O. `unibit` was built as a "pinned, bit-native L1 execution substrate" to bypass the host OS completely for critical operations. It provides a foundation where every single execution step can be cryptographically hashed (via BLAKE3) to prove exactly what occurred, free from OS-level noise.

---

## 3. CHATMAN EQUATION ALIGNMENT
**R ⊢ A = μ(O*)**

*   **R (Receipt):** This is the core purpose of `unibit-causality`. It maintains the BLAKE3-backed causal receipt chain.
*   **μ (Transformation):** `unibit-asmcheck` verifies that the hot-path assembly is actually branchless and deterministic.
*   **Replay:** Because execution is pinned and deterministic, `unibit` provides the ultimate Level-1 replay guarantee.

---

## 4. TRUEX EXECUTION ROLE
`Receipt → Replay`
It sits beneath the applications and the agents, silently hashing the execution consequences and chaining them together to form unforgeable proof of operational reality.

---

## 5. OPERATIONAL GEOMETRY
*   **Causality Handling:** Continuous BLAKE3 hashing of execution states.
*   **Failure Containment:** If a variance is detected (`unibit-bench` tier), the execution is flagged as non-deterministic and the receipt chain is broken.

---

## 6. RECEIPT & EVIDENCE SURFACES
*   Emits the lowest-level cryptographic proofs (BLAKE3 chains).
*   This forms the root of trust that the `proxyable` Truex Envelopes eventually anchor into.

---

## 7. TRUEX REBRAND MAPPING
*   `unibit` → `truex-l1` or `truex-substrate`
*   `unibit-causality` → `truex-chain`

---

## 8. TRUEX TERMINOLOGY CONVERSION
| Old | Truex |
| --- | --- |
| L1 Execution Substrate | Truex Deterministic Substrate |
| Causal Receipt Chain | Truex Envelope Chain |

---

## 9. RELATION TO OTHER TRUEX PROJECTS
*   **Upstream:** Used by `cns` and `truex-kernel` to anchor their execution.
*   **Downstream:** N/A. It is the bottom layer.

---

## 10. MISSING INVARIANTS
*   N/A. This repository explicitly implements the missing invariants (like verifiable clocks and deterministic entropy) required by higher-level systems.

---

## 11. TRUEX FUTURE EVOLUTION
`unibit` will become the "Truex Hypervisor." A specialized runtime that sits below the OS, allowing Truex organizational applications to run in verifiable enclaves.

---

## 12. FINAL TRUEX CLASSIFICATION
This repository is not fundamentally a Rust systems library.
It is the bit-native cryptographic receipt layer for unforgeable operational consequence inside the Truex execution-trust stack.
