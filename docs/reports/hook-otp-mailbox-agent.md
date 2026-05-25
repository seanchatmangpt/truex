# Hook OTP Mailbox & Actor Runtime Report

## FIFO Mailbox & Message Routing

1.  **FIFO Queueing:** `HookMailbox` stores dispatched messages in a FIFO queue. Ingest/dispatch extracts messages in order.
2.  **Addressing:** The runtime inspects `message.targetProcessId` to route input deltas to the correct process mailbox.
3.  **State Isolation:** Process states are isolated deep copies. Modifications to Process A's state do not leak to Process B.

## Verification Evidence

Unit tests in [hook-otp-mailbox.test.ts](file:///Users/sac/truex/packages/membrane/test/hook-otp/hook-otp-mailbox.test.ts) assert:
*   Mailbox FIFO processing matches dispatch order.
*   Two processes initialized with separate states remain completely isolated.
*   Messages addressed to `unknown-process` trigger immediate refusal receipts.
