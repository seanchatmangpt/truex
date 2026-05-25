# Project: UNIBIT (Tier 0)

> **Gall Classification:** Tier 0 — Deterministic Substrate
> **Truex Role:** Bit-Native L1 Execution Substrate and Causal Chain

## 1. Product Thesis

UNIBIT is the **Causal Receipt Layer** for Truex. It is responsible for generating the bit-native cryptographic hashes that form the system's unforgeable chain of authority. UNIBIT doesn't just hash data; it hashes the *causality* of every execution step. By binding the current state, the proposed delta, and the parent receipt into a single BLAKE3 digest, UNIBIT ensures that every millisecond of the system's operation is mathematically tied to the genesis block.

## 2. Key Invariants

* **UNI-1 (Unforgeable Causality):** No receipt is generated without a valid reference to its causal parent.
* **UNI-2 (Collision Resistance):** Leverages BLAKE3 to ensure that even at 100B ops/sec, the probability of a causal collision remains zero.

## 3. Verbs / Commands

* `unibit.link(delta, parent)`: Generates the causal hash for a new transition.
* `unibit.verify(receipt)`: Validates the bit-native integrity of a causal link.

## 4. Refusal Conditions

UNIBIT refuses a link if:
* The parent receipt hash does not match the local chain's tail.
* The resulting hash violates the system's "Genesis Proof."

## 5. Implementation Path

The primary cryptographic provider for the `truex-kernel` and `receipt-store`.