# Explanation: The Active Operational Ontology

Documentation is usually a passive artifact that quickly drifts from reality. Truex introduces the **Active Operational Ontology Engine**, making the source code physically self-aware.

## The Genesis Catch-22

In a typical system, you add a file, maybe test it, and hope it integrates well. In Truex, the physical structure of the repository is bound to the runtime.

The Observatory dynamically parses the Abstract Syntax Tree (AST) of the repository. It identifies every file, ensures it has a test (`provedBy`), and verifies it is tracked by a fact emitter (`documentedBy`). This graph is written to a SQLite registry.

## Autonomic Governance

If an AI agent or a developer attempts to mutate a file that is not legally mapped in this topology, the AGY Bridge intercepts the action. The runtime pulls the Andon cord and throws a Genesis Warning or a Jidoka Line Stop.

In Truex, **the source code IS the ontology**. You cannot trick the system with comments or outdated Readmes; the runtime enforces its own structural integrity via continuous `doctor prove ontology` verification.