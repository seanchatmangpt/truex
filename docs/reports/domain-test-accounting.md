# Domain Test Accounting Report

This report compiles the test-case level outcomes across the TRUEX ecosystem runtime and test suites. All metrics in this report declare the unit explicitly as `test_case`. Commands, message-level details, and benchmark evaluations are decoupled and excluded from these calculations to ensure precise accounting of test execution states.

> [!NOTE]
> All figures and tables in this report declare the unit explicitly as **`test_case`**.
> Terminal states of a `test_case` are mutually exclusive: a test case can only be in one of the states `Passed`, `Failed`, or `Skipped` at the end of its execution.

---

## 1. Domain Test Outcomes Table

| Test Suite / Surface | Unit | Attempted | Passed | Failed | Skipped | Terminal State Mutual Exclusivity Verification |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Vitest Full Suite** | `test_case` | 820 | 820 | 0 | 0 | $$820 + 0 + 0 = 820$$ (Verified) |
| **Truex Observatory Emitters** | `test_case` | 15 | 15 | 0 | 0 | $$15 + 0 + 0 = 15$$ (Verified) |
| **CONSOLIDATED TOTAL** | `test_case` | **835** | **835** | **0** | **0** | **$$835 + 0 + 0 = 835$$ (Verified)** |

### Formula Verification
$$\text{Passed} + \text{Failed} + \text{Skipped} = \text{Attempted}$$

- **Vitest Full Suite**: $$820 + 0 + 0 = 820$$ -> **Passed (Equation Holds)**
- **Truex Observatory**: $$15 + 0 + 0 = 15$$ -> **Passed (Equation Holds)**
- **Consolidated Total**: $$835 + 0 + 0 = 835$$ -> **Passed (Equation Holds)**

---

## 2. Test Suite Breakdown

### A. Vitest Full Suite
The Vitest test runner executes the unit, property-based, and integration test suites. It covers core primitives (`hash`, `receipt`, `replay`, `engine`, `sqlite`, `membrane`, `adapter`, `hook`, and `repository`).
- **Total Test Files**: 72
- **Total Test Cases (`test_case`)**: 820
- **Passed**: 820
- **Failed**: 0
- **Skipped**: 0

*Note: This suite includes the 10 stress test cases run within `hook-otp-nonmockable-stress.test.ts` (e.g. FIFO Causal Chain, Sibling Crash Containment, Restart Budget Exhaustion, Poison Message Quarantine, Capacity Backpressure, Replay Under Schedule Noise, Tamper After Process, Deterministic Lifecycle Hash, Observable Artifact Integrity, and AGY Bridge Visibility).*

### B. Truex Observatory Emitters
The Observatory script runs a series of fact emitters to extract architectural state, detect drift, and generate runtime proofs.
- **Total Emitter Checks (`test_case`)**: 15
- **Passed**: 15
- **Failed**: 0
- **Skipped**: 0

---

## 3. Decoupled & Excluded Telemetry
To maintain strict accounting boundary integrity, the following metrics from `truex-ecosystem-runtime-report.json` are excluded from the `test_case` outcomes:
- **HookBench T3 eval-only** (1,000,000 evaluations) - Benchmark operations, not test cases.
- **HookBench receipt-backed** (1,000,000 evaluations) - Benchmark operations, not test cases.
- **Hook OTP runtime messages** (5 dispatches) - Message-level transitions, not test cases.
- **AGY bridge refusal/admission messages** (2 dispatches) - Message-level transitions, not test cases.
- **Command executions** (7 commands) - Shell executions, not test cases.

---

## 4. Raw JSON Test Accounting Data
```json
{
  "unit": "test_case",
  "verification": {
    "mutualExclusivity": "Passed + Failed + Skipped == Attempted",
    "status": "passed"
  },
  "summary": {
    "attempted": 835,
    "passed": 835,
    "failed": 0,
    "skipped": 0,
    "isValid": true
  },
  "breakdown": [
    {
      "name": "Vitest Full Suite",
      "attempted": 820,
      "passed": 820,
      "failed": 0,
      "skipped": 0,
      "isValid": true
    },
    {
      "name": "Truex Observatory Emitters",
      "attempted": 15,
      "passed": 15,
      "failed": 0,
      "skipped": 0,
      "isValid": true
    }
  ]
}
```
