# Operational Law: Receipt Primitive ($S_0$)

## Root Axioms

- `Receipts are not logs. Receipts are operational authority.`
- Every receipt must prove input lineage, output lineage, and causal ordering.
- Tamper detection is a first-class requirement: any change in receipt fields or lineage pointers must invalidate validation.
- Recursive verification: Chaining is only valid if both parent and child receipts are individually validated.

## Ontology Boundaries

- **State (Field8)**: A signed `Receipt` data structure.
- **Event**: Signature generation or chain verification request.
- **Consequence**: Secure lineage proof establishing causal transitions ($R \vdash A = \mu(O^*)$).
