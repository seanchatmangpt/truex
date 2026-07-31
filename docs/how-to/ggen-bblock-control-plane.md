# Admit a ggen control-plane building block

Truex consumes deterministic construction artifacts produced by `ggen bblock plan`. At this Gall stage it does **not** run `ggen bblock enable`, invoke a cloud provider, or promote infrastructure into runtime actuation.

## Manufacture the plan

Run ggen from the Truex repository root:

```bash
ggen bblock plan fortune5-control-plane aws
```

Replace `aws` with `azure` or `gcp` when required. The command should materialize:

```text
.ggen/bblocks/plans/<provider>/fortune5-control-plane.json
.ggen/bblocks/receipts/<provider>/fortune5-control-plane-plan-intent.json
.ggen/bblocks/receipts/<provider>/fortune5-control-plane-plan-result.json
```

## Admit the construction receipts

```bash
pnpm doctor:ggen-bblock -- \
  --plan .ggen/bblocks/plans/aws/fortune5-control-plane.json \
  --intent .ggen/bblocks/receipts/aws/fortune5-control-plane-plan-intent.json \
  --result .ggen/bblocks/receipts/aws/fortune5-control-plane-plan-result.json
```

A successful proof prints an `ADMITTED` result containing the provider, requested group, plan digest, result-receipt digest, dependency closure, and pack closure.

Admission requires:

- `ggen.bblock.plan.v1` and `ggen.bblock.receipt.v1` schemas;
- provider closure over `aws`, `azure`, or `gcp`;
- the complete dependency closure for `fortune5-control-plane`;
- Gall, BRCE, replay, receipt-ledger, conservation, and legality packs;
- BLAKE3-shaped catalog, plan, and receipt digests;
- exact plan-to-receipt field agreement;
- causal linkage from `plan-intent` to `plan-result`;
- canonical repository-relative artifact paths;
- unique groups, directories, packs, and artifacts.

Every failed admission uses the typed boundary:

```text
GGEN_BBLOCK_REFUSED: <reason>
```

## Prove the Genesis composition

```bash
pnpm proof:genesis
```

The Genesis proof now passes one deterministic execution context through Storehouse receipting and advances the Vow with the actual BLAKE3 receipt hash. Identical admitted context and consequence replay to the same receipt identifier.

## Exclusion

`ggen bblock enable` remains outside this proof. Enabling packs or actuating infrastructure is forbidden until the lower Truex receipt, replay, engine, and persistence primitives are independently observed as `ALIVE` in the target checkout.
