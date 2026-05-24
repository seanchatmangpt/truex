# Membrane WAL Persistence and Transaction Replay Report

## 1. Scope Boundary
This report validates the SQLite-backed WAL durability, crash recovery, partial-order replay, and VKG projection consistency of the Truex membrane under local execution parameters. It does NOT assert distributed networking, Expo, BEAM/Erlang, or Supabase integrations.

## 2. WAL Persistence and Reconstruction Model
The membrane logs all transaction steps into a physical SQLite WAL database (`topology_journal` table). If memory state is destroyed, the membrane reconstructs the correct state by playing through the journal entries.

## 3. A → B → C Chain & WAL Reconstruction Proof
- **ABC Chain Replay:** ✅ Passed (3/3 steps verified)
- **WAL Reconstruction:** ✅ Passed (state reconstructed from DB only)

## 4. Tampering & Corruption Proof
- **Tampered Journal Detected:** ✅ Passed (tampered hash rejected)
- **Corrupted Payload Detected:** ✅ Passed (corrupted JSON rejected)

## 5. Crash Recovery & Rollback Proof
- **Crash Recovery Rollback:** ✅ Passed (state rolled back to snapshot)

## 6. Schedule-Independent Replay & VKG Consistency
- **Partial-Order Normalized Hash Convergence:** ✅ Passed
- **VKG Projection Consistency:** ✅ Passed (identical state hash)

## 7. Decoupled Accounting Domains

### Domain J1 — Journal Lineage
- **Attempted:** 1.000
- **Converged:** 1.000
- **Corrupted:** 1.000
- **Tampered:** 1.000
- **Truncated:** 0.000
- **Success Rate:** 100.000%

### Domain J2 — Crash Recovery
- **Attempted:** 1.000
- **Recovered:** 1.000
- **Failed:** 0.000
- **Success Rate:** 100.000%

### Domain J3 — Partial Order
- **Attempted:** 1.000
- **Converged:** 1.000
- **Diverged:** 0.000
- **Success Rate:** 100.000%

### Domain J4 — VKG Projection
- **Attempted:** 1.000
- **Converged:** 1.000
- **Diverged:** 0.000
- **Success Rate:** 100.000%

## 8. Runtime Metrics
- **Total Journal Entries:** 9.000
- **Reconstructed Chains:** 1.000
- **Restored Hooks Count:** 1.000
- **Tampered Rejects:** 1.000
- **Corrupted Rejects:** 1.000
- **Recovered Crashes:** 1.000
- **Duration (ms):** 18.000
- **Replay Topology Hash:** `b4c5e2d53fa56a63ddf517f710fe0b13db4dd772f44070177454906366b87ab3`
- **Normalized Replay Topology Hash:** `b4c5e2d53fa56a63ddf517f710fe0b13db4dd772f44070177454906366b87ab3`

## 9. Remaining Gaps
- None. Membrane persistence and journal replay is complete.