# Sheep Gate — Knowledge Hooks / AKA / Truex

## Gate Definition
The Sheep Gate governs the consequence lifecycle: admission, refusal, and partial states.

## Pass Criteria
1. Hook definitions exist
2. ADMIT / REFUSE / PARTIAL schema is valid and enforced
3. Receipt schema is defined
4. Replay law is documented
5. At least one BLAKE3-verified receipt has been successfully emitted
6. No direct action bypasses hook judgment

## ALIVE Condition
SheepGate.evaluate() returns PASS when all 6 criteria are met.

## Doctrinal Grounding
"No hook, no consequence. No receipt, no lawful completion. No replay, no audit."

## Firmament Grounding
- **SPR Ledger:** `process-intelligence/firmament/FIRMAMENT_PROJECT_SPR_LEDGER_002.md`, entry 3 (Knowledge Hooks / AKA / Truex)
- **Wall Gate Assignment:** Sheep Gate (primary) / Inspection Gate (secondary)
- **Wall Role:** Governs the consequence lifecycle — the mechanism by which knowledge-triggered actions (hooks) produce verifiable downstream effects without manual intervention.

## Implementation
- **ProofGate enum:** `crates/truex-kernel/src/proof_gate_registry.rs` — `SheepGate` variant with full criteria in doc comment
- **HookOutcome enum:** `crates/truex-kernel-types/src/hook_lifecycle.rs` — `Admit`, `Refuse`, `Partial` variants with serde, Display, and transition enforcement
- **JSON Schema:** `docs/schemas/hook-outcome.schema.json` — JSON Schema 2020-12 for HookOutcome

## ALIVE Receipt
`receipts/KNOWLEDGE_HOOKS_ALIVE_001.yaml` — issued 2026-06-02, 38 passing tests, blake3: `67b0e0b7e9484dd501aef680401cd07005a6b8fd52ffb50f0c632bc4d22ead46`
