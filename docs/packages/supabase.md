# Package: @truex/supabase

> **Path:** `packages/supabase/`
> **Gall Classification:** Tier 0 - Distributed Substrate

## 1. Product Thesis

The Supabase package is the **Distributed Sync and Evidence Persistence** layer. It bridges the local Truex SQLite ledger (`gall_truex.db`) to the global federated network. It handles the storage of Truex envelopes and cryptographic receipts in a Postgres/Supabase backend, enabling cross-node synchronization and offline-first operational closure.

## 2. Key Invariants

* **SUP-1 (No Local Promotion without Sync):** If configured, local state promotion is refused until the receipt has been successfully broadcast to the consensus layer.
* **SUP-2 (Hash Parity):** The hash of an envelope stored in Supabase must bit-match the local SQLite record.

## 3. Verbs / Commands

* `supabase.sync(envelope)`: Broadcasts a Truex envelope to the remote database.
* `supabase.pull(receiptId)`: Recovers a cryptographic receipt from the federated network.

## 4. Refusal Conditions

The Supabase sync refuses a transition if:
* The remote database hash for the current tip diverges from the local gossip sync.
* The network connection is lost and the system is in "Strict Sync" mode.

## 5. Proof Command

```bash
pnpm --filter @truex/supabase test
```