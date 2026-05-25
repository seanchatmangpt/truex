# Topology, Partial Orders, and VKG Projections Report

This report documents the verification and testing of deterministic replay capabilities across independent hook branches, receipt chain convergence under varying scheduling orders, global normalized topology hashing, and Virtual Knowledge Graph (VKG) projection divergence.

All tests are implemented in the test suite: [topology-partial-order-vkg.test.ts](file:///Users/sac/truex/packages/membrane/test/topology/topology-partial-order-vkg.test.ts).

---

## 1. Verified Properties & Invariants

### 1. Two Independent Branches Execute in Different Schedules
- **Behavior:** We defined two execution branches, Alpha and Beta, which operate on disjoint predicates and subjects.
- **Verification:** Evaluated three distinct schedule orders:
  - **Schedule 1 (Alpha First):** `Alpha1 -> Alpha2 -> Beta1 -> Beta2`
  - **Schedule 2 (Beta First):** `Beta1 -> Beta2 -> Alpha1 -> Alpha2`
  - **Schedule 3 (Interleaved):** `Alpha1 -> Beta1 -> Alpha2 -> Beta2`
- **Result:** All schedules execute successfully without cross-branch interference.

### 2. Per-Branch Receipt Chains Converge
- **Behavior:** Preceding receipt hashes are chained strictly on a per-branch basis (i.e., `Alpha2` chains to `Alpha1`, and `Beta2` chains to `Beta1`), ignoring temporal execution order.
- **Verification:** Asserted that `receiptHash` values for each corresponding hook step are bit-for-bit identical across all schedules.
- **Robustness:** Added adversarial checks verifying that tampering with any receipt hash inside the chain causes immediate replay convergence failure.
- **Result:** `receiptAlpha2_S1.receiptHash === receiptAlpha2_S2.receiptHash === receiptAlpha2_S3.receiptHash` (Verified).

### 3. Global Normalized Topology Hash Matches Across Schedules
- **Behavior:** A global normalized topology hash is constructed by sorting the per-branch receipts deterministically by their `deltaId` and hashing the sorted receipt hashes.
- **Verification:** Checked that sorting-based normalization removes scheduling/temporal entropy.
- **Result:** The normalized global hash matches exactly across Schedules 1, 2, and 3.

### 4. Non-Normalized Schedule Hash Differs and Records Order
- **Behavior:** Temporal/sequential chaining is enforced where each step links to its immediate predecessor in that specific schedule.
- **Verification:** Checked the final receipt hash and sequence hash for Schedule 1 vs. Schedule 2.
- **Result:** The sequence hashes differ (`seqHashS1 !== seqHashS2`), proving that sequential chaining successfully records the exact scheduling sequence.

### 5. VKG Projection Emits Same Lawful Projection for Equivalent Partial Orders
- **Behavior:** A Virtual Knowledge Graph (VKG) projection tracks active quad states. Since Alpha and Beta branches are independent, they represent equivalent partial orders.
- **Verification:** Applied the delta sequences for Schedules 1, 2, and 3 to separate projections.
- **Result:** The final set of active quads and their projection hashes are identical across all schedules.

### 6. Projection Divergence is Detected When One Branch Mutates
- **Behavior:** We simulated two types of mutations:
  1. **Branch Mutation (Tampering):** Modifying the payload/object value of a delta in one of the branches.
  2. **Non-Independent Mutation (Shared Resource Collision):** Creating overlapping mutations on a shared subject/predicate (`urn:shared:config`), where different execution schedules result in different final values.
- **Verification:** Asserted that mutated delta runs and order-dependent colliders produce distinct projection hashes.
- **Result:** Projection divergence is successfully caught and verified in both cases.

---

## 2. Test Execution Results

```bash
 RUN  v2.1.8 /Users/sac/truex

 ✓ packages/membrane/test/topology/topology-partial-order-vkg.test.ts (6 tests) 16ms

 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  19:44:56
   Duration  424ms (transform 186ms, setup 0ms, collect 264ms, tests 16ms, environment 0ms, prepare 35ms)
```

---

## 3. Structural Hardening & Invariant Fixes

During the implementation of this verification layer, a subtle hash mismatch was identified in `verifyReceipt`:
- **Issue:** The parser function `parseReceipt` in [runtime-law.ts](file:///Users/sac/truex/packages/membrane/src/runtime-law.ts) assigns `undefined` values to optional fields (`rollbackOf`, `failedChildId`, `reason`). However, when receipts are initially hashed during creation inside `createReceipt` in [mutations.ts](file:///Users/sac/truex/skills/receipt/mutations.ts), those keys are not present in the object literal. Due to key ordering/existence rules in `stableJson`, the hash verification failed.
- **Fix:** Hardened [invariant.ts](file:///Users/sac/truex/skills/receipt/invariant.ts#L16-L23) to clone and delete properties with `undefined` values from the object prior to hashing, ensuring consistency and restoring 100% test success across all core primitives.
