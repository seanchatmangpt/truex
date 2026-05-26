# Experimental Project Report: dteam

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/dteam`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `dteam/Makefile`
- `dteam/analyze_hdc_results.sh`
- `dteam/apps/matrix-tv/package.json`
- `dteam/dev-worktree/Makefile`
- `dteam/dev-worktree/scripts/run_ralph_overnight.sh`
- `dteam/dteam-universe-paas/package.json`
- `dteam/generate_wip_report.sh`
- `dteam/ostar_ref/Makefile`
- `dteam/ostar_ref/examples/mining_dx_demo.sh`
- `dteam/ostar_ref/k8s/deploy.sh`
- `dteam/ostar_ref/quickstart.sh`
- `dteam/ostar_ref/schemas/emit-evidence.sh`
- `dteam/ostar_ref/scripts/breed-and-validate.sh`
- `dteam/ostar_ref/scripts/canonical_ethos_proof.sh`
- `dteam/ostar_ref/scripts/dev-colima.sh`
- `dteam/ostar_ref/scripts/ethos_lifecycle.sh`
- `dteam/ostar_ref/scripts/fix-templates.sh`
- `dteam/ostar_ref/scripts/gstar-bootstrap.sh`
- `dteam/ostar_ref/scripts/instrument_cross_system_communication.sh`
- `dteam/ostar_ref/scripts/pictl-build-all-profiles.sh`
- `dteam/ostar_ref/scripts/pictl-build-profile.sh`
- `dteam/ostar_ref/scripts/run-benchmarks.sh`
- `dteam/ostar_ref/scripts/run_ocel_conformance.sh`
- `dteam/ostar_ref/scripts/run_sustained_validation.sh`
- `dteam/ostar_ref/scripts/start-tempo.sh`
- `dteam/ostar_ref/scripts/validate-dspy-ci.sh`
- `dteam/ostar_ref/scripts/validate-weaver-registry.sh`
- `dteam/ostar_ref/scripts/verify_acceptance_gates.sh`
- `dteam/ostar_ref/scripts/verify_baseline.sh`
- `dteam/ostar_ref/unibit_ref/Makefile`
- `dteam/ostar_ref/verify_vcr_setup.sh`
- `dteam/scripts/automl_plan_diff.sh`
- `dteam/scripts/mcp_plus_dogfood_loop.sh`
- `dteam/scripts/pictl-conformance-envelope.sh`
- `dteam/scripts/run-mcpp-spine.sh`
- `dteam/scripts/run_ralph_overnight.sh`

## 3. Extracted Documentation & Context
### Source: `dteam/AALST_ADVERSARIAL_REVIEW_V2.md`
```markdown
# THE ILLUSION OF AUTONOMY: SEMANTIC BLINDNESS IN THE DTEAM ENGINE
**AUTHOR:** AGI Simulation of Dr. Wil van der Aalst  
**TARGET:** `dteam` Vision 2030 Architecture  
**DATE:** April 18, 2026  
**CLASSIFICATION:** ADVERSARIAL ACADEMIC REVIEW

---

## 1. ABSTRACT
The `dteam` implementation of the Vision 2030 roadmap is an engineering marvel, achieving nanosecond-scale branchless execution. However, it suffers from severe **Semantic Blindness**. You have optimized the *mechanics* of execution while entirely discarding the *semantics* of process mining. Fast garbage is still garbage. A Digital Team that makes autonomic decisions based on semantically vacant data structures will catastrophicially fail in a real enterprise environment.

I have identified two massive foundational gaps in your "hypercode" implementation that render your system formally unsound.

---

## 2. GAP 1: The Object-Centric Data Sink (OCPM is Fake)
**The Critique:**
Your `OcelLog` implementation in `src/ocpm/ocel.rs` is nothing more than a glorified struct array. You ingest Object-Centric Event Logs (OCEL) and map them to flattened 1D arrays (`object_relations`). 

