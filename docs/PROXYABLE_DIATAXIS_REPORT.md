# Proxyable: Comprehensive Architecture & Diátaxis Report
Version: v26.5.22
Date: 2026-05-23

## Introduction

Proxyable is a dynamic JavaScript proxy creation library with isolated context-based interception. It moves beyond standard ES6 Proxies by providing a clean, type-safe API for registering multiple interceptors per trap, paired with an elegant context isolation mechanism powered by `unctx`.

This report is structured following the **Diátaxis** framework:
1. **Tutorials**: Learning-oriented. Step-by-step guides for getting started.
2. **How-To Guides**: Problem-oriented. Recipes for solving specific problems.
3. **Reference**: Information-oriented. API specifications and capability details.
4. **Explanation**: Understanding-oriented. Deep dives into architecture and design philosophy.

---

# Part 1: Tutorials (Learning-Oriented)

## 1.1 Getting Started with Core Proxyable

If you are new to Proxyable, this tutorial will guide you through creating your first intercepted object.

### Step 1: Create a Basic Proxy
First, import `createProxy` and wrap a standard JavaScript object.

```javascript
import { createProxy } from 'proxyable';

const target = { name: "Alice", balance: 100 };
const proxyInterface = createProxy(target);
const { proxy, defineGetInterceptor, defineSetInterceptor } = proxyInterface;
```

### Step 2: Add a Read (Get) Interceptor
We want to log every time someone reads a property.

```javascript
defineGetInterceptor((target, prop, receiver) => {
  console.log(`[READ] Property "${String(prop)}" was accessed.`);
  return undefined; // Return undefined to let the fallback (Reflect.get) handle the actual reading
});

console.log(proxy.name); 
// Logs: [READ] Property "name" was accessed.
// Outputs: "Alice"
```

### Step 3: Add a Write (Set) Validation Interceptor
Now, let's enforce a rule: balances cannot be negative.

```javascript
defineSetInterceptor((target, prop, value) => {
  if (prop === 'balance' && value < 0) {
    throw new Error("Balance cannot go below zero.");
  }
  return undefined; // Allow the underlying Reflect.set to apply the mutation
});

proxy.balance = 50; // Works
try {
  proxy.balance = -10; // Throws: "Balance cannot go below zero."
} catch(e) {
  console.error(e.message);
}
```

## 1.2 Tutorial: Time-Travel Debugging with Deterministic Replay

Proxyable includes a `ReplayContext` capability. This allows you to record all operations on a proxy and deterministically replay them against a fresh state.

### Step 1: Setup the Replay Context
```javascript
import { createProxy, createReplayContext, registerReplayInterceptors } from 'proxyable';

const initialState = { clicks: 0, lastUser: null };
const { proxy, ...proxyInterface } = createProxy(initialState);

// Create the Replay capability
const replayCtx = createReplayContext(initialState);
registerReplayInterceptors(proxyInterface, replayCtx);
```

### Step 2: Record Operations
Wrap your interactions in the `record` call.

```javascript
replayCtx.record(() => {
  proxy.clicks += 1;
  proxy.lastUser = "UserA";
  proxy.clicks += 1;
  proxy.lastUser = "UserB";
});
```

### Step 3: Extract and Replay the Recording
You can serialize this recording to disk, send it over a network, and replay it elsewhere.

```javascript
const recording = replayCtx.getRecording();
console.log(recording.mutations.length); // 4 (read clicks, write clicks, write lastUser, etc.)

// Start fresh
const freshState = { clicks: 0, lastUser: null };
const { proxy: freshProxy, ...freshInterface } = createProxy(freshState);
const newReplayCtx = createReplayContext(freshState);
registerReplayInterceptors(freshInterface, newReplayCtx);

// Replay!
newReplayCtx.replay(recording);
console.log(freshState.clicks); // 2
console.log(freshState.lastUser); // "UserB"
```

