# Unified Timing Benchmark & Stress Test Report

## Timing Benchmarks
- **In-Memory E2E Cycle Duration:** 80.73 ms
- **CLI Process (`doctor prove unified-integration`) Duration:** 810.42 ms
- **Parallel Concurrency (20 peers) Total Duration:** 534.50 ms (average 26.73 ms/run)

## Resource & Stability Metrics
- **Memory Stability (Heap Diff across 50 reps):** 41.773 MB
- **Adversarial Fuzzing/Refusal:** Passed. Invariant checks correctly throw configuration errors under out-of-bounds parameters.
- **Deterministic Concurrency:** Proven. 100% of concurrent executions completed successfully with identical terminal accounting.

## Environment Details
- **Timestamp:** 2026-05-26T05:20:11.662Z
- **Node Version:** v24.15.0
- **Platform:** darwin (arm64)
