# Project: CLNRM (Tier 3)

> **Gall Classification:** Tier 3 — Isolation Boundary
> **Truex Role:** Cryptographic Cleanroom Membrane

## 1. Product Thesis

CLNRM (Cleanroom) is the **Execution Containment Boundary** for Truex. It is a cryptographic sandbox designed to run untrusted agent-written code or experimental kernels. It provides strict hardware and software isolation, preventing an agent from "escaping" the project cell to interact with the host OS or unauthorized network ports. A piece of code running in CLNRM is physically restricted to a zero-side-effect environment where only the Membrane can observe its intents.

## 2. Key Invariants

* **CLN-1 (Total Side-Effect Denial):** Untrusted code is forbidden from performing raw IO. All interaction must occur via redirected Truex Membrane traps.
* **CLN-2 (Ephemerality):** A CLNRM session has no persistent state. Once the execution closure yield, the memory arena is shredded.

## 3. Verbs / Commands

* `clnrm.boot(code, cell)`: Initializes the cleanroom environment for a specific project cell.
* `clnrm.snapshot()`: Generates a cryptographic hash of the current cleanroom state.

## 4. Refusal Conditions

CLNRM refuses execution if:
* The code attempts to import a forbidden native module (e.g., `net`, `child_process`).
* The execution duration exceeds the allocated temporal budget.

## 5. Implementation Path

Integration with the `SandboxContext` and low-level WebAssembly memory isolation.