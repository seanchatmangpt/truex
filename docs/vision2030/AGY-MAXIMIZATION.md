# Maximizing Antigravity (AGY) CLI within the Truex Substrate

> **Path:** `docs/vision2030/AGY-MAXIMIZATION.md`

## 1. Product Thesis

The Antigravity CLI (AGY) is not just a developer assistant; it is the **runtime execution environment** for the Truex Post-Gall substrate. By leveraging AGY's native hooks, tool calling, and subagent architecture, we can shift Truex from a passive verification framework into an **autonomic closed-loop manufacturing pipeline**.

## 2. Strategic Maximization Paths

### A. Subagent Delegation (The Actor Model Synergy)
The `vendors/ReactiveMessagingPatterns_ActorModel/` directory introduces reactive actor patterns. We can map these patterns directly onto AGY's `.agents/` architecture:
*   **Create specialized subagents:** `.agents/truex-doctor.ts`, `.agents/truex-wizard.ts`, and `.agents/truex-telco.ts`.
*   Instead of the main AGY agent carrying the full context of the repository law, it acts as a **Message Router**. When a proof is required, the main agent delegates to the `truex-doctor` via `gemini invoke_agent truex-doctor`, fulfilling the *Request-Reply* and *Pipes and Filters* reactive patterns autonomously.

### B. Autonomic Hook Actuation
Currently, `scripts/after-tool-hook.ts` reads the `swarm.json` metrics and prints a terminal alert if an anomaly is detected (e.g., `"Launch Auditor Subagent"`).
*   **Maximization:** The `after-tool-hook.ts` should *programmatically execute* the AGY CLI to spawn the necessary subagent in the background. 
*   **Execution:** `execSync('gemini invoke_agent truex-auditor', { stdio: 'ignore' })`
*   This closes the Jidoka loop entirely. The system detects a drift, proposes a subagent, and AGY's hook system physically launches that subagent to fix the substrate without human intervention.

### C. Hook-Intercept Enforcement
AGY's `BeforeTool` hook (`truex-hook-loop`) intercepts standard operational attempts.
*   By ensuring `.agents/hooks.json` maps directly to AGY's modern tool names (`write_file`, `replace`, `run_shell_command`), every interaction the LLM makes with the codebase is forced through `truex-agy-bridge.ts`.
*   This converts raw LLM text generation into deterministic, receipt-bearing **GraphDeltas** stored in `gall_truex.db`, strictly enforcing the "No Fake Green" and "No Fossil" laws before the tool is even allowed to execute on disk.

## 3. The End State
By fusing Truex's receipted consequence engine with AGY's subagent routing, the repository ceases to be a passive codebase. It becomes a self-healing, autonomic organism where AGY serves as the continuous heartbeat and Truex serves as the deterministic law.