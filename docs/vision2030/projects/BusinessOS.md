# Project: BusinessOS (Tier 6)

> **Gall Classification:** Tier 6 — Organizational Operating System
> **Truex Role:** Avatar-Relative Operational Projection Surface

## 1. Product Thesis

BusinessOS is the primary human-and-autonomic interface for the Truex substrate. It is not an ERP or a database; it is a **projection surface**. It consumes the cryptographic receipts and OCEL 2.0 trajectories emitted by the lower tiers to render a "Time Travel" UI. This allows operators to scrub through the system's history, observe every admitted or refused consequence, and promote state changes with absolute causal clarity.

## 2. Key Invariants

* **BOS-1 (Avatar Isolation):** Every interaction in BusinessOS is bound to a specific Avatar identity, ensuring that all human intents are receipted and accountable.
* **BOS-2 (Proof-Only Rendering):** The UI only renders states that can be cryptographically proven by a valid Truex receipt. Claims without receipts are invisible.

## 3. Verbs / Commands

* `bos.scrub(timestamp)`: Time-travels the UI to a specific operational moment.
* `bos.promote(intent)`: Proposes a state change to the consequence membrane.

## 4. Refusal Conditions

BusinessOS refuses an interaction if:
* The user attempts to "write" to a field that is currently locked by a lower-tier transaction.
* The local node's gossip-sync head is out of alignment with the network.

## 5. Implementation Path

Transition from a standalone application to a pure frontend that communicates with `@truex/membrane` and `@truex/kernel`.