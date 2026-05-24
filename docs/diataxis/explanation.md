# Truex Explanation: Understanding-Oriented

Explanation clarifies and illuminates a particular topic. It broadens the reader's understanding of *why* Truex is designed the way it is.

## 1. The Einsteinian Jump to Operational Field Physics

Traditional software operates under a Newtonian model: there is a single shared database state, and actors read or write to it. Truex discards this model.

In Truex, we implement **Operational Field Physics**. State is not a fixed table; it is a **Virtual Knowledge Graph (VKG)**. Truth is relative to the observer's position, authority, and receipt lineage. 
- A **Hook** is a reflex within this field.
- A **Receipt** is the memory spine, proving causality.
- The **Observatory** is the sensory cortex, constantly extracting facts to shape the environment.
- The **AGY Bridge** is the motor cortex, actuating changes back into the swarm.

## 2. Receipts Before Reality

Most systems mutate a database and *then* write an audit log. Truex enforces **Receipts Before Reality**.

When a `GraphDelta` is proposed:
1. It is journaled to a Write-Ahead Log (WAL).
2. It is evaluated by the Hook Engine.
3. The engine generates an `inputHash` and `outputHash`, cryptographically linking them into a `Receipt`.
4. **Only if** the Receipt evaluates as `confirmed` does the system allow the membrane to commit the changes to the persistent state. 

This ensures that the system is entirely self-verifying. If an operation cannot generate a mathematically converged receipt, it never physically happens.

## 3. The Toyota Production System (TPS) Metaphor

Truex is not an "app framework." It is a **software manufacturing line**.

We mapped TPS concepts directly to runtime execution:
- **Muda (Waste):** Processing a hook that doesn't match the delta is waste. The `KanbanSystem` eliminates this.
- **Muri (Overburden):** Allowing a million-quad delta to choke the event loop is overburden. Strict capacity limits prevent this.
- **Mura (Inconsistency):** Relying on ambient `Date.now()` or `Math.random()` creates non-deterministic execution. Truex strictly enforces `SeededPRNG` entropy to eliminate Mura, ensuring that replay is always bit-identical.

## 4. OTP-Equivalence Without the BEAM

Erlang's OTP (Open Telecom Platform) is famous for its actor model, mailboxes, and "let it crash" philosophy. Truex brings **local OTP-equivalence** to TypeScript.

Instead of reactive callbacks, Truex Hooks operate as **Process-Bearing Organisms**.
- **Mailboxes** enforce FIFO temporal geometry, which is critical for replay schedules.
- **Process Isolation** ensures that a mutation in Hook A cannot corrupt the memory of Hook B.
- **Supervisors** manage restart budgets. If a hook crashes, it doesn't bring down the system; it is restarted. If it exhausts its budget, the message is placed in a **Quarantine**.

This means Truex governs *ongoing operational organisms*, not just stateless functions.

## 5. The Active Ontology

Documentation is usually a passive artifact that quickly drifts from reality. Truex introduces the **Active Operational Ontology Engine**.

The Observatory (`emit-topology-graph.ts`) dynamically parses the Abstract Syntax Tree (AST) of the repository. It identifies tests (`provedBy`) and emitters (`documentedBy`). This graph is written to SQLite. If an agent attempts to mutate a file that is not legally mapped in this topology, the runtime pulls the Andon cord and stops the line. 

In Truex, **the source code IS the ontology**, and the runtime enforces its own structural integrity.