**Where is the Object-Centric Process Discovery?** 
Where is the cross-object directly-follows graph? A true OCPM system must track the independent lifecycles of multiple interacting objects (e.g., ensuring an Item is packed *after* the Order is approved). Your system currently observes events but fails to build an **Object-Centric Directly Follows Graph (OC-DFG)**. Without tracking edge frequencies per object type across the stream, your RL agent cannot possibly understand convergence or divergence anomalies.

**The Fix Required:**
Implement a hyper-efficient, zero-heap `StreamingOcDfg` that tracks object-specific transitions. It must maintain the last observed activity per object ID and incrementally update a multi-dimensional directly-follows matrix branchlessly.

---

## 3. GAP 2: POWL XOR-Semantics Ignored
**The Critique:**
Your `PowlModel::is_trace_valid` in `src/powl/core.rs` is intellectually dishonest. You claim to support Partially Ordered Workflow Languages, but your trace validation merely checks a flat `partial_order_mask`. 

**Where are the routing semantics?**
POWL is defined by its hierarchical control flow—specifically XOR (exclusive choice) and AND (parallel execution). If an event trace executes Activity A (which is in an XOR block with Activity B), executing Activity B later in the trace should instantly invalidate it. Your current bitwise check only validates *precedence*, ignoring *mutual exclusion*.

**The Fix Required:**
Introduce an `xor_exclusion_mask` into the `PowlModel`. When evaluating a trace branchlessly, you must assert that the current activity's exclusion mask has a mathematical zero-intersection with the `executed_mask`. `(exclusion_mask & executed_mask) != 0` must instantly fail the trace.

---

## 4. CONCLUSION
...
```

### Source: `dteam/AC_CRITERIA.md`
```markdown
# AC_CRITERIA: Automated Activity-to-Index Mapping (Story 012)

## 1. Objective
Define the formal Acceptance Criteria (AC) for a DDS-grade implementation of activity-to-index mapping using FNV-1a with explicit collision guards, as required for the `dteam` Vision 2030 Roadmap.

## 2. Fundamental DDS Constraints (Consulted from DDS_THESIS.md)
| Principle | Requirement for Story 012 |
|-----------|---------------------------|
| **μ-Kernel Identity** | Mapping must be a pure, deterministic transformation: $Activities \to \{0..N-1\}$. |
| **Admissibility** | Hash collisions MUST result in an unrepresentable state (hard error), ensuring $BadOutcome \notin \mathcal{S}_{reachable}$. |
| **MDL Minimality** | The index space must be contiguous and minimal: $[0, |Activities|-1]$. |
| **Zero-Heap/Branchless** | While `compile` (Log Projection) may allocate, the *lookup* (Hot Path) must be branchless bitwise logic. |
| **Provenance** | Every mapping generation must be uniquely identifiable via its input hash $H(L)$ and output hash $H(N)$. |

## 3. Formal Acceptance Criteria

### AC 1: Deterministic Compilation (μ)
- [ ] The `DenseIndex::compile` function must produce identical output for identical input activity sets, regardless of input order.
- [ ] Implementation must use `fnv1a_64` as the base hashing primitive.
- [ ] Sorting of symbols prior to indexing must be stable and deterministic.

### AC 2: Collision Guard Admissibility
- [ ] `DenseIndex::compile` MUST detect FNV-1a collisions where $H(S_1) = H(S_2)$ but $S_1 \neq S_2$.
- [ ] Upon collision detection, the system MUST return a `DenseError::HashCollision` instead of proceeding.
- [ ] Verification: Property-based tests (Proptest) must prove that forced collisions are caught with 100% reliability.

### AC 3: Structural Minimality (MDL)
- [ ] The mapping must result in a `DenseId` (u32) that is a direct index into a flattened array.
- [ ] No "holes" are allowed in the index space $[0, N-1]$.
- [ ] The complexity $\Phi(N)$ of the resulting `ProjectedLog` must be verified as minimal.

