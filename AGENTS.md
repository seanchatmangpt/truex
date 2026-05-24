# TRUEX — AGENTS.md

## ROOT AXIOM

Today’s best practices are tomorrow’s antipatterns.

Tomorrow is always less than 24 hours away.

This repository exists to explore the transition from:

Probabilistic Software
→
Receipted Operational Manufacturing

The governing operational equation is:

A = μ(O)
→
A = μ(O*)
→
R ⊢ A = μ(O*)

Where:

- A = artifact, consequence, projection, executable motion
- μ = manufacturing / transformation operator
- O = ontology
- O* = lawful operational closure
- R = receipt lineage proving admissible consequence

The repository must always prefer:

Live Operational Closure > Static Architecture

---

# GALL LAW

A complex system that works evolves from a simple system that worked.

The repository MUST follow Gall sequencing:

S₀ works
→
S₁ may exist

If S₀ does not work:
S₁ is forbidden.

No speculative architecture is allowed above a non-working primitive.

---

# TRUEX GALL CALCULUS

The repository begins from:

GraphDelta
→
Hook
→
Effect
→
Receipt
→
Replay

Everything else is downstream.

---

# REPOSITORY PURPOSE

TRUEX is NOT:

- a framework
- a SaaS application
- an orchestration platform
- an AI agent framework
- a dashboard system
- a workflow builder

TRUEX IS:

A minimal operational substrate for:
- deterministic consequence
- replayable transitions
- receipt-bearing operation
- admissible variability
- operational convergence
- lawful composition

---

# CURRENT OPERATIONAL SCOPE

Allowed nouns:

- doctor
- wizard
- telco

Forbidden nouns:
- smoke
- edge
- db
- replay
- receipt
- pack
- deploy

until Gall sequencing proves necessity.

---

# CLI CALCULUS

Command form:

truex <noun> <verb8> [target]

Initial commands:

truex doctor prove engine
truex doctor prove receipt
truex doctor prove replay
truex doctor prove sqlite

No additional commands are allowed unless a lower primitive works first.

---

# CURRENT GALL STACK

S₋₂:
truex-test-utils

S₋₁:
hash primitives

S₀:
receipt primitives

S₁:
replay primitives

S₂:
engine primitives

S₃:
sqlite membrane primitives

Higher layers are forbidden until these converge.

---

# TECHNOLOGY RULES

Allowed:
- TypeScript
- Node.js
- pnpm
- vitest
- citty
- better-sqlite3
- @faker-js/faker
- fast-check
- @noble/hashes

Forbidden:
- Expo
- Supabase
- React
- ORMs
- Docker
- Kubernetes
- queues
- distributed runtimes

until Gall progression allows them.

---

# TESTING LAW

Tests must prove BOTH:

1. lawful states converge
2. unlawful states fail

A primitive is incomplete until:
- tampering fails
- replay divergence fails
- rollback succeeds
- admissible entropy survives

No snapshot-driven testing.

No fake healthy dashboards.

No mocked success paths for core primitives.

---

# ENTROPY LAW

Truex tests use:

deterministic admissible entropy

Allowed:
- seeded faker
- fast-check
- replayable generators

Forbidden:
- Math.random
- unseeded randomness
- clock-dependent tests
- network-dependent tests

The system must survive lawful variability.

---

# RECEIPT LAW

Receipts are not logs.

Receipts are operational authority.

A receipt must prove:
- input lineage
- output lineage
- replay convergence
- causal ordering
- tamper detection

Without replay:
there is no operational trust.

---

# REPLAY LAW

same input
+
same law
=
same consequence

Replay divergence is a first-class failure.

---

# SQLITE LAW

SQLite is the first persistence membrane.

It exists to prove:
- transactional consequence
- rollback correctness
- persisted replay
- receipt readback

SQLite is not “temporary infra.”

SQLite is Gall persistence.

---

# ENGINE LAW

