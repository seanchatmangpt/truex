# Experimental Project Report: ggen

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/ggen`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `ggen/Makefile`
- `ggen/crates/ggen-cli/run_phase2_tests.sh`
- `ggen/deploy/staging/start.sh`
- `ggen/docs/spec-kit-3t-thesis/Makefile`
- `ggen/examples/bree-semantic-scheduler/package.json`
- `ggen/examples/comprehensive-rust-showcase/run-demo.sh`
- `ggen/examples/demo-project/test.sh`
- `ggen/examples/fortune-5-benchmarks/package.json`
- `ggen/examples/ggen-sparql-cli/package.json`
- `ggen/examples/ggen-usage-wrapping/run-examples.sh`
- `ggen/examples/mcp-a2a-self-hosting/setup.sh`
- `ggen/examples/mcp-a2a-self-hosting/validate.sh`
- `ggen/examples/nextjs-openapi-sqlite-shadcn-vitest/verify.sh`
- `ggen/examples/openapi/verify.sh`
- `ggen/examples/rest-api-advanced/package.json`
- `ggen/examples/screencast-demo.sh`
- `ggen/examples/self-play/run-demo.sh`
- `ggen/examples/source-code-analysis/analyze-and-generate.sh`
- `ggen/examples/sparql-construct-city/package.json`
- `ggen/examples/test-demo.sh`
- `ggen/examples/ultra-deploy-demo.sh`
- `ggen/examples/yawl-workflow-platform/package.json`
- `ggen/marketplace/scripts/generate_index.sh`
- `ggen/marketplace/scripts/generate_phase1_packages.sh`
- `ggen/marketplace/scripts/generate_remaining_ontologies.sh`
- `ggen/marketplace/scripts/generate_validation_report.sh`
- `ggen/marketplace/scripts/update_production_flags.sh`
- `ggen/marketplace/scripts/validate_all_packages.sh`
- `ggen/marketplace/scripts/validate_phase1.sh`
- `ggen/marketplace/validate-docs.sh`
- `ggen/my-ontology-project/package.json`
- `ggen/phd-thesis/Makefile`
- `ggen/run_slow_test.sh`
- `ggen/run_test.sh`
- `ggen/scripts/acp.sh`
- `ggen/scripts/act-release.sh`
- `ggen/scripts/act-test-workflow.sh`
- `ggen/scripts/ai-demo.sh`
- `ggen/scripts/analyze-documentation-mura.sh`
- `ggen/scripts/andon_monitor.sh`
- `ggen/scripts/build-and-run-ggen-gvisor.sh`
- `ggen/scripts/build-debian-package.sh`
- `ggen/scripts/build-ggen-oci.sh`
- `ggen/scripts/build-gvisor-runsc.sh`
- `ggen/scripts/check-no-panic-points.sh`
- `ggen/scripts/check-type-safety.sh`
- `ggen/scripts/check-workflow-cache-issues.sh`
- `ggen/scripts/ci-health-check.sh`
- `ggen/scripts/ci-setup.sh`
- `ggen/scripts/claude-code-web-simulator/build-and-test-docker.sh`
- `ggen/scripts/claude-code-web-simulator/main.sh`
- `ggen/scripts/claude-code-web-simulator/test-real-pipeline.sh`
- `ggen/scripts/claude-code-web-simulator/verify-implementation.sh`
- `ggen/scripts/cli-smoke.sh`
- `ggen/scripts/collect-metrics.sh`
- `ggen/scripts/configure-containerd-gvisor.sh`
- `ggen/scripts/coverage_tracker.sh`
- `ggen/scripts/deb-gvisor-pipeline.sh`
- `ggen/scripts/deploy-docker.sh`
- `ggen/scripts/detect-test-gaps.sh`
- `ggen/scripts/detect-typosquatting.sh`
- `ggen/scripts/detect_regressions.sh`
- `ggen/scripts/diagnostics/cli-timing.sh`
- `ggen/scripts/diagnostics/registry-rebuild.sh`
- `ggen/scripts/diagnostics/registry-summary.sh`
- `ggen/scripts/docs-validate.sh`
- `ggen/scripts/dod-compliance-mine.sh`
- `ggen/scripts/enforce-test-coverage.sh`
- `ggen/scripts/find-production-panic-points.sh`
- `ggen/scripts/fix-async-steps.sh`
- `ggen/scripts/fix-bdd-compilation.sh`
- `ggen/scripts/fix-command-compilation.sh`
- `ggen/scripts/fix-doctest-format.sh`
- `ggen/scripts/fix-expect-violations.sh`
- `ggen/scripts/fix_compilation_errors.sh`
- `ggen/scripts/fix_marketplace_batch.sh`
- `ggen/scripts/fix_remaining_errors.sh`
- `ggen/scripts/fix_swarm_agent.sh`
- `ggen/scripts/fix_unwrap.sh`
- `ggen/scripts/full_recovery.sh`
- `ggen/scripts/full_recovery2.sh`
- `ggen/scripts/gemba_walk.sh`
- `ggen/scripts/generate-archive-report.sh`
- `ggen/scripts/generate-dashboard.sh`
- `ggen/scripts/generate-noun-verb-cli.sh`
- `ggen/scripts/generate-sbom.sh`
- `ggen/scripts/generate-test-skeleton.sh`
- `ggen/scripts/generate-validation-report.sh`
- `ggen/scripts/ggen-receipt-gate.sh`
- `ggen/scripts/ggen-receipt-generate.sh`
- `ggen/scripts/gh-pages-compare.sh`
- `ggen/scripts/gh-pages-logs.sh`
- `ggen/scripts/gh-pages-setup-check.sh`
- `ggen/scripts/gh-pages-status.sh`
- `ggen/scripts/gh-pages-trigger.sh`
- `ggen/scripts/gh-workflow-status.sh`
- `ggen/scripts/git-to-xes.sh`
- `ggen/scripts/health_dashboard.sh`
- `ggen/scripts/hooks/pre-commit.sh`
- `ggen/scripts/hooks/pre-push.sh`
- `ggen/scripts/install-ggen.sh`
- `ggen/scripts/install-git-hooks.sh`
- `ggen/scripts/install-gvisor-in-colima.sh`
- `ggen/scripts/install-hooks.sh`
- `ggen/scripts/install-runsc-colima.sh`
- `ggen/scripts/install-runsc.sh`
- `ggen/scripts/jtbd-all-verbs.sh`
- `ggen/scripts/lib/common.sh`
- `ggen/scripts/lib/hooks-common.sh`
- `ggen/scripts/marketplace/rebuild-index.sh`
- `ggen/scripts/merge-gate.sh`
- `ggen/scripts/metrics/baseline_snapshot.sh`
- `ggen/scripts/metrics/collect_metrics.sh`
- `ggen/scripts/metrics/generate_dashboard.sh`
- `ggen/scripts/metrics/month_end_report.sh`
- `ggen/scripts/metrics/parse_metrics.sh`
- `ggen/scripts/metrics/weekly_report.sh`
- `ggen/scripts/migrate_to_v6.sh`
- `ggen/scripts/monitor-validation.sh`
- `ggen/scripts/msa_data_collection.sh`
- `ggen/scripts/msa_quick_demo.sh`
- `ggen/scripts/optimize-pipeline.sh`
- `ggen/scripts/patch-all-packages.sh`
- `ggen/scripts/performance_benchmark.sh`
- `ggen/scripts/performance_dashboard.sh`
- `ggen/scripts/pre-commit-hook.sh`
- `ggen/scripts/pre-push-hook.sh`
- `ggen/scripts/production-readiness-validation.sh`
- `ggen/scripts/production-validation.sh`
- `ggen/scripts/publish_loop.sh`
- `ggen/scripts/pull-patch-publish.sh`
- `ggen/scripts/quick-docker-check.sh`
- `ggen/scripts/quick_validation.sh`
- `ggen/scripts/quickstart.sh`
- `ggen/scripts/receipt-compose.sh`
- `ggen/scripts/regenerate-examples.sh`
- `ggen/scripts/release-brew.sh`
- `ggen/scripts/release-check.sh`
- `ggen/scripts/release-validate-artifacts.sh`
- `ggen/scripts/release-validate-breaking-changes.sh`
- `ggen/scripts/release-validate-docs-sync.sh`
- `ggen/scripts/release-validate-git-state.sh`
- `ggen/scripts/release-validate-version.sh`
- `ggen/scripts/remove-clap-from-domain.sh`
- `ggen/scripts/replace-rgen-with-ggen.sh`
- `ggen/scripts/run-ggen-gvisor-direct.sh`
- `ggen/scripts/run-ggen-gvisor-final.sh`
- `ggen/scripts/run-ggen-gvisor-simple.sh`
- `ggen/scripts/run-ggen-gvisor.sh`
- `ggen/scripts/run-marketplace-benchmarks.sh`
- `ggen/scripts/run-p2p-benchmarks.sh`
- `ggen/scripts/run-ultra-deploy-tests.sh`
- `ggen/scripts/run-validation-suite.sh`
- `ggen/scripts/run_async_benchmarks.sh`
- `ggen/scripts/run_benchmarks.sh`
- `ggen/scripts/run_pattern_benchmarks.sh`
- `ggen/scripts/security-remediation.sh`
- `ggen/scripts/setup-and-run-ggen-gvisor.sh`
- `ggen/scripts/setup-dev.sh`
- `ggen/scripts/setup-gvisor-colima.sh`
- `ggen/scripts/setup-gvisor-containerd.sh`
- `ggen/scripts/setup-gvisor-simple.sh`
- `ggen/scripts/setup-gvisor.sh`
- `ggen/scripts/startup.sh`
- `ggen/scripts/stress-test.sh`
- `ggen/scripts/test-marketplace.sh`
- `ggen/scripts/test-release-process.sh`
- `ggen/scripts/ultra-deploy.sh`
- `ggen/scripts/update-and-validate-homebrew.sh`
- `ggen/scripts/update-homebrew-formula-e2e.sh`
- `ggen/scripts/update-homebrew-formula.sh`
- `ggen/scripts/utilities/verify_quick_wins.sh`
- `ggen/scripts/v2_migration/generate_cli_wrapper.sh`
- `ggen/scripts/v2_migration/migrate_remaining_commands.sh`
- `ggen/scripts/v2_migration/validate_migration.sh`
- `ggen/scripts/validate-all-docs.sh`
- `ggen/scripts/validate-behavior-predicates.sh`
- `ggen/scripts/validate-benchmark-components.sh`
- `ggen/scripts/validate-benchmarks.sh`
- `ggen/scripts/validate-crate-coverage.sh`
- `ggen/scripts/validate-crate.sh`
- `ggen/scripts/validate-deployment.sh`
- `ggen/scripts/validate-docker-integration.sh`
- `ggen/scripts/validate-docs/check-broken-links.sh`
- `ggen/scripts/validate-docs/check-no-typescript.sh`
- `ggen/scripts/validate-docs/validate-all.sh`
- `ggen/scripts/validate-docs/validate-case-study.sh`
- `ggen/scripts/validate-docs/validate-cli-reference.sh`
- `ggen/scripts/validate-docs/validate-quick-start.sh`
- `ggen/scripts/validate-docs/validate-sparql-guide.sh`
- `ggen/scripts/validate-docs/validate-toml-reference.sh`
- `ggen/scripts/validate-docs/validate-watch-mode.sh`
- `ggen/scripts/validate-docs/watch-docs-live.sh`
- `ggen/scripts/validate-docs.sh`
- `ggen/scripts/validate-elixir-a2a-docs.sh`
- `ggen/scripts/validate-examples.sh`
- `ggen/scripts/validate-homebrew-formula.sh`
- `ggen/scripts/validate-marketplace-package.sh`
- `ggen/scripts/validate-ollama.sh`
- `ggen/scripts/validate-otel-feature.sh`
- `ggen/scripts/validate-otel.sh`
- `ggen/scripts/validate-readme-claims.sh`
- `ggen/scripts/validate-readme.sh`
- `ggen/scripts/validate-rmcp-docs.sh`
- `ggen/scripts/validate-slos.sh`
- `ggen/scripts/validate-swarm-status.sh`
- `ggen/scripts/validate-test-coverage.sh`
- `ggen/scripts/validate_benchmark_targets.sh`
- `ggen/scripts/validate_llm_outputs.sh`
- `ggen/scripts/validate_marketplace_v2.sh`
- `ggen/scripts/validate_release.sh`
- `ggen/scripts/verify-and-publish-patch.sh`
- `ggen/scripts/verify-cargo-lock.sh`
- `ggen/scripts/verify-cli-commands.sh`
- `ggen/scripts/verify-dependency-removal.sh`
- `ggen/scripts/verify-rdf-module.sh`
- `ggen/scripts/verify_andon_gemba.sh`
- `ggen/scripts/verify_ci_migration.sh`
- `ggen/scripts/verify_llm_otel.sh`
- `ggen/scripts/verify_pack_integration.sh`
- `ggen/scripts/week4/daily_tracker.sh`
- `ggen/scripts/week4/week4_dashboard.sh`
- `ggen/scripts/week4_performance_profiler.sh`
- `ggen/semconv/Makefile`
- `ggen/semconv/live-check/run-ggen-live-check.sh`
- `ggen/templates/cleanroom/verify.sh`
- `ggen/templates/ultra/validate.sh`
- `ggen/test_a2a_mcp.sh`
- `ggen/test_fast.sh`
- `ggen/tests/benchmarks/quick_benchmark.sh`
- `ggen/tests/benchmarks/run_benchmarks.sh`
- `ggen/tests/clap_noun_verb_validation.sh`
- `ggen/tests/clnrm/run-all-tests.sh`
- `ggen/tests/integration/demo_git_hooks_ontology.sh`
- `ggen/tests/integration/verify_infrastructure.sh`
- `ggen/tests/integration/weaver-verification.sh`
- `ggen/tests/integration-v2/test_scenarios.sh`
- `ggen/tests/vision_2030_e2e.sh`

## 3. Extracted Documentation & Context
### Source: `ggen/AGENTS.md`
```markdown
# AGENTS.md: Verification Constitution

