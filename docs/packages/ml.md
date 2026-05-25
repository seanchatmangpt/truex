# Package: @truex/ml

> **Path:** `packages/ml/`
> **Gall Classification:** S₄ - Process Intelligence

## 1. Product Thesis

The ML package provides **Native ML-powered Process Mining Analysis**. It implements high-performance algorithms for classification, clustering, forecasting, and anomaly detection directly atop the Truex substrate. It leverages the deterministic outputs of the Kernel to identify behavioral patterns and process drifts, providing the analytical intelligence required for autonomic remediation.

## 2. Key Invariants

* **MLI-1 (Data Parity):** All ML models must be trained exclusively on receipted OCEL 2.0 evidence.
* **MLI-2 (Deterministic Inference):** Model inference must yield identical results for identical process trajectories across all nodes.

## 3. Verbs / Commands

* `ml.classify(trace)`: Assigns a behavioral class to a process trajectory.
* `ml.forecast(state)`: Predicts the next most likely operational consequence.

## 4. Refusal Conditions

The ML engine refuses an analysis if:
* The input trace contains unreceipted or tampered events.
* The required model weights fail a cryptographic provenance check.

## 5. Proof Command

```bash
pnpm --filter @truex/ml test
```