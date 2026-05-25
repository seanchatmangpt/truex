# Project: DesktopCommander (Tier 4)

> **Gall Classification:** Tier 4 — Execution Interface
> **Truex Role:** Agentic Host Integration Protocol

## 1. Product Thesis

DesktopCommander is the **Agentic Execution Interface**. It allows autonomic agents (operating in the cloud or local containers) to safely cross the "AI-to-Metal" boundary. It provides the physical hands required to execute shell commands, read/write files, and interact with host operating systems. Most importantly, it wraps these interactions in a Truex Membrane, ensuring that agentic "freedom" is strictly bounded by deterministic operational law and unforgeable receipts.

## 2. Key Invariants

* **DC-1 (Zero-Loss Interception):** Every OS-level attempt (exec, spawn, fs) must be intercepted by the host-bridge and receipted before execution.
* **DC-2 (Hardware-Locked Identity):** Execution receipts are tied to the host's hardware identity, preventing agentic spoofing across nodes.

## 3. Verbs / Commands

* `dc.execute(command)`: Proxies a shell command through the admission membrane.
* `dc.fs.mutate(delta)`: Applies a filesystem mutation within the bounded cell.

## 4. Refusal Conditions

DesktopCommander refuses an operation if:
* The proposed command contains a forbidden prefix (e.g., `sudo`, `rm -rf /`).
* The agent lacks the required host-level capability.
* The local SQLite ledger cannot append the intent receipt.

## 5. Implementation Path

Integration of the `truex-agy-bridge.ts` into the main DesktopCommander Rust/TS engine.