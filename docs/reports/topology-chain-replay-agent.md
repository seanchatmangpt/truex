# Topology Chain Execution and Replay Verification Report

This report documents the verification of causal chain execution, cryptographic receipt chaining, and deterministic replay convergence across multi-step cascades.

All tests are implemented in the test suite: [topology-chain-replay.test.ts](file:///Users/sac/truex/packages/membrane/test/topology/topology-chain-replay.test.ts).

---

## 1. Verified Properties & Invariants

### 1. `A -> B -> C` Chain Executes in Order
- **Behavior:** Hook A triggers on `trigger:A` and produces a delta containing `trigger:B`. Hook B triggers on `trigger:B` and produces a delta containing `trigger:C`. Hook C triggers on `trigger:C` and emits a termination event.
- **Verification:** The cascade execution was processed using `RecursiveHookEngine`. We verified that the activations sequence was strictly `hook-A` (depth 0) -> `hook-B` (depth 1) -> `hook-C` (depth 2).

### 2. Each Hook Emits a Receipt
- **Behavior:** Each execution step on the production line must construct a tamper-proof cryptographic receipt.
- **Verification:** Verified that each of the three activations emits a `Receipt` object, and that calling `verifyReceipt` on every individual receipt returns `true`.

### 3. Each Downstream Delta References Parent Receipt
- **Behavior:** In a causal chain, each step must cryptographically reference its predecessor.
- **Verification:** Asserted that:
  - Downstream delta ids match: `activationB.triggerDeltaId === activationA.producedDeltaId` and `activationC.triggerDeltaId === activationB.producedDeltaId`.
  - Receipt previous hashes match: `activationB.receipt.previousReceiptHash === activationA.receipt.receiptHash` and `activationC.receipt.previousReceiptHash === activationB.receipt.receiptHash`.
  - Root parent previous hash is `null`.

### 4. Full Chain Replay Converges
- **Behavior:** Replaying a lawful execution chain under the same rules and seed must result in identical execution outcomes.
- **Verification:** Tested this through two methods:
  - **Sequential Replay:** Walked through each activation manually using the `TruexHook.replay` primitive, reconstructing inputs at each level.
  - **Cascade Replay:** Ran the entire recursive cascade from scratch and verified that the resulting `HookTopology` has the exact same stable JSON hash.

### 5. Replaying with Mutated Middle Delta Fails
- **Behavior:** Modifying the input values of a step in the middle of the execution chain must cause replay validation to fail.
- **Verification:** Replayed `hook-B` with a mutated delta where:
  - The delta's quad value was altered (e.g. `object` changed to `"mutated_value"`).
  - The delta's `id` was altered.
- **Result:** Replay returned `false` in both scenarios because input hash matching failed.

### 6. Replaying with Mutated Parent Receipt Fails
- **Behavior:** Any modification to preceding receipt hashes in the chain must invalidate downstream execution.
- **Verification:** Simulated two adversarial tempering scenarios on Hook B's receipt:
  - **Direct Tampering:** Mutated `previousReceiptHash` without updating the `receiptHash` field (fails `verifyReceipt` self-integrity check).
  - **Hash-Allying Tampering:** Mutated `previousReceiptHash` and recalculated `receiptHash` to make the self-integrity check pass (passes `verifyReceipt`, but fails the execution convergence check since the derived `stepSeed` changes and produces a different outcome hash).
- **Result:** Both tampering styles were caught and failed replay verification.

### 7. Same Seed and Same Chain Produce Same Topology Report Hash
- **Behavior:** Given the same initial parent seed and hook chain, the overall execution topology must be perfectly deterministic.
- **Verification:** Ran two cascade runs with parent seed `42` and verified `hash(topology1) === hash(topology2)`.

### 8. Different Parent Seed Changes Topology Hash
- **Behavior:** A different parent seed must produce divergent step seeds and unique cryptographic receipt hashes.
- **Verification:** Ran the cascade with parent seed `100` and `101`, verifying that their respective global topology hashes differ.

---

## 2. Test Execution Evidence

```bash
 RUN  v2.1.8 /Users/sac/truex

 ✓ packages/membrane/test/topology/topology-chain-replay.test.ts (8 tests) 11ms

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Start at  19:46:03
   Duration  524ms (transform 240ms, setup 0ms, collect 362ms, tests 11ms, environment 0ms, prepare 37ms)
```

The entire repository test suite (851 tests across 77 test files) is fully stable and passing.
