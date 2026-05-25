# Topology Rollback and Storm Protection Verification Report

This report documents the verification, implementation, and testing of cascading rollback boundaries, hook storm cycles, maximum depth limits, and emitted-delta count breaches within the TrueX Core recursive hook engine.

All tests are implemented in the test suite: [topology-rollback-storm.test.ts](file:///Users/sac/truex/packages/membrane/test/topology/topology-rollback-storm.test.ts).

---

## 1. Verified Properties & Invariants

### 1. If Hook B Fails, Hook C Does Not Execute
- **Behavior:** In a cascading chain of hooks (`Hook A -> Hook B -> Hook C`), if `Hook B` encounters an execution failure (e.g. throws an error), the entire execution cascade must abort immediately.
- **Verification:** Asserted that `Hook C` is never executed (its behavioral callback is not invoked) and the topology does not record any activation for it.

### 2. If Hook B Fails, Hook A Consequence is Rolled Back or Marked Compensated
- **Behavior:** When a child hook in the cascade fails, any preceding successful hooks in the same path must have their in-memory/persistence mutations reverted (rolled back) or compensated.
- **Verification:** Combined the `RecursiveHookEngine` with `TransactionalMembrane` (SQLite + Proxy transaction boundaries). Mutated proxy state in `Hook A` and threw an error in `Hook B`. Verified that the transaction rolls back, reverting `membrane.proxy.count` back to `0`. Also verified that the topology captures compensation activations for the rolled-back ancestors.

### 3. Rollback Emits Rollback Receipt
- **Behavior:** Causal rollbacks of ancestors must be accompanied by explicit refused receipts denoting the rollback action.
- **Verification:** Asserted that when an execution error occurs, the engine emits and appends a rollback receipt for each ancestor to the topology activations with `status: 'refused'`.

### 4. Rollback Lineage References Failed Child
- **Behavior:** The generated rollback receipt must explicitly reference the failed child receipt in its causality chain.
- **Verification:** Verified that the rollback receipt's `failedChildId` field matches the failed child's receipt ID, and its `previousReceiptHash` correctly chains back to the failed child's receipt hash.

### 5. Cyclic `A -> B -> A` Hook Storm is Detected
- **Behavior:** Infinite loop cascades (e.g., Hook A triggering Hook B which triggers Hook A) must be detected before execution.
- **Verification:** Enforced path-wise cycle checking by passing the list of ancestor hook IDs down the recursion stack. Verified that triggering a cyclic ping-pong hook triggers a `TopologyRefusalError` immediately when the cycle is entered.

### 6. Hook Storm Emits Refused Receipt
- **Behavior:** When a cyclic hook storm is detected and aborted, a refused receipt must be generated to document the refusal of the cyclic step.
- **Verification:** Asserted that the thrown `TopologyRefusalError` contains a receipt with `status: 'refused'` and a reason string stating `Cyclic hook storm detected`.

### 7. Max Depth Breach is Refused
- **Behavior:** Cascades exceeding a specified `maxDepth` limit (to protect the stack/event loop) must be refused.
- **Verification:** Configured `maxDepth: 2` and triggered a 4-step cascade. Asserted that the engine refuses execution of the 3rd step, producing a refused receipt with `hookId: 'depth-breach-refusal'` and reason `Max depth breach`.

### 8. Max Emitted-Delta Count Breach is Refused
- **Behavior:** Cascades emitting too many intermediate deltas (to protect memory/capacity) must be refused.
- **Verification:** Configured `maxEmittedDeltas: 2` and ran a cascade generating 3 deltas. Asserted that the engine aborts and refuses the execution with `TopologyRefusalError` once the limit is breached, emitting a refused receipt for `delta-breach-refusal`.

---

## 2. Test Execution Results

```bash
 RUN  v2.1.8 /Users/sac/truex

 ✓ packages/membrane/test/topology/topology-rollback-storm.test.ts (8 tests) 16ms
 ✓ packages/membrane/test/topology/topology-partial-order-vkg.test.ts (6 tests) 16ms
 ✓ packages/membrane/test/topology/topology.gall.test.ts (6 tests) 10ms
 ✓ packages/membrane/test/topology/topology-chain-replay.test.ts (8 tests) 10ms
 ✓ packages/membrane/test/topology/topology.test.ts (3 tests) 5ms

 Test Files  5 passed (5)
      Tests  31 passed (31)
   Start at  19:46:55
   Duration  1.22s (transform 216ms, setup 0ms, collect 505ms, tests 57ms, environment 1ms, prepare 164ms)
```

---

## 3. Structural Hardening & Invariant Fixes

During the initial test runs, some existing tests in the codebase failed due to receipt hash verification errors.
- **Root Cause:** In our modifications to the `Receipt` type in [runtime-law.ts](file:///Users/sac/truex/packages/membrane/src/runtime-law.ts), we introduced optional fields (`rollbackOf`, `failedChildId`, `reason`). However, their inclusion in the parsed receipt object as `undefined` properties polluted the object keys and changed the output of `stableJson` in `hash(receiptWithoutHash)` during verification in `verifyReceipt`.
- **Fix:** Hardened `parseReceipt` to only append these optional properties to the return object if they are defined (i.e. of type `'string'`). This preserves the precise key mapping and hashes of all standard receipts while correctly supporting the new metadata properties for rollback receipts, keeping 100% of the test suite green.
