# Module: Audit Logger (Receipting)

> **Path:** `src/observability/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Audit Logger is not an external APM or side-channel reporting tool. It is the **durable receipting mechanism** for the Truex consequence membrane. It captures the operational intent, admission/refusal decisions, and terminal outcomes at the exact point of interception. In Truex, telemetry is not a projection of the system; it is the cryptographic proof of authority.

## 2. Accounting Domains

* **Memory Trace Budget:** The number of retained receipts in local execution memory (`maxLogEntries`), forcing buffer spillover to disk/SQLite when exceeded.
* **Stack Trace Budget:** A strict allocation for full stack traces (`maxStoredTraces`) to prevent unbounded heap memory consumption.

## 3. Key Invariants

* **AUDIT-1 (Pre-Decision Intent):** Every operational intent (`get`, `set`, `apply`, etc.) is logged immediately *before* downstream ACL or Invariant interceptors evaluate it.
* **AUDIT-2 (Deterministic Ordering):** The receipt ledger preserves exact, deterministic chronological ordering of attempts and refusals.
* **AUDIT-3 (No Silent Overflow):** When the `maxLogEntries` boundary is hit, the system deterministically executes an `overflowBehavior` (e.g., `truncate`, `compress`, `sqlite`, `disk`, or `refuse`).
* **AUDIT-4 (Trace Containment):** If `maxStoredTraces` is exceeded, subsequent stack traces are mandatorily degraded based on `stackTraceBehavior` (e.g., `redact`, `hash`, or `truncate`) to protect the execution substrate.

## 4. Verbs / Commands

* `createAuditContext(target, options)`: Establishes the bounded receipting environment, explicitly setting the log format, memory limits, and spillover mechanisms.
* `registerAuditInterceptors(proxyInterface, auditCtx)`: Binds the receipting engine to the membrane. This must be the *first* set of interceptors registered to capture pure intent.
* `call(fn)`: Executes logic where every membrane interaction generates an immutable receipt.
* `exportLog(format)`: Projects the current local receipt pool into `json`, `csv`, or `text`.
* `getFlushedLogsSqlite()` / `getFlushedLogsDisk()`: Recovers durable receipts that exceeded the local memory budget.

## 5. Refusal Conditions

The Audit Logger participates in boundary refusal by:
* Refusing an operation entirely if `overflowBehavior` is set to `refuse` and the log boundary limit (`maxLogEntries`) is reached, dropping the attempt before it proceeds to the substrate.
* Stripping unauthorized/exhaustive runtime stack frames (`[REDACTED]` or `[HASH]`) when the deterministic trace budget runs dry.

## 6. Proof Command

To prove the determinism, bounds control, and receipt accuracy of the logging engine:

```bash
npx vitest run test/observability/
```