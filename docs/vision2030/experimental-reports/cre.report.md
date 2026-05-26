# Experimental Project Report: cre

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/cre`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `cre/Makefile`
- `cre/demo/demo_generate.sh`
- `cre/demo/demo_run_line.sh`
- `cre/demo/demo_stop_the_line.sh`
- `cre/docker/docker-entrypoint.sh`
- `cre/docker/gcp-pre-stop.sh`
- `cre/examples/lnctrl-zero-to-line/run.sh`
- `cre/examples/yawl_pnet_demo.sh`
- `cre/marketplace/listing-package/test-customer-journey.sh`
- `cre/scripts/approval_worker.sh`
- `cre/scripts/backup.sh`
- `cre/scripts/benchmarks/run_benchmarks.sh`
- `cre/scripts/benchmarks/simple_benchmark.sh`
- `cre/scripts/build_static_otp.sh`
- `cre/scripts/cicd-pipeline.sh`
- `cre/scripts/debug_crash_dump.sh`
- `cre/scripts/debug_eflame.sh`
- `cre/scripts/debug_monitor.sh`
- `cre/scripts/debug_observer.sh`
- `cre/scripts/debug_omega.sh`
- `cre/scripts/debug_process_tree.sh`
- `cre/scripts/debug_profile.sh`
- `cre/scripts/debug_recon.sh`
- `cre/scripts/debug_redbug.sh`
- `cre/scripts/debug_system_info.sh`
- `cre/scripts/debug_trace.sh`
- `cre/scripts/demo_workflow.sh`
- `cre/scripts/deploy-dashboards.sh`
- `cre/scripts/dump_compiled_net.sh`
- `cre/scripts/f5_validate.sh`
- `cre/scripts/generate_compliance_receipt.sh`
- `cre/scripts/generate_compliance_receipt_native.sh`
- `cre/scripts/install-ggen.sh`
- `cre/scripts/install_otp_linux.sh`
- `cre/scripts/marketplace/security-scan.sh`
- `cre/scripts/marketplace/test-deployment.sh`
- `cre/scripts/measure_beam_startup.sh`
- `cre/scripts/measure_startup_time.sh`
- `cre/scripts/measure_vm_boot_time.sh`
- `cre/scripts/migration/cutover.sh`
- `cre/scripts/migration/gke-deploy.sh`
- `cre/scripts/migration/mnesia-export.sh`
- `cre/scripts/migration/rollback.sh`
- `cre/scripts/migration/spanner-import.sh`
- `cre/scripts/run_agi_symposium_demo.sh`
- `cre/scripts/run_agi_symposium_zai.sh`
- `cre/scripts/run_doctests.sh`
- `cre/scripts/run_eunit.sh`
- `cre/scripts/run_mapek_selfplay.sh`
- `cre/scripts/run_omega_with_zai.sh`
- `cre/scripts/runbooks/backup_health_check.sh`
- `cre/scripts/runbooks/diagnose.sh`
- `cre/scripts/runbooks/health_check.sh`
- `cre/scripts/runbooks/scale_validation.sh`
- `cre/scripts/security-scan.sh`
- `cre/scripts/test_otp_26_28_features.sh`
- `cre/scripts/validate-config.sh`
- `cre/scripts/validate_beam_features.sh`
- `cre/scripts/zai_chat.sh`
- `cre/security-reports/EXAMPLE_SCAN_EXECUTION.sh`
- `cre/src/backend/package.json`
- `cre/src/rust_implementations/Makefile`
- `cre/src/rust_nifs/Makefile`
- `cre/vendors/wf-substrate/validate-docker.sh`
- `cre/vendors/wf-substrate/validate-k8s.sh`
- `cre/vendors/wf-substrate/validate-tests.sh`
- `cre/vendors/yawl/Makefile`
- `cre/vendors/yawl/list-benchmarks.sh`
- `cre/vendors/yawl/run-benchmarks.sh`
- `cre/vendors/yawl/run-cancellation-tests.sh`
- `cre/vendors/yawl/run-performance-tests.sh`
- `cre/vendors/yawl/run_comprehensive_benchmarks.sh`
- `cre/vendors/yawl/run_comprehensive_tests_report.sh`
- `cre/vendors/yawl/run_corrected_tests.sh`
- `cre/vendors/yawl/run_individual_tests.sh`
- `cre/vendors/yawl/test-validate-cancellation-patterns.sh`
- `cre/vendors/yawl/test_infrastructure_validator.sh`
- `cre/vendors/yawl/test_production.sh`
- `cre/vendors/yawl/update-validation.sh`
- `cre/vendors/yawl/validate-benchmark-integration.sh`
- `cre/vendors/yawl/validate_pattern_implementation.sh`
- `cre/vendors/yawl/validate_production_tests.sh`
- `cre/vendors/yawl/verify_scoped_value_inheritance.sh`
- `cre/vendors/yawl/verify_test_coverage.sh`

## 3. Extracted Documentation & Context
### Source: `cre/BUILD_PLAN_LINECONTROLLER_FACTORY.md`
```markdown
# LineController Factory - Build Plan & Swarm Coordination

