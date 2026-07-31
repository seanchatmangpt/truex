# Truex

Truex is a receipted operational manufacturing substrate. Its governing path is:

```text
GraphDelta → Hook → Effect → Receipt → Replay
```

The repository admits a capability only when its implementation, dependency closure, executable proof, and receipt agree. Documentation and package metadata are not standing evidence.

## Capability map

Truex maintains one executable capability graph covering:

- 17 TypeScript workspace packages;
- 11 Rust crates;
- 42 Doctor proofs;
- 10 Wizard lifecycle verbs;
- 2 Telco operational verbs;
- 2 process-mining verbs;
- the ggen building-block and Genesis integration proofs.

```bash
pnpm capabilities
pnpm capabilities:verify
pnpm capabilities:prove
pnpm capabilities:prove:all
pnpm capabilities:prove -- --id doctor:finalization
```

`capabilities:verify` refuses duplicate package keys, missing implementations, dependency cycles, stale repository metadata, unsafe paths, and `ALIVE` declarations without proof commands. `capabilities:prove` runs the foundational Gall ladder. `capabilities:prove:all` executes every proof-bearing node. Both write receipt-bearing run evidence under `.truex/capabilities/`.

## Foundational proof ladder

```bash
pnpm doctor:capability -- hash
pnpm doctor:capability -- signature
pnpm doctor:capability -- receipt
pnpm doctor:capability -- replay
pnpm doctor:capability -- engine
pnpm doctor:capability -- sqlite
```

Higher capabilities must not outrun this sequence.

## ggen building blocks

Truex admits the deterministic plan and chained receipts produced by:

```bash
ggen bblock plan fortune5-control-plane aws
pnpm doctor:ggen-bblock -- \
  .ggen/bblocks/plans/aws/fortune5-control-plane.json \
  .ggen/bblocks/receipts/aws/fortune5-control-plane-plan-intent.json \
  .ggen/bblocks/receipts/aws/fortune5-control-plane-plan-result.json
```

This is local construction only. It does not call a cloud API, Terraform, Pulumi, Kubernetes, or any other downstream actuator.

## Genesis replay

```bash
pnpm proof:genesis
```

The Genesis proof routes a deterministic Storehouse consequence, advances the Vow with the actual BLAKE3 receipt digest, and rejects placeholder or unreceipted closure.

## Process mining

The native `wpm` CLI is the authoritative local process-mining surface:

```bash
cargo run -p truex-kernel-cli -- mining discover examples/log.json --algo dfg
cargo run -p truex-kernel-cli -- mining conformance examples/log.json examples/model.dfg.json
```

The TypeScript `truex pm` bridge is downstream of the generated `@truex/kernel-wasm` package. Generate it through the package build; never hand-edit files under `packages/kernel-wasm/pkg/`.

## Development

```bash
corepack enable
corepack prepare pnpm@9.14.2 --activate
pnpm install --frozen-lockfile
pnpm ci
cargo test --workspace
```

## Standing vocabulary

Truex uses only these states:

```text
PARTIAL_ALIVE | ALIVE | BLOCKED | BUILD_BROKEN | UNKNOWN | UNSUPPORTED
```

`UNKNOWN` is not admission. `ALIVE` requires observed execution and a replayable receipt.

## License

MIT OR Apache-2.0 unless a package states a narrower license.
