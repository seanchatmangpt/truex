# Project Wizard Timing Benchmark Report

## Executive Summary
- **Case:** project-wizard-timing-benchmark
- **Status:** ✅ Passed
- **Timestamp:** 2026-05-24T16:03:17.820Z
- **Report Hash:** `182097852ad623094708d655a04cf7354cef8cd9717d27b36d59d5b438dc8ae7`

## Detailed Verb Timings
Below is the execution duration for each of the 8 wizard verbs. The **Direct JS API** columns capture pure in-memory execution of the underlying classes, whereas the **CLI Command** columns capture the total execution time including CLI routing, tsx load, and argument parsing.

| Wizard Verb | Direct JS API Duration (ms) | CLI Command Duration (ms) | CLI Overhead (ms) |
|-------------|----------------------------|---------------------------|-------------------|
| `init` | 4.703 | 107.595 | 102.892 |
| `map` | 2.922 | 100.814 | 97.893 |
| `plan` | 2.079 | 103.965 | 101.886 |
| `forge` | 1.511 | 100.879 | 99.368 |
| `bind` | 2.763 | 102.456 | 99.692 |
| `prove` | 8.254 | 105.353 | 97.098 |
| `harden` | 0.656 | 100.548 | 99.892 |
| `handoff` | 1.257 | 98.404 | 97.147 |

## Detailed Verb Throughput (ops/sec)
Throughput is computed as the number of operations per second ($1000 / \text{duration in ms}$) if that verb were executed continuously.

| Wizard Verb | Direct JS API (ops/sec) | CLI Command (ops/sec) |
|-------------|-------------------------|-----------------------|
| `init` | 212.634 | 9.294 |
| `map` | 342.270 | 9.919 |
| `plan` | 480.933 | 9.619 |
| `forge` | 661.887 | 9.913 |
| `bind` | 361.871 | 9.760 |
| `prove` | 121.147 | 9.492 |
| `harden` | 1525.358 | 9.946 |
| `handoff` | 795.624 | 10.162 |

## Filesystem Latency (ms)
Baseline write-read-delete cycles are measured within the project workspace directly after each verb execution.

| Wizard Verb | API Workspace Latency (ms) | CLI Workspace Latency (ms) |
|-------------|----------------------------|----------------------------|
| `init` | 0.220 | 0.218 |
| `map` | 0.138 | 0.201 |
| `plan` | 0.175 | 0.185 |
| `forge` | 0.146 | 0.177 |
| `bind` | 0.188 | 0.158 |
| `prove` | 0.166 | 0.186 |
| `harden` | 0.173 | 0.181 |
| `handoff` | 0.125 | 0.157 |

## Operational Metrics Summary
| Metric | Direct JS API | CLI Command |
|--------|---------------|-------------|
| **Total Sequence Duration** | 24.145 ms | 820.013 ms |
| **Average Verb Duration** | 3.018 ms | 102.502 ms |
| **Average Filesystem Latency** | 0.166 ms | 0.183 ms |
| **Sequence Throughput (ops/sec)** | 331.332 | 9.756 |

## Validated Invariants
* **Invariant:** init creates the project cell and ledger files
* **Invariant:** map generates project topology and C4 context
* **Invariant:** plan dynamically schedules checkpoints based on topology
* **Invariant:** forge materializes checkpoint assets and updates W2 state
* **Invariant:** bind links project surface integrations and records W3 states
* **Invariant:** prove runs verification commands under test harness context
* **Invariant:** harden stress tests project boundaries and catches path traversal
* **Invariant:** handoff validates 12h elapsed gate and W1-W5 invariants

---
*Report auto-generated and validated by project-wizard-benchmark.test.ts*
