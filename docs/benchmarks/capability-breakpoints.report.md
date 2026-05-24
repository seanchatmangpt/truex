# Capability Breakpoints Benchmark Report

**Timestamp:** \`2026-05-24T05:43:52.194Z\`
**Report Hash:** \`9ba62814c7b6e0ae25bb2337b3cb72557cddab1670fb6a05de7ed95dc72b0596\`

## 1. High-Level Performance Metrics

- **ACL Capability Context Throughput:** 3,296,970 ops/sec (Latency: 30.33 ms for 100,000 ops)
- **Nested Transactions Max Depth:** 1,000 contexts resolved (Latency: 99.61 ms, Memory delta: 13.20 MB)
- **Multi-Tenant Creation (10,000 tenants):** P99 Latency = 3.042 microseconds, Operation Latency = 2.208 microseconds
- **Audit Trails Saturation (100,000 entries):** Peak Heap = 80.84 MB, Final RSS = 191.39 MB

## 2. Invariant Validation Checklist

- [x] **Sandbox ACL Invariants:** ACL boundary correctness under proxy context.
- [x] **Transaction Rollback Invariants:** Overlapping nested rollback verification.
- [x] **Replay Convergence Invariants:** Divergence checks on unseeded entropy and clock.
- [x] **Invariant Loops Guard Invariants:** Stack overflow prevented via custom guard.
- [x] **Multitenancy Isolation Invariants:** Config and virtual separation across 10,000 tenants.
- [x] **Audit Saturation Invariants:** Peak heap validation under 100,000 entries.

---
*Report generated automatically by Truex Doctor.*