# Unified Timing Benchmark & Stress Test Report

## Timing Benchmarks
- **In-Memory E2E Cycle Duration:** 22.56 ms
- **CLI Process (`doctor prove unified-integration`) Duration:** 492.98 ms
- **Parallel Concurrency (20 peers) Total Duration:** 266.79 ms (average 13.34 ms/run)

## Resource & Stability Metrics
- **Memory Stability (Heap Diff across 50 reps):** -11.946 MB
- **Adversarial Fuzzing/Refusal:** Passed. Invariant checks correctly throw configuration errors under out-of-bounds parameters.
- **Deterministic Concurrency:** Proven. 100% of concurrent executions completed successfully with identical terminal accounting.

## Environment Details
- **Timestamp:** 2026-06-08T07:46:01.059Z
- **Node Version:** v20.13.0
- **Platform:** darwin (arm64)
