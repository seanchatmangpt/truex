# Audit Limit Enforcer Report (S9-Audit-Limit-Enforcer)

## Executive Summary

Observability-driven memory growth is a common root cause for Out-Of-Memory (OOM) crashes in production environments. Stack trace generation and unbounded log growth within audit frameworks consume significant memory resources if not properly bounded.

This report summarizes the design, implementation, and verification of memory limits and stack trace budgets implemented in the `Proxyable` observability system (`audit-logger.js`). These modifications introduce:
1. **Hard Budgets on Stack Trace Captures**: Enabling `includeStackTrace` is restricted by a configurable budget (`maxStoredTraces`), with multiple fallback behaviors (truncation, redaction, hash-compression).
2. **Memory Bounds on Audit Logs**: The active in-memory audit log array is strictly bounded (`maxLogEntries`), supporting spillover and mitigation behaviors (refusal, truncation, cryptographic hash-compression, SQLite persistence, and disk writing).

All mechanisms have been verified using a newly created comprehensive test suite (`test/observability/audit-bounds.test.ts`), which runs successfully under Vitest.

---

## Design and Implementation Details

The modifications introduced in `/Users/sac/truex/src/observability/audit-logger.js` allow configuring limits via options:

### 1. Control Plan for Stack Traces
By default, stack trace capture remains **off**. When enabled (either explicitly via `includeStackTrace: true` or implicitly under `logLevel: 'debug'`), memory consumption is bounded by:
- **`maxStoredTraces` (Default: 100)**: A hard limit on the total number of full stack trace strings captured and stored in the active log.
- **`stackTraceBehavior` (Default: `'truncate'`)**: Defines what happens to entries captured after the trace limit is exceeded:
  - `truncate`: The `stackTrace` property is entirely omitted from subsequent entries, resulting in 0 additional memory footprint.
  - `redact`: Subsequent entries replace the stack trace with a static string placeholder (`"[REDACTED: limit reached]"`).
  - `hash`: Subsequent entries hash-compress the stack trace to a fixed-size SHA-256 string (`"[HASH:<sha256>]"`), providing cryptographic reference with negligible memory footprint.

To avoid wasting CPU and memory on entries that are filtered out or below the active log level, stack trace budget evaluation is run conditionally only when an entry passes active filters and log level validation.

### 2. Log Saturation and Memory Bounds
The in-memory audit log array is strictly bounded by a configurable size limit, after which overflow behaviors are activated:
- **`maxLogEntries` (Default: 5000)**: The maximum number of entries maintained in memory.
- **`overflowBehavior` (Default: `'truncate'`)**: Defines the strategy for managing older entries once the limit is reached:
  - `refuse`: New log entries are dropped/refused, keeping memory logs strictly at the limit.
  - `truncate`: FIFO truncation where the oldest entry is shifted out (`shift()`), keeping memory log size constant.
  - `compress`: Older entries are shifted out and hash-compressed into a cryptographic rolling hash chain and stored in a small bounded metadata queue.
  - `sqlite`: Older entries are shifted out and inserted into a persistent SQLite database (`gall_audit_logs` table), using `better-sqlite3`.
  - `disk`: Older entries are shifted out and appended to a flat log file on disk.

---

## Verification and Test Execution Results

We verified these limits and behaviors through the test suite `/Users/sac/truex/test/observability/audit-bounds.test.ts`.

### Test Suite Execution
Run Command: `npx vitest run test/observability/audit-bounds.test.ts`
All 8 test cases pass:
- **`should enforce a hard budget on stored traces (truncate)`**: Verified that `stackTrace` is correctly omitted after 5 trace allocations.
- **`should enforce a hard budget on stored traces (redact)`**: Verified that subsequent stack traces are replaced with the redaction notice.
- **`should enforce a hard budget on stored traces (hash-compressed)`**: Verified that subsequent stack traces are hashed to 64-character SHA-256 strings.
- **`should refuse new entries when overflowBehavior is refuse`**: Verified that logs are refused and memory size does not grow beyond the bound.
- **`should truncate older entries (FIFO) when overflowBehavior is truncate`**: Verified that older entries are shifted out in first-in-first-out order.
- **`should compress older entries (rolling hash) when overflowBehavior is compress`**: Verified rolling hash calculation and bounded compressed metadata.
- **`should spill over to SQLite when overflowBehavior is sqlite`**: Verified persistence and retrieval of displaced logs in SQLite.
- **`should spill over to disk when overflowBehavior is disk`**: Verified persistence and retrieval of displaced logs in a flat file.

---

## Recommendations for Hardened Production Observability

1. **Explicit Bounds in High-Churn Workloads**: Production environments must always specify `maxLogEntries` (e.g. 5,000) to protect against memory leak crashes from high-throughput interceptors.
2. **Use Hashed Trace Fallback under Debug**: In staging or debug environments, specify `stackTraceBehavior: 'hash'` to identify repeated caller patterns without incurring the memory overhead of capturing identical duplicate stack frames.
3. **SQLite Spilling for Local Persistence**: For edge or standalone nodes, configuring `overflowBehavior: 'sqlite'` provides reliable operational trails without bloating V8 heap memory.
