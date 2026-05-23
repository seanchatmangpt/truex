# TRUEX-REBRAND-ERLMCP

## 1. TRUEX CLASSIFICATION
**Tier:** Tier 4 — Execution Interface
**Truex Role:** High-Concurrency Agentic Protocol Bridge
**Execution Function:** BEAM-based MCP message routing and stabilization

*   **Deterministic vs Probabilistic:** Deterministic messaging.
*   **Runtime vs Manufacturing:** Runtime.
*   **Local vs Distributed:** Distributed.
*   **Operational vs Infrastructural:** Infrastructural.

---

## 2. ORIGINAL PURPOSE
Node.js and Python implementations of the Model Context Protocol (MCP) suffer from single-threaded bottlenecks when coordinating massive swarms of autonomous agents. `erlmcp` (and `mcp-mqtt-erl`) ported the MCP standard to the Erlang/BEAM virtual machine to leverage its legendary fault-tolerance and lightweight concurrency, enabling thousands of agents to communicate simultaneously without dropping context.

---

## 3. CHATMAN EQUATION ALIGNMENT
**A = μ(O*)**

*   **Admissibility:** Ensures that agentic communication doesn't crash the host protocol layer.
*   **μ (Transformation):** The reliable transport of intent across the network.

---

## 4. TRUEX EXECUTION ROLE
`Intake → Propagation`
Handles the raw communication pipeline between the LLMs and the local Truex host.

---

## 5. OPERATIONAL GEOMETRY
*   **Actor Geometry:** Maps the MCP protocol to Erlang processes, providing 1:1 agent-to-process failure containment.
*   **Concurrency Model:** Pre-emptive scheduling via the BEAM.

---

## 6. RECEIPT & EVIDENCE SURFACES
*   Can emit OTP-level telemetry for agent message latency.

---

## 7. TRUEX REBRAND MAPPING
*   `erlmcp` → `truex-mcp-beam` or `@truex/swarm-transport`
*   `mcp-mqtt-erl` → `truex-mcp-mqtt`

---

## 8. TRUEX TERMINOLOGY CONVERSION
| Old | Truex |
| --- | --- |
| MCP Server | Autonomic Communication Gateway |
| Erlang Process | Truex Protocol Actor |

---

## 9. RELATION TO OTHER TRUEX PROJECTS
*   **Upstream:** Connected to LLMs.
*   **Downstream:** Translates intents to `DesktopCommanderMCP` or `cns`.

---

## 10. MISSING INVARIANTS
*   Must be integrated with `unibit-causality` to cryptographically hash every incoming MCP message, proving what the agent actually requested.

---

## 11. TRUEX FUTURE EVOLUTION
Will become the standard high-throughput communication bus for enterprise-scale Truex swarms, replacing naive Node.js MCP servers for heavy workloads.

---

## 12. FINAL TRUEX CLASSIFICATION
This repository is not fundamentally an Erlang MCP library.
It is the high-concurrency autonomic transport gateway for agent swarm routing inside the Truex execution-trust stack.
