# Tutorial 5: Setting up the Observatory

The Truex Observatory is the sensory cortex of the system. It emits facts, diagrams, and receipts about the codebase itself.

## Step 1: Run the Observatory
To generate a full suite of artifacts, use the CLI orchestrator.

```bash
npm run observatory
```
*Or manually via tsx:*
```bash
npx tsx scripts/observatory/index.ts
```

## Step 2: Review Generated Artifacts
Navigate to `docs/v1/latest/`. You will find:
- **Facts (`facts/*.json`)**: AST-extracted metrics about your codebase.
- **Diagrams (`diagrams/*.mmd`)**: Mermaid diagrams illustrating persistence and topological flows.
- **Receipts (`receipts/*.json`)**: A cryptographically signed envelope proving the exact state of the documentation.

## Step 3: Hooking it to AGY
The observatory runs automatically in the background if the Antigravity `AfterTool` hook is configured, ensuring the system's "Digital Twin" never drifts from its code.