**Non-negotiable laws for agent-generated code in this repository.**

All claims of correctness must be **provable, not asserted**.

---

## Forbidden

The following constructs are **defects** and must not appear in the codebase:

### Testing & Verification
- **Unit tests** without real boundary crossing
- **Mocks** of primary evidence paths (tracer, meter, OTel client, MCP server) via `mockall` or manual stubs
- **Stubs** that simulate behavior without execution
- **Fixtures** that fabricate traces, spans, OCEL events, or receipts
- **Synthetic telemetry** builders (fake span structs, fabricated events)
- **Test-only fake clients** for LLM, MCP, observability, or state

### Code Quality
- **TODO, FIXME** placeholders (use real implementation or block work)
- **Monkeypatching** of code paths (including `mockall::mock!`, `#[automock]`, or manual trait implementation for testing only)
- **Hardcoded returns** that simulate success
- **Documentation-only contracts** (code must enforce, not docs)

### Evidence Falsification
- **Fake receipt builders** (receipts must be cryptographically derived)
- **Fabricated BLAKE3 hashes** (use real computation)
- **Synthetic MCP/LLM boundaries** (must be real calls or abstain)
- **Empty or placeholder proofs** (proof gates must validate real evidence)

### Configuration & Policy
- **Weakening of hooks** or enforcement settings
- **Bypass clauses** in policy (policy must be hard)
- **Shadow configuration files** that contradict main policy
- **Disablement of structural checks** without revision control

