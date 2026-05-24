# How To: Trigger a Jidoka Line Stop (Andon)

If you are building an integration or interceptor, you must stop the production line when a Semantic Law is violated to prevent bad state from entering the system.

## 1. Identify the Violation
Inside your evaluation logic (e.g., in `truex-agy-bridge.ts`), inspect the incoming payload or delta.

```typescript
if (content.includes('FOSSIL')) {
  throw new Error('Semantic Law Violation: Fossil record detected.');
}
```

## 2. Bubble up to the Membrane
Truex is designed to catch exceptions at the membrane level and automatically trigger a rollback and refusal receipt.

```typescript
try {
    const results = line.manufacture(delta);
} catch (error) {
    // Stop the Line
    console.error(`❌ Truex REFUSAL: ${error.message}`);
    console.error('🛑 Operation blocked to prevent drift.');
    process.exit(1); // Standard Jidoka halt for CLI agents
}
```

By exiting with a non-zero code, the upstream orchestrator (e.g., AGY) is informed that the operation failed.