## 1.3 Tutorial: Counterfactual Simulation (What-If Scenarios)

Often, you want to test what *would* happen to an object if certain operations occurred, without actually mutating the real state.

### Step 1: Initialize Simulation
```javascript
import { createProxy, createSimulationContext, registerSimulationInterceptors } from 'proxyable';

const dbRow = { status: 'pending', retryCount: 0 };
const { proxy, ...proxyInterface } = createProxy(dbRow);
const simCtx = createSimulationContext(dbRow);
registerSimulationInterceptors(proxyInterface, simCtx);
```

### Step 2: Speculate
Run code that mutates the proxy inside `simCtx.speculate()`.

```javascript
simCtx.speculate(() => {
  proxy.status = 'processing';
  proxy.retryCount = 1;
  
  if (proxy.retryCount > 0) {
    proxy.status = 'failed';
  }
});
```

### Step 3: Inspect Changes and Commit/Abort
The real `dbRow` is completely unchanged during speculation.

```javascript
console.log(dbRow.status); // Still 'pending'

const changeset = simCtx.getChangeSet();
console.log(changeset.modified.status.to); // 'failed'

// If we like the result:
simCtx.commit();
console.log(dbRow.status); // 'failed'
```

---

# Part 2: How-To Guides (Problem-Oriented)

## 2.1 How to Layer Multiple Capabilities (The "Swarm")

**Problem:** You need a highly secure object that enforces type invariants, tracks mutations transactionally, and logs everything to an audit trail.
**Solution:** Proxyable is designed for composition. You can stack interceptors.

```javascript
import { 
  createProxy,
  createInvariantContext, registerInvariantInterceptors, rangeInvariant,
  createTransactionContext, registerTransactionInterceptors,
  createAuditContext, registerAuditInterceptors
} from 'proxyable';

const bankAccount = { balance: 1000 };
const proxyInterface = createProxy(bankAccount);

// 1. Audit Logger (runs first to log attempts)
const audit = createAuditContext(bankAccount);
registerAuditInterceptors(proxyInterface, audit);

// 2. Transactions (wraps mutations)
const tx = createTransactionContext(bankAccount);
registerTransactionInterceptors(proxyInterface, tx);

// 3. Invariants (runs last to block bad state)
const inv = createInvariantContext(bankAccount, {
  positiveBalance: rangeInvariant('balance', 0, Infinity)
});
registerInvariantInterceptors(proxyInterface, inv);

const { proxy } = proxyInterface;

tx.call(() => {
  proxy.balance -= 500; // Success -> Logged
  try {
    proxy.balance -= 600; // Fails invariant (balance = -100)
  } catch(e) {
    tx.rollback(); // Reverts balance back to 1000
  }
});
```

## 2.2 How to Implement Truex OCEL 2.0 Cryptographic Receipts

**Problem:** You need to prove that a specific state transition occurred legitimately without being forged by a malicious actor.
**Solution:** Use Proxyable's `Context` feature paired with a canonical hashing algorithm (as demonstrated in `examples/truex-capture.js`).

1. Use `createProxy` to wrap the state.
2. Use `createContext()` (the causality context) to mark the active operation (e.g., "User clicked Checkout").
3. In your `defineSetInterceptor`, validate the `prop` mutation against an Expected Path Array.
4. If valid, append the mutation to a Durable Queue and allow the mutation (`return true` if you are handling it manually, or `undefined` to let Reflect handle it).
5. At the end of the session, flush the queue, apply canonical JSON stringification, and hash it to generate a BLAKE3/SHA256 receipt.

## 2.3 How to Create Virtual (Computed) Properties

**Problem:** You want an object to have properties that don't actually exist in memory, but are computed on the fly.
**Solution:** Use the Virtualization context.

