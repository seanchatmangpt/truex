# Project Status: ml
> **Path:** `packages/ml`
> **Status:** Prototype

## Current State
The **ml** package provides the predictive monitoring and anomaly detection capabilities for the Truex substrate. It is currently in the **Prototype** stage, with focus on algorithm selection and drift detection.

## Proven Invariants
- **Algorithm Selection Parity:** The system successfully selects the optimal process mining algorithm based on the scaling requirements of the trace batch.
- **Overfitting Prevention:** The overfitting detector prevents model drift by validating model performance against independent cross-validation sets.
- **Trace Anomaly Detection:** Isolation Forest models correctly identify traces with abnormal durations or behavior patterns as unfit.

## Combinatorial Role
The ML layer serves as the **Observatory Intelligence**. It consumes traces and receipts from the **Kernel** (Tier 1) and provides feedback to the **Planner** (Tier 3) to optimize project manufacturing routes.

## Final Execution Path
- **Phase 2: POWL-Discovery Integration:** Wiring the ML-based POWL discovery into the `truex-doctor` pipeline to autonomously mine operating laws from simulation traces.

## Jidoka Status
Detection of significant model drift or data quality degradation triggers a **Retraining Event**. If the accuracy falls below the established threshold, the system flags the current prediction as "Untrusted," preventing it from influencing autonomic decisions.
