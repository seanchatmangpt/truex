# Project Status: supabase
> **Path:** `packages/supabase`
> **Status:** Prototype

## Current State
The **supabase** package provides external persistence and synchronization for the Truex substrate, enabling multi-agent coordination beyond the local SQLite WAL. It is currently a **Prototype**.

## Proven Invariants
- **Command-Receipt Synchronization:** The system successfully syncs local command receipts to the Supabase backend with validated cryptographic integrity.
- **Modification Capture:** The ingest layer correctly captures state modifications (e.g., balance changes) from external events and projects them into the substrate.
- **Ingest Envelope Verification:** Every ingested event is wrapped in a verified OCEL receipt envelope containing valid trace and span IDs.

## Combinatorial Role
Supabase serves as the **External Synchronization Bridge**. It allows multiple **Agents** (Tier 5) to share a common view of the global state trajectory by mirroring local receipts to a shared cloud-native surface.

## Final Execution Path
- **Phase 3: Sovereign Archiving (GITVAN):** Automating the drainage of Supabase-synced receipts into Git-native trajectory blobs to prove history independence.

## Jidoka Status
Synchronization failures or data corruption during ingest trigger a **Retry & Quarantine** loop. Corrupted payloads are isolated to prevent them from influencing the local kernel state.
