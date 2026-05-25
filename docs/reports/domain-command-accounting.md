# Domain Command Accounting Report

This report presents the accounting metrics for the command executions recorded in `docs/reports/truex-ecosystem-runtime-report.json` as of 2026-05-23.

> [!NOTE]
> This accounting strictly tracks command-level execution outcomes (`command_invocation` unit). 
> Internal OTP runtime/agent supervisor refusals and quarantines are domain-level protocol behaviors and are excluded from these execution statistics, as they do not constitute command failures.

---

## Command Invocation Accounting Table

| # | Command | Attempted | Succeeded (Exit 0) | Failed (Exit != 0) | Duration (Actual) | Notes / Context |
|---|:---|:---:|:---:|:---:|:---:|:---|
| 1 | `npx vitest run packages/membrane/test/hook-otp/hook-otp-nonmockable-stress.test.ts` | 1 | 1 | 0 | 4,233.000 ms | OTP non-mockable stress vitest run complete |
| 2 | `npx vitest run packages/membrane/test/hook-otp` | 1 | 1 | 0 | 4,606.000 ms | OTP standard unit test run complete |
| 3 | `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove hook-otp` | 1 | 1 | 0 | 1,562.000 ms | Doctor prove hook-otp validation complete |
| 4 | `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove benchmark` | 1 | 1 | 0 | 30,601.000 ms | Doctor prove benchmark validation complete |
| 5 | `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove ecosystem` | 1 | 1 | 0 | 105,535.000 ms | Self-invocation doctor ecosystem proof wrapper |
| 6 | `TSX_DISABLE_CACHE=1 npx tsx scripts/observatory/index.ts` | 1 | 1 | 0 | 1,608.000 ms | Observatory emitters fact generation complete |
| 7 | `npx vitest run` | 1 | 1 | 0 | 33,397.000 ms | Repository test suite validation complete |
| **Total** | **All Commands** | **7** | **7** | **0** | **181,542.000 ms** | **All invocations succeeded** |

---

## Verification Proof

We verify the alignment of attempted command executions against the outcomes:

$$\text{Succeeded} + \text{Failed} = \text{Attempted}$$

- **Succeeded**: $7$
- **Failed**: $0$
- **Attempted**: $7$

Verification Equation:
$$7 + 0 = 7$$

> [!TIP]
> **Verification Status**: **PASSED**
> The sum of successful and failed executions matches the total attempted command invocations exactly.

---

## Accounting vs. Domain Refusals

It is critical to distinguish **command execution failures** from **internal domain-level refusals**:
* **Command Execution**: Represents the process running to completion. In this log, all 7 commands finished with an exit code of `0`, translating to 100% command success.
* **Domain Refusals & Quarantines**: There were 16 refusals and 6 quarantines recorded in the ecosystem (specifically in Hook OTP runtimes, stress cases, and the AGY bridge). These indicate that the Truex system successfully detected and quarantined poison messages, tampered receipts, or unauthorized proposals. These are defensive, lawful behaviors of the substrate and are reported as test successes (exit code 0), not command execution failures.

---

## Raw JSON Accounting Data

Below is the raw JSON schema compiled from the source report for programmatic ingestion.

```json
{
  "unit": "command_invocation",
  "metrics": {
    "attempted": 7,
    "succeeded": 7,
    "failed": 0
  },
  "verification": {
    "formula": "Succeeded + Failed == Attempted",
    "leftHandSide": 7,
    "rightHandSide": 7,
    "valid": true
  },
  "commands": [
    {
      "command": "npx vitest run packages/membrane/test/hook-otp/hook-otp-nonmockable-stress.test.ts",
      "exitCode": 0,
      "durationMs": 4233,
      "durationMsString": "4233.000 ms",
      "status": "Succeeded"
    },
    {
      "command": "npx vitest run packages/membrane/test/hook-otp",
      "exitCode": 0,
      "durationMs": 4606,
      "durationMsString": "4606.000 ms",
      "status": "Succeeded"
    },
    {
      "command": "TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove hook-otp",
      "exitCode": 0,
      "durationMs": 1562,
      "durationMsString": "1562.000 ms",
      "status": "Succeeded"
    },
    {
      "command": "TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove benchmark",
      "exitCode": 0,
      "durationMs": 30601,
      "durationMsString": "30601.000 ms",
      "status": "Succeeded"
    },
    {
      "command": "TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove ecosystem",
      "exitCode": 0,
      "durationMs": 105535,
      "durationMsString": "105535.000 ms",
      "status": "Succeeded"
    },
    {
      "command": "TSX_DISABLE_CACHE=1 npx tsx scripts/observatory/index.ts",
      "exitCode": 0,
      "durationMs": 1608,
      "durationMsString": "1608.000 ms",
      "status": "Succeeded"
    },
    {
      "command": "npx vitest run",
      "exitCode": 0,
      "durationMs": 33397,
      "durationMsString": "33397.000 ms",
      "status": "Succeeded"
    }
  ]
}
```
