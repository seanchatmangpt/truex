# Project Wizard Timing Benchmark Report

## Executive Summary
- **Case:** project-wizard-timing-benchmark
- **Status:** ✅ Passed
- **Timestamp:** 2026-05-26T05:20:31.511Z
- **Report Hash:** `fde260af6e98f3e5b33e259df4b18bcf7beb05195881df1c9fba05406bcf1e9a`

## Detailed Verb Timings
Below is the execution duration for each of the 8 wizard verbs. The **Direct JS API** columns capture pure in-memory execution of the underlying classes, whereas the **CLI Command** columns capture the total execution time including CLI routing, tsx load, and argument parsing.

| Wizard Verb | Direct JS API Duration (ms) | CLI Command Duration (ms) | CLI Overhead (ms) |
|-------------|----------------------------|---------------------------|-------------------|
| `init` | 3.784 | 102.479 | 98.695 |
| `map` | 2.265 | 98.855 | 96.590 |
| `plan` | 2.141 | 99.236 | 97.095 |
| `forge` | 1.250 | 98.078 | 96.828 |
| `bind` | 2.460 | 98.278 | 95.818 |
| `prove` | 6.291 | 103.806 | 97.515 |
| `harden` | 0.493 | 94.894 | 94.401 |
| `handoff` | 1.227 | 103.762 | 102.534 |

## Detailed Verb Throughput (ops/sec)
Throughput is computed as the number of operations per second ($1000 / \text{duration in ms}$) if that verb were executed continuously.

| Wizard Verb | Direct JS API (ops/sec) | CLI Command (ops/sec) |
|-------------|-------------------------|-----------------------|
| `init` | 264.279 | 9.758 |
| `map` | 441.452 | 10.116 |
| `plan` | 467.117 | 10.077 |
| `forge` | 799.787 | 10.196 |
| `bind` | 406.435 | 10.175 |
| `prove` | 158.955 | 9.633 |
| `harden` | 2030.284 | 10.538 |
| `handoff` | 814.775 | 9.637 |

## Filesystem Latency (ms)
Baseline write-read-delete cycles are measured within the project workspace directly after each verb execution.

| Wizard Verb | API Workspace Latency (ms) | CLI Workspace Latency (ms) |
|-------------|----------------------------|----------------------------|
| `init` | 0.203 | 0.389 |
| `map` | 0.183 | 0.385 |
| `plan` | 0.163 | 0.356 |
| `forge` | 0.144 | 0.405 |
| `bind` | 0.154 | 0.337 |
| `prove` | 0.158 | 0.343 |
| `harden` | 0.144 | 0.483 |
| `handoff` | 0.141 | 0.419 |

## Operational Metrics Summary
| Metric | Direct JS API | CLI Command |
|--------|---------------|-------------|
| **Total Sequence Duration** | 19.912 ms | 799.388 ms |
| **Average Verb Duration** | 2.489 ms | 99.923 ms |
| **Average Filesystem Latency** | 0.161 ms | 0.390 ms |
| **Sequence Throughput (ops/sec)** | 401.775 | 10.008 |

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
