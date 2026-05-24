# Truex How-To Guides: Task-Oriented

How-To guides are recipes. They guide the reader through the steps required to solve a specific, real-world problem within the Truex operational field.

## How to Trigger a Jidoka Line Stop (Andon)

If you are building an integration or interceptor, you must stop the production line when a Semantic Law is violated.

### 1. Identify the Violation
Inside your evaluation logic (e.g., `truex-agy-bridge.ts`), inspect the incoming payload or delta.

```typescript
if (content.includes('FOSSIL')) {
  throw new Error('Semantic Law Violation: Fossil record detected.');
}
```

### 2. Bubble up to the Membrane
Truex is designed to catch exceptions at the membrane level and automatically trigger a rollback and refusal receipt.

```typescript
try {
    const results = line.manufacture(delta);
} catch (error) {
    console.error(`❌ Truex REFUSAL: ${error.message}`);
    console.error('🛑 Operation blocked to prevent drift.');
    process.exit(1); // Standard Jidoka halt for CLI agents
}
```

## How to Register a New File in the Operational Ontology

Truex enforces an active Operational Ontology. If you create a new file, the AGY bridge will throw a "Genesis Mutation" warning. To fully admit the file, you must map it.

### 1. Write the Source File
Create your new core primitive: `packages/truex-core/src/new-primitive.ts`.

### 2. Write the Cryptographic Proof (`provedBy`)
Create a test file that explicitly imports and tests your primitive.
`packages/truex-core/test/new-primitive.test.ts`.

### 3. Ensure Observability (`documentedBy`)
Ensure that your file is caught by one of the `FactEmitter` scripts in `scripts/observatory/lib/` (e.g., by ensuring it exports a function or class that the AST parser recognizes).

### 4. Prove the Ontology
Run the doctor to command the system to parse its own AST and verify the file is no longer orphaned.

```bash
npx tsx scripts/truex.ts doctor prove ontology
```

## How to Configure the Antigravity (AGY) Bridge

To wire Truex into an AGY swarm, you must intercept the agent's actions before they hit the disk.

### 1. Register the BeforeTool Hook
In your workspace root, create or update `.agents/hooks.json`:

```json
{
  "hooks": {
    "truex-hook-loop": {
      "event": "BeforeTool",
      "matcher": "write_to_file|replace_file_content|run_command",
      "script": "npx tsx scripts/truex-agy-bridge.ts {{tool}} '{{arguments}}'",
      "enabled": true,
      "outputToContext": true
    }
  }
}
```

### 2. Register the AfterTool Hook
To ensure the Observatory updates the environment after a successful mutation:

```json
{
  "hooks": {
    "after-tool-observatory": {
      "event": "AfterTool",
      "matcher": "write_file|replace",
      "script": "npm run observatory",
      "enabled": true
    }
  }
}
```
