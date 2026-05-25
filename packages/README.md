# wasm4pm TypeScript Packages

10 packages forming the TypeScript orchestration layer around the Rust/WASM core.

## Dependency Graph

```
Application Layer:  apps/wasm4pm/
    ↓
Orchestration:    engine → planner → swarm → ml
    ↓
Foundation:      kernel → config → contracts → observability
    ↓
WASM Layer:       wasm4pm/ (Rust/WASM core)
```

## Packages

| Package | Role |
|---------|------|
| `@truex/contracts` | Shared types, receipts, errors, plans, hashing (leaf, no deps) |
| `@truex/config` | Zod-validated config, `resolveConfig()`, 5-layer precedence |
| `@wasm4pm/kernel` | WASM facade — 41 algorithms, `run()`, `stream()` |
| `@truex/engine` | Lifecycle state machine (uninitialized → watching / failed) |
| `@truex/planner` | `plan(config)` → ExecutionPlan, `explain(config)` → string |
| `@truex/observability` | 3-layer: CLI human, JSONL machine, OTEL spans |
| `@truex/testing` | Parity, determinism, CLI, OtelCapture, certification gates |
| `@truex/ml` | Micro-ML: classify, cluster, forecast, anomaly, regress, PCA |
| `@truex/swarm` | Multi-worker coordinator with convergence detection |

## Build

```bash
pnpm build     # Build all
pnpm test      # Test all
cd <package> && npm test  # Test one package
```
