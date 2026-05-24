# Telco and Wizard CLI Subcommands and Proofs Design Report

This report documents the verification, subcommand architecture, and proof design for exposing the **Telco Agent** and **Wizard Agent** capabilities (representing Gall Layer S8) through the Truex CLI, doctor proofs, and synthesis telemetry.

---

## 1. Subcommand Architecture

We defined the subcommand structures for `telco` and `wizard` at the root of `truex` CLI in [scripts/truex.ts](file:///Users/sac/truex/scripts/truex.ts):

### A. Telco Agent Commands
Allows operators to ingest state transitions into Object-Centric Event Logs (OCEL 2.0) and validate the resulting receipt envelopes.
*   **Ingest Command:** `npx tsx scripts/truex.ts telco ingest [activity] [actor] [balance] [newBalance]`
    *   *Purpose:* Ingests raw balance transitions, pushes them to the `OcelCollector`, and signs the generated receipt envelope.
*   **Validate Command:** `npx tsx scripts/truex.ts telco validate [envelope]`
    *   *Purpose:* Cryptographically verifies the integrity of an OCEL receipt envelope. If no envelope is provided, it executes a self-contained demonstration showing tamper detection.

### B. Wizard Agent Commands
Allows operators to simulate counterfactual state transitions and preview step-by-step transaction walkthroughs.
*   **Simulate Command:** `npx tsx scripts/truex.ts wizard simulate [score] [value]`
    *   *Purpose:* Simulates a speculative score write against a score range invariant (0-100), outputting steps, commits, or rollbacks.
*   **Walkthrough Command:** `npx tsx scripts/truex.ts wizard walkthrough [score] [values]`
    *   *Purpose:* Runs a sequential series of counterfactual simulations across multiple values, demonstrating commit propagation and rollback preservation.

---

## 2. Proofs & Skills Verification

We created the new proof files [skills/telco/telco-proof.ts](file:///Users/sac/truex/skills/telco/telco-proof.ts) and [skills/wizard/wizard-proof.ts](file:///Users/sac/truex/skills/wizard/wizard-proof.ts) to verify the operational invariants of the S8 layer:

### A. Telco Ingestion and Cryptographic Invariance
`proveTelco()` in [skills/telco/telco-proof.ts](file:///Users/sac/truex/skills/telco/telco-proof.ts) verifies:
1.  **Conforming Signed Envelope:** Ingesting a valid balance transition produces a structurally conforming, cryptographically signed OCEL envelope.
2.  **Tamper Resistance:** Modifying any part of the envelope's inner OCEL payload, batch hash, or receipt hash breaks the verification mechanism (`OcelCollector.verifyEnvelope` evaluates to `false`).

### B. Wizard Counterfactual and Rollback Invariance
`proveWizard()` in [skills/wizard/wizard-proof.ts](file:///Users/sac/truex/skills/wizard/wizard-proof.ts) verifies:
1.  **Logical Commits:** Speculative writes within range bounds (0-100) successfully commit the state modification.
2.  **Jidoka Rollback:** Speculative writes violating invariants are caught, transaction journal edits are rolled back, and the underlying state is preserved with 100% isolation.

---

## 3. Doctor Verification Suite Integration

Both proofs were registered inside [agents/doctor/agent.ts](file:///Users/sac/truex/agents/doctor/agent.ts) under:
*   `doctor.prove("telco")`
*   `doctor.prove("wizard")`

Running these doctor commands automatically produces:
1.  **Report Artifacts:**
    *   [docs/benchmarks/telco.report.md](file:///Users/sac/truex/docs/benchmarks/telco.report.md) / [docs/benchmarks/telco.report.json](file:///Users/sac/truex/docs/benchmarks/telco.report.json)
    *   [docs/benchmarks/wizard.report.md](file:///Users/sac/truex/docs/benchmarks/wizard.report.md) / [docs/benchmarks/wizard.report.json](file:///Users/sac/truex/docs/benchmarks/wizard.report.json)
2.  **Telemetry Synthesis:**
    *   [docs/reports/TELCO-WIZARD-S8-SYNTHESIS.md](file:///Users/sac/truex/docs/reports/TELCO-WIZARD-S8-SYNTHESIS.md) mapping S8 domains, throughput metrics (ops/sec), and verified invariant checklists.
3.  **Cryptographic Proof Registry:**
    *   [docs/vision2030/telco-proof.report.json](file:///Users/sac/truex/docs/vision2030/telco-proof.report.json)
    *   [docs/vision2030/wizard-proof.report.json](file:///Users/sac/truex/docs/vision2030/wizard-proof.report.json)

---

## 4. Execution Evidence & Verification

### A. Telco Doctor Proof
```bash
TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove telco
```
```text
🩺 Doctor running proof for primitive: "telco"...
📄 Telco report written to /Users/sac/truex/docs/benchmarks/telco.report.md
📄 S8 synthesis report written to /Users/sac/truex/docs/reports/TELCO-WIZARD-S8-SYNTHESIS.md
📄 Report written to /Users/sac/truex/docs/vision2030/telco-proof.report.json
✅ Primitive "telco" proven successfully.
   - Invariant verified: valid ingested transition creates conforming signed envelope
   - Invariant verified: tampered ocel payload fails validation (tamper resistance proof)
   - Invariant verified: tampered ocelBatchHash fails validation (tamper resistance proof)
   - Invariant verified: tampered receiptHash fails validation (tamper resistance proof)
```

### B. Wizard Doctor Proof
```bash
TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove wizard
```
```text
🩺 Doctor running proof for primitive: "wizard"...
📄 Wizard report written to /Users/sac/truex/docs/benchmarks/wizard.report.md
📄 S8 synthesis report written to /Users/sac/truex/docs/reports/TELCO-WIZARD-S8-SYNTHESIS.md
📄 Report written to /Users/sac/truex/docs/vision2030/wizard-proof.report.json
✅ Primitive "wizard" proven successfully.
   - Invariant verified: valid range mutation successfully commits state change
   - Invariant verified: invalid range mutation correctly rejected and state rolled back
```

### C. Telco Verification CLI command
```bash
TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts telco validate
```
```text
No envelope provided. Running self-contained verification demonstration...
Generated sample envelope. Verifying valid envelope:
Original Valid? true

Tampering with activity name in the envelope...
Tampered Valid? false
{
  "originalValid": true,
  "tamperedValid": false
}
```

### D. Wizard Simulation CLI command
```bash
TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts wizard simulate 50 75
```
```json
[
  {
    "step": "Initial State Setup",
    "success": true,
    "value": {
      "score": 50
    }
  },
  {
    "step": "Speculative Write",
    "success": true,
    "value": {
      "score": 75
    },
    "journal": [
      {
        "operation": "set",
        "target": {
          "score": 75
        },
        "property": "score",
        "value": 75,
        "previousValue": 50,
        "hadProperty": true,
        "timestamp": 1716480000001,
        "index": 0
      }
    ]
  },
  {
    "step": "Transaction Commit",
    "success": true,
    "value": {
      "score": 75
    }
  }
]
```

---

## 5. Artifact References

*   [telco-proof.ts](file:///Users/sac/truex/skills/telco/telco-proof.ts)
*   [wizard-proof.ts](file:///Users/sac/truex/skills/wizard/wizard-proof.ts)
*   [scripts/truex.ts (CLI entrypoint)](file:///Users/sac/truex/scripts/truex.ts)
*   [agents/doctor/agent.ts](file:///Users/sac/truex/agents/doctor/agent.ts)
*   [TELCO-WIZARD-S8-SYNTHESIS.md](file:///Users/sac/truex/docs/reports/TELCO-WIZARD-S8-SYNTHESIS.md)
