# Project Wizard Timing Benchmark Report

## Executive Summary
- **Case:** project-wizard-timing-benchmark
- **Status:** ✅ Passed
- **Timestamp:** 2026-05-25T18:56:24.155Z
- **Report Hash:** `3ce2c8ffbd19a13f1541ed84e2df8c150e6e484eb4dad2451a86e140aea32a10`

## Detailed Verb Timings
Below is the execution duration for each of the 8 wizard verbs. The **Direct JS API** columns capture pure in-memory execution of the underlying classes, whereas the **CLI Command** columns capture the total execution time including CLI routing, tsx load, and argument parsing.

| Wizard Verb | Direct JS API Duration (ms) | CLI Command Duration (ms) | CLI Overhead (ms) |
|-------------|----------------------------|---------------------------|-------------------|
| `init` | 3.785 | 103.187 | 99.402 |
| `map` | 2.509 | 97.398 | 94.889 |
| `plan` | 2.584 | 101.829 | 99.245 |
| `forge` | 1.585 | 97.474 | 95.889 |
| `bind` | 2.769 | 101.862 | 99.094 |
| `prove` | 7.145 | 104.752 | 97.607 |
| `harden` | 0.580 | 98.263 | 97.684 |
| `handoff` | 1.430 | 97.530 | 96.100 |

## Detailed Verb Throughput (ops/sec)
Throughput is computed as the number of operations per second ($1000 / \text{duration in ms}$) if that verb were executed continuously.

| Wizard Verb | Direct JS API (ops/sec) | CLI Command (ops/sec) |
|-------------|-------------------------|-----------------------|
| `init` | 264.204 | 9.691 |
| `map` | 398.625 | 10.267 |
| `plan` | 387.041 | 9.820 |
| `forge` | 630.865 | 10.259 |
| `bind` | 361.190 | 9.817 |
| `prove` | 139.964 | 9.546 |
| `harden` | 1725.375 | 10.177 |
| `handoff` | 699.504 | 10.253 |

## Filesystem Latency (ms)
Baseline write-read-delete cycles are measured within the project workspace directly after each verb execution.

| Wizard Verb | API Workspace Latency (ms) | CLI Workspace Latency (ms) |
|-------------|----------------------------|----------------------------|
| `init` | 0.208 | 0.375 |
| `map` | 0.390 | 0.285 |
| `plan` | 0.174 | 0.329 |
| `forge` | 0.181 | 0.344 |
| `bind` | 0.173 | 0.356 |
| `prove` | 0.215 | 0.351 |
| `harden` | 0.154 | 0.324 |
| `handoff` | 0.154 | 0.356 |

## Operational Metrics Summary
| Metric | Direct JS API | CLI Command |
|--------|---------------|-------------|
| **Total Sequence Duration** | 22.385 ms | 802.295 ms |
| **Average Verb Duration** | 2.798 ms | 100.287 ms |
| **Average Filesystem Latency** | 0.206 ms | 0.340 ms |
| **Sequence Throughput (ops/sec)** | 357.383 | 9.971 |

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
