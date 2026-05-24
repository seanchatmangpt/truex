# Hook OTP Receipt & Replay Agent Report

## Lineage Chaining & Replay Convergence

1.  **Receipt-per-Message:** Every message execution produces a signed `Receipt`. Confirmed executions emit `status: 'confirmed'`. Refused/crashed executions emit `status: 'refused'`.
2.  **Lineage Chain:** Process receipts link via `previousReceiptHash` to form a chain of states over mailbox history.
3.  **Replay Convergence:** Replay takes the initial state, delta, and behavior, re-evaluating it to assert that output state and effect hashes match the expected receipt.
4.  **Divergence Detection:** Modifying delta quads or receipt fields triggers replay failures.

## Verification Evidence

Unit tests in [hook-otp-receipt-replay.test.ts](file:///Users/sac/truex/packages/truex-core/test/hook-otp/hook-otp-receipt-replay.test.ts) verify:
*   Receipt hashes link correctly across sequential message dispatches.
*   Replay converges for valid receipts and diverges when delta inputs are mutated.
