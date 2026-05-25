# Project: A2A (Tier 5)

> **Gall Classification:** Tier 4/5 — Agent-to-Agent Coordination
> **Truex Role:** Autonomic Swarm Routing and Tension Resolution

## 1. Product Thesis

A2A is the **Coordination Protocol for the Autonomic Swarm**. It manages the "Dialogue of Tension" between specialized subagents. Instead of one agent making a unilateral decision, A2A forces multiple agents (e.g., a Developer and an Auditor) to debate a proposed motion. A transition is only admitted when the agents reach a "Natural Language Agreement" that is subsequently distilled into a cryptographic `SwarmReceipt`.

## 2. Key Invariants

* **A2A-1 (Conserved Tension):** No action is admitted without a corresponding "Tension Receipt" proving it was audited by at least one adversarial subagent.
* **A2A-2 (Non-Chat Authority):** Informal agent chat is never authority; only the final signed A2A agreement object can trigger the Membrane.

## 3. Verbs / Commands

* `a2a.negotiate(agents, intent)`: Orchestrates the multi-agent debate.
* `a2a.agree()`: Generates the terminal agreement receipt.

## 4. Refusal Conditions

A2A refuses an agreement if:
* The adversarial subagent (Auditor) emits a terminal refusal.
* The negotiation fails to reach consensus within the allowed turn budget.

## 5. Implementation Path

Integration of the `SwarmActuator` with the formal A2A dialogue protocol.