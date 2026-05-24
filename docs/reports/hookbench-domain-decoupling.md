# Decoupled Hookbench Domain Report

This report documents the decoupling of the Hookbench execution and replay domains. By separating execution mechanics (attempting hook invocations, generating receipts, policy refusal, and runtime error paths) from replay/validation mechanics (cryptographic verification, state convergence, context/seed mismatches, and tampered input paths), we establish clean ontological boundaries and verify perfect mathematical conservation across all execution tiers.

---

## 1. Hook Execution Domain
**Unit of Analysis:** `hook_execution`

The Hook Execution Domain manages the raw attempt, receipt generation, or refusal of hook executions. 

An execution is attempted only when a hook evaluation results in a match. In Eval-Only mode (`evalOnly: true`), receipts are bypassed, and executions proceed receipt-free. In Receipt-Backed mode, every successful execution yields a cryptographic receipt.

### Execution Accounting Table

| Tier | Mode | Attempted Executions | Receipts Generated | Executions Refused | Executions Errored | Receipt-Free Bypasses | Status |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **T0** | Receipt-Backed | 1 | 1 | 0 | 0 | 0 | **PASSED** |
| **T1** | Receipt-Backed | 48 | 48 | 0 | 0 | 0 | **PASSED** |
| **T2** | Receipt-Backed | 495 | 495 | 0 | 0 | 0 | **PASSED** |
| **T3** | Eval-Only | 495 | 0 | 0 | 0 | 495 | **PASSED** |
| **Total** | | **1,039** | **544** | **0** | **0** | **495** | **PASSED** |

### Execution Invariant Verification

We verify the conservation of execution outcomes using the following relations:

*   **Receipt-Backed Mode (T0, T1, T2):**
    $$\text{Attempted Executions} = \text{Receipts Generated} + \text{Executions Refused} + \text{Executions Errored}$$
    *   **T0**: $1 = 1 + 0 + 0 \quad$ (**PASSED**)
    *   **T1**: $48 = 48 + 0 + 0 \quad$ (**PASSED**)
    *   **T2**: $495 = 495 + 0 + 0 \quad$ (**PASSED**)

*   **Eval-Only Mode (T3):**
    $$\text{Attempted Executions} = \text{Receipt-Free Bypasses} + \text{Executions Refused} + \text{Executions Errored}$$
    *   **T3**: $495 = 495 + 0 + 0 \quad$ (**PASSED**)

*   **Aggregate Conservation:**
    $$\text{Total Attempted} = \text{Receipts} + \text{Refused} + \text{Errored} + \text{Bypasses}$$
    $$\text{Total}: 1,039 = 544 + 0 + 0 + 495 \quad$ (**PASSED**)

> [!NOTE]
> All matching hook evaluations successfully completed without runtime exceptions or errors, resulting in a 100% execution processing rate and 0 errors across all tiers.

---

## 2. Hook Replay Domain
**Unit of Analysis:** `hook_replay`

The Hook Replay Domain manages the verification of prior executions. It consumes cryptographic receipts and attempts deterministic replay. 

Replays succeed (converge) only if the state transitions match the receipted consequence. Mismatches represent either context/seed drift (non-determinism in stateful context) or active tampering.

### Replay Accounting Table

| Tier | Mode | Replay Attempted | Replay Converged | Replay Context Mismatch | Replay Tampered | Replay Not Attempted | Status |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| **T0** | Receipt-Backed | 1 | 1 | 0 | 0 | 0 | **PASSED** |
| **T1** | Receipt-Backed | 48 | 48 | 0 | 0 | 0 | **PASSED** |
| **T2** | Receipt-Backed | 495 | 495 | 0 | 0 | 0 | **PASSED** |
| **T3** | Eval-Only | 0 | 0 | 0 | 0 | 495 | **PASSED** |
| **Total** | | **544** | **544** | **0** | **0** | **495** | **PASSED** |

### Replay Invariant Verification

We verify the conservation of replay outcomes using the following relations:

