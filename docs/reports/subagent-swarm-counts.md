# Subagent Swarm Execution & Audit Report

**Date:** 2026-05-24
**Subject:** Swarm Subagent Execution Accounting & Operational Boundary Validation

---

## 1. Executive Summary

This audit accounting report details the execution metrics and state verification of the five core subagent classes configured within the `truex` repository: **Governor**, **Architect**, **Operator**, **Doctor**, and **Auditor**.

Operational metrics were gathered from conversation log traces (`transcript.jsonl`), database state logs (`gall_truex.db`), and specialized validation sweeps:
- **Receipted Swarm Audit Integration (`scripts/receipted-audit.ts`)**: Evaluated each subagent class in a sequential operational loop, logging findings, generating post-quantum ML-DSA signature receipts, and validating replay convergence.
- **Consequence Authority Verification (`skills/adapter/proofs.ts` and `adapter.test.ts`)**: Proved ACL gate boundary constraints, structural data validation gates, and database transactional rollbacks.

All percentages and rates are calculated to exactly three decimal places (`.xxx` precision) in compliance with the repository's numerical precision standards.

---

## 2. Swarm Accounting Matrix

The table below compiles all attempts, completions, failures, refusals, and timeouts for each subagent class, along with their completed rates:

| Subagent Class | Attempted | Completed | Failed | Refused | Timed Out | Completed Rate |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **GovernorAgent** | 4 | 2 | 0 | 2 | 0 | `50.000%` |
| **DoctorAgent** | 4 | 2 | 0 | 2 | 0 | `50.000%` |
| **ArchitectAgent** | 1 | 1 | 0 | 0 | 0 | `100.000%` |
| **OperatorAgent** | 1 | 1 | 0 | 0 | 0 | `100.000%` |
| **AuditorAgent** | 1 | 1 | 0 | 0 | 0 | `100.000%` |
| **MaliciousAgent** (Security Test) | 2 | 0 | 0 | 2 | 0 | `0.000%` |
| **SWARM AGGREGATE** | **13** | **6** | **0** | **7** | **0** | **`46.154%`** |

### Accounting Breakdown Details:
1. **GovernorAgent**:
   - `scripts/receipted-audit.ts` (1 run, committed successfully)
   - `skills/adapter/proofs.ts` (3 runs submitted via adapter):
     - Proposal `prop-001` (valid payload, admitted & committed)
     - Proposal `prop-003` (malformed empty subject, refused by intake validation)
     - Proposal `prop-004` (speculative run causing duplicate UUID, refused by database constraint)
2. **DoctorAgent**:
   - `scripts/receipted-audit.ts` (1 run, committed successfully)
   - `packages/membrane/test/adapter.test.ts` (3 runs submitted via adapter):
     - Proposal `prop-1` (valid payload, admitted & committed)
     - Proposal `prop-3` (malformed empty subject, refused by intake validation)
     - Proposal `prop-4` (speculative run causing duplicate UUID, refused by database constraint)
3. **ArchitectAgent**, **OperatorAgent**, and **AuditorAgent**:
   - Each ran exactly 1 time during `scripts/receipted-audit.ts`, passing all internal assertions and committing successfully.
4. **MaliciousAgent**:
   - Run twice (once in `skills/adapter/proofs.ts` and once in `adapter.test.ts`) to verify that the ACL gate blocks unauthorized mutations. Both runs were correctly refused.

---

## 3. Operational Boundary Metrics & Proofs

To establish receipt-bearing operational trust, the system validates three primary boundary layers:

### A. ACL Gate Admission & Refusal Boundary
The `TruexAgentAdapter` enforces write-level capabilities by checking a subagent's class ID against a registered allowed predicate ACL map (`allowedAgentsACL`). 
- **Admission Proof**: A valid proposal from an authorized agent (e.g. `GovernorAgent` proposing `schema:stepName`) generates a `confirmed` receipt:
  $$\text{Receipt.status} = \text{"confirmed"}$$
- **Refusal Proof**: An unauthorized agent (e.g. `MaliciousAgent`) or a write to an unregistered predicate yields a `refused` status, blocking the write:
  $$\text{Receipt.status} = \text{"refused"}$$
- **Structural Integrity Gate**: Intake validation rejects empty subjects or invalid quads before executing hooks.
- **Speculative Rollback Boundary**: Any speculative database error (e.g., duplicate unique constraint triggers) halts execution and triggers a database `ROLLBACK`, leaving the physical table state completely unmutated.

### B. Cryptographic Lineage Chain Validation
Lineage is proved by verifying that each sequentially generated receipt is linked cryptographically to its predecessor:
$$\text{receipt}_{k}.\text{previousReceiptHash} = \text{receipt}_{k-1}.\text{receiptHash}$$
Using `verifyChain(r1, r2)`:
1. `verifyReceipt` validates the individual cryptographic envelope of both receipts.
2. Checks that `r2.previousReceiptHash` exactly matches `r1.receiptHash`.
Any reordering or modification of intermediate receipts breaks this equality, resulting in immediate verification failure (tamper-proofing).

### C. Replay Convergence Check
The fundamental replay law states:
$$\text{Initial State} + \text{GraphDelta} + \text{Hook Laws} = \text{Consequence Output Hash}$$
For every transaction, `engine.replay(delta, receipt)` performs an offline re-evaluation of the GraphDelta:
1. Re-applies the delta to a transient mock state.
2. Re-runs the hook matches.
3. Asserts that the new output state hash matches `receipt.outputHash` exactly.
Any divergence (mutation of inputs, alteration of hook code, or change in environmental parameters) yields a divergence failure.

---

## 4. Verification Checksum

- **Verification Status**: `PASS`
- **Execution Run Hash**: `46a480d52b95ef0841267839db08be59fa20bce78de50c56fa689da6e193e2a5`
- **Ecosystem Report Status**: Synchronized with `gall_truex.db` WAL ledger.
