# Truex Tutorials: Learning-Oriented

Tutorials are lessons that take the reader by the hand through a series of steps to complete a project. They are designed to help you *learn* the Truex operating system.

## 1. Writing Your First Truex Hook

The **Hook** is the fundamental operational atom in Truex. It senses, transforms, receipts, and replays.

### Step 1: Define the Hook
Create a file `src/my-hook.ts`. Truex requires all hooks to have a strict definition containing an ID, a condition, and the effects it produces.

```typescript
import { TruexHook, createDeterministicContext, hash } from 'truex-core';
import type { GraphDelta, HookDefinition } from 'truex-core';

const definition: HookDefinition = {
  id: "hook-first",
  name: "My First Hook",
  condition: { kind: "delta-match", predicate: "urn:hello" },
  effects: [{ kind: "emit-event", type: "hello-world" }]
};

const hook = new TruexHook(definition);
```

### Step 2: Create a GraphDelta
Hooks don't take arbitrary JSON; they take a `GraphDelta` (the physical state change proposal).

```typescript
const delta: GraphDelta = {
  id: "delta-1",
  adds: [{ subject: "alice", predicate: "urn:hello", object: "bob", graph: null }],
  deletes: []
};
```

### Step 3: Execute and Capture the Receipt
Execute the hook within a deterministic context. The output includes the generated effects and the unforgeable receipt.

```typescript
const ctx = createDeterministicContext(42);
const { effects, receipt } = hook.execute(ctx, delta, undefined);

console.log(receipt.status); // "confirmed"
console.log(receipt.receiptHash); // Cryptographic proof of execution
```

## 2. Replaying a Receipted Transition

Replay is how Truex governs trust. If it cannot be replayed deterministically, it did not happen.

### Step 1: Re-initialize the Context
You must use the exact same entropy (seed) that was used during execution.

```typescript
const replayCtx = createDeterministicContext(42);
```

### Step 2: Trigger Replay
Pass the original delta and the receipt you want to verify. Truex will re-execute the hook and ensure the new receipt hash perfectly matches the historical receipt.

```typescript
const isConverged = hook.replay(replayCtx, delta, receipt);
console.log(isConverged ? "Trust Verified" : "Replay Diverged");
```

## 3. Running the Truex Doctor

The Doctor is Truex's autonomic verification system. It ensures your implementation follows the Gall sequencing laws.

### Step 1: Prove the Hook Primitive
Run the doctor to mathematically prove that your hook definitions satisfy the Truex Property Standard (TPS).

```bash
npx tsx scripts/truex.ts doctor prove hook
```

### Step 2: Read the Report
Check `docs/vision2030/hook-proof.report.json` to view the empirical evidence that your hook converges, survives tampered inputs, and correctly identifies capacity breaches.
