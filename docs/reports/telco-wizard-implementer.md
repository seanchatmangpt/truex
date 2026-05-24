# Telco and Wizard Agent CLI Implementation & Wiring Report

This report documents the wiring and verification of the Telco and Wizard agent subcommands inside the `truex` CLI (`scripts/truex.ts`) and the `DoctorAgent` (`agents/doctor/agent.ts`).

---

## 1. Overview of Changes

To enable operational interaction with the `TelcoAgent` and `WizardAgent`, we have:
1. **Implemented CLI commands** in `scripts/truex.ts` and wired them under the `truex telco` and `truex wizard` namespaces.
2. **Integrated Doctor prove cases** in `agents/doctor/agent.ts` under the primitives `"telco-ingest"`, `"telco-validate"`, `"wizard-simulate"`, and `"wizard-walkthrough"`.
3. **Wired Doctor subcommands** under the `truex doctor prove` CLI namespace in `scripts/truex.ts`.
4. **Resolved a validation gap** in `WizardAgent` by wrapping the speculative write inside `invCtx.call()` to trigger invariant interception, and conditionally handling transaction rollbacks.

---

## 2. CLI Command Wiring (`scripts/truex.ts`)

The commands are implemented using `citty` to parse inputs and handle defaults:

### Telco Commands (`truex telco <command>`)
- **`ingest`**: Calls `TelcoAgent.ingestTransition(...)` to ingest property mutations (e.g., account balance changes) and exports a signed OCEL receipt envelope.
- **`validate`**: Verifies an OCEL receipt envelope's signature and batch hash. If no envelope is provided, it runs a self-contained tamper-verification demonstration.

### Wizard Commands (`truex wizard <command>`)
- **`simulate`**: Conducts a counterfactual transaction on a mutable state (e.g. `score`), validating it against range invariants. If invalid, the write is rolled back and the initial state is restored.
- **`walkthrough`**: Performs a sequential trace of multiple speculative scores (some valid, some out-of-bounds), showing commits for valid values and rollbacks for invalid values.

### Doctor Prove Commands (`truex doctor prove <command>`)
We wired four new subcommands under `proveCommand`:
- `telco-ingest`
- `telco-validate`
- `wizard-simulate`
- `wizard-walkthrough`

---

## 3. Agent Integration & Invariant Enforcement

### Telco Ingestion and Validation
`TelcoAgent` leverages `OcelCollector` to track state changes and create cryptographically secure OCEL 2.0 receipt envelopes. Any mutation of the envelope's fields, `ocelBatchHash`, or `receiptHash` results in validation failure.

### Wizard Invariant Validation Fix
In `WizardAgent.simulateTransaction`, the range invariant validation interceptor requires an active invariant context. We updated the code to wrap the speculative write inside `invCtx.call()`:
```typescript
txCtx.call(() => {
  invCtx.call(() => {
    proxyInterface.proxy.score = val;
  });
});
```
This correctly triggers the invariant violation (via the Jidoka fatal error handler) when the score exceeds the $[0, 100]$ range.

### Conditional Rollback
When Jidoka intercepts an invariant violation, it automatically rollbacks all active transactions. To prevent double-rollback errors (`Error: No active transaction to rollback`), we updated the catch handler to rollback only if the transaction is still active:
```typescript
try {
  if (txCtx.isActive()) {
    txCtx.rollback();
  }
} catch {
  // Safe fallback if Jidoka already executed rollback
}
```

---

## 4. Verification Evidence

All doctor proof subcommands compile and pass:

### `doctor prove telco-ingest`
- **Output:**
  ```text
  🩺 Doctor running proof for primitive: "telco-ingest"...
  ✅ Primitive "telco-ingest" proven successfully.
     - Invariant verified: OCEL receipt envelope generated and verified successfully
     - Invariant verified: Envelope contains traceId, spanId, and ocelBatchHash properties
     - Invariant verified: State modification balance=120 accurately captured
  ```

### `doctor prove telco-validate`
- **Output:**
  ```text
  🩺 Doctor running proof for primitive: "telco-validate"...
  ✅ Primitive "telco-validate" proven successfully.
     - Invariant verified: Valid OCEL receipt envelope verifies successfully
     - Invariant verified: Tampered OCEL receipt envelope verification fails
     - Invariant verified: Tamper-resistance invariant verified
  ```

### `doctor prove wizard-simulate`
- **Output:**
  ```text
  🩺 Doctor running proof for primitive: "wizard-simulate"...
  ✅ Primitive "wizard-simulate" proven successfully.
     - Invariant verified: Out-of-bounds write detected and rejected
     - Invariant verified: Transaction rollback successfully executed
     - Invariant verified: Initial state restored upon rollback
  ```

### `doctor prove wizard-walkthrough`
- **Output:**
  ```text
  🩺 Doctor running proof for primitive: "wizard-walkthrough"...
  ✅ Primitive "wizard-walkthrough" proven successfully.
     - Invariant verified: Sequential simulation states match bounds constraint
     - Invariant verified: In-bounds writes commit successfully
     - Invariant verified: Out-of-bounds writes roll back successfully
     - Invariant verified: State trajectory maintains logical continuity
  ```
