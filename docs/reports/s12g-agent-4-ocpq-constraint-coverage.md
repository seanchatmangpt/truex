# S12G Agent 4 OCPQ Constraint Coverage

## OCPQ-Style Constraint Coverage:
- Supported Predicates: `attribute`, `relationship`, `temporal` (`before`, `after`, `sameTime`), `exists`, `eq`, `neq`.
- Unsupported Predicate Refusal: Implemented explicitly. `UNSUPPORTED_PREDICATES` (`and`, `or`, `not`, `implies`) and unsupported operators trigger explicit `Error` to enforce refusal, rather than silent failure.
- Constraint Library: Evaluator expanded to 8 standard constraints: `c-proof-command-missing`, `c-checkpoint-accounting`, `c-handoff-timing`, `c-mailbox-receipt-missing`, `c-stale-report`, `c-queue-starvation`, `c-completion-accounting`, `c-proof-after-failure`.
- Pass Fixtures: Added in `ocpq-constraint-gap.test.ts` to ensure constraints don't produce false positives (e.g. `changed file with later proof passes`).
- Violation Fixtures: Added in `ocpq-constraint-gap.test.ts` checking for `c-checkpoint-accounting`, `c-handoff-timing`, `c-mailbox-receipt-missing`, `c-stale-report` (with missing artifacts), `c-completion-accounting`, and `c-proof-after-failure`.
- Malformed Fixtures: Added tests verifying `malformed nested query refuses` and `unsupported predicate kind refuses` mapping directly to the ledger's refused state.
- Accounting: Aggregated `OcpqConstraintReport` implemented, conserving all attempted constraints into exactly one terminal state: `attempted = passed + violated + refused + failed`.
- Patches Applied: Refactored `ocpq-project-constraints.gall.ts` to implement the three missing governance tests (`c-completion-accounting`, `c-proof-after-failure`, extended `c-stale-report`). Implemented rigorous evaluation loop accounting with `evaluateProjectConstraintsAll`. Created `ocpq-constraint-gap.test.ts`.
- Remaining Risks: Nested logical constraints (`and`/`or`/`not`) remain unsupported, meaning complex compositional constraints currently map to multiple discrete constraints or are refused. This should be addressed if composite predicates become essential.