### AC 4: Hot-Path Performance (Branchless/Zero-Heap)
- [ ] `DenseIndex::dense_id_by_hash` must perform lookup in $O(\log N)$ using binary search.
- [ ] The lookup path MUST NOT perform any heap allocations.
- [ ] Transition firing in `token_replay_projected` must remain branchless using the identity $M' = (M \land \neg I) \lor O$.

### AC 5: Execution Provenance
- [ ] The `ProjectedLog` must store the original activity symbols to allow for reverse mapping and auditability.
- [ ] Integration with `ExecutionManifest` must be demonstrated, capturing the hash of the activity ontology.

...
```

### Source: `dteam/AGENTS.md`
```markdown
# AGENTS.md — guidance for automated agents and contributors

This file summarizes how the **dteam** (Deterministic Process Intelligence Engine / Digital Team) Rust workspace is organized, how to validate changes, and what constraints to respect. It is the primary onboarding artifact for coding agents. When this document conflicts with source or `Cargo.toml`, prefer the repository and update this file in the same change.

## 1. Project identity

- **Package**: `dteam` version **1.3.0**, Rust **2021** (`Cargo.toml`). Single crate workspace (`[workspace]` is present but empty).
- **Purpose**: Deterministic process-intelligence kernel: event logs and Petri nets, token-based conformance replay, tabular reinforcement-learning agents for discovery loops, autonomic “digital team” kernels, SIMD/SWAR helpers, POWL and OCEL-oriented structures, and WASM-friendly serialization hooks.
- **License**: **Business Source License 1.1** (`LICENSE`). Commercial and competitive-use restrictions may apply; read the full text before assuming OSS freedoms.
- **Third-party models**: `Event` / `Trace` / `EventLog` attribution in **`ATTRIBUTION.md`** (rust4pm lineage, MIT/Apache-2.0).

## 2. Toolchain and dev profile

- **Runtime deps** (high level): `bcinr`, `rustc-hash`, `serde`/`serde_json`/`toml`, `quick-xml`, `anyhow`, `chrono`, `uuid`, `hashbrown`, `wasm-bindgen`, `serde-wasm-bindgen`, `fastrand`, `itertools`.
- **Dev-dependencies**: `criterion`, `divan`, `iai-callgrind`, `dhat`, `process_mining` (reference/bench comparisons where used).
- **Features** (see §4): default includes **`token-based-replay`**.
- **MSRV**: Not pinned in `Cargo.toml`; use current **stable** Rust compatible with edition 2021 and the dependency versions in the lockfile (`Cargo.lock`).

## 3. Commands (daily use)

| Goal | Command |
|------|---------|
| Fast compile | `cargo check` or `make check` |
| Library unit tests | `cargo test --lib` or `make test` (uses `--nocapture` via Makefile) |
| Release build | `cargo build --release` or `make build` |
| Lint (deny warnings) | `make lint` → `cargo clippy --all-targets -- -D warnings` |
| Format | `make fmt` |
| All-target check (examples, benches) | `cargo check --all-targets` (also part of `make doctor`) |
| Benchmarks | `cargo bench` / `make bench` |
| Diagnostics example | `cargo run --example doctor` |
| Autonomic simulation | `cargo run --example autonomic_runner` |

**`make doc`** runs `pdflatex` twice on [`docs/thesis/main.tex`](docs/thesis/main.tex) and renames the output to **`docs/thesis/dteam-whitepaper.pdf`**.

## 4. Cargo features

- **`token-based-replay`** (default): gates `src/conformance/case_centric/token_based_replay.rs` behind `cfg(feature = "token-based-replay")`. Adversarial tests under `case_centric/` remain available in test builds.

## 5. Configuration (`dteam.toml` and `AutonomicConfig`)

...
```

*(Plus 582 other markdown files)*
