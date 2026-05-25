# Project Status: kernel-wasm
> **Path:** `packages/kernel-wasm`
> **Status:** Industrializing

## Current State
The **kernel-wasm** project is the Rust-based, WebAssembly-compiled implementation of the Truex Kernel. It is currently **Industrializing**, moving from a prototype ggen-manufactured component to a production-ready binary for edge deployment.

## Proven Invariants
- **GGEN Manufacturing Closure:** The Rust source code is autonomously manufactured by ggen, ensuring 1:1 parity with the semantic laws defined by the Governor.
- **Physical Admissibility Lock:** The kernel-wasm binary is proven to act as a deterministic gate for IoT actuation, ensuring that no physical consequence occurs without a valid receipt.
- **Zero-Dependency Adjudication:** The kernel-wasm requires no external runtime dependencies beyond the Wasm environment, minimizing the attack surface.

## Combinatorial Role
The kernel-wasm provides the **Portable Execution Surface**. It allows the Truex substrate to run in hostile or resource-constrained environments (Tier 6), such as ESP32 or FPGA, while maintaining cryptographic parity with the Node.js implementation.

## Final Execution Path
- **Phase 3: Hardware Interlock:** Porting the minimal kernel-wasm binary to hardware targets to prove the "Physics Engine" can adjudicate physical state transitions.

## Jidoka Status
Violations of safety invariants (e.g., out-of-bounds memory access or invalid law transitions) trigger a **Hard Trap**. The Wasm execution environment halts immediately, preventing faulty logic from polluting the physical state.
