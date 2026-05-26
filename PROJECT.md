# Project: TRUEX Hook OTP & Autonomic Loop Telemetry

## Architecture
- **Hook OTP SQLite Persistence**: Integrates SQLite persistence into the Hook OTP runtime. Hook processes and mailbox messages are journaled to SQLite tables (`hook_processes` and `hook_mailbox`), ensuring crash-only/restart recovery.
- **Autonomic Loop Telemetry**: Closes gaps in reinforcement learning/circuit breaker metrics. Gaps are:
  - **OBS-GAP-1**: Aggregate `td_error` in `rl.run_cycle` OpenTelemetry span attributes.
  - **OBS-GAP-2**: Preserve SPC Western Electric rules in quantized telemetry.
  - **OBS-GAP-3**: Causally link circuit breaker events to health transitions.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Research & Plan | Assess requirements and design SQLite schema / telemetry enhancements | None | IN_PROGRESS |
| 2 | Hook OTP SQLite Membrane | Implement SQLite-backed journaling for HookMailbox and HookProcess | M1 | PLANNED |
| 3 | Autonomic Loop Telemetry | Implement OBS-GAP-1, OBS-GAP-2, OBS-GAP-3 in instrumentation package | M1 | PLANNED |
| 4 | Specialized Verification | Run 5 specialized verification subagents concurrently and consolidate reports | M2, M3 | PLANNED |

## Interface Contracts
### Hook OTP SQLite Persistence
- Schema:
  - `hook_processes`: `id TEXT PRIMARY KEY`, `state TEXT`, `restart_count INTEGER`, `is_halted INTEGER`, `last_receipt_hash TEXT`
  - `hook_mailbox`: `id TEXT PRIMARY KEY`, `target_process_id TEXT`, `delta_json TEXT`, `sender_id TEXT`, `payload_json TEXT`, `expiration INTEGER`, `queued_at INTEGER`
- Functions/Methods:
  - `initializeOtpSchema(db: Database)` to create tables.
  - `saveProcessState(db: Database, proc: HookProcess)` to save state.
  - `saveMailboxMessage(db: Database, msg: HookMessage)` to save a queued message.
  - `removeMailboxMessage(db: Database, msgId: string)` to delete a popped message.
  - `recoverProcess(db: Database, processId: string, behavior: Function) -> HookProcess` to reload state and mailbox.
  - Integration with `dispatchMessage` and/or `HookOtpRuntime` to automatically persist updates.

### Autonomic Telemetry
- `Instrumentation.createRlRunCycleEvent(...)` or equivalent span helper carrying `rl.update.td_error` (OBS-GAP-1).
- Telemetry export preserving Western Electric rule labels/flags (OBS-GAP-2).
- Circuit breaker spans carrying causal parent trace/span IDs linking them to health transitions (OBS-GAP-3).

## Code Layout
- `packages/membrane/src/hook-otp.gall.ts` — Hook OTP runtime core
- `packages/observability/src/instrumentation.ts` — OpenTelemetry instrumentation
- `packages/observability/src/types.ts` — Telemetry event type definitions
