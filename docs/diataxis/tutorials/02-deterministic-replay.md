# Tutorial 2: Deterministic Replay

Replay is how Truex governs trust. If an event cannot be replayed deterministically, it did not happen.

## Step 1: Re-initialize the Context
To replay an event, you must use the exact same entropy (seed) that was used during the initial execution.

```typescript
import { createDeterministicContext } from 'truex-core';

// Re-initialize with the historical seed
const replayCtx = createDeterministicContext(42);
```

## Step 2: Trigger Replay
Pass the original delta and the receipt you want to verify. Truex will re-execute the hook and ensure the new receipt hash perfectly matches the historical receipt.

```typescript
// Assuming `hook`, `delta`, and `receipt` from the previous execution
const isConverged = hook.replay(replayCtx, delta, receipt);

if (isConverged) {
  console.log("Trust Verified: The execution is deterministic.");
} else {
  console.error("Replay Diverged: The law or environment has changed.");
}
```

## Why This Matters
By confirming that `replayCtx` yields the exact same hash, you mathematically prove that the operational consequence was bound by law, not by ambient state.