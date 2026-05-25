# Package: @truex/swarm

> **Path:** `packages/swarm/`
> **Gall Classification:** S₅ - Autonomic Manufacturing

## 1. Product Thesis

The Swarm package is the **Multi-Worker Autonomic Coordinator**. It enables the scaling of Truex across multiple parallel worker threads or machines while maintaining mathematical convergence. It leverages the Model Context Protocol (MCP) to provide agents with "hands" while using the `SwarmActuator` to monitor for abnormalities and launch remediation subagents.

## 2. Key Invariants

* **SWM-1 (Convergence Detection):** The swarm must continuously report its health metrics. If the convergence rate drops below the threshold, a Jidoka Line Stop is triggered.
* **SWM-2 (Causal Accountability):** Every action taken by every worker in the swarm must be linked to a parent `SwarmReceipt`.

## 3. Verbs / Commands

* `swarm.spawn(workerCount)`: Initializes the parallel worker pool.
* `swarm.actuate(proposal)`: Executes an agent proposal across the swarm boundary.

## 4. Refusal Conditions

The Swarm coordinator refuses a proposal if:
* The proposed action exceeds the global swarm resource budget.
* The worker attempting the action has an invalid or tampered receipt chain.
* The global convergence monitor detects a drift that requires a manual reset.

## 5. Proof Command

```bash
pnpm --filter @truex/swarm test
```