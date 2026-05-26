# Experimental Project Report: insa

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/insa`

## 1. Audit Status
- **Test Status:** ⚠️ No Tests Found / Not Executable

## 2. Executable Entry Points
- `insa/scripts/audit-cli-thin.sh`
- `insa/scripts/install-hooks.sh`

## 3. Extracted Documentation & Context
### Source: `insa/AGENTS.md`
```markdown
# INSA AGENTS.md Operating Contract

This repository is governed by the Toyota Code Production System (TCPS) and the INSA Byte Law. 
As an AI agent operating in this repository, you must strictly adhere to the following rules. 
Failure to follow these rules is considered a critical defect and an architectural violation.

## 1. The Meaning of "Done"
- **No fake completion:** You must not claim a task is "done" just because the code compiles or looks plausible.
- **Evidence-first completion:** "Done" means evidentiary operational closure. It requires: closed field + lawful motion + bounded delta + canonical evidence + deterministic replay.
- **Stop the line:** Treat narrative-only proof as a defect. If a route cannot be proven, block it.
- **Completion Format:** Every completion report must include: Summary, Files changed, Commands run, Evidence (e.g., `just unrdf-check`, `doctor check --scope ontology,generated`, `truthforge ontology`), Blocked/unknown, and Next required gate.

## 2. Core Architectural Laws
- **Do not preserve exploration debt:** Delete code that exists only as exploration.
- **Do not treat MCP/A2A/HITL as cognition:** They are bounded projections after local instinct resolution fails to close.
- **Do not let projection results mutate state:** They must re-enter as `Observation -> CONSTRUCT8 -> O*`.
- **Do not widen Need9 first:** `Need9` means decompose, sequence, compose, or add another byte lane. It does not mean widen to `u16` or `Vec`.
- **Do not emit without proof:** Unproofed emission is structurally forbidden.
- **Do not report without replay:** Board/security reports are derived from POWL64 replayable evidence, not generated prose.
- **Do not use stable/nightly as authority boundary:** The boundary is `admitted` vs `unadmitted`. Nightly/SIMD/intrinsic paths are permitted when they provide a control edge and match the `ReferenceLawPath`.

## 3. unrdf Manufacturing Rules
`unrdf` is the ontology-to-artifact manufacturing station.
- **Do not edit generated artifacts by hand:** Generated outputs (in `crates/insa-generated/`, `docs/generated/`, etc.) are read-only manufactured parts.
- **Do not wrap unrdf with INSA CLI commands:** Use `just unrdf-sync` and `just unrdf-check`.
- **Do not generate hot-path machine law from ontology templates:** `unrdf` generates semantic projections (IRI constants, docs, Zod schemas, failure catalogs). Handcraft hot law.
- **Do not put ontology selection logic inside Nunjucks:** SPARQL selects; Nunjucks projects.
- **Do not claim done if generated artifacts are stale:** You must run `just unrdf-check`.
- **Atomic Commits:** Do not modify generated output without committing the source ontology/query/template changes together.

## 4. CLI Rules (`clap-noun-verb`)
`clap-noun-verb` provides the operational command grammar.
- **Thin CLI Wrappers:** Allowed: parse arguments, build request structs, call domain functions, return serializable output, map status to exit code. Forbidden: implementing domain law in CLI wrappers.
- **No filesystem mutation without plan/receipt:** Commands like `wizard apply` or `telco bind` must follow the plan/preview/apply/receipt/verify pattern.
- **No prose-only output for primary commands:** Output must be structured JSON.
- **Exit codes are mandatory:** Commands must map status to standard exit codes (0 = OK, 1 = BLOCKED, 2 = UNKNOWN, etc.).
- **No hidden interactive prompts in CI paths:** Use `--dry-run` and `--yes` for mutations.

## 5. Telco Rules (Communication Service Assurance)
`telco` is the provisioned communication service layer, not ping/curl.
...
```

### Source: `insa/AUDIT.md`
```markdown
# INSA Read-Only Audit Pass

**Date:** 2026-05-01
**Scope:** Wave 8 final security/audit pass. Read-only inspection plus
allowed minor cleanup (license files, README, this document). No `.rs`
source was modified.

---

## 1. `cargo audit`

`cargo-audit` is installed (`/Users/sac/.cargo/bin/cargo-audit`).

Scanned 353 transitive crate dependencies against 1067 RustSec advisories.

**Result:** 0 vulnerabilities. 4 informational warnings, all transitive
through the `clap-noun-verb` / `clap-noun-verb-macros` dependency
(version 26.5.1) consumed by `insa-cli`:

