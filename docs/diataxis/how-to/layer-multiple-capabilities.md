# How to Layer Multiple Capabilities

In the Proxyable architecture, **Capabilities** are composable, single-purpose wrappers that enforce invariants, handle cross-cutting concerns, and orchestrate logic around your core functions. Layering multiple capabilities allows you to build robust, secure, and observable systems without polluting your business logic.

This guide demonstrates how to stack multiple capabilities onto a single target function, ensuring they execute in the correct order.

## Prerequisites

- Node.js 18+
- `membrane` installed
- Basic understanding of Proxyable Membranes

## Step 1: Define the Capabilities

Let's define three distinct capabilities that mirror TPS and OCEL principles:
1.  **AuditCapability:** Logs the start and end of an operation (OCEL).
2.  **AuthCapability:** Verifies the user has permission to execute the action (Security).
3.  **JidokaCapability:** Halts execution if performance degrades severely (TPS).

```typescript
import { createCapability, JidokaError } from 'membrane';

export const AuditCapability = createCapability({
  name: 'Audit',
  onBefore(context) {
    console.log(`[AUDIT] Starting operation: ${context.operationName}`);
  },
  onAfter(context, result) {
    console.log(`[AUDIT] Completed operation: ${context.operationName}`);
    return result;
  }
});

export const AuthCapability = createCapability({
  name: 'Auth',
  onBefore(context) {
    const user = context.args[1]; // Assuming user is the second argument
    if (!user || user.role !== 'ADMIN') {
      throw new Error('Unauthorized: Admin access required');
    }
  }
});

export const JidokaCapability = createCapability({
  name: 'PerformanceJidoka',
  onBefore(context) {
    context.state.startTime = Date.now();
  },
  onAfter(context, result) {
    const duration = Date.now() - context.state.startTime;
    if (duration > 1000) {
      console.warn(`[JIDOKA] Operation took ${duration}ms. Nearing SLA limits!`);
    }
    return result;
  }
});
```

## Step 2: Target Function

Create the core business logic function. Notice how clean it remains; it doesn't know about auditing, auth, or performance tracking.

```typescript
async function updateDatabase(data: any, user: any) {
  // Simulate database work
  await new Promise(resolve => setTimeout(resolve, 300));
  return { success: true, recordsUpdated: 1 };
}
```

## Step 3: Layering with `applyCapabilities`

Use the `applyCapabilities` (plural) function to wrap the target. Order matters! Capabilities are executed "outside-in" during `onBefore` and "inside-out" during `onAfter`.

```typescript
import { applyCapabilities } from 'membrane';

// Execution Order:
// onBefore: Audit -> Auth -> Jidoka -> Target
// onAfter: Target -> Jidoka -> Auth -> Audit
const secureObservableUpdate = applyCapabilities(updateDatabase, [
  AuditCapability,    // Outermost
  AuthCapability,     // Middle
  JidokaCapability    // Innermost
]);
```

## Step 4: Execute the Layered Function

Let's run the wrapped function and observe the output.

```typescript
async function run() {
  const adminUser = { id: 1, role: 'ADMIN' };
  
  console.log('--- Executing as Admin ---');
  await secureObservableUpdate({ id: 101, value: 'New Data' }, adminUser);

  console.log('\n--- Executing as Guest ---');
  const guestUser = { id: 2, role: 'GUEST' };
  try {
    await secureObservableUpdate({ id: 102, value: 'Bad Data' }, guestUser);
  } catch (e) {
    console.error(`Caught Error: ${e.message}`);
  }
}

run();
```

## Terminal Commands

Save the file as `layering.ts` and run it:

```bash
npx tsx layering.ts
```

### Expected Console Output

```
--- Executing as Admin ---
[AUDIT] Starting operation: updateDatabase
[AUDIT] Completed operation: updateDatabase

--- Executing as Guest ---
[AUDIT] Starting operation: updateDatabase
Caught Error: Unauthorized: Admin access required
```

*(Note that in the second run, the Auth capability halted execution before the target function or Jidoka capability could run, but the Audit capability still logged the start.)*

## Handling Edge Cases

### Edge Case 1: Capability Conflict
If two capabilities attempt to modify the arguments before they reach the target function, the inner capability receives the arguments modified by the outer capability. Design your capabilities to be orthogonal to avoid unexpected mutations.

### Edge Case 2: Asynchronous Error Handling
If a capability throws an error in `onBefore`, the target is not called. However, any `onError` handlers in *outer* capabilities will be triggered, allowing them to clean up state or format the error before it bubbles up to the caller.

## Connection to TPS
Layering capabilities is akin to building a robust assembly line. Each capability acts as a dedicated workstation performing a specific check or augmentation (Poka-Yoke) without slowing down the core value creation process.
