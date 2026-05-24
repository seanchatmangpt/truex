# Architectural Clarification: Projection vs. Execution Classification

This report provides the architectural clarification of the operational boundaries within the TRUEX runtime environment. It formally reclassifies the 493 matches in the **T3 Eval-only** benchmark tier from "executions" to "projection matches" and defines the exact boundaries separating Evaluation, Projection Match, Execution, Commit, Receipt, and Replay.

---

## 1. Executive Summary

In previous reports, hook matches across all Hookbench tiers (T0–T3) were loosely described under the single category of "executions." However, a rigorous audit of the benchmark runner and engine semantics demonstrates that **Tier T3 (Eval-only)** executes with `evalOnly: true`. 

When `evalOnly` is active, the engine only evaluates whether a hook's condition/predicate matches the incoming GraphDelta. If a match is found, the engine registers this activation potential but **bypasses the execution block**, generating zero side effects, zero database commits, zero cryptographic receipts, and triggering zero replay procedures.

To preserve the TRUEX axiom of *determinism and operational trust*, these 493 matches in T3 must not be counted as "executions." They are **Projection Matches**—purely predictive, read-only observations of potential state transitions.

---

## 2. The Six Operational Boundaries

To establish a strict taxonomy of state transitions, we define the six sequential phases of the TRUEX lifecycle:

### I. Evaluation
*   **Definition**: The read-only phase where the engine evaluates a registered hook's condition/predicate against an incoming `GraphDelta`.
*   **Operational Context**: Runs entirely in-memory using pure functions. No context mutation occurs.
*   **Applicability**: Performed in both Eval-Only and Receipt-Backed modes.

### II. Projection Match
*   **Definition**: The precise event where a hook's predicate evaluates to `true` for a given `GraphDelta`, indicating a valid activation condition.
*   **Operational Context**: In Eval-Only mode (`evalOnly: true`), this is the terminal phase of the lifecycle. The match is recorded for telemetry, but the action/effect is never executed.
*   **Applicability**: Occurs in both modes, but is the *final* state in Eval-Only.

### III. Execution
*   **Definition**: The invocation of the hook's effect-generating logic or action in response to a projection match.
*   **Operational Context**: Runs the hook's effects generator, producing a set of concrete state mutations (`HookEffect[]`).
*   **Applicability**: Excluded from Eval-Only mode; executes only in Receipt-Backed mode (`evalOnly: false`).

### IV. Commit
*   **Definition**: The atomic writing of the generated `HookEffect` mutations to the persistent membrane (e.g., the SQLite write-ahead log).
*   **Operational Context**: If the transaction succeeds, the new state is committed. If it fails, the persistence layer performs a rollback.
*   **Applicability**: Excluded from Eval-Only mode; occurs only in Receipt-Backed mode.

### V. Receipt
*   **Definition**: The generation and persistence of a cryptographic proof (the `Receipt`) witnessing the state transition.
*   **Operational Context**: The receipt contains the input delta hash, the prior state hash, the law/rules applied, the resulting state hash, and a cryptographic signature confirming operational authority.
*   **Applicability**: Excluded from Eval-Only mode; generated only in Receipt-Backed mode upon successful commit.

### VI. Replay
*   **Definition**: The independent reconstruction of the state transition by applying the same inputs under the same laws in a clean, isolated context.
*   **Operational Context**: Verifies state convergence. If the re-executed state hash matches the receipt's output state hash, the transition converges. If they differ, it diverges, indicating tampering or non-determinism.
*   **Applicability**: Excluded from Eval-Only mode; executed in Receipt-Backed mode for operational verification.

---

## 3. Stage Properties & Boundaries Matrix

The table below outlines the functional differences and constraints across each of the six boundaries:

| Phase / Stage | Mutates State / Context? | Generates Side-Effects? | Persisted to Membrane? | Cryptographic Proof? | Active in `evalOnly: true`? | Active in `evalOnly: false`? |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Evaluation** | ❌ No | ❌ No | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **Projection Match** | ❌ No | ❌ No | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **Execution** | ✅ Yes (In-Memory) | ✅ Yes (Mutations) | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Commit** | ✅ Yes (Persistent) | ✅ Yes (Journaled) | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **Receipt** | ❌ No | ❌ No | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Replay** | ❌ No (Isolated) | ❌ No | ❌ No | ✅ Yes (Verified) | ❌ No | ✅ Yes |

