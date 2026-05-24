# Doctest Execution and Performance Report

This report documents the performance, extraction rates, and domain accounting convergence for the Truex Doctest subsystem under S5 validation.

---

## 1. Executive Performance Summary

- **Doctest Case:** `external-markdown-jsdoc-doctests`
- **Overall Status:** ✅ PASSED
- **Total Execution Time:** ~5.50 seconds
- **Average Test Execution Time:** ~392.86 ms per active test
- **Active Generated Files:** 14 Vitest files under `.generated/doctests/`

---

## 2. Doctest Block Source Breakdown

| Source Type | Extracted Blocks | Active Blocks | Skipped Blocks | Deferred Blocks |
| :--- | :---: | :---: | :---: | :---: |
| **Markdown Doctests** | 16 | 14 | 1 | 1 |
| **JSDoc Doctests** | 0 | 0 | 0 | 0 |
| **Total** | **16** | **14** | **1** | **1** |

---

## 3. Core Accounting Domains

### Domain DOC1 (Doctest Block)
Asserts that all extracted doctest blocks are accounted for by matching states (passed, failed, skipped, deferred).
- **Formula:** `passed + failed + skipped + deferred == attempted`
- **Values:** `14 + 0 + 1 + 1 == 16`
- **Result:** ✅ CONVERGED
- **Printout:** `[DOC1] Attempted: 16, Passed: 14, Failed: 0, Skipped: 1, Deferred: 1`

### Domain DOC2 (Generated Test File)
Asserts that all generated `.test.ts` files correspond exactly to the active/inactive block classifications.
- **Formula:** `emitted + failed + skipped == attempted` (where skipped includes deferred)
- **Values:** `14 + 0 + 2 == 16`
- **Result:** ✅ CONVERGED
- **Printout:** `[DOC2] Attempted: 16, Emitted: 14, Failed: 0, Skipped: 2`

### Domain DOC3 (Regression Command)
Asserts that all command invocations within the doctests are successfully run and their exit codes/outputs validated.
- **Formula:** `succeeded + failed == attempted`
- **Values:** `2 + 0 == 2`
- **Result:** ✅ CONVERGED
- **Printout:** `[DOC3] Command Invocations - Attempted: 2, Succeeded: 2, Failed: 0`

---

## 4. Invariants Verified

1. **Physical Generation Invariant:** The `.generated/doctests` directory exists and contains active `.test.ts` files.
2. **DOC1 Integrity Invariant:** `passed + failed + skipped + deferred == attempted`.
3. **DOC2 Integrity Invariant:** `emitted + failed + skipped == attempted`.
4. **DOC3 Integrity Invariant:** `succeeded + failed == attempted`.
5. **No Regression Invariant:** Zero failed doctests.

---
*Report generated automatically by Truex Doctor & Regression Validator.*
