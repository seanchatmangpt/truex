# Reference: The Gall Sequencing Law

Truex enforces **Gall Sequencing**: Complex systems must emerge from working simple systems. Any abstraction that expands faster than its replay proof is an unlawful architectural drift.

The hierarchy is strictly defined and verified continuously:

- **S₀ (Ledger):** Hashing (`BLAKE3`), Canonicalization (`stableJson`), and ML-DSA Signatures. Everything begins with cryptographic identity.
- **S₁ (Replay):** Deterministic Contexts, Seeded Entropy, Replay Convergence. Operations must be identically reproducible.
- **S₂ (Engine):** The `TruexHook`, `GraphDelta`, and TPS Manufacturing Line. The core operational loop.
- **S₃ (Persistence):** SQLite WAL, `DeltaJournal`, `TransactionalMembrane`. Ensures zero-loss cold-loads and durability.
- **S₄ (Observatory & Actuation):** AST-driven Ontology, Fact Emitters, AGY Bridge. The sensory and motor cortex governing the swarm.
- **S₅ (Topology & OTP):** Local OTP-equivalence (Mailboxes, Supervisors, Process Isolation) and cross-hook causal topologies.

Higher layers are forbidden before lower replay convergence is mathematically proven.