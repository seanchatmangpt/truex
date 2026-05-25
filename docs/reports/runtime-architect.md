# Runtime Architect Report: Decomposition Drift & Boundary Stabilization

**Date:** 2026-05-23
**Agent:** Agent 4 — Runtime Architect
**Status:** Stabilization Strategy Defined

---

## 1. Current Layer Map

The Truex system is structured into five distinct operational layers, moving from mathematical primitives up to automated agent coordination.

| Layer | Responsibility | Key Modules |
| :--- | :--- | :--- |
| **Layer 0: Primitives (S-2 to S0)** | Core deterministic computations, hashing (BLAKE3), post-quantum signature verification (ML-DSA-65), and receipt verification. | `src/lib/gall-truex/hash-proof.ts`<br>`src/lib/gall-truex/receipt-proof.ts`<br>`src/lib/gall-truex/signature-proof.ts`<br>`packages/membrane/src/hash.ts` (delegates to `skills/hash/mutations.ts`) |
| **Layer 1: Persistence & Journaling (S3)** | SQLite transactional persistance membrane, write-ahead logging (WAL) for Zero-Loss Cold-Load, and recovery. | `packages/membrane/src/persistence/schema.ts`<br>`packages/membrane/src/persistence/receipt-store.ts`<br>`packages/membrane/src/persistence/journal.ts` |
| **Layer 2: Execution Engine & Replay (S1 to S2)** | Engine evaluators matching GraphDeltas to Hook conditions, producing receipts, and validating replay convergence. | `src/lib/gall-truex/engine-proof.ts`<br>`src/lib/gall-truex/replay-proof.ts`<br>`packages/membrane/src/persistence/replay.ts` |
| **Layer 3: Interception Membranes (Capabilities)** | ES6 Proxy boundaries trapping and isolating mutations, enforcing sandboxes, ACL policies, transactions, and logs. | `packages/membrane/src/membrane.ts` (delegates to consolidated `skills/membrane/mutations.ts` and `skills/membrane/invariant.ts`) |
| **Layer 4: Orchestration & Collaboration** | Autonomic closed-loop execution, production scheduling (Heijunka), and external agent adapter orchestration. | `packages/membrane/src/manufacturing/`<br>`packages/membrane/src/integration/` |

---

## 2. Drift Findings

### A. Hashing Algorithm Divergence (Critical Proof Drift)
The codebase has a major cryptographic drift where different modules compute hashes using different algorithms:
- `hash-proof.ts`, `skills/hash/mutations.ts`, and `report-receipt.ts` correctly implement **BLAKE3**.
- `sqlite-proof.ts` and the legacy `src/ocel2/index.js` define their own `hash` functions using **SHA-256** from `node:crypto`.

**Impact:** A receipt created during in-memory evaluation cannot be validated in persistence or during replay of certain legacy layers due to mismatched hash algorithms.

### B. SQLite Schema and Store Inconsistencies
There are currently three divergent implementations of the SQLite persistent receipt store:
1. `src/lib/gall-truex/sqlite-proof.ts`: Uses a simple schema where the `gall_receipts` table only contains `id` and `data` columns.
2. `skills/replay/mutations.ts`: Uses a schema where `gall_receipts` includes columns like `status`, `previousReceiptHash`, and `receiptHash` as raw fields alongside `data`.
3. `packages/membrane/src/persistence/schema.ts` (and `receipt-store.ts`): Uses the fully canonicalized production WAL schema with individual columns for `event_id`, `delta_id`, `input_hash`, `output_hash`, `previous_receipt_hash`, `status`, and `receipt_hash` as well as index setup.

**Impact:** Writing database adapters or maintaining schema migrations is complicated by these different structures.

### C. ES6 Proxy Interception Duplication
The ES6 Proxy interception logic is split between two major, unconnected code blocks:
- **Legacy JS Implementations (`src/`)**: 11 folders (`src/proxy/`, `src/invariants/`, `src/simulation/`, etc.) implement proxy context-traps using separate files and JavaScript exports.
- **Modern Consolidated TypeScript Membrane (`skills/membrane/`)**: Re-implements these exact same concepts (`createProxy`, `createTransactionContext`, `createSimulationContext`, `OcelCollector`, `createOcelProxy`) inside TypeScript modules.

**Impact:** Massive codebase bloat and duplication.

### D. Deterministic RNG Duplication
The Mulberry32 deterministic random number generator is duplicated:
- `src/lib/gall-truex/receipt-proof.ts` (`nextRand`, `deterministicUUID`)
- `src/replay/replay-context.js` (`createLocalDeterministicContext`)

---

## 3. Premature Abstractions

The separation of context-interceptor subfolders in the legacy `src/` directory (e.g. `src/multitenancy/`, `src/security/`, `src/virtualization/`, etc.) is a premature abstraction. Splitting a single proxy membrane interceptor into 11 distinct packages before interfaces stabilized led to:
- Scattered, redundant traps for standard ES6 proxy handlers (`get`, `set`, `deleteProperty`).
- Coordination overhead when multiple context layers are combined (e.g., combining transactions with invariants).

Consolidating these into `skills/membrane/mutations.ts` and `skills/membrane/invariant.ts` solved this, making the legacy directories obsolete.

---

## 4. Stabilization Recommendations

### Exact File Boundaries to KEEP (Canonical Sources of Truth)
1. **Hashing & Serialization**: `packages/membrane/src/hash.ts` (delegating to `skills/hash/mutations.ts`) is the single source of truth for BLAKE3 hashing and deterministic `stableJson` representation.
2. **Membrane Interception**: `packages/membrane/src/membrane.ts` is the single entry point for all ES6 Proxy capabilities (ACL, Invariants, Sandbox, Transactions, Simulation).
3. **Database Schema**: `packages/membrane/src/persistence/schema.ts` is the canonical schema definition and migration runner.
4. **Receipt Primitives**: `packages/membrane/src/receipt.ts` is the canonical library for receipt creation, ML-DSA-65 signatures, and chain verification.

### Exact File Boundaries to COLLAPSE (Future Deprecation Target)
1. **Legacy Interceptors (`src/`)**: Deprecate and remove `src/proxy/`, `src/sandbox/`, `src/simulation/`, `src/invariants/`, `src/security/`, `src/contracts/`, `src/observability/`, `src/virtualization/`, `src/context/`, `src/replay/`, `src/multitenancy/`.
2. **Legacy Adapters (`src/ocel2/`)**: Remove the JS implementation of `ocel2` and transition consumers to use the unified OcelCollector from `packages/membrane/src/membrane.ts`.
3. **Proof-level Helpers (`src/lib/gall-truex/`)**: Unify `sqlite-proof.ts` and `engine-proof.ts` to import `hash`, `createReceipt`, and SQLite schemas from `packages/membrane` rather than defining simplified local models.