| ID                | Crate              | Class          | Path                                            |
|-------------------|--------------------|----------------|-------------------------------------------------|
| RUSTSEC-2024-0375 | `atty` 0.2.14      | unmaintained   | `atty -> clap-noun-verb -> insa-cli`            |
| RUSTSEC-2021-0145 | `atty` 0.2.14      | unsound        | (same)                                          |
| RUSTSEC-2024-0370 | `proc-macro-error` | unmaintained   | `proc-macro-error -> clap-noun-verb-macros`     |
| RUSTSEC-2026-0002 | `lru` 0.12.5       | unsound        | `lru -> clap-noun-verb -> insa-cli`             |

**Action:** none in this pass. All four are upstream-vendor concerns in
the `clap-noun-verb` family. Track for upstream bump.

---

## 2. License field coverage

| Surface                      | Count | Status                          |
|------------------------------|-------|---------------------------------|
| `[workspace.package].license`| 1     | `MIT OR Apache-2.0`             |
| Member crates                | 23    | all `license.workspace = true`  |
| `xtask`                      | 1     | `license.workspace = true`      |
| Root manifest                | 1     | `license = "MIT OR Apache-2.0"` |

...
```

### Source: `insa/CHANGELOG.md`
```markdown
# Changelog

All notable changes to INSA will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

See also: [CONTRIBUTING.md](CONTRIBUTING.md), [MIGRATION.md](MIGRATION.md).

## [Unreleased]

(none)

## [0.1.0-alpha.0] - 2026-05-02

### Added
- RC closure Phase 10 (T045): `release-cargo-publish-dry` justfile recipe runs `cargo publish --dry-run` for all 21 publishable crates and captures verbatim evidence to `.release-evidence/<tag>/`
- RC closure Phase 9 (T041): README Quickstart section with three-line bootstrap + demo invocation block
- RC closure Phase 9 (T036–T037): `demos/access-drift/input/` — 8 JSON fixture files + recipe `demo-access-drift`; `release-capture` and `verify-release` justfile recipes (T043–T044)
- RC closure Phase 8 (T029–T035): `insa-telco` control plane — `ServiceRegistry`, `BindingTable`, `provision_service`, `bind_service`, `route_service`; 7 control-plane tests covering happy paths and violation cases
- RC closure Phase 8: `docs/release-authority.md` — insa-cli publish=false governance, path-dep policy, de-admission procedure
- RC closure Phase 7 (T028): `scripts/audit-cli-thin.sh` — audits `#[verb]`-annotated wrappers for the ≤5-line FM-1.1 bound
- RC closure Phase 6 (T024–T027): `insa-cli` doctor and wizard nouns wired to domain functions — `explain`, `repair_request`, `resume` replacing all TODO stubs; `scope_for_id` helper mapping check-id prefixes to `DoctorScope`
- RC closure Phase 6 (T019–T023): `insa-wizard` — in-process `OnceLock` session store, `pub fn explain(session_id)`, `pub fn resume(session_id)`; tests for happy path and error cases
- RC closure Phase 5 (T015–T018): `insa-doctor` — `ExplainOutput`, `DoctorError`, static catalog of 14 PRD §13.1 check IDs; `repair_request()` with full guard sequence (UnknownFindingId → NotRepairable → ScopeMismatch → dry/applied); dedicated test files for explain and repair
- RC closure Phase 3 (T009–T011): `insa-doctor` — `unknown_stub` renamed to `skipped_no_input`; `Unknown` status replaced with `Skipped`; 4 positive Skipped tests for Bench/Replay/Pack/Release scopes
- RC closure Phase 2 (T005–T008): `docs/de-admission-procedure.md` — compiler/CPU/benchmark drift triggers; `docs/deferrals.md` — registry of D-W7-01/02/03 deferred markers; release tests updated with Deferred markers
- Wave 11: sibling-agent consolidated polish — residual cross-agent divergences resolved, final pipeline verified green
- Wave 10: doctor aggregation proptests covering environment + crate constraint invariants
- Wave 10: telco MCP contract tests (Control ⊥ Data ⊥ Proof separation enforced at boundary)
- Wave 10: pre-commit hook live-gating verified (`just check` blocks non-conforming commits)
- Wave 9: pack tamper-detection property tests (`insa-pack` manifest digest integrity under mutation)
- 24-crate Rust workspace implementing Toyota Code Production System (TCPS) byte-law architecture
- 8-stage spine: O* -> COG8 -> KAPPA8/INST8 -> POWL8 -> CONSTRUCT8/Projection -> POWL64 -> ReplayValid
- 14 ReplayFailure variants (PRD §11.1 + Cog8FiringIdMismatch + FiringSignalingInconsistent)
- 6 Truthforge admission cases (cog8 branchless <-> reference, powl64 codec roundtrip, construct8 commutativity, instinct resolver determinism, plus 2 baseline)
- Flagship JTBDs verified: loan_decision_closure, access_drift_observability, plus observability + property invariants
- Layout invariants compile-time-locked across 11 types
- xtask subcommands: layout, fuzz, truthforge (with --summary, --filter, --badge)
- CI: .github/workflows/ci.yml (check -> test -> dx)
...
```

*(Plus 66 other markdown files)*
