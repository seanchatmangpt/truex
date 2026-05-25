# Project: ERLMCP (Tier 4)

> **Gall Classification:** Tier 4 — High-Throughput Routing
> **Truex Role:** High-Concurrency Agentic Protocol Bridge

## 1. Product Thesis

ERLMCP is the **High-Concurrency Protocol Bridge** for the Truex substrate. While standard Node.js-based MCP servers suffer from single-threaded bottlenecks under heavy swarm loads, ERLMCP leverages the **Erlang/BEAM virtual machine**. It provides a fault-tolerant, massively concurrent gateway for routing multi-agent messages (A2A). It ensures that a swarm of thousands of agents can debate, coordinate, and stabilize without message loss or system-wide stalls.

## 2. Key Invariants

* **ERL-1 (Soft Real-Time Routing):** Message routing latency must remain stable regardless of the number of active agent processes.
* **ERL-2 (Isolation-by-Process):** Every agent session is mapped to a light-weight Erlang process, ensuring that a crash in one coordination thread cannot corrupt the global substrate.

## 3. Verbs / Commands

* `erlmcp.route(message)`: Dispatches an MCP packet to the target agent process.
* `erlmcp.supervise(swarm)`: Monitors agent processes and restarts them upon failure (conforming to OTP patterns).

## 4. Refusal Conditions

ERLMCP refuses a message if:
* The agent process mailbox exceeds the safety depth limit.
* The message lacks a valid Truex `eventId` or `parentReceiptHash`.

## 5. Implementation Path

Deployment of the AtomVM/BEAM bridge to handle heavy A2A coordination workloads.