---

...
```

### Source: `ggen/CHANGELOG.md`
```markdown
# Changelog

All notable changes to ggen will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [26.5.21] — A2A & MCP Implementation & Docs Cleanup (2026-05-21)

### Added
- **MCP Server implementation** — Built a functional Model Context Protocol server (`ggen mcp server`) over standard I/O using the official `rmcp` SDK.
- **A2A protocol implementation** — Built functional A2A task coordination commands (`ggen a2a create`, `ggen a2a status`) managing `Task` structures and `TaskState`.
- **E2E Actuation script** — Tested headless invocation using `npx @google/gemini-cli` acting as autonomous user avatars.

### Fixed
- **Documentation fidelity** — Scrubbed `README.md` to remove references to hallucinated/non-existent features and accurately reflect the 5-crate architecture (Core, CLI, Config, Marketplace, A2A/MCP).
- **Workspace Versions** — Bumped all workspace crates to `v26.5.21` and resolved version mismatches.

## [26.5.18] — Workspace consolidation & vendored-submodule removal (2026-05-18)

Versions 26.5.6 through 26.5.17 were not released. This entry consolidates
all work between v26.5.19 and v26.5.19.

### Added

- **`ggen-marketplace` crate** — marketplace logic (atomic, builders, bundle,
  cache, install, metadata, metrics, migration, models, ontology, ownership,
  PKI, policy, profile, rdf/, search, security, traits, trust, v3,
  validation) extracted from `ggen-core` into a dedicated workspace crate.
  39 file renames with 100% similarity preserved by git's rename detection.
