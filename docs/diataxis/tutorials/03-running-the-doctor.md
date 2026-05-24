# Tutorial 3: Running the Truex Doctor

The Doctor is Truex's autonomic verification system. It ensures your implementation follows the Gall sequencing laws.

## Step 1: Prove the Hook Primitive
Run the doctor to mathematically prove that your hook definitions satisfy the Truex Property Standard (TPS).

```bash
npx tsx scripts/truex.ts doctor prove hook
```

## Step 2: Read the Report
Check `docs/vision2030/hook-proof.report.json` to view the empirical evidence that your hook converges, survives tampered inputs, and correctly identifies capacity breaches.

## Step 3: Prove the Ontology
Truex enforces that every file is mapped in the Operational Ontology.

```bash
npx tsx scripts/truex.ts doctor prove ontology
```

If you add a new file without a test or an observatory emitter, the doctor will fail and report an orphaned artifact.