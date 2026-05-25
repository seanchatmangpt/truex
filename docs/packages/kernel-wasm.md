# Package: @truex/kernel-wasm

> **Path:** `packages/kernel-wasm/`
> **Gall Classification:** Tier 0 - Deterministic Substrate

## 1. Product Thesis

The Kernel-WASM package is the **Physical Binary Distribution** of the Tier 0 Rust kernel. It contains the compiled `.wasm` bytecode and the high-performance glue-code required for JS environments. It represents the "Compiled Law" of the Truex substrate, providing the branchless, constant-time mathematical primitives that the higher-level `@truex/kernel` wrapper utilizes for adjudication.

## 2. Key Invariants

* **WASM-1 (Bytecode Parity):** The compiled WASM binary must be bit-identical to the source-proven Rust algorithms.
* **WASM-2 (Memory Safety):** All operational state must be contained within the isolated linear memory of the WASM instance, preventing any "Pointer Breakout" into the host JS environment.

## 3. Verbs / Commands

* `initWasm()`: Instantiates the WASM engine.
* `wasm.call(algorithm)`: Triggers a high-performance state transition in Rust.

## 4. Refusal Conditions

The WASM binary refuses an execution if:
* The input data exceeds the pre-allocated memory buffer.
* The algorithm ID is unknown or untracked in the active ontology.

## 5. Proof Command

```bash
cargo test --workspace
```