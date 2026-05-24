# Truex Doctest Corpus Report

All 12 required doctests (along with the pre-existing samples) have been authored and verified using the automated doctest verifier tool. Every test successfully compiles, runs, and passes.

## Summary of Verification Run

- **Total Doctests Scanned**: 16
- **Attempted (Active)**: 14
- **Passed**: 14
- **Failed**: 0
- **Skipped**: 1 (ignored-doctest sample)
- **Deferred**: 1 (deferred-doctest sample)

All test executions converged successfully.

---

## Detailed Corpus Inventory

### 1. First Hook
- **File**: `docs/doctest-tutorial.md` (Lines L8-L29)
- **Type**: `typescript`
- **Name**: `first-hook`
- **Purpose**: Defines a `TruexHook` with an event-emitting behavior, sets up a deterministic context, and executes it against a matching `GraphDelta` structure.
- **Verification**: ✅ Passed

### 2. Replay Confirmed Receipt
- **File**: `docs/doctest-tutorial.md` (Lines L34-L58)
- **Type**: `typescript`
- **Name**: `replay-confirmed-receipt`
- **Purpose**: Performs a live execution of a hook, captures the resulting receipt, and replays the transaction under a new context instance with the same seed to confirm deterministic execution convergence.
- **Verification**: ✅ Passed

### 3. Tampered Receipt Fails
- **File**: `docs/doctest-tutorial.md` (Lines L63-L88)
- **Type**: `typescript`
- **Name**: `tampered-receipt-fails`
- **Purpose**: Tampered receipt verification by intentionally altering the `receiptHash` before replay validation, asserting that the replay mechanism detects the modification and returns `false`.
- **Verification**: ✅ Passed

### 4. Capacity Breach Refusal (Muri)
- **File**: `docs/doctest-tutorial.md` (Lines L93-L128)
- **Type**: `typescript`
- **Name**: `capacity-breach-refusal`
- **Purpose**: Asserts that a delta exceeding standard capacity constraints (>100 quads) is rejected during the Jidoka pre-execution guard check (`PokaYoke`), throwing a `Semantic Law Violation (Muri)` exception.
- **Verification**: ✅ Passed

### 5. Deterministic Context Same Seed
- **File**: `docs/doctest-tutorial.md` (Lines L133-L146)
- **Type**: `typescript`
- **Name**: `deterministic-context-same-seed`
- **Purpose**: Proves that two independent `TruexContext` instances initialized with the same seed yield identical deterministic sequences of UUIDs and clocks.
- **Verification**: ✅ Passed

### 6. Deterministic Context Different Seed
- **File**: `docs/doctest-tutorial.md` (Lines L151-L160)
- **Type**: `typescript`
- **Name**: `deterministic-context-different-seed`
- **Purpose**: Proves that two `TruexContext` instances initialized with different seeds generate distinct UUIDs, demonstrating correct entropy divergence.
- **Verification**: ✅ Passed

### 7. Hash/Canonicalization Stability
- **File**: `docs/doctest-tutorial.md` (Lines L165-L173)
- **Type**: `typescript`
- **Name**: `hash-canonicalization-stability`
- **Purpose**: Verifies that `stableJson()` and `hash()` are deterministic and alphabetize object keys before hashing, producing matching hashes for structurally equivalent but unordered inputs.
- **Verification**: ✅ Passed

### 8. Doctor Prove CLI Commands (Bash Doctest)
- **File**: `docs/doctest-tutorial.md` (Lines L178-L181)
- **Type**: `bash`
- **Name**: `doctor-prove-replay-cmd`
- **Purpose**: Asserts that the CLI script command `npx tsx scripts/truex.ts doctor prove replay` runs without issue, outputting the expected validation result with exit code 0.
- **Verification**: ✅ Passed

### 9. GraphDelta Parser Valid Input
- **File**: `docs/doctest-tutorial.md` (Lines L186-L200)
- **Type**: `typescript`
- **Name**: `graph-delta-parser-valid`
- **Purpose**: Verifies that the parser correctly decodes and validates a standard, well-formed GraphDelta input structure.
- **Verification**: ✅ Passed

### 10. GraphDelta Parser Malformed Input
- **File**: `docs/doctest-tutorial.md` (Lines L205-L217)
- **Type**: `typescript`
- **Name**: `graph-delta-parser-malformed`
- **Purpose**: Verifies that passing malformed delta structures (such as an empty predicate string) fails validation and throws a clear, structural exception.
- **Verification**: ✅ Passed

### 11. Topology A → B → C Validation
- **File**: `docs/doctest-tutorial.md` (Lines L222-L292)
- **Type**: `typescript`
- **Name**: `topology-abc-validation`
- **Purpose**: Registers three hook nodes (Node A, Node B, and Node C) with causal dependencies, dispatches a root delta, and asserts that they cascade sequentially, generating exactly three receipts in the correct order.
- **Verification**: ✅ Passed

### 12. OTP Mailbox FIFO Ordering
- **File**: `docs/doctest-tutorial.md` (Lines L297-L314)
- **Type**: `typescript`
- **Name**: `otp-mailbox-fifo`
- **Purpose**: Asserts that the OTP HookMailbox implementation processes dispatched messages strictly in a First-In-First-Out (FIFO) queue order.
- **Verification**: ✅ Passed

---

## Pre-existing Sample Doctests (Validated Concurrently)

- `hash-assertion` (`docs/doctest-sample.md` L7-L13): ✅ Passed
- `doctor-prove-hook` (`docs/doctest-sample.md` L17-L20): ✅ Passed
- `ignored-doctest` (`docs/doctest-sample.md` L24-L27): ⚠️ Skipped (no-doctest)
- `deferred-doctest` (`docs/doctest-sample.md` L29-L32): ⏳ Deferred (defer-doctest)
