# Antigravity Artifact: Core Primitives

> **Generated:** 2026-05-24T08:39:22.216Z
> **Version:** 1.0.0

## Core Primitives

### HASH
- **Files:** packages/truex-core/src/hash.ts
- **Resolved Symbols:** stableJson, hash

### SIGNATURE
- **Files:** packages/truex-core/src/signature.ts
- **Resolved Symbols:** generateKeyPair, signReceiptHash, verifySignature, createReceipt, KeyPair

### RECEIPT
- **Files:** packages/truex-core/src/receipt.ts
- **Resolved Symbols:** generateKeyPair, signReceiptHash, verifySignature, createReceipt, KeyPair, verifyReceipt, verifyChain

### REPLAY
- **Files:** packages/truex-core/src/replay.ts
- **Resolved Symbols:** conditionMatches, verifyConvergence, MemoryReceiptStore, SQLiteReceiptStore, GallTruexPureEngine, GallTruexSqliteEngine, EvaluationResult, assertOutputConvergence

## Stats

| Metric | Value |
| :--- | :--- |
| totalFiles | 67 |
| totalFunctions | 160 |
| totalClasses | 37 |
| totalExportedSymbols | 395 |

## File Inventory

| Path | Functions | Classes | Symbols |
| :--- | :--- | :--- | :--- |
| `packages/truex-core/src/benchmark/hookbench.gall.ts` | 9 | 1 | 15 |
| `packages/truex-core/src/benchmark/million-hook-church.ts` | 3 | 1 | 6 |
| `packages/truex-core/src/benchmark/runner.ts` | 2 | 0 | 3 |
| `packages/truex-core/src/benchmark/stress-tests.ts` | 1 | 0 | 1 |
| `packages/truex-core/src/concurrency.ts` | 3 | 0 | 5 |
| `packages/truex-core/src/context.ts` | 1 | 0 | 2 |
| `packages/truex-core/src/hash.ts` | 0 | 0 | 0 |
| `packages/truex-core/src/hook-otp.gall.ts` | 7 | 0 | 14 |
| `packages/truex-core/src/hook.ts` | 0 | 1 | 1 |
| `packages/truex-core/src/index.ts` | 0 | 0 | 0 |
| `packages/truex-core/src/integration/autonomic-loop.ts` | 0 | 2 | 4 |
| `packages/truex-core/src/integration/consequence-actuator.ts` | 4 | 0 | 9 |
| `packages/truex-core/src/integration/env-actuator.ts` | 3 | 0 | 3 |
| `packages/truex-core/src/integration/hook-interceptor.ts` | 1 | 0 | 1 |
| `packages/truex-core/src/integration/report-receipt.ts` | 3 | 0 | 4 |
| `packages/truex-core/src/integration/skill-sandbox.ts` | 1 | 0 | 2 |
| `packages/truex-core/src/integration/swarm-controller.ts` | 3 | 0 | 8 |
| `packages/truex-core/src/integration/task-delta.ts` | 1 | 0 | 1 |
| `packages/truex-core/src/integration/trajectory-replay.ts` | 3 | 0 | 4 |
| `packages/truex-core/src/manufacturing/collaboration.ts` | 0 | 1 | 1 |
| `packages/truex-core/src/manufacturing/gemba.ts` | 0 | 1 | 2 |
| `packages/truex-core/src/manufacturing/heijunka.ts` | 0 | 1 | 2 |
| `packages/truex-core/src/manufacturing/jidoka.ts` | 0 | 2 | 2 |
| `packages/truex-core/src/manufacturing/jit.ts` | 0 | 1 | 1 |
| `packages/truex-core/src/manufacturing/kaizen.ts` | 0 | 2 | 4 |
| `packages/truex-core/src/manufacturing/lean.ts` | 0 | 1 | 3 |
| `packages/truex-core/src/manufacturing/line.ts` | 1 | 1 | 2 |
| `packages/truex-core/src/manufacturing/registry.ts` | 1 | 1 | 3 |
| `packages/truex-core/src/manufacturing/standardization.ts` | 2 | 0 | 3 |
| `packages/truex-core/src/manufacturing/swarm-actuator.ts` | 0 | 1 | 2 |
| `packages/truex-core/src/manufacturing/topology.ts` | 0 | 2 | 4 |
| `packages/truex-core/src/manufacturing/visual.ts` | 0 | 1 | 2 |
| `packages/truex-core/src/membrane-replay.gall.ts` | 13 | 0 | 22 |
| `packages/truex-core/src/membrane.ts` | 0 | 0 | 0 |
| `packages/truex-core/src/ocel2-project-projection.gall.ts` | 8 | 0 | 10 |
| `packages/truex-core/src/ocel2-project-types.ts` | 9 | 0 | 89 |
| `packages/truex-core/src/ocpq-project-constraints.gall.ts` | 3 | 0 | 12 |
| `packages/truex-core/src/persistence/audit-engine.ts` | 0 | 1 | 2 |
| `packages/truex-core/src/persistence/index.ts` | 0 | 1 | 2 |
| `packages/truex-core/src/persistence/journal.ts` | 0 | 1 | 1 |
| `packages/truex-core/src/persistence/lock.ts` | 0 | 1 | 2 |
| `packages/truex-core/src/persistence/membrane-link.ts` | 1 | 1 | 2 |
| `packages/truex-core/src/persistence/ontology.ts` | 0 | 1 | 2 |
| `packages/truex-core/src/persistence/receipt-store.ts` | 0 | 1 | 1 |
| `packages/truex-core/src/persistence/replay.ts` | 0 | 1 | 1 |
| `packages/truex-core/src/persistence/schema.ts` | 1 | 0 | 3 |
| `packages/truex-core/src/persistence/snapshot.ts` | 1 | 0 | 3 |
| `packages/truex-core/src/persistence/transactions.ts` | 0 | 1 | 1 |
| `packages/truex-core/src/persistent-mailbox.gall.ts` | 21 | 0 | 27 |
| `packages/truex-core/src/plugins/otel-weaver.ts` | 0 | 0 | 1 |
| `packages/truex-core/src/powl-project-workflow.gall.ts` | 7 | 0 | 20 |
| `packages/truex-core/src/project-wizard.gall.ts` | 0 | 5 | 9 |
| `packages/truex-core/src/receipt.ts` | 0 | 0 | 0 |
| `packages/truex-core/src/replay.ts` | 0 | 0 | 0 |
| `packages/truex-core/src/runtime-law.ts` | 8 | 0 | 18 |
| `packages/truex-core/src/signature.ts` | 0 | 0 | 0 |
| `packages/truex-core/src/topology.gall.ts` | 8 | 0 | 19 |
| `packages/truex-core/src/utils/array.ts` | 3 | 0 | 4 |
| `packages/truex-core/src/utils/error-log.ts` | 3 | 0 | 4 |
| `packages/truex-core/src/utils/log-format.ts` | 5 | 0 | 7 |
| `packages/truex-core/src/utils/memory.ts` | 1 | 2 | 3 |
| `packages/truex-core/src/utils/object.ts` | 3 | 0 | 3 |
| `packages/truex-core/src/utils/proxy-log.ts` | 1 | 0 | 2 |
| `packages/truex-core/src/utils/proxy-overhead.ts` | 6 | 0 | 8 |
| `packages/truex-core/src/utils/string.ts` | 2 | 0 | 2 |
| `packages/truex-core/src/utils/timing.ts` | 2 | 1 | 4 |
| `packages/truex-core/src/utils/type.ts` | 5 | 0 | 5 |

---
*Artifact generated by Truex Observatory.*