The engine must remain:

- framework agnostic
- database agnostic
- network agnostic
- UI agnostic

The engine only knows:

GraphDelta
→
Condition
→
Effect
→
Receipt

Nothing else.

---

# DECOMPOSITION LAW

Do not split modules prematurely.

One-file proofs are preferred until invariants stabilize.

Premature decomposition is considered architecture drift.

---

# ARCHITECTURE DRIFT

The following are signs of drift:

- architecture expanding faster than runtime proof
- new nouns appearing without necessity
- mocked “healthy” systems
- dashboards without replay
- passing tests without adversarial failure
- hardcoded ontology fossils
- speculative abstractions

When drift appears:
return to the last working primitive.

---

# TRUEX TESTING POLICY

The repository does not test examples.

The repository tests:
- invariants
- replay convergence
- tamper resistance
- admissible variability
- rollback correctness
- lawful composition

Property-based testing is strategically preferred over static fixtures.

---

# CONTRIBUTION LAW

Contributors must:
- preserve Gall sequencing
- prefer observable consequence
- prefer replayable systems
- prefer deterministic variability
- prefer minimal lawful primitives

Contributors must NOT:
- scaffold future architecture
- introduce speculative abstractions
- add runtime layers prematurely
- expand nouns casually
- hide failures behind mocks

---

# SUBAGENT LAW

To guarantee thorough verification across E2E pathing, concurrency, fuzzing, leak auditing, and integration CLI surfaces, the system must always launch the 5 specialized subagents first before consolidating implementation artifacts:
1. **Reactive E2E Path Specialist** — verifies sequential happy-path lifecycles and accounting ledgers.
2. **Reactive Concurrency Stress Specialist** — audits concurrency race conditions and SQLite transactional locks.
3. **Reactive Fuzz & Refusal Specialist** — validates refusal boundaries under corrupt/malicious input formats.
4. **Reactive Resource Leak Auditor** — audits heap consumption stability and profiler output.
5. **Reactive CLI & Integration Specialist** — verifies the Doctor agent command routing and synthesis generation.

No lifecycle proof is complete without parallel verification of these 5 agent fronts.

---

# SUBAGENT CONFIGURATION & MAXIMIZATION LAW

To maximize the performance, throughput, and safety of spawned subagents:

1. **Workspace Modes**: Prefer invoking subagents with explicit `Workspace` parameters:
   - Use `Workspace: "share"` when parallel checkouts or branches are needed, leveraging Git worktrees to prevent redundant filesystem duplication.
   - Use `Workspace: "branch"` to isolate speculative executions (e.g., fuzzing, performance runs) and protect the master directory.

2. **Auto-Approval (YOLO / Sandbox)**: For automated execution loops, configure settings to skip manual prompts:
   - Ensure the global settings config is set to `"general": { "approval_mode": "yolo" }` or invoke the CLI with `--dangerously-skip-permissions`.
   - Prefer `"proceed-in-sandbox"` mode to auto-approve tool execution inside the sandbox container.

3. **Tool Interceptions**: Local repository custom hooks in `.agents/hooks.json` must align with the CLI's tool naming conventions:
   - Matcher patterns must explicitly intercept modern tool names (`write_file`, `replace`, `run_shell_command`).
   - Hooks must evaluate against local SQLite journals (`gall_truex.db`) before permitting filesystem writes, establishing instant Jidoka line stops on law violation.

4. **Specialized Subagent Mapping**: Instead of running a single bloated agent context:
   - Spawning agents must register workspace-specific TS subagents under `.agents/` (e.g., `truex-doctor.ts`) and delegate execution tasks directly to them.
   - Keep interactions bounded using subagent timeout constraints (default 60 seconds) to avoid parent context truncation.

---

# FINAL INVARIANT

Complex operational trust may only emerge from:

Receipted composition of working lawful primitives.

Civilization scales on receipted consequence.

