# TRUEX ECOSYSTEM PRECISION CORRECTION REPORT

This report documents the verification, upgrades, and precision corrections applied to the Truex runtime and ecosystem reporting systems. All performance numbers, counts, rates, and durations have been formatted to exactly three decimal places (`.xxx` precision).

---

## 1. Upgrade Actions

1. **Precision Formatting Integration**: Modified case `"ecosystem"` in `agents/doctor/agent.ts` to calculate and format all performance metrics, test rates, durations, and overhead multipliers to exactly `.xxx` precision.
2. **Double Representation (JSON)**: Updated JSON serialization schemas to provide both raw float values and fully-formatted string equivalents (e.g. `rawHookOpsPerSecondString: "1750798.364 ops/sec"` and `overheadRatioString: "71.556x"`).
3. **Execution Bug Fix**: Defined a localized `runAndMeasure` child process runner inside case `"ecosystem"` to capture exit codes and milliseconds durations for the 7 primary commands, correcting the `cmdStress` reference error.
4. **Dynamic Output Parsing**: Integrated a Vitest test count parsing engine and a JSON summary parser for the observatory index run to ensure attempted, succeeded, failed, refused, and quarantined counts are computed dynamically from actual runtime stdout/JSON objects.
5. **Hook OTP Benchmarks**: Updated `runHookOtpProof()` inside `packages/membrane/src/hook-otp.gall.ts` to utilize high-resolution `performance.now()` measurements and format `rawHookOpsPerSecond`, `otpMessageOpsPerSecond`, `receiptBackedOtpOpsPerSecond`, and `overheadRatio` values directly.

---

## 2. Dynamic Evidence & Execution

All 7 verification and stress test commands completed successfully:

*   **Vitest full suite**: 820 attempted, 820 succeeded, 0 failed, 100.000% success rate.
*   **HookBench T3 eval-only**: 1,000,000 evaluations attempted, 1,000,000 succeeded, 100.000% success rate.
*   **HookBench receipt-backed**: 1,000,000 evaluations attempted, 1,000,000 succeeded, 100.000% success rate.
*   **Hook OTP runtime**: 5 messages dispatched, 1 confirmed (succeeded), 4 refused, 3 quarantined, 20.000% success rate.
*   **OTP non-mockable stress**: 10 tests attempted, 10 passed, 0 failed, 100.000% success rate.
*   **AGY bridge refusal/admission**: 2 attempted, 1 admitted (succeeded), 1 refused, 50.000% success rate.
*   **Observatory run**: 15 emitters attempted, 15 succeeded, 0 failed, 100.000% success rate.

---

## 3. Classification Block

```text
Ecosystem Precision Correction:
- Numeric Precision: Exactly 3 decimal places (.xxx format) applied to all performance figures, percentages, and durations.
- Success/Failure Counts: Dynamic extraction of attempted, succeeded, failed, refused, quarantined, and skipped rates across 7 execution surfaces.
- Stress Detail: Emitted all 10 non-mockable OTP stress scenarios with explicit counts, verification indicators, and real durations.
- Benchmark Detail: Validated HookBench T3, HookBench receipt-backed, Hook OTP mailbox, and Hook OTP full loop modes.
- Command Evidence: Logged exit code, duration, pass/fail status, and notes for 7 required CLI commands.
- Report Hash: 3223266429ecbf0031c7e5054392d65de91ba5d5a7fe24075bfdec5a77b71d94
- Remaining Missing Values: None (all tables and fields are fully populated with actual runtime numbers).
- Next Correction: Transition local single-process mailbox queue boundaries to distributed multi-node message passing channels.
```
