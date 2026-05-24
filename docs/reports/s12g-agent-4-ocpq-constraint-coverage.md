# S12G Agent 4 — OCPQ Constraint Coverage & Adversarial Fixture Report

This report summarizes the implementation, validation, and coverage details for the **Object-Centric Project Query (OCPQ) Constraint Evaluator** and **Adversarial Fixtures** (Gall S12).

---

## 1. Unsupported Predicates & Refusal Architecture

To enforce process integrity and prevent silent failures, the evaluator now explicitly registers and refuses unsupported OCPQ predicate kinds and operators. Any attempt to pass these structures results in a hard runtime exception rather than a silent failure.

### Refused Predicate Kinds
The following logical structures are defined in the types but are explicitly refused by the evaluator at runtime:
- **`and`**
- **`or`**
- **`not`**
- **`implies`**

### Refused Operators
- **Attribute Operators**: `lt`, `lte`, `gt`, `gte`, `contains`, `startsWith`, `endsWith`
- **Temporal Operators**: `within`

When encountered, these raise explicit errors, ensuring that constraints containing unimplemented syntax are caught immediately.

---

## 2. Expanded Project Governance Constraints

Two new governance rules were introduced to safeguard the project execution:

| Constraint ID | Name | Description | Severity | Target Object Type |
|---|---|---|---|---|
| `c-stale-report` | No stale report allowed | Flags report objects that have not been updated within 2 hours of the latest event in the log. | `warning` | `report` |
| `c-queue-starvation` | No queue starvation allowed | Detects mailbox messages stuck in `available` state for more than 10 minutes. | `error` | `mailbox_message` |

---

## 3. Adversarial Fixtures & Compliance Profiles

We constructed comprehensive compliancy profiles in the test suite to verify the detection of various project governance failures:

1. **Pass Fixture (Clean log)**: Ensures that a perfect log containing all correct relations, timely reports, and active queues generates zero violations.
2. **Changed File Without Proof**: Asserts a `source_file` object with no corresponding `proof_succeeded` event triggers `c-proof-command-missing`.
3. **Checkpoint Without Accounting Domain**: Asserts a checkpoint missing a `purpose` attribute triggers `c-checkpoint-accounting`.
4. **Handoff Before 12h Gate**: Asserts a handoff completing in less than 12 hours from initialization triggers `c-handoff-timing`.
5. **Terminal Message Missing Receipt**: Asserts confirmed/refused messages without an `emitted` or `parent_receipt` qualifier relation trigger `c-mailbox-receipt-missing`.
6. **Stale Report**: Asserts reports with an `updatedAt` value older than 2 hours trigger `c-stale-report`.
7. **Queue Starvation**: Asserts messages in the `available` state older than 10 minutes trigger `c-queue-starvation`.

---

## 4. Verification Coverage

The test cases are implemented under:
`packages/truex-core/test/project-evidence/ocpq-constraint-gap.test.ts`

These tests verify both the positive (compliance) and negative (violations & parser refusals) pathways.
- **Pass rate**: 100% (all 10 new test cases pass)
- **Integration validation**: Cleanly integrates with `doctor prove project-evidence-types` primitive checks.
