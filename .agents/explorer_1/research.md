# Research Findings: Hook OTP and Autonomic Loop Telemetry

## 1. Hook OTP Data Structures and Message Dispatch

Located in `packages/membrane/src/hook-otp.gall.ts`, the core data structures and dispatch functions are implemented as follows:

### Data Structures
* **`HookMessage`**: Represents an individual message targeted at a hook process.
  ```typescript
  export interface HookMessage {
    id: string;
    targetProcessId: HookProcessId;
    delta: GraphDelta;
    senderId?: string;
    payload?: any;
    expiration?: number;
  }
  ```
* **`HookMailbox`**: Manages the message queue with standard FIFO operations. Currently backed by an in-memory array queue.
  ```typescript
  export interface HookMailbox {
    queue: HookMessage[];
    push(msg: HookMessage): void;
    pop(): HookMessage | undefined;
    isEmpty(): boolean;
    size(): number;
  }
  ```
* **`HookProcess`**: Represents a run-time actor with behavior logic, dynamic state, supervision attributes, and mailbox.
  ```typescript
  export interface HookProcess {
    id: string;
    behavior: (state: any, msg: any) => { nextState: any; effects: any[] };
    state: any;
    mailbox: HookMailbox;
    restartCount: number;
    isHalted: boolean;
    supervisorId?: string;
    lastReceiptHash: string | null;
    maxQueueDepth?: number;
  }
  ```

### Message Dispatching
The `dispatchMessage` function (lines 130–353) coordinates the synchronous execution lifecycle:
1. Validates queue size limit constraints.
2. Derives a deterministic context step seed from the message payload, previous receipt hash, and a parent seed.
3. Validates delta formats and caps the total changes count to 100.
4. Pushes the message to the process mailbox and pops it immediately to execute behavior synchronously.
5. Captures errors:
   - On success: issues a confirmed receipt, updates the process state, and links the receipt chain via `lastReceiptHash`.
   - On crash: issues a refused receipt, triggers supervision policies (incrementing restart counts or halting execution), and records details in the quarantine logs.

---

## 2. Design for SQLite-Backed Journaling

To implement SQLite durability for `HookMailbox` and `HookProcess` (mirroring patterns in `persistent-mailbox.gall.ts` and `persistence/schema.ts`), the following schema and transaction flow are proposed:

### SQL Schema Definitions
```sql
-- Hook OTP process instance journal
CREATE TABLE IF NOT EXISTS truex_hook_processes (
  id TEXT PRIMARY KEY,
  state_json TEXT NOT NULL,                -- JSON representation of current process state
  restart_count INTEGER NOT NULL DEFAULT 0, -- supervisor restart count
  is_halted INTEGER NOT NULL DEFAULT 0,    -- 0=active, 1=halted (budget exhausted)
  supervisor_id TEXT,                      -- optional supervisor group association
  last_receipt_hash TEXT,                  -- points to receipts(receipt_hash) for S10 lineage/tamper checks
  max_queue_depth INTEGER,                 -- limit on the number of available/active messages
  updated_at INTEGER NOT NULL              -- timestamp (epoch ms) of last execution/mutation
);

-- Mailbox queue entries
CREATE TABLE IF NOT EXISTS truex_hook_messages (
  id TEXT PRIMARY KEY,
  target_process_id TEXT NOT NULL REFERENCES truex_hook_processes(id) ON DELETE CASCADE,
  delta_json TEXT NOT NULL,                -- JSON representation of GraphDelta
  sender_id TEXT,                          -- optional sender process/agent UUID
  payload_json TEXT,                       -- optional arbitrary message payload (JSON format)
  expiration INTEGER,                      -- optional timestamp indicating message TTL
  state TEXT NOT NULL DEFAULT 'available', -- 'available', 'processed', 'quarantined', 'expired'
  created_at INTEGER NOT NULL,             -- FIFO sequencing ordering
  receipt_hash TEXT,                       -- associated confirmation/refusal receipt_hash after processing
  error_info TEXT                          -- store stack trace / error message if processing crashed
);

-- Supervisor policies
CREATE TABLE IF NOT EXISTS truex_hook_supervisors (
  id TEXT PRIMARY KEY,
  max_restarts INTEGER NOT NULL,
  within_ms INTEGER NOT NULL
);

-- Supervisor restart history (for restart rate policy enforcement within_ms window)
CREATE TABLE IF NOT EXISTS truex_hook_supervisor_restarts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  supervisor_id TEXT NOT NULL REFERENCES truex_hook_supervisors(id),
  process_id TEXT NOT NULL REFERENCES truex_hook_processes(id),
  restarted_at INTEGER NOT NULL
);

-- Quarantine records for poisoned messages
CREATE TABLE IF NOT EXISTS truex_hook_quarantine (
  id TEXT PRIMARY KEY,
  process_id TEXT NOT NULL REFERENCES truex_hook_processes(id),
  message_json TEXT NOT NULL,              -- Full JSON snapshot of the offending HookMessage
  error_message TEXT NOT NULL,
  quarantined_at INTEGER NOT NULL
);

-- Indexes to guarantee FIFO and quick lookup for lineage
CREATE INDEX IF NOT EXISTS idx_hook_messages_fifo 
ON truex_hook_messages(target_process_id, state, created_at);

CREATE INDEX IF NOT EXISTS idx_hook_processes_sup
ON truex_hook_processes(supervisor_id);
```

