# Explanation: Receipts Before Reality

Most systems mutate a database and *then* write an audit log. If the audit log fails, the mutation still occurred. Truex inverts this paradigm, enforcing **Receipts Before Reality**.

## The Ingestion Flow

When an agent or system proposes a `GraphDelta`:

1.  **WAL Journaling:** It is immediately journaled to a Write-Ahead Log (WAL).
2.  **Hook Evaluation:** It is evaluated by the Hook Engine under strict deterministic entropy.
3.  **Cryptographic Linkage:** The engine generates an `inputHash` and `outputHash`, cryptographically linking them into an ML-DSA signed `Receipt`.
4.  **Commitment:** **Only if** the Receipt evaluates as `confirmed` does the system allow the proxy membrane to commit the changes to the persistent state.

## Why This Matters

This ensures that the system is entirely self-verifying. If an operation cannot generate a mathematically converged receipt, it never physically happens. The receipt is not a record of an event; the receipt *is* the operational authority that grants the event existence. You cannot decouple the action from its proof.