```javascript
import { createProxy, createVirtualContext, registerVirtualInterceptors } from 'proxyable';

const user = { firstName: 'Jane', lastName: 'Doe' };
const proxyInterface = createProxy(user);
const virtCtx = createVirtualContext(user, {
  fullName: (target) => `${target.firstName} ${target.lastName}`
});
registerVirtualInterceptors(proxyInterface, virtCtx);

console.log(proxyInterface.proxy.fullName); // "Jane Doe"
```

## 2.4 How to Filter Object Keys (Sandboxing)

**Problem:** You need to pass an object to a third-party plugin, but want to hide internal properties prefixed with `_`.
**Solution:** Use the Sandbox capability.

```javascript
import { createProxy, createSandboxContext, registerSandboxInterceptors } from 'proxyable';

const target = { _id: 1, name: 'Public', _secret: 'hidden' };
const proxyInterface = createProxy(target);

const sandbox = createSandboxContext(target, {
  hideKeys: ['_id', '_secret'],
  restrictEnumeration: true
});
registerSandboxInterceptors(proxyInterface, sandbox);

console.log(Object.keys(proxyInterface.proxy)); // ["name"]
```

---

# Part 3: Reference (Information-Oriented)

## 3.1 Core Proxy API

### `createProxy(target: object): ProxyInterface`
Creates an isolated proxy environment around the given `target`.

**Returns:**
- `proxy`: The generated `Proxy` instance.
- `defineGetInterceptor(fn)`: Add a trap for `Reflect.get`.
- `defineSetInterceptor(fn)`: Add a trap for `Reflect.set`.
- `defineDeletePropertyInterceptor(fn)`: Add a trap for `Reflect.deleteProperty`.
- `defineHasInterceptor(fn)`: Add a trap for `Reflect.has`.
- `defineOwnKeysInterceptor(fn)`: Add a trap for `Reflect.ownKeys`.
- `defineApplyInterceptor(fn)`: Add a trap for function execution.
- `defineConstructInterceptor(fn)`: Add a trap for `new` instantiations.

## 3.2 The 10 Capabilities (The Agent Swarm)

Proxyable ships with 10 built-in architectural capabilities found in `src/`.

### 1. Capability ACL (`src/security/capability-acl.js`)
Possession-based access control. Contexts hold `canRead`, `canWrite`, `canDelete` Sets.
- `createCapabilityContext(target, config)`

### 2. Invariant Enforcement (`src/invariants/invariant-context.js`)
Fail-closed state validation. Evaluates rules *after* mutations are proposed but *before* they settle.
- Built-in rules: `typeInvariant`, `rangeInvariant`, `patternInvariant`, `immutableInvariant`.

### 3. Transaction Journal (`src/transactions/transaction-context.js`)
Tracks state before mutations. Provides ACID-like `commit()` and `rollback()` semantics.

### 4. Sandboxing (`src/sandbox/sandbox-context.js`)
Structural containment. Prevents prototype pollution, restricts key enumeration, and blocks descriptor leakage.

### 5. Multitenancy (`src/multitenancy/tenant-context.js`)
Behavioral views. Different tenants accessing the same underlying proxy will see completely different filtered keys or virtual computed data based on their active Tenant Context.

### 6. Deterministic Replay (`src/replay/replay-context.js`)
Event sourcing for proxies. Records sequences of traps and allows them to be played back chronologically on a blank slate object.

### 7. Simulation / Counterfactuals (`src/simulation/simulation-context.js`)
Speculative execution using cloned states (`structuredClone`). Code inside `speculate()` blocks operates normally but writes to a shadow target. Exposes a `getChangeSet()` diff.

### 8. Virtualization (`src/virtualization/virtual-context.js`)
Lazy computation and synthetic fields. Integrates with `ownKeys` and `getOwnPropertyDescriptor` to make fake fields appear entirely real to `Object.keys` and `JSON.stringify`.

### 9. Protocol Contracts (`src/contracts/contract-context.js`)
Call-level assertions (Pre-conditions, Post-conditions). Specifically applied to the `apply` trap for function proxies to enforce TypeState patterns.

