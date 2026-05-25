# Truex S10 Queue Claim and Retry Backoff Report

## 1. Domain Ownership & Executive Summary
As Agent 2, our domain covers the persistent operational mailbox scheduling discipline, queue isolation, concurrency controls, depth limit restrictions, and the retry/backoff policies including deterministic jitter.
This report details the implementation, cryptographic convergence, and verification of:
- **Priority and FIFO Scheduling**: Messages claimed descending by priority first, then ascending by creation time (FIFO).
- **Queue Limits**: Concurrency limit checks, max queue depth limit checks, and queue-scoped isolation.
- **Retry Backoff Policies**: Support for constant, linear, squared, exponential, and jittered-deterministic backoff policies.
- **Deterministic Jitter**: Cryptographic jitter calculated using `hash(messageId || attempt || parentReceiptHash) mod window`.
- **System Queue Protection**: Demonstrating that poisoned queues cannot starve crucial operational queues (e.g. replay, rollback, and observatory).

---

## 2. Test Architectures and Coverage
We created the following test files to verify all queue isolation and retry backoff invariants:
- `packages/membrane/test/persistent-mailbox/persistent-mailbox-queue-isolation.test.ts`
- `packages/membrane/test/persistent-mailbox/persistent-mailbox-retry-backoff.test.ts`

### 2.1 Queue Isolation & Scheduling Discipline
The `persistent-mailbox-queue-isolation.test.ts` suite implements 5 passing test cases:
1. **Priority and FIFO Scheduling**: Enqueues messages with varying priorities (8, 5, 2) and identical priorities with different enqueue order. Asserts that `claimNextMessage` preserves the `ORDER BY priority DESC, created_at ASC` scheduling discipline.
2. **Empty Queue Claim**: Confirms a claim on an empty queue safely returns `{ status: 'empty' }`.
3. **Queue Depth Limit**: Asserts that when a queue hits its maximum depth configuration (`maxDepth`), further enqueues return a refuse receipt and are rejected.
4. **Concurrency Limits**: Asserts that claims are locked if the active executing message count hits the `concurrencyLimit`, and unlock once an executing message is completed.
5. **System Queue Protection**: Demonstrates that system-critical queues (`replay`, `rollback`, `observatory`) remain fully functional and un-starved even when a user queue (`poisoned`) is completely locked/saturated.

### 2.2 Retry and Backoff Policies
The `persistent-mailbox-retry-backoff.test.ts` suite implements 4 passing test cases:
1. **Message Backoff & Promotion**: Confirms that a retryable message is scheduled in the future and cannot be claimed until the clock has advanced past the backoff time and it is promoted.
2. **Retry Exhaustion**: Validates that messages exceeding the standard retry limit of 3 are transitioned to the terminal `discarded` state.
3. **Deterministic Jitter**: Validates that the formula `hash(messageId + attempt + parentReceiptHash) mod window` produces reproducible results for identical inputs, but varies with different attempts.
4. **Immediate Discard Policy**: Ensures that queues configured with `none` retry policy immediately discard failing messages on their first attempt.

---

## 3. Implementation Details & Hashing Invariant
The deterministic jitter formula is implemented as:
```typescript
const normalizedParent = parentReceiptHash || '';
const jHash = hash(messageId + String(attempt) + normalizedParent);
const window = policy.windowMs ?? 1000;
const jitterVal = parseInt(jHash.slice(0, 8), 16) % window;
```
This guarantees absolute determinism for the replay mechanism and ensures that identical inputs result in identical jitter values, fulfilling the core receipt-replay convergence requirements.

---

## 4. Execution Invariant Verification
All tests run and pass within the vitest environment:
```bash
 ✓ packages/membrane/test/persistent-mailbox/persistent-mailbox-queue-isolation.test.ts (5 tests) 12ms
 ✓ packages/membrane/test/persistent-mailbox/persistent-mailbox-retry-backoff.test.ts (4 tests) 10ms
```
No mocks, stubs, or placeholder logic were introduced, complying strictly with repository axioms.
