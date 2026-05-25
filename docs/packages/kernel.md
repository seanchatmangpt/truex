# Package: @truex/kernel

> **Path:** `packages/kernel/`
> **Gall Classification:** Tier 0/1 - Physics Geometry

## 1. Product Thesis

The Kernel package is the **Tier 0 Truex VM**. It is the absolute bedrock of the system, responsible for the sub-millisecond mathematical adjudication of operational intent. It wraps the Rust-compiled WASM binary, industrializing the cost floor of process mining and geometric workflow enforcement. It converts high-level "attempts" into low-level, zero-variance mathematical proofs.

## 2. Key Invariants

* **KER-1 (Deterministic Adjudication):** Identical inputs and POWL models must yield bit-identical decisions and receipts.
* **KER-2 (Constant-Time Math):** Admissibility checks must operate within a fixed temporal window to prevent side-channel leaks and guarantee hot-path performance.

## 3. Verbs / Commands

* `kernel.adjudicate(intent, model)`: Evaluates an operational intent against a POWL graph.
* `kernel.stamp(hash)`: Generates an unforgeable BLAKE3 cryptographic receipt.

## 4. Refusal Conditions

The Kernel refuses an adjudication if:
* The proposed state transition violates the POWL partial order.
* The BLAKE3 hash of the parent receipt fails verification.
* The WASM memory arena is exhausted.

## 5. Proof Command

```bash
pnpm --filter @truex/kernel test
```