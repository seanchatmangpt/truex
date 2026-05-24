# Agent Report: Mailbox Saturation + Ordering Stress Test Results

## Overview

This report documents the mailbox saturation and FIFO ordering stress tests executed on the Truex Hook OTP process architecture. The tests stressed increasing mailbox queue depths, multiple producers, and validated key correctness invariants under crash/malformation/tampering scenarios under multi-producer interleaving.

## Verification Execution

- **Test Suite Path:** `packages/truex-core/test/hook-otp/hook-otp-mailbox-breakpoint.test.ts`
- **JSON Report Path:** `docs/benchmarks/otp-mailbox-breakpoint.report.json`
- **Markdown Report Path:** `docs/benchmarks/otp-mailbox-breakpoint.report.md`

## Key Findings

- **Queue Overflow Invariant:** Emitting a refused receipt before mutating state is fully functional. The process correctly refuses processing when the mailbox size exceeds `maxQueueDepth`.
- **FIFO Reordering Guard:** Swapping or tampering with the order of execution correctly fails replay validation, verifying the causal ordering invariant.
- **Receipt Chain Integrity:** Any mutation of receipt hashes or previous receipt linkage correctly fails verification.
- **Zero Message Loss:** All messages are accounted for (processed + refused = total dispatched).

### Memory & Telemetry Summary under Multi-Producer Interleaving

| Metric | Observation |
| --- | --- |
| GC Run Observed | No |
| Heap Peak Range | 21.00 - 222.29 MB |
| RSS Peak After | 366.42 MB |
| Average Bytes/Msg Approx | 3719.46 Bytes |

For detailed benchmark numbers, see [otp-mailbox-breakpoint.report.md](file:///Users/sac/truex/docs/benchmarks/otp-mailbox-breakpoint.report.md).