*   **Replay Transition Conservation:**
    $$\text{Replay Attempted} = \text{Replay Converged} + \text{Replay Context Mismatch} + \text{Replay Tampered}$$
    *   **T0**: $1 = 1 + 0 + 0 \quad$ (**PASSED**)
    *   **T1**: $48 = 48 + 0 + 0 \quad$ (**PASSED**)
    *   **T2**: $495 = 495 + 0 + 0 \quad$ (**PASSED**)
    *   **T3**: $0 = 0 + 0 + 0 \quad$ (**PASSED**)
    *   **Total**: $544 = 544 + 0 + 0 \quad$ (**PASSED**)

*   **Replay Coverage Conservation:**
    $$\text{Attempted Executions} = \text{Replay Attempted} + \text{Replay Not Attempted}$$
    *   **T0**: $1 = 1 + 0 \quad$ (**PASSED**)
    *   **T1**: $48 = 48 + 0 \quad$ (**PASSED**)
    *   **T2**: $495 = 495 + 0 \quad$ (**PASSED**)
    *   **T3**: $495 = 0 + 495 \quad$ (**PASSED**)
    *   **Total**: $1,039 = 544 + 495 \quad$ (**PASSED**)

> [!TIP]
> **Technical Analysis of Causal Entropy Normalization (Perfect Replay Convergence)**
> In the Receipt-Backed benchmark loop (T1 and T2), every single matched execution now converges on replay (0.000% divergence / mismatch rate). This is achieved through Causal Entropy Normalization:
> 1. Rather than relying on a global, stateful context PRNG sequence that progresses with every execution, the hook execution layer derives a step-specific deterministic context `stepCtx` dynamically.
> 2. The seed for `stepCtx` is derived as a deterministic 32-bit unsigned integer from the parent context seed, the delta ID, and the previous receipt hash: `hash({ seed: ctx.seed, deltaId: delta.id, previousReceiptHash })`.
> 3. Consequently, both sequential execution and retrospective replay instantiate the exact same step-specific context and generate identical UUIDs and hashes, regardless of execution order, scheduler timing, or PRNG history. This solves the sequence coupling and guarantees 100.000% replay convergence, while still ensuring that a divergent parent context seed will trigger a replay failure.

---

## 3. Stress Failure Taxonomy Mapping

The 80/20 Stress suite verifies various fault-injection scenarios. Under this decoupled framework, we classify each test case into its respective domain boundary:

### Hook Execution Domain (Stress Cases)
These cases test constraints, inputs, cycles, and persistence during the live execution phase:

| Case ID | Case Name | Category | Status | Observed Behavior |
|:---|:---|:---|:---:|:---|
| **stress-01** | malformed input | malformed input | ✅ | Successfully rejected malformed delta: GraphDelta.adds must be an array |
| **stress-02** | capacity breach / Muri | capacity breach | ✅ | Successfully blocked capacity breach: Semantic Law Violation (Muri): Input delta size exceeds processing capacity. |
| **stress-03** | nonmatching predicate / Muda | nonmatching predicate | ✅ | Mismatched predicate correctly bypassed hook |
| **stress-04** | forbidden predicate / policy refusal | policy refusal | ✅ | Forbidden predicate correctly identified for refusal |
| **stress-10** | timing/memory nondeterminism in report hash | report deterministic stability | ✅ | Stable hash generated across identical runs |
| **stress-11** | eval-only misclassified as receipt-backed | classification safety | ✅ | Eval-only correctly classified with zero receipts |
| **stress-12** | benchmark metric miscalculation | telemetry accuracy | ✅ | Metric math is verified and correct |
| **stress-13** | WAL persistence mismatch | SQLite journal integrity | ✅ | WAL successfully writes and reads back identical deltas |
| **stress-14** | rollback failure | transaction isolation | ✅ | Transaction rollbacks successfully revert all delta mutations |
| **stress-15** | observatory stale report | observatory freshness | ✅ | Observatory reports successfully exist and are active |
| **stress-16** | Recursive Hook Storms | topology failure frontier | ✅ | Successfully triggered 1000 recursive sub-deltas |
| **stress-17** | Cyclical Hook Activation | topology failure frontier | ✅ | Cycle detected and halted via safety limit |
| **stress-18** | Cascading Rollback Divergence | topology failure frontier | ✅ | Clean rollback achieved after partial cascade failure |
| **stress-19** | Interrupted Receipt Persistence | topology failure frontier | ✅ | Atomic rollback confirmed after interrupted 5-step cascade |

