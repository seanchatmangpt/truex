# Project: BitStar (Tier 0)

> **Gall Classification:** Tier 0 — Distributed Substrate
> **Truex Role:** Quantum Consensus and Multi-Node Stabilization

## 1. Product Thesis

BitStar is the **Consensus Protocol** for the federated Truex network. It allows the substrate to scale from a single machine to a global distributed enterprise. It implements a gossip-sync protocol that synchronizes actor mailboxes and receipt heads across nodes. It ensures that a BLAKE3 cryptographic receipt generated on one node is mathematically proven and legally recognized by all other nodes in the network, establishing "Operational Consensus" without a centralized clearinghouse or database.

## 2. Key Invariants

* **STAR-1 (Consensus Convergence):** All nodes must eventually converge on the same receipt head for a given project cell.
* **STAR-2 (Byzantine Fault Tolerance):** The network must detect and quarantine any node that attempts to broadcast a tampered or out-of-order receipt chain.

## 3. Verbs / Commands

* `bitstar.broadcast(receipt)`: Announces a new terminal receipt to the peer network.
* `bitstar.sync()`: Resolves chain divergences and aligns the local state with the network head.

## 4. Refusal Conditions

BitStar refuses a sync if:
* The majority of the network reports a divergent hash head (Refusing promotion).
* A peer node provides a receipt that fails the BLAKE3 causality check.

## 5. Implementation Path

Integration of the `GossipSync` prototype with a formal networking layer (libp2p or similar).