**Project**: Manufacturing Integrations from Industry Ontology + Deterministic OTP Execution
**MVP Lane**: Security Ops (SOC Automation)
**Build Model**: 20-Agent Swarm with Parallel Tracks
**Timeline**: Aggressive phase delivery

---

## EXECUTIVE SUMMARY

We are building a **replacement manufacturing system** that will eliminate job categories:
- SOC analysts doing routine incident triage (replaced by manufactured line)
- Integration engineers maintaining custom API glue (replaced by ontology → manufacture)
- Ops engineers manually managing incident workflows (replaced by deterministic lines)

The system manufactures integrations and applications deterministically from industry ontology (Σ), runs them as supervised OTP processes with stop-the-line capability, and emits receipts for every build and execution.

**Key Claims (to be proven with metrics):**
- "Manufacturing speed: spec change → new artifacts in <30 seconds"
- "Determinism: identical inputs → identical trace ordering"
- "Cancellation: post-cancel effects = zero"
- "Replacement ROI: ontology work costs 20% of hand-coding equivalent"

---

## 1. MVP LANE CHOICE: SECURITY OPS (INCIDENT TRIAGE)

### Why Security Ops?
- **Board visibility**: SOC breaches/incidents are board-level risk; automation is board-level topic
- **Clear replacement**: triage/escalation analysts are routine-work category (replaceable)
- **Deterministic**: incident classification rules are deterministic (high precision)
- **Easy to manufacture**: 4 standard connectors cover 80% of use case
- **Evidence requirement**: incident handling demands audit trails (native to manufacturing model)

### Lane Definition: Incident Triage to Escalation

```
[Incident Event]
  → Classification (SIEM enrichment)
...
```

### Source: `cre/CHANGELOG.md`
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-02-06

### Added

#### New Pattern Modules (10 modules)
- `critical_section.erl` - WCP-28: Critical Section pattern for mutual exclusion
- `data_accumulate.erl` - WDP-04: Data Accumulation pattern
- `data_distribute.erl` - WDP-03: Data Distribution pattern
- `data_transform.erl` - WDP-02: Data Transformation pattern
- `data_visibility.erl` - WDP-05: Data Visibility pattern
- `direct_resource_creation.erl` - WRP-01: Direct Resource Creation pattern
- `implicit_termination.erl` - WCP-18: Implicit Termination pattern
- `multiple_choice.erl` - WCP-06: Multiple Choice pattern
- `multiple_instances_sync.erl` - WCP-17: Multiple Instances with Synchronization pattern
- `param_pass.erl` - WDP-01: Parameter Passing pattern
- `resource_allocation.erl` - WRP-04: Resource Allocation pattern
- `resource_deallocation.erl` - WRP-05: Resource Deallocation pattern
- `resource_initialization.erl` - WRP-03: Resource Initialization pattern
- `role_based_allocation.erl` - WRP-02: Role-Based Allocation pattern
- `structured_loop.erl` - WCP-22: Structured Loop pattern

#### New Core Modules
- `gen_yawl.erl` - Wrapper gen_pnet behavior with 3-tuple fire/3 support for state updates
- `yawl_claude_bridge.erl` - LLM integration interface for Claude/OpenAI
- `yawl_interface_d.erl` - Dual interface implementation for YAWL workflows
- `van_der_aalst_workflow.erl` - Academic workflow examples (van der Aalst patterns)
- `order_fulfillment.erl` - E-commerce order fulfillment workflow
- `freight_in_transit.erl` - Logistics/shipping workflow for in-transit shipments

#### Test Scripts
- `scripts/run_doctests.sh` - Script to run doctests across all modules
- `scripts/run_eunit.sh` - Script to run EUnit tests

...
```

### Source: `cre/CLAUDE.md`
```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# CRE - Common Runtime Environment

Erlang/OTP YAWL workflow engine with Petri Net patterns. **OTP 28 REQUIRED**.

## Build & Test Commands

```bash
rebar3 compile              # Compile after .erl/.hrl changes (REQUIRED before tests)
rebar3 eunit                # Run all unit tests
rebar3 eunit --module=foo   # Run specific module tests
rebar3 ct                   # Run Common Test integration suites
rebar3 dialyzer             # Static type analysis
rebar3 cover                # Generate coverage report
```

## Docker Workflow

When Docker is available, use containers for build/test:
```bash
docker buildx bake --load                           # Build multi-arch image
docker run --rm -v $(pwd):/work -w /work cre:0.3.0 rebar3 eunit
```

gVisor sandbox environments (Claude Code Web) meet containerization requirements. SessionStart.sh bootstraps OTP 28 with pre-built static binaries.

## Architecture

**Core Runtime:** Single OTP runner (`gen_yawl`) wrapping `gen_pnet` (Petri Net behavior). Everything else is pure stateless helpers.

| Directory | Purpose |
|-----------|---------|
| `src/core/` | gen_pnet runtime (DO NOT modify without understanding callback chain) |
| `src/pnet/` | Petri Net algebra (types, markings, modes, choice) |
| `src/wf/` | Workflow utilities (timers, tasks, scopes, tokens) |
...
```

*(Plus 299 other markdown files)*
