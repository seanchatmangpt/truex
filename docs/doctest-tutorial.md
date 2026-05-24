# Truex Doctest Tutorial

This tutorial provides executable doctests illustrating the key components of Truex.

## 1. First Hook
Define a simple hook and execute it against a matching GraphDelta.

```typescript doctest name="first-hook"
import { TruexHook } from "packages/truex-core/src/hook.js";
import { createDeterministicContext } from "packages/truex-core/src/context.js";

const hook = new TruexHook({
  id: "hook-1",
  name: "Simple Emit Event Hook",
  condition: { kind: "delta-match", predicate: "likes" },
  effects: [{ kind: "emit-event", type: "LikedEvent" }]
});

const ctx = createDeterministicContext(42);
const delta = {
  id: "delta-1",
  adds: [{ subject: "Alice", predicate: "likes", object: "Bob", graph: null }],
  deletes: []
};

const result = hook.execute(ctx, delta, null);
expect(result.effects).toEqual([{ kind: "emit-event", type: "LikedEvent" }]);
expect(result.receipt.status).toBe("confirmed");
```

## 2. Replay Confirmed Receipt
Run hook replay validation to verify deterministic convergence.

```typescript doctest name="replay-confirmed-receipt"
import { TruexHook } from "packages/truex-core/src/hook.js";
import { createDeterministicContext } from "packages/truex-core/src/context.js";

const hook = new TruexHook({
  id: "hook-1",
  name: "Simple Emit Event Hook",
  condition: { kind: "always" },
  effects: [{ kind: "emit-event", type: "AlwaysEvent" }]
});

const ctx1 = createDeterministicContext(100);
const delta = {
  id: "delta-1",
  adds: [],
  deletes: []
};

const { receipt } = hook.execute(ctx1, delta, null);

// Replay verification with same seed
const ctx2 = createDeterministicContext(100);
const success = hook.replay(ctx2, delta, receipt);
expect(success).toBe(true);
```

## 3. Tampered Receipt Fails
Verifying that modifying a receipt causes replay validation to fail.

```typescript doctest name="tampered-receipt-fails"
import { TruexHook } from "packages/truex-core/src/hook.js";
import { createDeterministicContext } from "packages/truex-core/src/context.js";

const hook = new TruexHook({
  id: "hook-1",
  name: "Simple Emit Event Hook",
  condition: { kind: "always" },
  effects: [{ kind: "emit-event", type: "AlwaysEvent" }]
});

const ctx1 = createDeterministicContext(100);
const delta = {
  id: "delta-1",
  adds: [],
  deletes: []
};

const { receipt } = hook.execute(ctx1, delta, null);

// Mutate the receipt hash (adversarial tampering)
const tamperedReceipt = { ...receipt, receiptHash: "tampered-hash-value" };
const ctx2 = createDeterministicContext(100);
const success = hook.replay(ctx2, delta, tamperedReceipt);
expect(success).toBe(false);
```

## 4. Capacity Breach Refusal
Asserting that exceeding standard capacity constraints (more than 100 quads) is rejected by Jidoka / PokaYoke.

```typescript doctest name="capacity-breach-refusal"
import { PokaYoke, AndonSystem } from "packages/truex-core/src/manufacturing/jidoka.js";
import { TruexHook } from "packages/truex-core/src/hook.js";
import { createDeterministicContext } from "packages/truex-core/src/context.js";

const andon = new AndonSystem();
const pokaYoke = new PokaYoke(andon);

const hook = new TruexHook({
  id: "hook-1",
  name: "Simple Hook",
  condition: { kind: "always" },
  effects: [{ kind: "emit-event", type: "SomeEvent" }]
});

const ctx = createDeterministicContext(123);

// Create a delta with more than 100 quads (101 adds)
const adds = Array.from({ length: 101 }, (_, i) => ({
  subject: `s${i}`,
  predicate: `p${i}`,
  object: `o${i}`
}));

const delta = {
  id: "delta-breached",
  adds,
  deletes: []
};

expect(() => {
  pokaYoke.guardExecution(hook, ctx, delta, () => {
    return hook.execute(ctx, delta, null);
  });
}).toThrow("Semantic Law Violation (Muri): Input delta size exceeds processing capacity.");
```

## 5. Deterministic Context Same Seed
Proving two local deterministic contexts with the same seed behave identically.

```typescript doctest name="deterministic-context-same-seed"
import { createDeterministicContext } from "packages/truex-core/src/context.js";

const ctx1 = createDeterministicContext(12345);
const ctx2 = createDeterministicContext(12345);

const uuid1 = ctx1.uuid();
const uuid2 = ctx2.uuid();
expect(uuid1).toBe(uuid2);

const time1 = ctx1.clock();
const time2 = ctx2.clock();
expect(time1).toBe(time2);
```

## 6. Deterministic Context Different Seed
Proving two local deterministic contexts with different seeds generate different sequences.

```typescript doctest name="deterministic-context-different-seed"
import { createDeterministicContext } from "packages/truex-core/src/context.js";

const ctx1 = createDeterministicContext(11111);
const ctx2 = createDeterministicContext(22222);

const uuid1 = ctx1.uuid();
const uuid2 = ctx2.uuid();
expect(uuid1).not.toBe(uuid2);
```

