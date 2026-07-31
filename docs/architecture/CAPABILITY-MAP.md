# Truex Capability Map

`src/capabilities.ts` is the executable authority. This document is its human projection.

## Inventory

| Class | Count |
|---|---:|
| TypeScript packages | 17 |
| Rust crates | 11 |
| Doctor proofs | 42 |
| Wizard verbs | 10 |
| Telco verbs | 2 |
| Process-mining verbs | 2 |
| ggen and Genesis integrations | 2 |
| **Total** | **86** |

## Dependency law

```text
hash → signature → receipt → replay → engine → sqlite
```

Membrane, hooks, topology, mailbox, agents, planning, integration, and finalization are downstream. A higher node cannot establish standing if a dependency is not `ALIVE`.

## Main surfaces

- TypeScript: contracts, membrane, config, kernel-wasm, ML, planner, kernel, observability, storehouse, vow, engine, agents, cognition, swarm, testing, Supabase projection, and ZOE LA example.
- Rust: kernel types, utilities, macros, algorithms, TPS metrics, MiniML, Prolog8, Insa RepLaw, cognition, WASM kernel, and the native `wpm` CLI.
- Wizard: `init → map → plan → forge → bind → prove → harden → handoff`, plus `simulate → walkthrough`.
- Telco: `ingest → validate`.
- Process mining: real JSON/XES parsing, DFG/heuristic/Alpha discovery, and conformance against the supplied DFG.
- ggen: control-plane plan and receipt admission; `enable` and cloud actuation remain excluded.

## Proof commands

```bash
pnpm capabilities
pnpm capabilities:verify
pnpm capabilities:prove
pnpm capabilities:prove -- --id doctor:finalization
pnpm doctor:capability -- <primitive>
```

Static nodes start at `UNKNOWN`. Proof execution emits receipt-bearing states under `.truex/capabilities/`.

## Explicitly blocked legacy crowns

The proof broker refuses these former success paths until real fixtures replace them:

- `doctor-wizard-telco-unified`: fabricated elapsed time and mock agent reports;
- `telemetry-integration`: no admitted operations-and-receipts fixture;
- `unified-integration`: delegates through the mocked unified flow;
- `capability-breakpoints`: could consume stale reports after a failed test command.

Valid standings are `PARTIAL_ALIVE`, `ALIVE`, `BLOCKED`, `BUILD_BROKEN`, `UNKNOWN`, and `UNSUPPORTED`.