- **`ggen-a2a-mcp` crate** — A2A protocol modules + MCP server bridge
  extracted from `ggen-core`. Adds rmcp 1.3.0 integration with 4 tools.
- **`ggen-config` crate** — `ggen.toml` parser and validator extracted from
  `ggen-core`. Adds a `receipt/` module (chain, envelope, error,
  receipt_impl) for cryptographic receipt linkage and verification.
- **Framework adapter generation** — LangChain Python adapter generation via
  `ggen framework` command.
- **`docs/preserved/`** — RECOVERY.md plus `craftplan-local-d2e4c18.bundle`,
  a 78KB git bundle preserving the local-only commit from the removed
  `vendors/craftplan` submodule (~6000 lines of Elixir agent integration).
...
```

### Source: `ggen/CLAUDE.md`
```markdown
# ggen v26.5.19 - Rust Code Generation CLI

Specification-driven code generation from RDF ontologies. Formula: A = μ(O) - Code precipitates from RDF via five-stage pipeline (μ₁-μ₅).
Stack: Rust 1.95.0 | Tokio | Oxigraph | Tera | Serde | Clap | Chicago TDD ONLY | 5 crates | 98% test coverage
**Compressed Architecture:** `docs/architecture/COMPRESSED_REFERENCE.md` — verified C4, real sync flow, stub registry, error map. Load this before modifying any code.

