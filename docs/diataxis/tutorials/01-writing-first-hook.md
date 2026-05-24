# Tutorial 1: Writing Your First Truex Hook

The **Hook** is the fundamental operational atom in Truex. It senses, transforms, receipts, and replays.

## Step 1: Define the Hook
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

## Step 2: Create a GraphDelta
Hooks don't take arbitrary JSON; they take a `GraphDelta` (the physical state change proposal).

```typescript
const delta: GraphDelta = {
  id: "delta-1",
  adds: [{ subject: "alice", predicate: "urn:hello", object: "bob", graph: null }],
  deletes: []
};
```

## Step 3: Execute and Capture the Receipt
Execute the hook within a deterministic context. The output includes the generated effects and the unforgeable receipt.

```typescript
const ctx = createDeterministicContext(42);
const { effects, receipt } = hook.execute(ctx, delta, undefined);

console.log(receipt.status); // "confirmed"
console.log(receipt.receiptHash); // Cryptographic proof of execution
```