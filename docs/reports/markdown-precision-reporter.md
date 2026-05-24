# Markdown Precision Reporter

This report details the implementation of exact `.xxx%` (3 decimal places) precision across all Markdown reports and tables in the TRUEX ecosystem.

## 1. Precision Standards

To prevent rounding drift and mock-like formatting, all percentages representing success rates, failure rates, refusal rates, and quarantine rates are computed and displayed to exactly **3 decimal places**.

- Functions like `computeAccounting` utilize `.toFixed(3)` for rates.
- Inline Markdown rendering in `agents/doctor/agent.ts` uses formatting utilities (`val.toFixed(3)`) to enforce this precision.

## 2. Updated Markdown Report Generators

The following Markdown reports have been successfully regenerated:
1. `docs/reports/TRUEX-ECOSYSTEM-RUNTIME-REPORT.md`
2. `docs/reports/OTP-NONMOCKABLE-STRESS-SYNTHESIS.md`
3. `docs/benchmarks/hookbench.full-report.md`
4. `docs/benchmarks/hookbench.80-20-stress.md`
5. `docs/benchmarks/hook-otp.report.md`

All tables now display exact, real execution counts and percentages formatted to `.xxx%` precision.
