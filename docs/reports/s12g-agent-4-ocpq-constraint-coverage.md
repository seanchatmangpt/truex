# Agent 4 — OCPQ Constraint Coverage

## Final classification:
OCPQ-Style Constraint Coverage:
- Supported Predicates: `attribute`, `relationship`, `temporal`. Supported attribute ops: `exists`, `eq`, `neq`. Supported temporal ops: `before`, `after`, `sameTime`.
- Unsupported Predicate Refusal: `and`, `or`, `not`, `implies`. Unsupported attribute ops: `lt`, `lte`, `gt`, `gte`, `contains`, `startsWith`, `endsWith`. Unsupported temporal ops: `within`. Explicitly refused and throws errors on encounter.
- Constraint Library: 8 standard project constraints defined (`c-proof-command-missing`, `c-checkpoint-accounting`, `c-handoff-timing`, `c-mailbox-receipt-missing`, `c-stale-report`, `c-queue-starvation`, `c-completion-accounting`, `c-proof-after-failure`).
- Pass Fixtures: Implemented for all constraints verifying compliance paths.
- Violation Fixtures: Implemented for all constraints verifying adversarial evidence and misbehavior paths.
- Malformed Fixtures: Implemented validation layer verifying structured refusal of malformed queries and predicates.
- Accounting: `attempted = passed + violated + refused + failed` holds universally. Verified via the `evaluateProjectConstraintsAll` constraint report payload.
- Patches Applied: Gap tests for coverage have been executed to assert strict conservation and structural rejection.
- Remaining Risks: Support for logical operators (`and`, `or`, `not`) would improve constraint expressiveness if added. Currently, they are refused to guarantee explicit deterministic bounding.
