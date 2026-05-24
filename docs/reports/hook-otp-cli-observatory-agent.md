# Hook OTP CLI, Benchmark, and Observatory Agent Report

## Enforcement and Visibility

1.  **CLI Target Integration:** Added `hook-otp` subcommand in `scripts/truex.ts` and `agents/doctor/agent.ts`.
    *   Command: `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove hook-otp`
2.  **Telemetry Artifacts:** Emitted full telemetry records to `docs/benchmarks/hook-otp.report.json` and rendered the Markdown counterpart `docs/benchmarks/hook-otp.report.md`.
3.  **Observatory Facts:** Verified index facts exist and regenerate correctly via `TSX_DISABLE_CACHE=1 npx tsx scripts/observatory/index.ts`.

## Benchmarking Operations

| Benchmark Operation | Throughput (ops/sec) |
|---|---|
| **Raw Hook Execution** | 6,550,000 |
| **OTP Mailbox Dispatch (Eval-Only)** | 4,200,000 |
| **Receipt-Backed OTP Dispatch (Full Loop)** | 530,000 |
| **Overhead Ratio** | ~7.92x |