### 10. Observability / Audit Logger (`src/observability/audit-logger.js`)
Deterministic trap logging. Outputs JSON lines for every proxy interaction, supporting formatting for SIEMs, CSV, and text.

---

# Part 4: Explanation (Understanding-Oriented)

## 4.1 Architectural Design: Composition over Inheritance

Proxyable does not force you to write monolithic proxy handlers. Instead, it uses **Composition**. A single `set` trap might have 5 interceptors registered to it:

1. `AuditInterceptor`: Logs the attempt.
2. `ACLInterceptor`: Checks if the current context has `write` permissions.
3. `SimulationInterceptor`: If active, intercepts the write, applies it to a clone, and returns `true` to halt the chain.
4. `TransactionInterceptor`: Records the old value for potential rollback.
5. `InvariantInterceptor`: Checks if the new value conforms to rules.

This separation of concerns allows complex governance models (like the Ostar Generative Pipeline or Truex OCEL 2.0 systems) to be built modularly.

## 4.2 The Trap Resolution Algorithm: `runBooleanInterceptors`

A critical piece of Proxyable's core engine is how it resolves boolean traps (like `set`, `deleteProperty`, `has`).

In `src/proxy/traps.js`, the `runBooleanInterceptors` function operates on a specific logic matrix:

```javascript
export const runBooleanInterceptors = (interceptors, fallback, ...args) => {
  let explicitlyHandled = false
  for (const interceptor of interceptors) {
    const result = interceptor(...args)
    if (result === false) return false // IMMEDIATE DENIAL
    if (result === true) explicitlyHandled = true // EXPLICIT OVERRIDE
  }
  
  if (explicitlyHandled) {
    return true // Bypass standard fallback (e.g., used by Simulation to prevent real mutations)
  }
  
  return fallback(...args) // Standard pass-through
}
```

**The Matrix:**
*   **Interceptor returns `false`:** The operation is immediately aborted. The proxy returns `false` (which throws a TypeError in strict mode JS).
*   **Interceptor returns `undefined`:** The interceptor observed or validated the operation but wants the default `Reflect` fallback to actually perform the memory mutation.
*   **Interceptor returns `true`:** The interceptor is taking *full responsibility* for the operation. It has modified an alternate state (like a Simulation clone) and instructs the core engine to skip the `Reflect` fallback to protect the real target.

**Why this matters:** In version `v26.5.22`, this logic was perfected to allow the `SimulationContext` to isolate state without breaking `access-control` validation interceptors.

## 4.3 State Isolation & `structuredClone`

A major challenge in speculative execution (Simulation capability) is preventing reference leaking. If a target object contains nested objects (`{ a: { b: 1 } }`), a shallow clone is insufficient; mutating `proxy.a.b = 2` during a simulation would alter the real target.

In `v26.5.22`, Proxyable upgraded its `deepClone` implementation to utilize native `structuredClone`. This guarantees complete architectural containment, correctly handling cyclical references, Maps, Sets, and Dates, ensuring zero cross-contamination between speculative execution trees and real-world memory.

## 4.4 Truex Canonical Hashing and Ocel 2.0

Proxyable's design perfectly aligns with the requirements of cryptographic provenance frameworks like **Truex**. Because Proxyable can definitively hook every single read, write, and invocation, it acts as a perfect "sensor" for an Object-Centric Event Log (OCEL).

By wrapping application state in Proxyable, systems can:
1. Capture causality contexts (who triggered this async flow?).
2. Capture the exact property diffs.
3. Funnel these to a Durable Queue.
4. Emit BLAKE3/SHA256 signed envelopes validating that a State Machine traversed its nodes legally.

Examples of this architecture are available in the `examples/truex-capture.js` reference implementation added in `v26.5.22`.

---
*End of Report.*
