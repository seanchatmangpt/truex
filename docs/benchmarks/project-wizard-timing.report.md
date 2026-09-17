# Project Wizard Timing Benchmark Report

## Executive Summary
- **Case:** project-wizard-timing-benchmark
- **Status:** ✅ Passed
- **Timestamp:** 2026-06-08T07:46:11.964Z
- **Report Hash:** `1ba27e681b823bd4db9887e35e769cc8e2610984ba6f2bda517e03fab54b8d61`

## Detailed Verb Timings
Below is the execution duration for each of the 8 wizard verbs. The **Direct JS API** columns capture pure in-memory execution of the underlying classes, whereas the **CLI Command** columns capture the total execution time including CLI routing, tsx load, and argument parsing.

| Wizard Verb | Direct JS API Duration (ms) | CLI Command Duration (ms) | CLI Overhead (ms) |
|-------------|----------------------------|---------------------------|-------------------|
| `init` | 3.682 | 130.422 | 126.739 |
| `map` | 3.179 | 133.808 | 130.629 |
| `plan` | 2.887 | 135.865 | 132.978 |
| `forge` | 1.317 | 135.151 | 133.834 |
| `bind` | 3.566 | 147.100 | 143.534 |
| `prove` | 11.317 | 155.013 | 143.696 |
| `harden` | 0.508 | 130.475 | 129.967 |
| `handoff` | 3.635 | 142.288 | 138.653 |

## Detailed Verb Throughput (ops/sec)
Throughput is computed as the number of operations per second ($1000 / \text{duration in ms}$) if that verb were executed continuously.

| Wizard Verb | Direct JS API (ops/sec) | CLI Command (ops/sec) |
|-------------|-------------------------|-----------------------|
| `init` | 271.564 | 7.667 |
| `map` | 314.556 | 7.473 |
| `plan` | 346.350 | 7.360 |
| `forge` | 759.446 | 7.399 |
| `bind` | 280.452 | 6.798 |
| `prove` | 88.366 | 6.451 |
| `harden` | 1967.536 | 7.664 |
| `handoff` | 275.084 | 7.028 |

## Filesystem Latency (ms)
Baseline write-read-delete cycles are measured within the project workspace directly after each verb execution.

| Wizard Verb | API Workspace Latency (ms) | CLI Workspace Latency (ms) |
|-------------|----------------------------|----------------------------|
| `init` | 0.289 | 0.309 |
| `map` | 0.158 | 0.336 |
| `plan` | 0.153 | 0.282 |
| `forge` | 0.152 | 0.474 |
| `bind` | 0.171 | 0.292 |
| `prove` | 0.177 | 0.389 |
| `harden` | 0.135 | 0.361 |
| `handoff` | 0.466 | 0.345 |

## Operational Metrics Summary
| Metric | Direct JS API | CLI Command |
|--------|---------------|-------------|
| **Total Sequence Duration** | 30.091 ms | 1110.122 ms |
| **Average Verb Duration** | 3.761 ms | 138.765 ms |
| **Average Filesystem Latency** | 0.213 ms | 0.349 ms |
| **Sequence Throughput (ops/sec)** | 265.859 | 7.206 |

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
