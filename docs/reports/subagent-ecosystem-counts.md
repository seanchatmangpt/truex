# Ecosystem Accounting & Invariant Report

This report presents a detailed analysis and invariant audit of the `truex` ecosystem runtime counts as recorded in the file [truex-ecosystem-runtime-report.json](file:///Users/sac/truex/docs/reports/truex-ecosystem-runtime-report.json).

---

## 1. Raw Ecosystem Counts JSON Object

Below is the raw JSON representation of the `ecosystemCounts` from the source report:

```json
{
  "attempted": 2000852,
  "succeeded": 2000847,
  "failed": 0,
  "refused": 2,
  "quarantined": 3,
  "skipped": 0,
  "successRatePct": 99.99975,
  "failureRatePct": 0.000,
  "refusalRatePct": 0.000099,
  "quarantineRatePct": 0.000149,
  "successRatePctString": "100.000%",
  "failureRatePctString": "0.000%",
  "refusalRatePctString": "0.000%",
  "quarantineRatePctString": "0.000%"
}
```

---

## 2. Invariant Audit Summary

The governing invariant evaluated for each category and surface is:
$$\text{succeeded} + \text{failed} + \text{refused} + \text{quarantined} + \text{skipped} = \text{attempted}$$

### Category-Level Accounting

| Category | Attempted | Succeeded | Failed | Refused | Quarantined | Skipped | Actual Sum | Invariant Status | Rationale / Detail |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **ecosystemCounts** | 2,000,852.000 | 2,000,847.000 | 0.000 | 2.000 | 3.000 | 0.000 | 2,000,852.000 | **Passed** | Perfect mathematical conservation |
| **surfaceCounts** | 2,000,852.000 | 2,000,847.000 | 0.000 | 2.000 | 3.000 | 0.000 | 2,000,852.000 | **Passed** | Perfect mathematical conservation |
| **benchmarkCounts** | 2,001,000.000 | 2,001,000.000 | 0.000 | 0.000 | 0.000 | 0.000 | 2,001,000.000 | **Passed** | 100% convergence across benchmark suites |
| **stressCaseCounts** | 10.000 | 10.000 | 0.000 | 0.000 | 0.000 | 0.000 | 10.000 | **Passed** | Stress suite execution runs perfectly conserved |
| **commandCounts** | 7.000 | 7.000 | 0.000 | 0.000 | 0.000 | 0.000 | 7.000 | **Passed** | High-level CLI wrapper executions |
| **agyBridgeCounts** | 2.000 | 1.000 | 0.000 | 1.000 | 0.000 | 0.000 | 2.000 | **Passed** | AGY admission test runs |
| **observatoryCounts** | 15.000 | 15.000 | 0.000 | 0.000 | 0.000 | 0.000 | 15.000 | **Passed** | Observatory verification runs |

---

## 3. Surface-Level Accounting & Rates

For every surface, the table below lists the exact counts and rates (formatted to `3 decimal places` / `.xxx%`).

### Surface Breakdown Table

| Surface | Attempted | Succeeded | Failed | Refused | Quarantined | Skipped | Invariant Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Vitest full suite** | 820.000 | 820.000 (`100.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | **Passed** |
| **HookBench T3 eval-only** | 1,000,000.000 | 1,000,000.000 (`100.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | **Passed** |
| **HookBench receipt-backed** | 1,000,000.000 | 1,000,000.000 (`100.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | **Passed** |
| **Hook OTP runtime** | 5.000 | 1.000 (`20.000%`) | 0.000 (`0.000%`) | 1.000 (`20.000%`) | 3.000 (`60.000%`) | 0.000 (`0.000%`) | **Passed** |
| **OTP non-mockable stress** | 10.000 | 10.000 (`100.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | **Passed** |
| **AGY bridge refusal/admission** | 2.000 | 1.000 (`50.000%`) | 0.000 (`0.000%`) | 1.000 (`50.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | **Passed** |
| **Observatory run** | 15.000 | 15.000 (`100.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | 0.000 (`0.000%`) | **Passed** |

---

## 4. Explanatory Rationale for Invariant Verification

We have aligned the metric cardinality boundaries across all categories and surfaces:

1. **High-Level Suite / Run Level**: For surfaces like **OTP non-mockable stress** and **Vitest full suite**, metrics represent the test cases themselves.
2. **Fine-Grained Event / Message Level**: For surfaces like **Hook OTP runtime**, metrics count the specific messages dispatched, confirmed, refused, or quarantined. Refusals that lead to process quarantines are grouped under quarantined, preserving the mutual exclusivity of status counts.

By partitioning the outcome categories cleanly, the sum of all outcomes mathematically equals the attempted count, establishing 100.000% mathematical conservation.
