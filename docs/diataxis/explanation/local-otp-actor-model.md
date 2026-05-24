# Explanation: Local OTP-Equivalence

Erlang's OTP (Open Telecom Platform) is famous for its robust actor model, mailboxes, and "let it crash" philosophy. Truex brings **local OTP-equivalence** to TypeScript, not to build distributed clusters, but to enforce rigorous crash containment within the hook field.

## Process-Bearing Organisms

Instead of reactive callbacks that bleed state, Truex Hooks operate as independent processes.

1.  **Temporal Geometry:** Mailboxes enforce strict FIFO ordering. The sequence of messages is critical; if messages are reordered, the Replay Law fails.
2.  **State Isolation:** A mutation or crash in Hook A cannot corrupt the memory of Hook B. They do not share scope.
3.  **Supervision:** Supervisors manage restart budgets. If a hook crashes, it doesn't bring down the system; it is restarted from its pre-crash state.
4.  **Quarantine:** If a poison message repeatedly crashes a hook, exhausting its budget, the system quarantines the message.

This topological transition elevates hooks from simple functions to resilient, fault-tolerant entities that actively shape the operational ecosystem.