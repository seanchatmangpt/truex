# Operational Law: TRUEX Adapter Primitive

## Root Axioms

-decouple external agent orchestration (AGY) from strict consequence authority (TRUEX).
- Every state mutation request by an external agent must enter the system as an `AgentProposal` ($\Delta O$).
- The Adapter must enforce ACL authorization and evaluate the mutation within a counterfactual membrane.
- Every admitted proposal yields a signed transaction receipt.
- Every refused proposal yields a signed `Refused` receipt with rollback of all speculative changes.
- Every execution must pass replay convergence check prior to transaction settlement.

## Ontology Boundaries

- **State (Field8)**: Active object memory and transition engine.
- **Event**: Incoming `AgentProposal` request.
- **Consequence**: Admitted and replayed state mutations, or Refused state transaction rollback.
