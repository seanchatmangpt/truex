# Project Status: kernel
> **Path:** `packages/kernel`
> **Status:** Stable

## Current State
The **kernel** is the zero-variance execution loop of the Truex Operating System. It is the final authority for state adjudication and cryptographic receipt issuance. It is currently **Stable**, providing the foundation for all Tier 1-6 operations.

## Proven Invariants
- **Input Integrity:** The kernel guarantees that the same input always yields the same hash, ensuring complete execution determinism.
- **Cryptographic Finality:** Every admitted transition is signed with a BLAKE3+ML-DSA dual signature, providing quantum-hardened proof of state.
- **Stable Lexical Ordering:** JSON keys are sorted before hashing to prevent spurious divergence in receipt chains.

## Combinatorial Role
The kernel serves as the **Adjudication Layer**. it receives effect sets from the **Engine** (Tier 1) and writes them to the **SQLite WAL** (Tier 0) while issuing the receipts that the **Swarm** (Tier 4) uses for consensus.

## Final Execution Path
- **Phase 1: Operation Rename-Complete:** Finalizing the rebrand from `wasm4pm` to `truex-kernel` across all Rust crates and TS bridge files to establish the 2030 namespace.

## Jidoka Status
Any detected tampering with the receipt chain or the underlying WAL results in an immediate **Integrity Refusal**. The kernel refuses to boot or admit new transitions if the cryptographic lineage is broken.
