## 2026-05-26T05:00:36Z

Find and close the remaining gaps in the Hook OTP (Open Telecom Platform) runtime and Autonomic Loop telemetry within the TRUEX ecosystem, ensuring clean monorepo builds and tests.

Working directory: /Users/sac/truex
Integrity mode: development

## Requirements

### R1. Hook OTP SQLite Persistence Membrane
Implement SQLite-backed journaling for `HookMailbox` queues and `HookProcess` states under Gall Stack S3, enabling durable state recovery across process restarts. Provide unit and integration tests proving that after a process restart or crash, its mailbox and state are correctly recovered from the database.

### R2. Autonomic Loop Telemetry Gaps
Address the three identified telemetry gaps:
- **OBS-GAP-1**: Aggregate reinforcement learning convergence metrics (specifically `td_error`) into the main `rl.run_cycle` OpenTelemetry span.
- **OBS-GAP-2**: Preserve SPC Western Electric rule classifications during quantization to enable rule-to-action correlation.
- **OBS-GAP-3**: Establish cross-cycle causality linking for circuit breaker execution decisions and RL health changes.

### R3. Workspace Compilation and Validation
Ensure the entire workspace builds successfully using `npx pnpm@9 -r run build` and that all test suites pass under `npx pnpm@9 test`.

## Acceptance Criteria

### Hook OTP Persistence
- [ ] SQLite schema is updated to include tables for `hook_mailbox` and `hook_processes`.
- [ ] Active mailboxes and states are persisted to the database on dispatch.
- [ ] Tests verify that a process can be resumed from its persisted state and queue after a crash or restart.

### Autonomic Telemetry
- [ ] OpenTelemetry traces for `rl.run_cycle` contain `td_error` attributes.
- [ ] SPC Western Electric classifications are present in exported telemetry.
- [ ] Circuit breaker events are causally linked to corresponding health transitions.

### Verification
- [ ] `npx pnpm@9 -r run build` completes with exit code 0.
- [ ] `npx pnpm@9 test` passes 100% of tests.
- [ ] `npx tsx scripts/truex.ts doctor prove unified-integration` runs successfully with exit code 0.
