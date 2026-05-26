# Experimental Project Report: open-ontologies

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/open-ontologies`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `open-ontologies/Makefile`
- `open-ontologies/apps/mobile/package.json`
- `open-ontologies/benchmark/demo/run_demo.sh`
- `open-ontologies/benchmark/epc/benchmark.sh`
- `open-ontologies/benchmark/gvr/measure_grounding.sh`
- `open-ontologies/benchmark/marketplace_benchmark.sh`
- `open-ontologies/benchmark/mushroom/run_benchmark.sh`
- `open-ontologies/benchmark/reasoner/run_lubm_performance.sh`
- `open-ontologies/benchmark/reasoner/run_pizza_correctness.sh`
- `open-ontologies/benchmark/reasoner/setup_jars.sh`
- `open-ontologies/package.json`
- `open-ontologies/scripts/actuation/auto_actuate_pending.sh`
- `open-ontologies/scripts/actuation/auto_loop.sh`
- `open-ontologies/scripts/actuation/oo-gemini-actuate.sh`
- `open-ontologies/scripts/actuation/prove_autoreceipt_truex-kernel.sh`
- `open-ontologies/scripts/actuation/test-actuation.sh`
- `open-ontologies/scripts/collect-github-evidence.sh`
- `open-ontologies/scripts/gh-create-issue.sh`
- `open-ontologies/scripts/gh-create-pr.sh`
- `open-ontologies/scripts/verify-setup.sh`
- `open-ontologies/studio/package.json`
- `open-ontologies/tools/assert-no-generated-dir.sh`
- `open-ontologies/tools/check-test-count.sh`
- `open-ontologies/tools/check-test-removal-tag.sh`
- `open-ontologies/tools/untrack-secret.sh`
- `open-ontologies/tools/validate-autonomics.sh`
- `open-ontologies/tools/validate-connect-groups.sh`
- `open-ontologies/tools/validate-functions.sh`
- `open-ontologies/tools/validate-namespace-singularity.sh`
- `open-ontologies/tools/validate-no-downstream-authority.sh`
- `open-ontologies/tools/validate-ocel.sh`
- `open-ontologies/tools/validate-public-anchor-closure.sh`
- `open-ontologies/tools/validate-realtime.sh`
- `open-ontologies/tools/validate-receipts.sh`
- `open-ontologies/tools/validate-rls-policy-coverage.sh`
- `open-ontologies/tools/validate-rls.sh`
- `open-ontologies/tools/validate-storage.sh`
- `open-ontologies/tools/validate-supabase-local.sh`
- `open-ontologies/tools/verify-receipts.sh`

## 3. Extracted Documentation & Context
### Source: `open-ontologies/CHANGELOG.md`
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [26.5.21] - 2026-05-21

### Changed
- **Architecture Recenter**: Established `OpenOntologyReceipt.v1` as the primary truth surface. GHF, truex-kernel, ggen MCP/A2A, and ZOELA are now firmly structured as downstream route families bound by the same OCEL path grammar.
- **Receipt Validation**: Implemented core validation laws requiring explicit `expected_ocel`, `observed_ocel`, alignment state, and boundary evidence. Refuses closure for synthetic/cloned traces or exit-code-only proofs.
- **GHF Fleet Sentinel**: Demonstrated the first regression-bound route family with a complete refusal/remediation/admission loop (missing artifact -> OutOfMembraneReceipt -> ggen remediation -> FleetHealthReceipt).
- **AutoReceipt Manifest**: Formalized that `AutoReceiptClosed` is a derived theorem from the Validation Ladder, not a self-certified agent state.
...
```

### Source: `open-ontologies/CLAUDE.md`
```markdown
# Open Ontologies

## Claude Code Infrastructure

**Model**: claude-haiku-4-5 | **Hooks**: SessionStart, UserPromptSubmit, Stop, PreToolUse, PostToolUse, ConfigChange

**Build**: `make check` | `make test` | `make adversarial` (all must pass before Stop)

**Evidence tier required**: PROVEN (make adversarial + SHACL validation receipt)

**Rules** (.claude/rules/):
- _core/absolute.md (always-loaded) — 7 non-negotiable rules
- _core/workflow.md (always-loaded) — 5-step ontology engineering cycle
- mcp-server.md — 43 onto_* tool catalog and registration
- cell8-conformance.md — 13 Cell8 gates (A1-A13) validation
- ggen-pipeline.md — TTL→SPARQL→Tera→generated.rs safe editing
- coding-agent-mistakes.md — 5 mistake classes, 6-question patch contract
- otel-validation.md — OTEL span/trace verification

**Skills** (.claude/skills/):
- rdf-ontology — Turtle/OWL syntax, property axioms, hierarchies
- sparql-construct — SPARQL CONSTRUCT queries for ggen pipeline
- shacl-validation — SHACL NodeShape definition, validation execution
- cell8-gates — 13 Cell8 conformance gates (A1-A13), EARL patterns
- mcp-server-tools — 43 onto_* tool patterns, JSON-RPC protocol
- ggen-codegen — Code generation pipeline, Tera templates, safe workflow
- oxigraph-patterns — GraphStore API, SPARQL execution, triple patterns
- andon-stop (global) — Stop-the-line protocol on Andon signals

**Protected paths** (pre-tool guard blocks edits):
- `src/cmds/generated.rs` ← ggen artifact; edit `ontology/cli-open-ontologies.ttl` instead
- `cell8-ggen/src/cell8/generated/` ← ggen artifact
- `.claude/hooks/` ← self-protected
- `.claude/settings.json` ← self-protected

**Andon signals** (stop the line):
- `error[E` — Compiler error
- `test.*FAILED` — Test failure
- `dead param` — Unused parameter pattern (`let _ = x;`)
- `panicked at` — Runtime panic
...
```

### Source: `open-ontologies/CONTRIBUTING.md`
```markdown
# Contributing to Open Ontologies

Thanks for your interest in contributing! This document explains how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/open-ontologies.git`
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Run checks: `cargo build && cargo test && cargo clippy -- -D warnings`
6. Push and open a PR

## Development Setup

**Requirements:**
- Rust 1.85+ (edition 2024)
- For PostgreSQL schema import: `libpq-dev`
- For embeddings: models are downloaded automatically via `open-ontologies init`

**Build:**
```bash
cargo build --release
```

**Test:**
```bash
cargo test
```

**Lint:**
```bash
cargo clippy -- -D warnings
```

**Audit:**
```bash
cargo install cargo-audit
cargo audit
```
...
```

*(Plus 92 other markdown files)*
