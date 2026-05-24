# Truex Reference: Information-Oriented

Reference material is technical description. It provides the API footprint, the mathematical laws, and the exact constraints of the Truex operating system.

## 1. The Gall Sequencing Law

Truex enforces **Gall Sequencing**: Complex systems must emerge from working simple systems.
- **S₀ (Ledger):** Hashing (`BLAKE3`), Canonicalization, and ML-DSA Signatures.
- **S₁ (Replay):** Deterministic Contexts, Seeded Entropy, Replay Convergence.
- **S₂ (Engine):** The `TruexHook`, `GraphDelta`, and TPS Manufacturing Line.
- **S₃ (Persistence):** SQLite WAL, `DeltaJournal`, `TransactionalMembrane`.
- **S₄ (Observatory):** AST-driven Ontology, Fact Emitters, AGY Bridge.
- **S₅ (Topology):** Local OTP-equivalence (Mailboxes, Supervisors, Process Isolation).

## 2. Core Primitives

### `TruexHook`
The bounded operational morphism: $H = (\Delta, C, E, R, \Pi)$
- `matches(delta: GraphDelta): boolean`
- `execute(ctx: TruexContext, delta: GraphDelta, prevHash: string): { effects, receipt, events }`
- `replay(ctx: TruexContext, delta: GraphDelta, expectedReceipt: Receipt): boolean`

### `GraphDelta`
The standard unit of state mutation.
```typescript
type GraphDelta = {
  id: string;
  adds: Quad[];
  deletes: Quad[];
}
```

### `Receipt`
The unforgeable proof of operational consequence.
```typescript
type Receipt = {
  id: string;
  eventId: string;
  deltaId: string;
  inputHash: string;
  outputHash: string;
  previousReceiptHash: string | undefined;
  status: 'confirmed' | 'refused';
  receiptHash: string;
}
```

## 3. CLI Calculus

Truex strictly limits the top-level operational nouns to prevent command sprawl:
- `truex doctor`: Autonomic validation, invariant testing, and proofs.
- `truex wizard`: Counterfactual simulation and task walks.
- `truex telco`: Membrane orchestration and network boundaries.

**Subcommands for `doctor prove`:**
- `hash`, `signature`, `receipt`, `replay`, `engine`, `membrane`, `sqlite`, `adapter`, `hook`, `repository`, `benchmark`, `hook-otp`, `topology`, `ontology`.

## 4. Operational Control Laws (TPS)

- **Jidoka:** Any failure in validation, hashing, or capacity limits throws a hard error, stopping the execution line (Refusal Receipt).
- **Kanban:** Hooks are evaluated lazily; they are only pulled into execution if their `condition` predicate matches the incoming `GraphDelta`.
- **Heijunka:** Capacity limits (e.g., maximum 100 quads per delta) prevent *Muri* (overburden) on the single-threaded Node.js event loop.
