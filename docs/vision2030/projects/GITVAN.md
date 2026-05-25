# Project: GITVAN (Tier 0)

> **Gall Classification:** Tier 0/1 — State Trajectory Memory
> **Truex Role:** Git-Native Operational Evidence Substrate

## 1. Product Thesis

GITVAN is the **State Trajectory Storage** for Truex. It provides a Git-native protocol for versioning the high-frequency object motion captured by the substrate. While SQLite handles the "Live Ledger," GITVAN handles the "Deep History." It stores millions of OCEL 2.0 receipts and GraphDeltas in compressed, Git-compatible blobs, enabling long-term auditing, time-travel debugging, and multi-node synchronization using standard Git distribution protocols. It ensures that the system's entire historical trajectory is cryptographically preserved and easily accessible.

## 2. Key Invariants

* **GV-1 (Zero-Loss Versioning):** Every receipt in the live ledger must have a corresponding, bit-identical representation in the GITVAN trajectory.
* **GV-2 (History Immutability):** Once a trajectory segment is pushed to GITVAN, it is cryptographically locked and cannot be rewritten.

## 3. Verbs / Commands

* `gitvan.snapshot(ledger)`: Commits the current live ledger to the persistent trajectory storage.
* `gitvan.checkout(receiptId)`: Restores a project cell to a previous historical state.

## 4. Refusal Conditions

GITVAN refuses a push if:
* The proposed trajectory segment contains a hash gap or broken receipt link.
* The history being pushed has diverged from the project's canonical branch.

## 5. Implementation Path

Automated background process that drains the SQLite `wal_deltas` into compressed Git blobs.