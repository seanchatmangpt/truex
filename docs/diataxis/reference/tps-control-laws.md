# Reference: TPS Control Laws

Truex maps Toyota Production System (TPS) concepts directly into runtime execution controls.

- **Jidoka (Autonomation):** Any failure in validation, hashing, or unmapped artifact detection throws a hard error, stopping the execution line and emitting a Refusal Receipt. Defective state cannot propagate.
- **Andon:** The `AndonSystem` provides the manual or automatic signal that halts the `ClosedLoopGovernor`.
- **Kanban (Pull System):** Hooks are evaluated lazily. A hook is only "pulled" into execution if its condition predicate perfectly matches an incoming `GraphDelta`.
- **Heijunka (Load Leveling):** Capacity limits (e.g., maximum 100 quads per delta) prevent *Muri* (overburden) on the single-threaded Node.js event loop.
- **Kaizen (Continuous Improvement):** The `RefiningEngine` rewrites slightly malformed inputs ("soft-fossils") into dynamic variants before processing.
- **Genchi Genbutsu (Go and See):** The Observatory parses the AST and emits real-time facts, preventing developers from assuming system state.
- **Muda (Waste):** Bypassing hooks that do not match the delta avoids computational waste.
- **Mura (Inconsistency):** Relying on ambient `Date.now()` or `Math.random()` is banned. `TruexContext` enforces deterministic entropy to eliminate Mura.