---

## 4. Reclassified Hookbench Tiers Matrix (T0–T3)

By applying the refined boundaries, we reclassify the Hookbench results. Note that the 493 matches in T3 Eval-only now report **0 Executions**, **0 Commits**, **0 Receipts**, and **0 Replays**.

| Tier | Mode | Attempted Evaluations | Projection Matches | Executions | Database Commits | Cryptographic Receipts | Replay Converged | Replay Diverged |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **T0** | Receipt-Backed | 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| **T1** | Receipt-Backed | 10,000 | 52 | 52 | 52 | 52 | 1 | 51 |
| **T2** | Receipt-Backed | 1,000,000 | 493 | 493 | 493 | 493 | 1 | 492 |
| **T3** | Eval-Only | 1,000,000 | 493 | **0** | **0** | **0** | **0** | **0** |
| **Total**| — | **2,010,001** | **1,039** | **546** | **546** | **546** | **3** | **543** |

### Reclassification Mathematical Equations

We verify the integrity of the reclassification by splitting the validation equations by mode:

1.  **Receipt-Backed Mode Verification (`evalOnly: false` for T0, T1, T2)**:
    $$\text{Projection Matches} = \text{Executions} = \text{Database Commits} = \text{Cryptographic Receipts} = \text{Replay Attempted}$$
    *   **T0**: $1 = 1 = 1 = 1 = 1$ (Verified)
    *   **T1**: $52 = 52 = 52 = 52 = 52$ (Verified)
    *   **T2**: $493 = 493 = 493 = 493 = 493$ (Verified)

2.  **Eval-Only Mode Verification (`evalOnly: true` for T3)**:
    $$\text{Projection Matches} > 0, \quad \text{Executions} = \text{Database Commits} = \text{Cryptographic Receipts} = \text{Replay Attempted} = 0$$
    *   **T3**: $493 > 0, \quad 0 = 0 = 0 = 0 = 0$ (Verified)

---

## 5. Consolidated Hookbench Accounting JSON

Below is the structured JSON representation of the reclassified hookbench tiers, aligning with the new boundary definitions.

```json
{
  "unit": "hook_delta_evaluation_and_activation",
  "schema": "projection-vs-execution-classification-v1",
  "verification": {
    "evalOnlyRule": "evalOnly == true => executions == 0 && receipts == 0 && replayConverged == 0 && replayDiverged == 0",
    "receiptBackedRule": "evalOnly == false => executions == projectionMatches && receipts == projectionMatches && (replayConverged + replayDiverged == executions)",
    "status": "verified"
  },
  "summary": {
    "totalAttemptedEvaluations": 2010001,
    "totalProjectionMatches": 1039,
    "totalExecutions": 546,
    "totalCommits": 546,
    "totalReceipts": 546,
    "totalReplayConverged": 3,
    "totalReplayDiverged": 543
  },
  "tiers": [
    {
      "tier": "T0",
      "mode": "receipt-backed",
      "evalOnly": false,
      "attemptedEvaluations": 1,
      "projectionMatches": 1,
      "executions": 1,
      "commits": 1,
      "receipts": 1,
      "replayConverged": 1,
      "replayDiverged": 0
    },
    {
      "tier": "T1",
      "mode": "receipt-backed",
      "evalOnly": false,
      "attemptedEvaluations": 10000,
      "projectionMatches": 52,
      "executions": 52,
      "commits": 52,
      "receipts": 52,
      "replayConverged": 1,
      "replayDiverged": 51
    },
    {
      "tier": "T2",
      "mode": "receipt-backed",
      "evalOnly": false,
      "attemptedEvaluations": 1000000,
      "projectionMatches": 493,
      "executions": 493,
      "commits": 493,
      "receipts": 493,
      "replayConverged": 1,
      "replayDiverged": 492
    },
    {
      "tier": "T3",
      "mode": "eval-only",
      "evalOnly": true,
      "attemptedEvaluations": 1000000,
      "projectionMatches": 493,
      "executions": 0,
      "commits": 0,
      "receipts": 0,
      "replayConverged": 0,
      "replayDiverged": 0
    }
  ]
}
```