### Operational Transaction Lifecycle (dispatchMessage)
1. **Transaction Start**: Begin an exclusive write transaction.
2. **Retrieve Hook State**: Query process parameters (`is_halted`, `state_json`, `max_queue_depth`) and lock the row.
3. **Queue Depth Bounds**: If the number of pending/executing messages in `truex_hook_messages` is `>= max_queue_depth`, roll back and issue a refused receipt.
4. **Acquire Oldest Message**: Query the oldest `available` message ordered by `created_at` ASC.
5. **Execute Behavior**: Deserialize state/payload, evaluate hook function behavior.
6. **Commit on Success**:
   - Write updated `state_json`, `last_receipt_hash`, and `updated_at` to `truex_hook_processes`.
   - Update message `state = 'processed'` and save `receipt_hash` to `truex_hook_messages`.
   - Write confirmation receipt into `receipts` table.
   - Commit the transaction.
7. **Rollback & Supervise on Failure**:
   - Roll back modifications to the state.
   - Record restart attempts in `truex_hook_supervisor_restarts`.
   - Count supervisor violations in the configured `within_ms` window.
   - If budget is exceeded: mark the process `is_halted = 1`, and update message `state = 'quarantined'` with error details.
   - If budget is not exceeded: increment `restart_count` in `truex_hook_processes`, roll back state to initial configuration, and update message `state = 'quarantined'` (preventing poison message infinite retry loops).
   - Write a refused receipt to `receipts` table.
   - Commit the supervision update.

---

## 3. Autonomic Loop Telemetry

The autonomic system's telemetry and metrics are split between Node.js/TypeScript packages (`packages/observability`) and the Rust core kernel (`crates/truex-kernel`).

### Reinforcement Learning Convergence Metrics
* **Temporal Difference Error (`td_error`)**: 
  - In TS telemetry (`instrumentation.ts` lines 184–214), `RlPolicyUpdateEvent` exposes `tdError` along with policy details (`qBefore`, `qAfter`, `reward`, and `convergence.delta = |qAfter - qBefore|`).
  - In the Rust kernel (`crates/truex-kernel/src/rl_orchestrator.rs` line 1320), the convergence metric is calculated during updates as `td_error_linucb`.
* **OpenTelemetry Gap (`rl.run_cycle` span)**:
  - The `rl.run_cycle` span is created in Rust (`rl_orchestrator.rs` line 1153) at the *commencement* of the loop cycle.
  - **Observation**: The span does *not* contain the `td_error` attribute. The `td_error` is only computed *after* action execution and learning updates occur, and is currently only logged to a separate event `rl.convergence_diagnostics`.
  - **Gap (OBS-GAP-1)**: To resolve this, `td_error` must be aggregated into the main OpenTelemetry trace attributes of `rl.run_cycle` by updating attributes dynamically on the span scope before exiting the cycle.

### SPC Western Electric Rules
* Located in `packages/observability/src/agent-coordination-log.ts` (lines 28–37), the `SpcCorrelation` log tracks rules fired:
  - `rule_1_outlier`
  - `rule_2_shift`
  - `rule_3_trend`
  - `rule_4_two_of_three`
* SPC violations are exported as Object-Centric Event Logs (OCEL) under the `spc_rule_violation` event type mapped to the `spc_alert` object type (lines 216–246).

### Circuit Breakers and Transitions
* Located in `packages/engine/src/protection-layer.ts`, the `ProtectionManager` manages per-algorithm circuit breakers with states `'Closed' | 'HalfOpen' | 'Open'`.
* **Execution Decisions**:
  - `makeProtectionDecision` calculates the `degradationLevel` (enum bounds: `NONE`, `QUALITY`, `PERFORMANCE`, `AVAILABILITY`) based on the count of open circuit breakers and active SPC alerts.
  - **Causal Linkage**: Circuit breaker events are correlated in the coordination log with recovery events (`recovery_completed` and `spc_rule_violation`) using `alert_resolved_by_cycle` and `recovery_latency_cycles` tracking metrics, establishing a direct causal validation chain.

---

## 4. Test Verification Mapping

### Observability Telemetry Test Suites
* `packages/observability/src/__tests__/spans-and-instrumentation.test.ts`: Verifies required OTEL span structures, format validations, and the `Instrumentation` class API contracts.
* `packages/observability/src/__tests__/agent-coordination-log.test.ts`: Verifies deterministic tracking and OCEL logging of SPC correlations, agent actions, and recovery latency.
* `packages/observability/src/__tests__/feedback-loop.test.ts`: Tests `captureFeedback` quality metric recording and serialization.
* `packages/observability/src/__tests__/feedback-diagnosis-integration.test.ts`: Verifies automated diagnosis categorization (e.g. `healthy` models).

### Hook OTP Test Suites
* `packages/membrane/test/hook-otp/hook-otp-runtime.test.ts`: Verifies runtime dispatch, FIFO message queuing, state isolation, and metrics.
* `packages/membrane/test/hook-otp/hook-otp-supervisor.test.ts` & `hook-otp-supervisor-breakpoint.test.ts`: Tests Supervisor restart limits and graceful containment.
* `packages/membrane/test/hook-otp/hook-otp-receipt-replay.test.ts`: Tests receipt generation, chain validation, and replay convergence.
* `packages/membrane/test/persistent-mailbox/*`: A comprehensive suite verifying persistent transactional queues, backoff calculations, and concurrency locks.

---

## 5. Project Health Run Status

### Build Run
Running `npx pnpm@9 -r run build` fails with an exit code of 2 due to the following compilation error:
```
packages/engine build: src/engine.ts(23,50): error TS2307: Cannot find module '@truex/storehouse' or its corresponding type declarations.
packages/engine build: Failed
```
This indicates a compilation issue in the `@truex/engine` workspace project where it fails to locate or resolve the typings/exports from `@truex/storehouse`.

### Test Run
Running `npx pnpm@9 test` completes successfully:
* **Result**: **All 228 test files passed successfully** (1353 tests).
* The test execution covers all unit/integration tests including autonomic loops, sandbox environments, and persistent mailboxes, ensuring the operational codebase is highly stable.
