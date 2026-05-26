# TRUEX-REBRAND-DESKTOPCOMMANDER

## 1. TRUEX CLASSIFICATION
**Tier:** Tier 4 — Execution Interface
**Truex Role:** Agentic Host Integration Protocol
**Execution Function:** Crossing the AI-to-Metal Boundary

*   **Deterministic vs Probabilistic:** Interface bridging probabilistic agents to deterministic APIs.
*   **Runtime vs Manufacturing:** Runtime.
*   **Local vs Distributed:** Local.
*   **Operational vs Infrastructural:** Infrastructural.

---

## 2. ORIGINAL PURPOSE
LLMs are trapped in the cloud. They cannot natively read files, execute shell commands, or interact with local hardware. The Model Context Protocol (MCP) was introduced by Anthropic to solve this. `DesktopCommanderMCP` was built to give the autonomic swarm (Tiers 2 & 5) physical "hands" to manipulate the local operating system, execute `ggen` commands, and inspect local repositories.

---

## 3. CHATMAN EQUATION ALIGNMENT
**A = μ(O*)**

*   **μ (Transformation):** Translates high-level agentic intent into raw OS-level execution commands (bash, filesystem).
*   **Admissibility:** This is a high-risk surface. If the MCP server does not enforce admissibility constraints, a hallucinating agent can destroy the local filesystem.

---

## 4. TRUEX EXECUTION ROLE
`Intake → Consequence`
It is the execution pipeline for the autonomous actors.

---

## 5. OPERATIONAL GEOMETRY
*   **Failure Containment:** Currently weak. It relies on the LLM "behaving."
*   **Mutation Surfaces:** Massive (the entire local OS).

---

## 6. RECEIPT & EVIDENCE SURFACES
*   Currently lacks cryptographic receipts for shell execution.

---

## 7. TRUEX REBRAND MAPPING
*   `DesktopCommanderMCP` → `truex-mcp-gateway` or `@truex/host-agent`

---

## 8. TRUEX TERMINOLOGY CONVERSION
| Old | Truex |
| --- | --- |
| MCP Server | Operational Execution Gateway |
| Commands | Transition Intents |

---

## 9. RELATION TO OTHER TRUEX PROJECTS
*   **Upstream:** Commanded by `BusinessOS` agents and `ggen` pipelines.
*   **Downstream:** Executes commands that trigger `cns`, `truex-kernel`, etc.

---

## 10. MISSING INVARIANTS
*   **CRITICAL FLAW:** `DesktopCommanderMCP` currently lacks the Truex Membrane (`proxyable`). Every file write or shell execution triggered by the agent *must* be intercepted, evaluated for admissibility against a local `truex-kernel` policy, and receipted before execution.

---

## 11. TRUEX FUTURE EVOLUTION
It will be wrapped entirely inside the Truex Membrane. It will no longer execute raw bash commands; it will submit "Speculative Operations" to the local Truex kernel, which will admit or deny the agent's intent based on strict process geometry.

---

## 12. FINAL TRUEX CLASSIFICATION
This repository is not fundamentally an MCP Server.
It is the execution interface boundary for bounded autonomic operators inside the Truex execution-trust stack.
