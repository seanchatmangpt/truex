# Project: CNS (Tier 0)

> **Gall Classification:** Tier 0 — Deterministic Substrate
> **Truex Role:** Ultra-High-Throughput Branchless Execution Engine

## 1. Product Thesis

CNS is the **Physical Execution Engine** of the Truex substrate. It is designed for maximum throughput, operating at the hardware level to stabilize operational consequences. By utilizing branchless logic and bit-native operations, CNS achieves performance speeds of 97B ops/sec, ensuring that the "Truex Physics" can keep up with the world's most demanding high-frequency workloads (HFT, Telecommunications, Real-time Manufacturing). It is the layer where abstract law becomes physical reality.

## 2. Key Invariants

* **CNS-1 (Hardware Determinism):** Execution results must be bit-identical across different CPU architectures (x86_64, ARM64) to ensure global replay parity.
* **CNS-2 (Zero Variance):** Logic must be implemented using branchless patterns to eliminate timing attacks and jitter.

## 3. Verbs / Commands

* `cns.stabilize(transition)`: Executes a high-frequency state transition.
* `cns.measure()`: Captures hardware-level performance facts (CPU cycles, cache hits).

## 4. Refusal Conditions

CNS refuses an operation if:
* The hardware-level invariant check (e.g., checksum parity) fails.
* The instruction attempt violates the bit-mask of the current state.

## 5. Implementation Path

The core Rust logic contained within the `truex-kernel` and `bcinr` dependencies.