# Experimental Project Report: clap-noun-verb

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/clap-noun-verb`

## 1. Audit Status
- **Test Status:** ⚠️ No Tests Found / Not Executable

## 2. Executable Entry Points
- `clap-noun-verb/package.json`
- `clap-noun-verb/playground/scripts/pre-commit.sh`
- `clap-noun-verb/playground/scripts/sr_loop.sh`
- `clap-noun-verb/refactor_ggen_v2.sh`
- `clap-noun-verb/scripts/generate_360_templates.sh`
- `clap-noun-verb/scripts/generate_examples.sh`
- `clap-noun-verb/scripts/migrate_test_unwraps.sh`
- `clap-noun-verb/scripts/performance_validation.sh`
- `clap-noun-verb/scripts/pre-release-check.sh`
- `clap-noun-verb/scripts/sr_loop.sh`
- `clap-noun-verb/scripts/test_matrix_21.sh`
- `clap-noun-verb/scripts/test_timeout.sh`
- `clap-noun-verb/scripts/validate-docs.sh`
- `clap-noun-verb/scripts/verify_test_unwrap_solution.sh`

## 3. Extracted Documentation & Context
### Source: `clap-noun-verb/AUTONOMIC.md`
```markdown
# Autonomic CLI Layer

The Autonomic CLI Layer transforms clap-noun-verb into a **machine-grade interface** designed for agents, MAPE-K loops, orchestration systems, and autonomic controllers.

## Overview

Traditional CLIs are primarily human interfaces. The Autonomic CLI Layer makes commands:
- **Introspectable**: Discover capabilities, arguments, and metadata at runtime
- **Analyzable**: Reason about effects, risks, and constraints
- **Observable**: Generate structured receipts for audit and analysis
- **Constrained**: Enforce guards and budgets on execution

## Core Concepts

### 1. Introspection

Commands can describe themselves in machine-readable format:

```bash
# Discover all capabilities
myapp --capabilities

# Introspect all commands
myapp --introspect

# Introspect a specific noun
myapp --introspect-noun services

# Show command graph with dependencies
myapp --graph
```

**Example output (`--capabilities`)**:
```json
{
  "cli_version": "3.8.0",
  "schema_version": "1.0.0",
  "features": ["introspect", "capabilities", "effects", "planes", "guards", "receipts"],
  "app": {
    "name": "myapp",
...
```

### Source: `clap-noun-verb/CHANGELOG.md`
```markdown
# Changelog

All notable changes to clap-noun-verb will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [26.4.25] - 2026-04-24

### Added
- **MCPP Extraction** - Extracted MCPP substrate into a standalone semantic control substrate, serving as the Universal Port for UniverseOS.
- **Second-Order Autonomics** - Implemented Meta-MAPE-K loop in `SecondOrderAutonomicLoop` to automatically tune primary `AutonomicLoop` instances based on their historical stability and anomaly detection rates.
- **Headless AI Integration** - Added `run_headless` integration to easily execute prompts through `claude` and `gemini` headless clients, cleanly returning the output.
- **CLI Playground Conversion** - Fully migrated the `playground/` crate to `mcpp-cli`, replacing dummy commands with MCPP core functionalities (`doctor`, `wizard`, `telco`, `powl8`, `receipt`, `spec`, `policy`, `ontology`, `verify`, `accept`).
- **Middleware Hooks** - Wired up `MiddlewarePipeline` directly into `CommandRouter` and `CommandRegistry` for SHACL admissibility validation and `LockchainReceipt` emission.
- **TypeMap Context** - Substituted simple string context passing with thread-safe `TypeMap` (dependency injection container) inside `VerbContext`.

## [26.4.23] - 2026-04-23

### Changed
- Release v26.4.23
- **First-class configuration support** — Added auto-discovery for `clap-nv.toml` and `clap-nv.yaml` in `ConfigLoader`.
- **Project Scaffolding** — Added `scaffold_config` utility to generate default configuration templates.
- **Module Restoration** — Restored `agent_cli` and `ggen_integration` modules.
- **Wizard Modernization** — Fully refactored `wizard` module for compatibility with `genai` v0.3.5.
- **Test Suite Stabilization** — Refactored `proptest` usage and disabled unimplemented integration tests to ensure 100% pass rate.


### Changed

- **Documentation and examples migrated to pure documentation style** — All 7 example files updated to remove `#[noun]` attributes and migrate `#[arg]` parameter attributes to doc comment tags (`[default:]`, `[env:]`, `[value_hint:]`).
- **Source code comments updated** — Removed `#[noun]` references from inline doc comments in `src/lib.rs`, `src/cli/mod.rs`, `src/cli/registry.rs`, `src/io/types.rs`.
- **Code generator updated** — `src/rdf/code_generator.rs` no longer emits `#[noun(...)]` in generated code.
- **Tutorial docs updated** — `01-your-first-cli.md`, `03-adding-commands.md`, `tutorial-3-first-cli.md` converted to doc comment style.
- **API reference updated** — `noun-macro.md` deprecation notice, `verb-macro.md` examples, `api-catalog.md` noun section updated.
- **Playground version bumped** — `playground/src/main.rs` updated to reference v5.6.0, module doc comment cleaned.

### Added

- **Deprecation notices** to `noun-macro.md`, `attribute-macro-api.md` (archive) with migration examples showing the target documentation style.
...
```

### Source: `clap-noun-verb/CLAUDE.md`
```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**clap-noun-verb** is a Rust CLI framework built on top of `clap`, providing noun-verb command patterns (e.g., `myapp services status`). It uses proc-macros (`#[noun]`, `#[verb]`) for declarative command registration with `linkme` distributed slices for compile-time auto-discovery. Version 5.6.0.

## Build Commands

**Always use `cargo make`, never direct `cargo` commands.**

| Task | Command |
|------|---------|
| Format check | `cargo make format-check` |
| Format | `cargo make format` |
| Clippy | `cargo make clippy` |
| Lint (all) | `cargo make lint` |
| Test (quick) | `cargo make test` |
| Test (single-threaded) | `cargo make test-lib-deterministic` |
| Test (all features) | `cargo make test-all` |
| Test (frontier features) | `cargo make test-frontier` |
| Check | `cargo make check` |
| Check (all features) | `cargo make check-all` |
| Build | `cargo make build` |
| Build (release) | `cargo make build-release` |
| Build examples | `cargo make build-examples` |
| Doc | `cargo make doc` |
| CI (full) | `cargo make ci` |
| Benchmarks | `cargo make bench` |

**Single test**: `cargo test test_name --quiet` (only use direct `cargo test` for single test runs).

## Crate Structure

Two crates in a workspace:

- **`clap-noun-verb`** (`src/`) — Main library crate. All core modules, optional feature-gated modules, examples, tests.
- **`clap-noun-verb-macros`** (`clap-noun-verb-macros/src/`) — Proc-macro crate providing `#[noun]`, `#[verb]`, `#[arg]`, `#[meta_aware]`, `#[federated]`, `#[spec]`, `#[semantic_composable]`, `#[competency]`, `#[assessment]`, `#[auto_test]`, and more. Published first before the main crate.

...
```

*(Plus 109 other markdown files)*
