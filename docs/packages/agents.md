# Package: @truex/agents

> **Path:** `packages/agents/`
> **Gall Classification:** S₅ - Autonomic Manufacturing

## 1. Product Thesis

The Agents package implements the **Autonomous Adversarial Validation** layer of the Truex substrate. It provides a swarm of specialized subagents (Doctor, Auditor, Path Specialist, etc.) that actively stress the consequence membrane. Unlike traditional AI assistants, these agents are designed to **refuse fake green** and mathematically prove the survival of invariants under admissible variability.

## 2. Key Invariants

* **AGE-1 (Self-Correction):** An agent cannot mark its own work as complete. Handoff is only admitted after a successful validation from the Doctor subagent.
* **AGE-2 (Bounded Agency):** Subagents operate within a strict execution window and fuel budget, preventing runaway cognitive costs.
* **AGE-3 (A2A Receipting):** Every agent-to-agent delegation must generate a `SwarmReceipt`, proving the causal chain of instruction.

## 3. Verbs / Commands

* `invoke_agent(name, prompt)`: Launches a specialized subagent thread.
* `mcp_server.start()`: Initializes the Model Context Protocol interface for external agent interaction.

## 4. Refusal Conditions

The Agents package refuses execution if:
* The subagent lacks the required capability/skill for the task.
* The delegation chain is unreceipted or broken.
* The task target is outside the bounded project cell.

## 5. Proof Command

```bash
pnpm --filter @truex/agents test
```