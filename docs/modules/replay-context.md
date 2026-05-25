# Module: Replay Context

> **Path:** `src/replay/`
> **Gall Classification:** S₁ - Replay Primitive

## 1. Product Thesis

The Replay Context module establishes the **temporal isolation boundary** of the Truex substrate. It enforces the rule: *No Replay, No Substrate*. By recording exact trap invocations (`get`, `set`, `apply`, etc.) during an active session, it constructs a deterministic log of operational intent. This log can be subsequently executed (replayed) against an isolated snapshot of the original substrate to prove that the exact sequence of operations produces the exact same structural outcome, defending against non-deterministic side effects or external state dependencies.

## 2. Accounting Domains

* **Trap Sequence Conservation:** Every trap fired during `record()` must have a corresponding, identically ordered counterpart during `replay()`. The total number of executed mutations must exactly equal the total number of recorded mutations.

## 3. Key Invariants

* **REP-1 (Temporal Isolation):** A replay execution operates on an exact clone (`targetSnapshot`) of the substrate taken at the moment `record()` was initiated. It never mutates the active, live substrate.
* **REP-2 (Strict Determinism):** The replay engine injects a deterministic local clock and PRNG (`createLocalDeterministicContext`). Unstructured time calls or randomized logic within the membrane are forced into deterministic lockstep during replay.
* **REP-3 (Sequence Parity):** If a replay execution deviates from the recorded sequence (e.g., trying to read a different property than the one recorded at index `i`), the system throws a `Sequence mismatch` error.
* **REP-4 (Outcome Parity):** After all recorded traps are replayed, the final state of the isolated substrate must perfectly match the expected final state of the original execution.

## 4. Verbs / Commands

* `createReplayContext(target, options)`: Creates the recording and replay boundaries for a membrane, injecting optional deterministic seeds for time and UUIDs.
* `record(fn)`: Executes the provided function block, meticulously logging every proxy trap invocation and generating a unique `recordingId`.
* `replay(recordingId)`: Re-executes the recorded trace against an isolated clone of the substrate, evaluating sequence parity and outcome equivalence.
* `getRecording(recordingId)`: Returns the raw sequence log for cryptographic receipting or auditing.

## 5. Refusal Conditions

The Replay engine will refuse execution (via `Error`) if:
* A `record()` block is nested inside another active recording block (`Already recording. Nested recordings are not supported.`).
* A `replay()` is attempted for a `recordingId` that does not exist.
* During replay, the execution attempts to fire a trap that does not match the exact order, type, or property of the recorded sequence (`Sequence mismatch`).

## 6. Proof Command

To prove the deterministic recording and sequence parity limits:

```bash
npx vitest run packages/membrane/test/membrane-replay/
```