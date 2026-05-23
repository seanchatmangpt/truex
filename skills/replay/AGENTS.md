# Operational Law: Replay Primitive ($S_1$)

## Root Axioms

- `same input + same law = same consequence`
- Replay divergence is a first-class execution failure.
- Expected receipts must be cryptographically verified (`verifyReceipt`) prior to checking convergence to prevent forgery replay attacks.
- Persistence membranes must index transition metadata to support fast trace query and verification operations.

## Ontology Boundaries

- **State (Field8)**: An expected receipt and transition inputs.
- **Event**: Replay validation or engine transition check request.
- **Consequence**: Deterministic verification that execution maps 1:1 with signed receipt lineages.
