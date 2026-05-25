# Project: PICTL (Tier 1)

> **Gall Classification:** Tier 1 — Process Geometry
> **Truex Role:** Process Intelligence Control and Soundness Validator

## 1. Product Thesis

PICTL is the **Algorithmic Validator for Process Geometry**. While the Kernel *executes* POWL graphs, PICTL *verifies* them. It performs static analysis on proposed workflow models to detect deadlocks, infinite loops, or unreachable states before the model is ever frozen as law. It ensures that the project's "Physics" are mathematically sound, preventing a flawed workflow from terminally locking the substrate during runtime execution.

## 2. Key Invariants

* **PIC-1 (Soundness Enforcement):** A POWL model is refused if it fails the soundness check (Liveness and Safeness).
* **PIC-2 (Cycle Denial):** Explicitly identifies and refuses unintentional cycles that would result in infinite execution.

## 3. Verbs / Commands

* `pictl.verify(model)`: Performs the soundness verification of a POWL graph.
* `pictl.reduce(model)`: Performs transitive reduction to simplify the graph geometry.

## 4. Refusal Conditions

PICTL refuses a model if:
* A state in the graph is detected as a "Terminal Sink" with no exit.
* A parallel join node can never be satisfied (Deadlock).

## 5. Implementation Path

Used as the mandatory validation gate during the `ggen sync` and `handoff` workflows.