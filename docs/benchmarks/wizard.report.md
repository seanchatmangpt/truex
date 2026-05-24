# Wizard Agent Counterfactual Transaction Simulation Report

## Executive Summary
- **Case:** wizard-counterfactual-simulation
- **Status:** ✅ Passed
- **Layer:** S8
- **Report Hash:** db50d5736a78c99b1629cec7da4274f1cd7daf4d9bcf04cdf2fd6bcdf42864f6

## Operational Metrics
| Metric | Value |
|--------|-------|
| Simulations Run | 1000.000 |
| Valid Commits | 500.000 |
| Invalid Rollbacks | 500.000 |
| Simulation Duration (ms) | 248.639 |
| Simulation Throughput (ops/sec) | 4021.890 |

## Validated Invariants
*   **Invariant:** valid range mutation successfully commits state change
*   **Invariant:** invalid range mutation correctly rejected and state rolled back
*   **Invariant:** project cell initialization creates config structure
*   **Invariant:** project topology mapper scans files and outputs C4 diagrams
*   **Invariant:** checkpoint planner creates agent checkpoints and rejects vague inputs
*   **Invariant:** verification of all checkpoints, facts, reports, and ledger files complete and valid