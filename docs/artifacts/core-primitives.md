# Antigravity Artifact: Core Primitives

> **Generated:** 2026-05-26T05:19:54.170Z
> **Version:** 1.0.0

## Core Primitives

### HASH
- **Files:** packages/membrane/src/hash.ts
- **Resolved Symbols:** stableJson, hash

### SIGNATURE
- **Files:** packages/membrane/src/signature.ts
- **Resolved Symbols:** generateKeyPair, signReceiptHash, verifySignature, createReceipt, KeyPair

### RECEIPT
- **Files:** packages/membrane/src/receipt.ts
- **Resolved Symbols:** generateKeyPair, signReceiptHash, verifySignature, createReceipt, KeyPair, verifyReceipt, verifyChain

### REPLAY
- **Files:** packages/membrane/src/replay.ts
- **Resolved Symbols:** conditionMatches, verifyConvergence, MemoryReceiptStore, SQLiteReceiptStore, GallTruexPureEngine, GallTruexSqliteEngine, EvaluationResult, assertOutputConvergence

## Stats

| Metric | Value |
| :--- | :--- |
| totalFiles | 85 |
| totalFunctions | 180 |
| totalClasses | 51 |
| totalExportedSymbols | 468 |

## File Inventory

| Path | Functions | Classes | Symbols |
| :--- | :--- | :--- | :--- |
| `packages/membrane/src/benchmark/hookbench.gall.ts` | 9 | 1 | 15 |
| `packages/membrane/src/benchmark/million-hook-church.ts` | 3 | 1 | 6 |
| `packages/membrane/src/benchmark/runner.ts` | 2 | 0 | 3 |
| `packages/membrane/src/benchmark/stress-tests.ts` | 1 | 0 | 1 |
| `packages/membrane/src/concurrency/truex-wasm-bridge.ts` | 0 | 1 | 1 |
| `packages/membrane/src/concurrency/wasm-worker-pool.ts` | 0 | 1 | 2 |
| `packages/membrane/src/concurrency/wasm-worker.ts` | 0 | 0 | 0 |
| `packages/membrane/src/concurrency.ts` | 3 | 0 | 5 |
| `packages/membrane/src/context.ts` | 2 | 0 | 3 |
| `packages/membrane/src/hash.ts` | 0 | 0 | 0 |
| `packages/membrane/src/hook-otp.gall.ts` | 14 | 0 | 21 |
| `packages/membrane/src/hook.ts` | 0 | 1 | 1 |
| `packages/membrane/src/index.ts` | 0 | 0 | 0 |
| `packages/membrane/src/integration/autonomic-loop.ts` | 0 | 2 | 4 |
| `packages/membrane/src/integration/consequence-actuator.ts` | 4 | 0 | 9 |
| `packages/membrane/src/integration/env-actuator.ts` | 3 | 0 | 3 |
| `packages/membrane/src/integration/hook-interceptor.ts` | 1 | 0 | 1 |
| `packages/membrane/src/integration/report-receipt.ts` | 3 | 0 | 4 |
| `packages/membrane/src/integration/skill-sandbox.ts` | 1 | 0 | 2 |
| `packages/membrane/src/integration/swarm-controller.ts` | 3 | 0 | 8 |
| `packages/membrane/src/integration/task-delta.ts` | 1 | 0 | 1 |
| `packages/membrane/src/integration/trajectory-replay.ts` | 3 | 0 | 4 |
| `packages/membrane/src/lib/entropy.ts` | 0 | 1 | 1 |
| `packages/membrane/src/lib/logic-engine.ts` | 0 | 1 | 5 |
| `packages/membrane/src/manufacturing/collaboration.ts` | 0 | 1 | 1 |
| `packages/membrane/src/manufacturing/gemba.ts` | 0 | 1 | 2 |
| `packages/membrane/src/manufacturing/heijunka.ts` | 0 | 1 | 2 |
| `packages/membrane/src/manufacturing/jidoka.ts` | 0 | 2 | 2 |
| `packages/membrane/src/manufacturing/jit.ts` | 0 | 1 | 1 |
| `packages/membrane/src/manufacturing/kaizen.ts` | 0 | 2 | 4 |
| `packages/membrane/src/manufacturing/lean.ts` | 0 | 1 | 3 |
| `packages/membrane/src/manufacturing/line.ts` | 1 | 1 | 2 |
| `packages/membrane/src/manufacturing/registry.ts` | 1 | 1 | 3 |
| `packages/membrane/src/manufacturing/remediator.ts` | 0 | 1 | 2 |
| `packages/membrane/src/manufacturing/standardization.ts` | 2 | 0 | 3 |
| `packages/membrane/src/manufacturing/swarm-actuator.ts` | 0 | 1 | 2 |
| `packages/membrane/src/manufacturing/swarm-receipt.ts` | 1 | 0 | 2 |
| `packages/membrane/src/manufacturing/topology.ts` | 0 | 2 | 4 |
| `packages/membrane/src/manufacturing/visual.ts` | 0 | 1 | 2 |
| `packages/membrane/src/membrane-replay.gall.ts` | 13 | 0 | 22 |
| `packages/membrane/src/membrane.ts` | 0 | 0 | 0 |
| `packages/membrane/src/ocel2-project-projection.gall.ts` | 8 | 0 | 10 |
| `packages/membrane/src/ocel2-project-types.ts` | 13 | 0 | 98 |
| `packages/membrane/src/ocpq-project-constraints.gall.ts` | 4 | 0 | 13 |
| `packages/membrane/src/persistence/audit-engine.ts` | 0 | 1 | 2 |
| `packages/membrane/src/persistence/gossip-sync.ts` | 0 | 1 | 2 |
| `packages/membrane/src/persistence/index.ts` | 0 | 1 | 2 |
| `packages/membrane/src/persistence/journal.ts` | 0 | 1 | 1 |
| `packages/membrane/src/persistence/lock.ts` | 0 | 1 | 2 |
| `packages/membrane/src/persistence/membrane-link.ts` | 1 | 1 | 2 |
| `packages/membrane/src/persistence/ontology.ts` | 0 | 1 | 2 |
| `packages/membrane/src/persistence/receipt-store.ts` | 0 | 1 | 1 |
| `packages/membrane/src/persistence/replay.ts` | 0 | 1 | 1 |
| `packages/membrane/src/persistence/schema.ts` | 1 | 0 | 3 |
| `packages/membrane/src/persistence/snapshot.ts` | 1 | 0 | 3 |
| `packages/membrane/src/persistence/transactions.ts` | 0 | 1 | 1 |
| `packages/membrane/src/persistent-mailbox.gall.ts` | 21 | 0 | 27 |
| `packages/membrane/src/plugins/otel-weaver.ts` | 1 | 0 | 2 |
| `packages/membrane/src/powl-project-workflow.gall.ts` | 9 | 1 | 24 |
| `packages/membrane/src/project-wizard.gall.ts` | 0 | 5 | 11 |
| `packages/membrane/src/receipt.ts` | 0 | 0 | 0 |
| `packages/membrane/src/replay.ts` | 0 | 0 | 0 |
| `packages/membrane/src/runtime-law.ts` | 8 | 0 | 18 |
| `packages/membrane/src/signature.ts` | 0 | 0 | 0 |
| `packages/membrane/src/telco.gall.ts` | 0 | 2 | 11 |
| `packages/membrane/src/topology.gall.ts` | 8 | 0 | 19 |
| `packages/membrane/src/utils/array.ts` | 3 | 0 | 4 |
| `packages/membrane/src/utils/error-log.ts` | 3 | 0 | 4 |
| `packages/membrane/src/utils/log-format.ts` | 5 | 0 | 7 |
| `packages/membrane/src/utils/memory.ts` | 1 | 2 | 3 |
| `packages/membrane/src/utils/object.ts` | 3 | 0 | 3 |
| `packages/membrane/src/utils/proxy-log.ts` | 1 | 0 | 2 |
| `packages/membrane/src/utils/proxy-overhead.ts` | 6 | 0 | 8 |
| `packages/membrane/src/utils/reactive-patterns.ts` | 3 | 0 | 5 |
| `packages/membrane/src/utils/string.ts` | 2 | 0 | 2 |
| `packages/membrane/src/utils/timing.ts` | 2 | 1 | 4 |
| `packages/membrane/src/utils/type.ts` | 5 | 0 | 5 |
| `packages/membrane/src/utils/wasm-resource.ts` | 0 | 1 | 2 |
| `packages/membrane/src/validation/jidoka-controller.ts` | 0 | 1 | 1 |
| `packages/membrane/src/wizard/project-cell.ts` | 0 | 0 | 7 |
| `packages/membrane/src/wizard/project-receipts.ts` | 0 | 0 | 1 |
| `packages/membrane/src/wizard/project-route.ts` | 0 | 0 | 4 |
| `packages/membrane/src/wizard/verbs/init.ts` | 0 | 1 | 1 |
| `packages/membrane/src/wizard/verbs/map.ts` | 0 | 1 | 2 |
| `packages/membrane/src/wizard/verbs/plan.ts` | 0 | 1 | 1 |

---
*Artifact generated by Truex Observatory.*