**Recent Audit (2026-04-01):** `docs/crate-audits/AUDIT_DASHBOARD.md` — workspace health assessment with 54 stubs classified, 8,900 lines dead code identified, 4 P0 blockers prioritized.

## Rules (see .claude/rules/ for details)

---

## Architecture Reference (LSP-Surveyed)

### Crate Map by Domain

#### Core Workspace (5 Crates)

| Crate | Purpose | Key Types |
|-------|---------|-----------|
| `ggen-core` | Graph-aware code generation engine | `Graph`, `GgenOntology`, `Pipeline`, `PipelineBuilder`, `GenContext`, `Generator`, `DeltaType`, `GraphDelta`, `DriftDetector`, `ThreeWayMerger`, `RegionAwareMerger`, `SnapshotManager`, `TemplateResolver`, `RegistryClient`, `PqcSigner` |
| `ggen-cli` | CLI interface (as `ggen-cli-lib`) | `RunResult`, `cli_match()`, `run_for_node()` |
| `ggen-config` | ggen.toml parsing and validation | `GgenConfig`, `AiConfig`, `McpConfig`, `A2AConfig`, `ProjectConfig`, `TemplatesConfig`, `ConfigLoader`, `ConfigValidator` |
| `ggen-a2a-mcp` | Agent-to-Agent protocol & MCP bridge | `McpServer`, `A2aHandler`, `Capability` |
| `ggen-marketplace` | Registry for ontology packs & templates | `MarketplaceClient`, `PackMetadata`, `RegistryIndex` |

#### Removed/Merged Components

- `ggen-prompt-mfg`: Merged into `ggen-core/src/prompt_mfg`
- `prolog8`: Removed from the workspace
- `ggen-domain`, `ggen-utils`, `ggen-ontology-core`, `ggen-codegen`, etc.: Consolidated into `ggen-core`

### Cross-Cutting Patterns

| Pattern | Where Used | Details |
|---------|-----------|---------|
| **`pub type Result<T> = std::result::Result<T, CrateError>`** | Every crate | Each crate has its own error enum via `thiserror` |
| **Builder pattern** | `ggen-core` | `with_*()` chain methods for optional config |
| **Typestate** | `ggen-marketplace` | Compile-time state transitions (`Draft`/`Published`) |
| **Newtype wrappers** | All crates | Invariant encoding in types (e.g., `PackageId`, `WorkOrderId`) |
...
```

*(Plus 614 other markdown files)*
