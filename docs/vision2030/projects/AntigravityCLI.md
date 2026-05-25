# Project: Antigravity CLI (Tier 4)

> **Gall Classification:** Tier 4 — Execution Interface
> **Truex Role:** The Autonomic TUI and Swarm Heartbeat

## 1. Product Thesis

The Antigravity CLI is the **Headless Operating Surface** for Truex. It is the primary way human and autonomic operators interact with the substrate. Unlike a standard shell, the Antigravity CLI is natively integrated with the Truex Membrane, meaning every command it executes (from file edits to shell scripts) is automatically receipted, audited, and evaluated against the project's invariants. It provides the "Heartbeat" for the autonomic swarm, orchestrating subagents and proving their consequences.

## 2. Key Invariants

* **CLI-1 (Native Receipting):** The CLI is forbidden from executing a tool call without first emitting an intent receipt to the local ledger.
* **CLI-2 (Jidoka Integration):** If a command violates a substrate law, the CLI must stop the execution line immediately and report the specific refusal receipt.

## 3. Verbs / Commands

* `truex doctor prove <target>`: Verifies the mathematical integrity of a specific primitive.
* `truex wizard manufacture`: Triggers the generative forge.
* `truex telco dial <peer>`: Initiates an interop session.

## 4. Refusal Conditions

The CLI refuses an execution if:
* The local SQLite ledger is tampered or the chain integrity check fails.
* The operator lacks the hardware-locked capability for the requested command.

## 5. Implementation Path

The primary operational binary (`scripts/truex.ts`) wrapping the `@truex/kernel` and `@truex/membrane`.