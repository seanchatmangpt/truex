# Hook OTP Supervisor & Quarantine Agent Report

## Concurrency & Fault Tolerance Boundaries

1.  **Transient Crash Recovery:** Processes throwing errors during behavior execution are caught by the supervisor, which increments the restart counter and reverts the process to its initial clean state.
2.  **Restart Budget:** Enforces bounds (`maxRestarts` within `withinMs`). Exceeding this budget halts the process and marks it as inactive.
3.  **Poison Message Isolation:** The message that triggered the crash is quarantined inside `runtime.quarantine` to prevent infinite restart loops.
4.  **Crash Containment:** Sibling processes run on independent mailboxes and remain unaffected if a neighboring process crashes or halts.

## Verification Evidence

Unit tests in [hook-otp-supervisor.test.ts](file:///Users/sac/truex/packages/membrane/test/hook-otp/hook-otp-supervisor.test.ts) verify:
*   Transient crashes successfully trigger supervisor restarts.
*   Budget exhaustion halts the target process cleanly.
*   Halting process A does not interrupt message evaluation in process B.