## 7. Hash/Canonicalization Stability
Proving `hash()` and `stableJson()` are deterministic and order keys alphabetically.

```typescript doctest name="hash-canonicalization-stability"
import { stableJson, hash } from "packages/truex-core/src/hash.js";

const obj1 = { z: 1, a: 2, m: 3 };
const obj2 = { a: 2, m: 3, z: 1 };

expect(stableJson(obj1)).toBe(stableJson(obj2));
expect(hash(obj1)).toBe(hash(obj2));
```

## 8. Doctor Prove CLI Commands
Testing the Truex CLI doctor prove replay command.

```bash doctest name="doctor-prove-replay-cmd"
npx tsx scripts/truex.ts doctor prove replay
# expect: exitCode 0
```

## 9. GraphDelta Parser Valid Input
Verifying parsing of a valid GraphDelta structure.

```typescript doctest name="graph-delta-parser-valid"
import { parseGraphDelta } from "packages/truex-core/src/runtime-law.js";

const rawDelta = {
  id: "delta-123",
  adds: [
    { subject: "A", predicate: "rel", object: "B", graph: null }
  ],
  deletes: []
};

const parsed = parseGraphDelta(rawDelta);
expect(parsed.id).toBe("delta-123");
expect(parsed.adds[0].subject).toBe("A");
```

## 10. GraphDelta Parser Malformed Input
Verifying that parsing of invalid/malformed structures fails as expected.

```typescript doctest name="graph-delta-parser-malformed"
import { parseGraphDelta } from "packages/truex-core/src/runtime-law.js";

const rawDelta = {
  id: "delta-123",
  adds: [
    { subject: "A", predicate: "", object: "B" } // Empty predicate is invalid
  ],
  deletes: []
};

expect(() => parseGraphDelta(rawDelta)).toThrow("Quad.predicate must be a non-empty string");
```

## 11. Topology A → B → C Validation
A simple multi-node hook topology validation.

```typescript doctest name="topology-abc-validation"
import { createTopologyRuntime, registerTopologyHook, emitTopologyDelta, runTopologyChain, type TopologyDelta } from "packages/truex-core/src/topology.gall.js";

const runtime = createTopologyRuntime(42);

// Register Node A
registerTopologyHook(
  runtime,
  "node-a",
  "Hook A",
  { kind: "delta-match", predicate: "action:a" },
  (state, delta) => {
    return {
      nextState: { value: "a-done" },
      effects: [{
        kind: "add-quad",
        quad: { subject: "ping", predicate: "action:b", object: "pong", graph: null }
      }]
    };
  },
  { value: "a-init" }
);

// Register Node B
registerTopologyHook(
  runtime,
  "node-b",
  "Hook B",
  { kind: "delta-match", predicate: "action:b" },
  (state, delta) => {
    return {
      nextState: { value: "b-done" },
      effects: [{
        kind: "add-quad",
        quad: { subject: "ping", predicate: "action:c", object: "pong", graph: null }
      }]
    };
  },
  { value: "b-init" }
);

// Register Node C
registerTopologyHook(
  runtime,
  "node-c",
  "Hook C",
  { kind: "delta-match", predicate: "action:c" },
  (state, delta) => {
    return {
      nextState: { value: "c-done" },
      effects: [{ kind: "emit-event", type: "completed" }]
    };
  },
  { value: "c-init" }
);

const rootDelta: TopologyDelta = {
  id: "delta-start",
  adds: [{ subject: "user1", predicate: "action:a", object: "start", graph: null }],
  deletes: []
};

const chain = emitTopologyDelta(runtime, rootDelta);
const run = runTopologyChain(runtime, chain);

expect(run.status).toBe("success");
expect(run.receipts).toHaveLength(3);

const nodeIds = run.receipts.map(r => r.nodeId);
expect(nodeIds).toEqual(["node-a", "node-b", "node-c"]);
```

## 12. OTP Mailbox FIFO Ordering
Proving hook-otp mailbox messages process in FIFO order.

```typescript doctest name="otp-mailbox-fifo"
import { createHookMailbox } from "packages/truex-core/src/hook-otp.gall.js";

const mailbox = createHookMailbox();
const msg1 = { id: "msg-1", targetProcessId: "proc-1", delta: { id: "d1", adds: [], deletes: [] } };
const msg2 = { id: "msg-2", targetProcessId: "proc-1", delta: { id: "d2", adds: [], deletes: [] } };
const msg3 = { id: "msg-3", targetProcessId: "proc-1", delta: { id: "d3", adds: [], deletes: [] } };

mailbox.push(msg1);
mailbox.push(msg2);
mailbox.push(msg3);

expect(mailbox.size()).toBe(3);
expect(mailbox.pop()?.id).toBe("msg-1");
expect(mailbox.pop()?.id).toBe("msg-2");
expect(mailbox.pop()?.id).toBe("msg-3");
expect(mailbox.isEmpty()).toBe(true);
```
