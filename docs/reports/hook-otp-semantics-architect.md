# Hook OTP Semantics Architect Report

## Summary of the local OTP-equivalence model

Rather than compiling to BEAM or introducing distributed actor networks, Truex implements local concurrency and process boundary primitives to manage Hook state isolation.

## OTP Primitives Mapped to Truex

1.  **Actor Identity & Process Isolation:** Hook processes run in independent memory boxes defined by a `HookProcessId`. No two processes share mutable state.
2.  **Mailbox Ordering:** Hook messages (input deltas) are queued in FIFO order in `HookMailbox`.
3.  **Supervisor Recovery:** Supervisors manage process execution loops, recovering crashed processes to their initial state within configured restart limits.
4.  **Poison message quarantine:** Messages that trigger crashes are quarantined to prevent loop failures.
5.  **Receipt/Replay-per-Message:** Every message processed produces a confirmed/refused receipt, enabling replay-per-message validation.
