# Experimental Project Report: unibit

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/unibit`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `unibit/Makefile`
- `unibit/bin/sr.sh`
- `unibit/bin/test-sr-honesty.sh`

## 3. Extracted Documentation & Context
### Source: `unibit/CLAUDE.md`
```markdown
# unibit

Nightly Rust POC: pinned, bit-native L1 execution substrate.

Phase 0 goal: prove that a fixed resident truth region and equally bounded scratch region can be pinned, validated, executed over, and inspected at the assembly level — without exposing the execution substrate to ordinary runtime ambiguity.

## Quick Start

    cargo run -p unibit-smoke        # Phase 0 smoke proof
    cargo xtask doctor               # machine readiness report
    cargo xtask dx                   # fast DX loop (fmt + clippy + tests + lexicon)
    cargo xtask prove                # full local proof
    node bin/check-lexicon.mjs       # lexicon check standalone

## Workspace

    unibit/
    ├── crates/unibit-kernel/    ← word kernel (UCell, UMask, UDenial, admit3/4, commit_masked, execute_step, execute_step_multi)
    ├── crates/unibit-l1/        ← L1 region types (TruthBlock, Scratchpad, L1Region, UProjection)
    ├── crates/unibit-mustar/    ← semantic-to-kinetic compiler (GlobeCell, Activity, MotionPacket, compile_activity)
    ├── crates/unibit-causality/ ← BLAKE3 causal receipt chain (UCausalReceipt, causal_mix)
    ├── crates/unibit-unios/     ← typestate admission OS (UMotion<S>, OperationalEpoch, admit_motion, EpochTable)
    ├── crates/unibit-macros/    ← ontology DSL (ubit_ontology! macro)
    ├── crates/unibit-smoke/     ← integration binary; proves all properties, prints [PASS]
    ├── crates/unibit-asmcheck/  ← assembly verifier (verify_no_branch, verify_no_memory_access, verify_tier_*)
    ├── crates/unibit-bench/     ← Criterion benchmarks (T0–T3 tiers + mustar/causality/unios) + tier budgets / regression / canary
    ├── crates/unibit-hdc/       ← HDC kernels (T0Kernel64, T1Hdc128, T1Hdc256, Hv512, scalar/ref admit_commit)
    ├── crates/unibit-hot/       ← hot-path tiers (t0/t1/t2) + ML projections (knn, naive_bayes, stump, logistic)
    ├── crates/unibit-dsi/       ← Decision-Sufficient Information verifier (4-criteria preservation)
    ├── crates/unibit-preference/← 6-region preference field + Trajectory<T> from receipt chains
    ├── crates/unibit-e2e/       ← 60 arena tests (Sprawl trilogy + HDIT formalization)
    ├── docs/hdit/               ← HDIT formal specs (DSI, tier contract, POWL lowering, benchmark doctrine, preference/trajectory)
    ├── xtask/                   ← cargo xtask commands (NOT a workspace member)
    └── bin/check-lexicon.mjs    ← lexicon enforcer (Node.js ESM)

## Build Commands

All developer commands go through `cargo xtask`. Never use raw `cargo` invocations for full-project work — use xtask.

```bash
...
```

### Source: `unibit/CONTRIBUTING.md`
```markdown
# Contributing to unibit

We operate on a strictly gated, bit-native L1 execution substrate. Contributions are not merely "code reviews"; they are formal state transitions submitted for admission.

## The Explore/Exploit Workflow

1. **Explore (Gemini / Spec Kit)**
   - Do not write code first.
   - Expand the possibility space, map public ontologies, and surface non-obvious risks.
   - Generate candidate semantic deltas in the `docs/` or `spec/` boundaries.
   - Ensure the intent is captured using public RDF vocabularies (e.g., ODRL for policies, DCAT for specs).

2. **Specify and Plan**
   - Translate the intent into executable instructions (POWL8 / POWL64).
   - Ensure the planned transition is branchless and respects the `UCell` / `UMask` primitives.

3. **Exploit (Claude Code)**
   - The Exploit operator implements the chosen, narrowed path.
   - Run the fast DX loop: `cargo xtask dx`.
   - Run the full local proof gate: `cargo xtask prove`.

## Admissibility Criteria
Your PR (candidate transition) will be denied if it fails any of the three kernel gates:
- **Prerequisite Gate**: The code must compile cleanly on the pinned `nightly` toolchain.
- **Law Gate**: The code must strictly obey the `rust-lexicon.md` laws. No forbidden words.
- **Capability Gate**: The code must pass all tiered benchmarks, assembly inspections, and typestate validations.

Do not attempt to bypass the kernel. If a gate denies the transition, the state and receipt remain unchanged. Fix the trajectory and try again.
...
```

### Source: `unibit/DEF-OF-DONE.md`
```markdown
# Definition of Done (DoD)

This repository operates under a strict admissibility model, not a loose integration model. A feature, fix, or transition is only "Done" when it passes the constitutional compiler boundary.

## 1. Zero-Regression Maturity Matrix
- **T0/T1/T2/T3 Tiers**: The change must execute within the defined nanosecond budgets (e.g., T0 kernel operations under 500ps, T1 under 200ns). `cargo xtask bench` must pass.
- **Assembly Inspection**: Hot-path modifications must not introduce branches or memory access violations. `cargo xtask asm` must pass `verify_no_branch`.

## 2. Cryptographic and Causal Provenance
- **Receipt Emission**: Every state transition (`execute_step`) must emit a deterministic `UReceipt` (FNV-1a) and/or `UCausalReceipt` (BLAKE3).
- **Proof Replay**: The generated event tape must perfectly replay to the expected receipt via `verify_receipt_chain`.

## 3. Typestate and Memory Safety
- **L1 Layout**: Any structural changes to `TruthBlock`, `Scratchpad`, or `L1Region` must pass compile-time `#[repr(C, align(64))]` assertions and pointer-math granularity checks.
- **Typestate OS**: `UMotion<Pending>` must only transition to `UMotion<Hot>` via `admit_motion`, and to `UMotion<Spent>` via `execute_motion`. Compile-time typestate rules must remain unbroken.

## 4. Lexicon Compliance
- **No Forbidden Words**: The change must strictly adhere to the unibit lexicon (`bin/check-lexicon.mjs`). Terms like `byte`, `buffer`, `fake`, `stub`, `load`, and `store` are explicitly forbidden and must be replaced with their lawful semantic equivalents (`octet`, `UCell`, `commit`, etc.).

## 5. Explore/Exploit Boundary
- **Candidate Normalization**: No exploratory output (e.g., LLM generated Markdown) is authoritative until normalized into the public RDF graph (O*).
- **Accepted Deltas**: No repository change is truth until it is an accepted implementation delta derived from the selected O* and applied by the Exploit operator.
...
```

*(Plus 79 other markdown files)*