### Hook Replay Domain (Stress Cases)
These cases test receipt verification, tampering detection, and replay correctness of historical transitions:

| Case ID | Case Name | Category | Status | Observed Behavior |
|:---|:---|:---|:---:|:---|
| **stress-05** | receipt tamper | receipt integrity | ✅ | Tampered receipt correctly rejected |
| **stress-06** | receipt chain reorder | receipt linkage | ✅ | Replay successfully blocked reordered chain |
| **stress-07** | replay input divergence | replay inputs | ✅ | Replay successfully failed on input mutation |
| **stress-08** | replay law divergence | replay rules | ✅ | Replay successfully failed on law mutation |
| **stress-09** | seed/context divergence | deterministic entropy | ✅ | Replay successfully failed on seed mismatch |

---

## 4. Raw JSON Decoupled Report

Below is the programmatically generated raw JSON payload for decoupled analysis:

```json
{
  "decoupledAt": "2026-05-24T02:34:45.792Z",
  "hookExecutionDomain": {
    "unit": "hook_execution",
    "tiers": [
      {
        "tier": "T0",
        "mode": "Receipt-Backed",
        "attemptedExecutions": 1,
        "receiptsGenerated": 1,
        "executionsRefused": 0,
        "executionsErrored": 0,
        "receiptFreeBypasses": 0,
        "invariantPassed": true
      },
      {
        "tier": "T1",
        "mode": "Receipt-Backed",
        "attemptedExecutions": 48,
        "receiptsGenerated": 48,
        "executionsRefused": 0,
        "executionsErrored": 0,
        "receiptFreeBypasses": 0,
        "invariantPassed": true
      },
      {
        "tier": "T2",
        "mode": "Receipt-Backed",
        "attemptedExecutions": 495,
        "receiptsGenerated": 495,
        "executionsRefused": 0,
        "executionsErrored": 0,
        "receiptFreeBypasses": 0,
        "invariantPassed": true
      },
      {
        "tier": "T3",
        "mode": "Eval-Only",
        "attemptedExecutions": 495,
        "receiptsGenerated": 0,
        "executionsRefused": 0,
        "executionsErrored": 0,
        "receiptFreeBypasses": 495,
        "invariantPassed": true
      }
    ],
    "aggregated": {
      "attemptedExecutions": 1039,
      "receiptsGenerated": 544,
      "executionsRefused": 0,
      "executionsErrored": 0,
      "receiptFreeBypasses": 495,
      "invariantPassed": true
    }
  },
  "hookReplayDomain": {
    "unit": "hook_replay",
    "tiers": [
      {
        "tier": "T0",
        "mode": "Receipt-Backed",
        "replayAttempted": 1,
        "replayConverged": 1,
        "replayContextMismatch": 0,
        "replayTampered": 0,
        "replayNotAttempted": 0,
        "invariantPassed": true
      },
      {
        "tier": "T1",
        "mode": "Receipt-Backed",
        "replayAttempted": 48,
        "replayConverged": 48,
        "replayContextMismatch": 0,
        "replayTampered": 0,
        "replayNotAttempted": 0,
        "invariantPassed": true
      },
      {
        "tier": "T2",
        "mode": "Receipt-Backed",
        "replayAttempted": 495,
        "replayConverged": 495,
        "replayContextMismatch": 0,
        "replayTampered": 0,
        "replayNotAttempted": 0,
        "invariantPassed": true
      },
      {
        "tier": "T3",
        "mode": "Eval-Only",
        "replayAttempted": 0,
        "replayConverged": 0,
        "replayContextMismatch": 0,
        "replayTampered": 0,
        "replayNotAttempted": 495,
        "invariantPassed": true
      }
    ],
    "aggregated": {
      "replayAttempted": 544,
      "replayConverged": 544,
      "replayContextMismatch": 0,
      "replayTampered": 0,
      "replayNotAttempted": 495,
      "invariantPassed": true
    }
  }
}
```
