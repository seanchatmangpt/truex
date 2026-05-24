# TRUEX Command and Stress Telemetry Report

This report compiles exact tables and raw telemetry for repository command executions and OTP stress cases based on the system run logs.

## Command Execution Telemetry

Below is the compilation of the command list execution times, exit codes, and durations retrieved from `truex-ecosystem-runtime-report.json`.

| Command | Exit Code | Duration ms | Attempted | Succeeded | Failed | Refused | Quarantined | Skipped |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `npx vitest run packages/truex-core/test/hook-otp/hook-otp-nonmockable-stress.test.ts` | 0.000 | 4233.000 | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| `npx vitest run packages/truex-core/test/hook-otp` | 0.000 | 4606.000 | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove hook-otp` | 0.000 | 1562.000 | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove benchmark` | 0.000 | 30601.000 | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove ecosystem` | 0.000 | 105535.000 | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| `TSX_DISABLE_CACHE=1 npx tsx scripts/observatory/index.ts` | 0.000 | 1608.000 | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 0.000 |
| `npx vitest run` | 0.000 | 33397.000 | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 0.000 |

---

## Stress Case Telemetry

Below is the compilation of the 10 OTP stress cases showing their attempted, passed, failed, refused, quarantined, replay converged/diverged, and receipt verified counts, retrieved from `hook-otp.stress-results.json`.

| Stress Case | Attempted | Passed | Failed | Refused | Quarantined | Replay Converged | Replay Diverged | Receipt Verified |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| FIFO Causal Chain | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 1.000 | 0.000 | 1.000 |
| Sibling Crash Containment | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 1.000 | 0.000 | 1.000 |
| Restart Budget Exhaustion | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 1.000 | 0.000 | 1.000 |
| Poison Message Quarantine | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 1.000 | 0.000 | 1.000 |
| Capacity Backpressure | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 1.000 | 0.000 | 1.000 |
| Replay Under Schedule Noise | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 1.000 | 0.000 | 1.000 |
| Tamper After Process | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 0.000 | 1.000 | 0.000 |
| Deterministic Lifecycle Hash | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 1.000 | 0.000 | 1.000 |
| Observable Artifact Integrity | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 1.000 | 0.000 | 1.000 |
| AGY Bridge Visibility | 1.000 | 1.000 | 0.000 | 0.000 | 0.000 | 1.000 | 0.000 | 1.000 |

---

## Raw Telemetry JSON Data

### Command Telemetry JSON
```json
[
  {
    "command": "npx vitest run packages/truex-core/test/hook-otp/hook-otp-nonmockable-stress.test.ts",
    "exitCode": 0,
    "durationMs": 4233,
    "durationMsString": "4233.000 ms",
    "passed": true,
    "failed": 0,
    "notes": "OTP non-mockable stress vitest run complete",
    "attempted": 1,
    "succeeded": 1,
    "refused": 0,
    "quarantined": 0,
    "skipped": 0,
    "successRatePct": 100,
    "failureRatePct": 0,
    "refusalRatePct": 0,
    "quarantineRatePct": 0,
    "successRatePctString": "100.000%",
    "failureRatePctString": "0.000%",
    "refusalRatePctString": "0.000%",
    "quarantineRatePctString": "0.000%"
  },
  {
    "command": "npx vitest run packages/truex-core/test/hook-otp",
    "exitCode": 0,
    "durationMs": 4606,
    "durationMsString": "4606.000 ms",
    "passed": true,
    "failed": 0,
    "notes": "OTP standard unit test run complete",
    "attempted": 1,
    "succeeded": 1,
    "refused": 0,
    "quarantined": 0,
    "skipped": 0,
    "successRatePct": 100,
    "failureRatePct": 0,
    "refusalRatePct": 0,
    "quarantineRatePct": 0,
    "successRatePctString": "100.000%",
    "failureRatePctString": "0.000%",
    "refusalRatePctString": "0.000%",
    "quarantineRatePctString": "0.000%"
  },
  {
    "command": "TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove hook-otp",
    "exitCode": 0,
    "durationMs": 1562,
    "durationMsString": "1562.000 ms",
    "passed": true,
    "failed": 0,
    "notes": "Doctor prove hook-otp validation complete",
    "attempted": 1,
    "succeeded": 1,
    "refused": 0,
    "quarantined": 0,
    "skipped": 0,
    "successRatePct": 100,
    "failureRatePct": 0,
    "refusalRatePct": 0,
    "quarantineRatePct": 0,
    "successRatePctString": "100.000%",
    "failureRatePctString": "0.000%",
    "refusalRatePctString": "0.000%",
    "quarantineRatePctString": "0.000%"
  },
  {
    "command": "TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove benchmark",
    "exitCode": 0,
    "durationMs": 30601,
    "durationMsString": "30601.000 ms",
    "passed": true,
    "failed": 0,
    "notes": "Doctor prove benchmark validation complete",
    "attempted": 1,
    "succeeded": 1,
    "refused": 0,
    "quarantined": 0,
    "skipped": 0,
    "successRatePct": 100,
    "failureRatePct": 0,
    "refusalRatePct": 0,
    "quarantineRatePct": 0,
    "successRatePctString": "100.000%",
    "failureRatePctString": "0.000%",
    "refusalRatePctString": "0.000%",
    "quarantineRatePctString": "0.000%"
  },
  {
    "command": "TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove ecosystem",
    "exitCode": 0,
    "durationMs": 105535,
    "durationMsString": "105535.000 ms",
    "passed": true,
    "failed": 0,
    "notes": "Self-invocation doctor ecosystem proof wrapper",
    "attempted": 1,
    "succeeded": 1,
    "refused": 0,
    "quarantined": 0,
    "skipped": 0,
    "successRatePct": 100,
    "failureRatePct": 0,
    "refusalRatePct": 0,
    "quarantineRatePct": 0,
    "successRatePctString": "100.000%",
    "failureRatePctString": "0.000%",
    "refusalRatePctString": "0.000%",
    "quarantineRatePctString": "0.000%"
  },
  {
    "command": "TSX_DISABLE_CACHE=1 npx tsx scripts/observatory/index.ts",
    "exitCode": 0,
    "durationMs": 1608,
    "durationMsString": "1608.000 ms",
    "passed": true,
    "failed": 0,
    "notes": "Observatory emitters fact generation complete",
    "attempted": 1,
    "succeeded": 1,
    "refused": 0,
    "quarantined": 0,
    "skipped": 0,
    "successRatePct": 100,
    "failureRatePct": 0,
    "refusalRatePct": 0,
    "quarantineRatePct": 0,
    "successRatePctString": "100.000%",
    "failureRatePctString": "0.000%",
    "refusalRatePctString": "0.000%",
    "quarantineRatePctString": "0.000%"
  },
  {
    "command": "npx vitest run",
    "exitCode": 0,
    "durationMs": 33397,
    "durationMsString": "33397.000 ms",
    "passed": true,
    "failed": 0,
    "notes": "Repository test suite validation complete",
    "attempted": 1,
    "succeeded": 1,
    "refused": 0,
    "quarantined": 0,
    "skipped": 0,
    "successRatePct": 100,
    "failureRatePct": 0,
    "refusalRatePct": 0,
    "quarantineRatePct": 0,
    "successRatePctString": "100.000%",
    "failureRatePctString": "0.000%",
    "refusalRatePctString": "0.000%",
    "quarantineRatePctString": "0.000%"
  }
]
```

### Stress Cases Telemetry JSON
```json
[
  {
    "name": "FIFO Causal Chain",
    "attempted": 1,
    "passed": 1,
    "failed": 0,
    "refused": 0,
    "quarantined": 0,
    "replayConverged": 1,
    "receiptVerified": 1,
    "reported": 1,
    "durationMs": 89
  },
  {
    "name": "Sibling Crash Containment",
    "attempted": 1,
    "passed": 1,
    "failed": 0,
    "refused": 0,
    "quarantined": 0,
    "replayConverged": 1,
    "receiptVerified": 1,
    "reported": 1,
    "durationMs": 2
  },
  {
    "name": "Restart Budget Exhaustion",
    "attempted": 1,
    "passed": 1,
    "failed": 0,
    "refused": 0,
    "quarantined": 0,
    "replayConverged": 1,
    "receiptVerified": 1,
    "reported": 1,
    "durationMs": 0
  },
  {
    "name": "Poison Message Quarantine",
    "attempted": 1,
    "passed": 1,
    "failed": 0,
    "refused": 0,
    "quarantined": 0,
    "replayConverged": 1,
    "receiptVerified": 1,
    "reported": 1,
    "durationMs": 0
  },
  {
    "name": "Capacity Backpressure",
    "attempted": 1,
    "passed": 1,
    "failed": 0,
    "refused": 0,
    "quarantined": 0,
    "replayConverged": 1,
    "receiptVerified": 1,
    "reported": 1,
    "durationMs": 1
  },
  {
    "name": "Replay Under Schedule Noise",
    "attempted": 1,
    "passed": 1,
    "failed": 0,
    "refused": 0,
    "quarantined": 0,
    "replayConverged": 1,
    "receiptVerified": 1,
    "reported": 1,
    "durationMs": 1
  },
  {
    "name": "Tamper After Process",
    "attempted": 1,
    "passed": 1,
    "failed": 0,
    "refused": 0,
    "quarantined": 0,
    "replayConverged": 0,
    "receiptVerified": 0,
    "reported": 1,
    "durationMs": 0
  },
  {
    "name": "Deterministic Lifecycle Hash",
    "attempted": 1,
    "passed": 1,
    "failed": 0,
    "refused": 0,
    "quarantined": 0,
    "replayConverged": 1,
    "receiptVerified": 1,
    "reported": 1,
    "durationMs": 42
  },
  {
    "name": "Observable Artifact Integrity",
    "attempted": 1,
    "passed": 1,
    "failed": 0,
    "refused": 0,
    "quarantined": 0,
    "replayConverged": 1,
    "receiptVerified": 1,
    "reported": 1,
    "durationMs": 24
  },
  {
    "name": "AGY Bridge Visibility",
    "attempted": 1,
    "passed": 1,
    "failed": 0,
    "refused": 0,
    "quarantined": 0,
    "replayConverged": 1,
    "receiptVerified": 1,
    "reported": 1,
    "durationMs": 4188
  }
]
```
