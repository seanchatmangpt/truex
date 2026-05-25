# Unified Timing Benchmark & Stress Test Report

## Timing Benchmarks
- **In-Memory E2E Cycle Duration:** 21.67 ms
- **CLI Process (`doctor prove unified-integration`) Duration:** 805.64 ms
- **Parallel Concurrency (20 peers) Total Duration:** 327.82 ms (average 16.39 ms/run)

## Resource & Stability Metrics
- **Memory Stability (Heap Diff across 50 reps):** -21.239 MB
- **Adversarial Fuzzing/Refusal:** Passed. Invariant checks correctly throw configuration errors under out-of-bounds parameters.
- **Deterministic Concurrency:** Proven. 100% of concurrent executions completed successfully with identical terminal accounting.

## Environment Details
- **Timestamp:** 2026-05-25T18:56:05.493Z
- **Node Version:** v24.15.0
- **Platform:** darwin (arm64)
