# How To: Register a New File in the Operational Ontology

Truex enforces an active Operational Ontology. If you create a new file, the AGY bridge will throw a "Genesis Mutation" warning. To fully admit the file, you must map it.

## 1. Write the Source File
Create your new core primitive, e.g., `packages/truex-core/src/new-primitive.ts`.

## 2. Write the Cryptographic Proof (`provedBy`)
The system expects every primitive to have a test that proves its capability.
Create `packages/truex-core/test/new-primitive.test.ts` and import the primitive.

## 3. Ensure Observability (`documentedBy`)
Ensure that your file is caught by one of the `FactEmitter` scripts in `scripts/observatory/lib/`. Usually, exporting a function, class, or importing a specific dependency (like `vitest`) is enough for the AST engine to classify it.

## 4. Prove the Ontology
Run the doctor to command the system to parse its own AST and verify the file is no longer orphaned.

```bash
npx tsx scripts/truex.ts doctor prove ontology
```

If it exits successfully, your file is part of the system's operational topology.