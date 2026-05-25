# Truex Runtime Evidence Extractor Report

## Section One: Overview and Telemetry Metadata

This report extracts and validates the runtime evidence collected from the Truex ecosystem. All performance measurements, transaction counts, rates, memory deltas, and durations are formatted to exactly three decimal places (`3.000` decimals) in compliance with Truex architectural standards.

### System Telemetry Invariants
- **Platform OS**: `darwin` (macOS arm-Sixty-Four)
- **Node.js Version**: `vTwentyFour.Fifteen.Zero`
- **CPU Architecture**: `arm-Sixty-Four` (Apple M-Three Max CPU)
- **Primary Report Timestamp**: `May Twenty-Fourth, Twenty-Twenty-Six at Zero Hours, Twenty-Six Minutes, Twenty Seconds, and One-Hundred-Fifty-Eight Milliseconds Coordinated Universal Time (UTC)`
- **Ecosystem Report Hash**: Stored in `truex-ecosystem-runtime-report.json` and cryptographically validated
- **Hook OTP Report Hash**: Stored in `hook-otp.report.json` and cryptographically validated
- **HookBench Full Report Hash**: Stored in `hookbench.full-report.json` and cryptographically validated

---

## Section Two: Ecosystem Execution Surface Accounting

This table summarizes the overall counts across all seven execution surfaces from `truex-ecosystem-runtime-report.json`.

| Execution Surface | Attempted | Succeeded | Failed | Refused | Quarantined | Skipped | Success Rate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Ecosystem Aggregate** | `2000852.000` | `2000847.000` | `0.000` | `16.000` | `6.000` | `0.000` | `100.000%` |
| **Vitest Full Suite** | `820.000` | `820.000` | `0.000` | `0.000` | `0.000` | `0.000` | `100.000%` |
| **HookBench T3 (Eval-Only)** | `1000000.000` | `1000000.000` | `0.000` | `0.000` | `0.000` | `0.000` | `100.000%` |
| **HookBench (Receipt-Backed)** | `1000000.000` | `1000000.000` | `0.000` | `0.000` | `0.000` | `0.000` | `100.000%` |
| **Hook OTP Runtime** | `5.000` | `1.000` | `0.000` | `4.000` | `3.000` | `0.000` | `20.000%` |
| **OTP Non-Mockable Stress** | `10.000` | `10.000` | `0.000` | `11.000` | `3.000` | `0.000` | `100.000%` |
| **AGY Bridge Refusal/Admission** | `2.000` | `1.000` | `0.000` | `1.000` | `0.000` | `0.000` | `50.000%` |
| **Observatory Run** | `15.000` | `15.000` | `0.000` | `0.000` | `0.000` | `0.000` | `100.000%` |

---

## Section Three: HookBench Microbenchmark Performance (T0-T3 Tiers)

Extracted metrics from `hookbench.full-report.json` evaluating the four performance tiers:

| Tier | Registered Hooks | Processed Deltas | Total Evaluations | Matched Hooks | Receipts | Duration (ms) | Throughput (evals/sec) | Memory Delta (MB) | Match Rate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **T0 (Baseline)** | `1.000` | `1.000` | `1.000` | `1.000` | `1.000` | `0.099` | `10075.567` | `0.200` | `100.000%` |
| **T1 (Small)** | `100.000` | `100.000` | `10000.000` | `52.000` | `52.000` | `4.170` | `2398320.792` | `12.258` | `0.520%` |
| **T2 (Medium)** | `1000.000` | `1000.000` | `1000000.000` | `493.000` | `493.000` | `61.382` | `16291398.909` | `-5.266` | `0.049%` |
| **T3 (Large Eval)** | `1000.000` | `1000.000` | `1000000.000` | `493.000` | `0.000` | `16.655` | `60040828.965` | `-8.037` | `0.049%` |

---

## Section Four: Hook OTP Concurrency and Consequence Metrics

Extracted metrics showing OTP mailbox and supervision concurrency throughput and overhead:

| Benchmark Surface | Mode | Registered Hooks | Processed Deltas | Total Evaluations | Matched Hooks | Receipts | Duration (ms) | Throughput (ops/sec) | Memory Delta (MB) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hook OTP Mailbox** | `eval-only` | `1.000` | `500.000` | `500.000` | `500.000` | `0.000` | `0.074` | `6764343.791` | `0.000` |
| **Hook OTP Full Loop** | `receipt-backed` | `1.000` | `500.000` | `500.000` | `500.000` | `500.000` | `13.249` | `37738.578` | `0.000` |

---

## Section Five: Command Verification Audit

Duration and status for the seven CLI commands executed during ecosystem validation:

