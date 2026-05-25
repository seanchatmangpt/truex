# Hook OTP Gaps & Classification Findings

This report evaluates the Erlang-like OTP (Open Telecom Platform) equivalence model implemented for GraphDelta state mutation hooks in TRUEX. It analyzes the runtime boundaries, performance benchmarks, test coverage, and key architectural gaps, culminating in a formal system classification block.

---

## 1. Context & Architectural Overview

In TRUEX, Hook OTP equivalence (`packages/membrane/src/hook-otp.gall.ts`) provides concurrency and fault-tolerance semantics for GraphDelta hooks. Rather than operating on a BEAM virtual machine or compiling to Erlang, the runtime implements isolated logical processes in TypeScript.

The runtime guarantees:
1. **Actor Identity & Isolation:** Each process is identified by a `HookProcessId` and has a deeply copied, isolated state to prevent cross-process mutation.
2. **Mailbox Queueing:** Incoming messages are buffered in a FIFO queue (`HookMailbox`) before being processed.
3. **Supervisor Recovery:** Supervisors manage worker lifetimes, resetting crashed processes to their initial state within configured restart limits (`maxRestarts` within `withinMs`).
4. **Poison Message Quarantine:** Crash-inducing messages are isolated in a quarantine queue to avoid infinite restart loops.
5. **Receipt/Replay Chaining:** Every processed message yields a signed cryptographic `Receipt` that chains to the previous state using `previousReceiptHash`, enabling replay verification and tamper detection.

---

## 2. Telemetry & Performance Metrics

From the primary equivalence suite (`hook-otp.report.json`) and stress suite executions (`hook-otp.stress-results.json`), the following performance characteristics are observed:

| Operation | Performance (ops/sec) | Description / Notes |
| :--- | :--- | :--- |
| **Raw Hook Behavior** | ~17.7M | Direct execution of the process behavior callback without queueing or hashing. |
| **OTP Mailbox Dispatch (Eval-Only)** | ~21.1M | Evaluation of FIFO queueing and behavior execution without generating cryptographic receipts. |
| **Receipt-Backed OTP (Full Loop)** | ~33.4k | Complete cycle: cloning state, queueing, behavior execution, SHA-256 receipt generation, and chaining. |
| **Overhead Ratio** | **~530x to 730x** | Significant cost due to deep state-cloning (`JSON.parse`/`JSON.stringify`) and cryptographic hashing per message. |

### Lifecycle Telemetry Summary:
- **Messages Dispatched:** 5
- **Messages Processed:** 4
- **Messages Confirmed:** 1
- **Messages Refused:** 4
- **Messages Quarantined:** 3
- **Supervisor Restarts:** 2
- **Budget Halted:** 1

---

## 3. Analysis of Remaining Gaps

While the current implementation succeeds as a local TS equivalent, the following five critical gaps prevent it from acting as a production-grade, distributed actor system:

### A. Distributed Clustering
The Hook OTP runtime is strictly single-node and in-memory. There is no cluster coordinator, peer discovery protocol, or consensus mechanism (e.g., Raft, Paxos, Gossip) to synchronize mailboxes, supervisor states, or process configurations across physical or logical machine boundaries.

### B. Remote Actor Networking
Routing relies on synchronous Map lookups in the local memory space (`runtime.processes.get(id)`). There is no network transport layer (such as WebSockets, gRPC, or TCP sockets) to marshal message payloads and route them to remote processes running on other nodes.

### C. Multi-Node Supervision
Supervisors can only monitor processes running in the same memory stack. There is no concept of a distributed supervision tree capable of monitoring remote nodes, executing remote restarts, or resolving network partitions (e.g., split-brain scenarios).

### D. State Persistence
All process states, mailboxes, and restart histories are transient and reside in volatile JavaScript heap memory (`proc.state`). While the external AGY bridge logs tool-execution WAL deltas to SQLite, the core Hook OTP runtime does not natively journal or persist its actor queues or state history to survive runtime crashes or restarts.

### E. AGY Lifecycle Coupling
The Hook OTP runtime and the agent tool-execution lifecycle are loosely integrated. The AGY bridge is invoked as an external interceptor script (`scripts/truex-agy-bridge.ts`) rather than having agent tool executions natively run as supervised actor processes directly managed inside the core OTP loop.

---

## 4. Source Coverage Analysis

Targeted coverage verification of `packages/membrane/src/hook-otp.gall.ts` yields:

- **Statement Coverage:** `96.01%`
- **Branch Coverage:** `80.95%`
- **Function Coverage:** `91.66%`
- **Line Coverage:** `96.01%`

### Uncovered Code Paths (Error Fallbacks):
- **Lines 290–299:** Catch-all for a process crashing when *no supervisor* is assigned (defaults to quarantining the message, halting the process, and returning a refused receipt).
- **Lines 324–325:** Catch block inside `replayMessage` returning `true` if the replay throws an error and the receipt status was indeed `'refused'`.

---

## 5. System Classification Block

```yaml
OTP-GAPS-CLASSIFICATION:
  OTP Claim Accuracy: "Local TypeScript Equivalent (Not BEAM)"
  Strongest Implemented Primitive: "Supervised Receipt-Backed Message Dispatch Loop with State Rollback and Quarantine"
  Strongest Test Evidence: "Non-Mockable Stress Suite (10 distinct integration scenarios verifying 1,000-message FIFO chains, sibling crash containment, restart budgets, and SQLite WAL delta integrations)"
  Strongest Runtime Metric: "Eval-only mailbox throughput of ~21.1M ops/sec (contrasted against full receipt-backed loop at ~33.4k ops/sec)"
  Weakest Boundary: "Synchronous, Blocking Dispatch Execution Loop (runs entirely on Node.js call stack; infinite loops hang the runtime; state isolation relies on expensive, non-serializable JSON cloning)"
  Source Coverage: "96.01% Statement / 80.95% Branch / 91.66% Function (uncovered paths are restricted to non-supervised crashes and replay failure fallbacks)"
  Remaining Gap: "Lack of Distributed Clustering, Remote Actor Networking, Multi-Node Supervision, Native State Persistence, and Direct AGY Lifecycle Coupling"
  Next Lawful Patch: "SQLite Persistence Membrane for OTP Processes (Implement SQLite-backed journaling for HookMailbox queues and HookProcess states under Gall Stack S3, enabling durable state recovery across process restarts)"
```