| Verification Command | Exit Code | Passed | Failed | Duration (ms) | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `vitest run hook-otp-nonmockable-stress.test` | `0.000` | `true` | `false` | `4200.000` | OTP non-mockable stress vitest run complete |
| `vitest run packages/membrane/test/hook-otp` | `0.000` | `true` | `false` | `3990.000` | OTP standard unit test run complete |
| `truex doctor prove hook-otp` | `0.000` | `true` | `false` | `1500.000` | Doctor prove hook-otp validation complete |
| `truex doctor prove benchmark` | `0.000` | `true` | `false` | `1823.000` | Doctor prove benchmark validation complete |
| `truex doctor prove ecosystem` | `0.000` | `true` | `false` | `21618.000` | Self-invocation doctor ecosystem proof wrapper |
| `node scripts/observatory/index.ts` | `0.000` | `true` | `false` | `1654.000` | Observatory emitters fact generation complete |
| `vitest run` | `0.000` | `true` | `false` | `8175.000` | Repository test suite validation complete |

---

## Section Six: Non-Mockable Stress Scenarios Evidence

Detailing the ten stress scenarios executed during the non-mockable OTP stress sweep:

| Stress Case ID | Scenario Name | Attempted | Passed | Failed | Refused | Quarantined | Replay Converged | Receipt Verified | Duration (ms) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1.000** | FIFO Causal Chain | `1.000` | `1.000` | `0.000` | `0.000` | `0.000` | `1.000` | `1.000` | `59.000` |
| **2.000** | Sibling Crash Containment | `1.000` | `1.000` | `0.000` | `1.000` | `0.000` | `1.000` | `1.000` | `0.000` |
| **3.000** | Restart Budget Exhaustion | `1.000` | `1.000` | `0.000` | `4.000` | `1.000` | `1.000` | `1.000` | `0.000` |
| **4.000** | Poison Message Quarantine | `1.000` | `1.000` | `0.000` | `1.000` | `1.000` | `1.000` | `1.000` | `0.000` |
| **5.000** | Capacity Backpressure | `1.000` | `1.000` | `0.000` | `1.000` | `0.000` | `1.000` | `1.000` | `1.000` |
| **6.000** | Replay Under Schedule Noise | `1.000` | `1.000` | `0.000` | `0.000` | `0.000` | `1.000` | `1.000` | `1.000` |
| **7.000** | Tamper After Process | `1.000` | `1.000` | `0.000` | `0.000` | `0.000` | `0.000` | `0.000` | `0.000` |
| **8.000** | Deterministic Lifecycle Hash | `1.000` | `1.000` | `0.000` | `3.000` | `1.000` | `1.000` | `1.000` | `29.000` |
| **9.000** | Observable Artifact Integrity | `1.000` | `1.000` | `0.000` | `0.000` | `0.000` | `1.000` | `1.000` | `14.000` |
| **10.000** | AGY Bridge Visibility | `1.000` | `1.000` | `0.000` | `1.000` | `0.000` | `1.000` | `1.000` | `2951.000` |

---

## Section Seven: Discrepancies and Gap Reporting

During extraction, several discrepancies were identified between the raw JSON metrics (`hook-otp.report.json`) and the compiled markdown validation synthesis (`OTP-NONMOCKABLE-STRESS-SYNTHESIS.md`). These differences must be synchronized in future code generation sweeps.

| Metric Parameter | Value in `hook-otp.report.json` | Value in `OTP-NONMOCKABLE-STRESS-SYNTHESIS.md` | Discrepancy Status |
| :--- | :--- | :--- | :--- |
| **Raw Hook Ops/Sec** | `16506008.187` | `1665046.022` | Mismatch (`10.000` ratio difference) |
| **Receipt-Backed OTP Ops/Sec** | `10976.868` | `37738.578` | Mismatch (`3.000` speed difference) |
| **Overhead Ratio** | `1503.708` | `44.121` | Mismatch (Overhead calculation mismatch) |

```json
{
  "missing": true,
  "reason": "Mismatched benchmark execution runs and parameters between raw JSON metrics and compiled synthesis reports. The CodeGeneratorCorrector must reconcile the raw hook execution ops/sec metric reporting formulas in the stress runner and the main test suite to ensure single-source-of-truth convergence.",
  "gaps": [
    {
      "parameter": "rawHookOpsPerSecond",
      "action": "Ensure that the stress-test framework uses the same high-resolution timer duration logic as the benchmark suite, aligning the 16.500 million vs 1.600 million measurements."
    },
    {
      "parameter": "receiptBackedOtpOpsPerSecond",
      "action": "Align process-mailbox size and message counts used to compute throughput across all OTP validation sweeps."
    }
  ]
}
```
