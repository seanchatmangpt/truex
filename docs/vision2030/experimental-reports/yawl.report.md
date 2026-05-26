# Experimental Project Report: yawl

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/yawl`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `yawl/Makefile`
- `yawl/build/procletService/runEditor.sh`
- `yawl/build_nif.sh`
- `yawl/ci-cd/scripts/deploy-automation.sh`
- `yawl/ci-cd/scripts/deploy.sh`
- `yawl/ci-cd/scripts/perf-regression-check.sh`
- `yawl/ci-cd/scripts/publish-charts.sh`
- `yawl/ci-cd/scripts/secrets-management.sh`
- `yawl/ci-cd/scripts/security-scan.sh`
- `yawl/ci-cd/scripts/smoke-tests.sh`
- `yawl/ci-cd/scripts/update-baseline.sh`
- `yawl/ci-cd/scripts/validate-manifests.sh`
- `yawl/ci-cd/scripts/validate-production-readiness.sh`
- `yawl/ci-cd/tests/run-mcp-a2a-tests.sh`
- `yawl/ci-cd/tests/validate-mcp-a2a-health.sh`
- `yawl/compile_consensus_test.sh`
- `yawl/debug-compile.sh`
- `yawl/deploy/artifact-validation.sh`
- `yawl/deploy/gcp/run.sh`
- `yawl/deploy/gcp/setup.sh`
- `yawl/deploy/monitoring-validation.sh`
- `yawl/deploy/staging-validation.sh`
- `yawl/docker/backup.sh`
- `yawl/docker/base/healthcheck.sh`
- `yawl/docker/claude-code/entrypoint.sh`
- `yawl/docker/entrypoint.sh`
- `yawl/docker/healthcheck.sh`
- `yawl/docker/mcp-healthcheck.sh`
- `yawl/docker/production/fallback-start.sh`
- `yawl/docker/production/test-docker-build.sh`
- `yawl/docker/production/test-run.sh`
- `yawl/docker/ralph-loop/healthcheck-ralph.sh`
- `yawl/docker/restore.sh`
- `yawl/docker/scripts/dev-down.sh`
- `yawl/docker/scripts/dev-logs.sh`
- `yawl/docker/scripts/dev-up.sh`
- `yawl/docker/scripts/healthcheck.sh`
- `yawl/ebin/priv/run_jtbd5_test.sh`
- `yawl/fix-all-remaining-errors.sh`
- `yawl/fix-legacy-imports.sh`
- `yawl/fix-legacy-src-imports.sh`
- `yawl/fix_verify_calls.sh`
- `yawl/generate-ocel.sh`
- `yawl/ontology/validation/extension-only.sh`
- `yawl/q-validate.sh`
- `yawl/run-cancellation-tests.sh`
- `yawl/run-groq-selfplay-test.sh`
- `yawl/run-groq-test.sh`
- `yawl/run-moderate-soak-test.sh`
- `yawl/run-performance-tests.sh`
- `yawl/run_tests.sh`
- `yawl/rust/rust4pm/Makefile`
- `yawl/scripts/aggregate-gc-comparison.sh`
- `yawl/scripts/analyze-build-timings.sh`
- `yawl/scripts/analyze-gc-logs.sh`
- `yawl/scripts/analyze-latency-degradation.sh`
- `yawl/scripts/analyze-test-times.sh`
- `yawl/scripts/aot/generate-aot.sh`
- `yawl/scripts/ast-differ.sh`
- `yawl/scripts/benchmark-build.sh`
- `yawl/scripts/benchmark-integration-tests.sh`
- `yawl/scripts/benchmark-multi-gc.sh`
- `yawl/scripts/benchmark-qlever.sh`
- `yawl/scripts/build-analytics.sh`
- `yawl/scripts/build-erlang-beams.sh`
- `yawl/scripts/build-erlang.sh`
- `yawl/scripts/build-guard-wasm.sh`
- `yawl/scripts/build-otp28-from-source.sh`
- `yawl/scripts/build-rust4pm.sh`
- `yawl/scripts/build-semantic-cache.sh`
- `yawl/scripts/build-test-impact-graph.sh`
- `yawl/scripts/cache-cleanup.sh`
- `yawl/scripts/cds/generate-cds.sh`
- `yawl/scripts/cds-helper.sh`
- `yawl/scripts/check-test-shards.sh`
- `yawl/scripts/cluster-tests.sh`
- `yawl/scripts/collect-build-metrics.sh`
- `yawl/scripts/collect-metrics.sh`
- `yawl/scripts/compute-semantic-hash.sh`
- `yawl/scripts/convert-libei-to-dylib.sh`
- `yawl/scripts/convert-thesis.sh`
- `yawl/scripts/deploy-parallelization.sh`
- `yawl/scripts/detect-semantic-changes.sh`
- `yawl/scripts/dx-incremental.sh`
- `yawl/scripts/dx-v2.sh`
- `yawl/scripts/dx.sh`
- `yawl/scripts/establish-baselines.sh`
- `yawl/scripts/final-gate-v3.sh`
- `yawl/scripts/final-gate.sh`
- `yawl/scripts/fix-dx-pipeline.sh`
- `yawl/scripts/gc-profile.sh`
- `yawl/scripts/generate-cds-archives.sh`
- `yawl/scripts/generate-performance-report.sh`
- `yawl/scripts/generate-test-data.sh`
- `yawl/scripts/generate-validation-report.sh`
- `yawl/scripts/h2-snapshot-utils.sh`
- `yawl/scripts/hyper-validate-comprehensive.sh`
- `yawl/scripts/hyper-validate.sh`
- `yawl/scripts/jextract-generate.sh`
- `yawl/scripts/load-ontologies.sh`
- `yawl/scripts/manage-warm-cache.sh`
- `yawl/scripts/maven-wrapper.sh`
- `yawl/scripts/metrics-dashboard.sh`
- `yawl/scripts/metrics-runner.sh`
- `yawl/scripts/monitor-build-performance.sh`
- `yawl/scripts/mvnd-enforce.sh`
- `yawl/scripts/observatory/observatory.sh`
- `yawl/scripts/observatory/rust4pm-audit.sh`
- `yawl/scripts/oracle-sort-files.sh`
- `yawl/scripts/performance/benchmark-build.sh`
- `yawl/scripts/phase6-consolidate.sh`
- `yawl/scripts/predict-test-times.sh`
- `yawl/scripts/ralph/agent-spawner.sh`
- `yawl/scripts/ralph/cli.sh`
- `yawl/scripts/ralph/loop-state.sh`
- `yawl/scripts/ralph/utils.sh`
- `yawl/scripts/ralph-loop/apply-terraform.sh`
- `yawl/scripts/ralph-loop/auto-oracle-deploy.sh`
- `yawl/scripts/ralph-loop/build-minimal-dist.sh`
- `yawl/scripts/ralph-loop/check-a1-regions.sh`
- `yawl/scripts/ralph-loop/deploy-to-gke.sh`
- `yawl/scripts/ralph-loop/deploy-to-oci-micro.sh`
- `yawl/scripts/ralph-loop/deploy-to-oci.sh`
- `yawl/scripts/ralph-loop/flex-warmer.sh`
- `yawl/scripts/ralph-loop/instance-keeper.sh`
- `yawl/scripts/ralph-loop/oracle-capacity-monitor.sh`
- `yawl/scripts/ralph-loop/region-hunter.sh`
- `yawl/scripts/ralph-loop/start-oracle-loop.sh`
- `yawl/scripts/ralph-loop/start-simulation.sh`
- `yawl/scripts/ralph-loop/stop-oracle-loop.sh`
- `yawl/scripts/ralph-loop/stop-simulation.sh`
- `yawl/scripts/ralph-loop/verify-oracle-loop.sh`
- `yawl/scripts/ralph-loop/verify-simulation.sh`
- `yawl/scripts/realtime-metrics-monitor.sh`
- `yawl/scripts/remote-cache-management.sh`
- `yawl/scripts/run-all-shards.sh`
- `yawl/scripts/run-feedback-tests.sh`
- `yawl/scripts/run-integration-shards.sh`
- `yawl/scripts/run-mcp-validation-tests.sh`
- `yawl/scripts/run-parallel-stress-tests.sh`
- `yawl/scripts/run-shard.sh`
- `yawl/scripts/run-test-tier.sh`
- `yawl/scripts/run-zai-sim.sh`
- `yawl/scripts/run_stress_tests.sh`
- `yawl/scripts/schedule-tests-by-predictions.sh`
- `yawl/scripts/self-assessment-invariant-test.sh`
- `yawl/scripts/start-beam-bridge.sh`
- `yawl/scripts/stress-test-orchestrator.sh`
- `yawl/scripts/test-cds-performance.sh`
- `yawl/scripts/test-incremental-build.sh`
- `yawl/scripts/test-optimizations.sh`
- `yawl/scripts/test-self-play-loop-v3.sh`
- `yawl/scripts/test-semantic-caching.sh`
- `yawl/scripts/test-sessionstart-hook.sh`
- `yawl/scripts/test-warm-cache.sh`
- `yawl/scripts/train-prediction-model.sh`
- `yawl/scripts/tune-build-parameters.sh`
- `yawl/scripts/validate-caching.sh`
- `yawl/scripts/validate-cds-setup.sh`
- `yawl/scripts/validate-compatibility.sh`
- `yawl/scripts/validate-impact-graph.sh`
- `yawl/scripts/validate-parallel-isolation.sh`
- `yawl/scripts/validate-receipts.sh`
- `yawl/scripts/validate-yengine-parallelization.sh`
- `yawl/scripts/validation/validate-release.sh`
- `yawl/scripts/verify-1m-agent-deployment.sh`
- `yawl/scripts/verify-baselines.sh`
- `yawl/scripts/verify-self-play-loop.sh`
- `yawl/scripts/verify-tip-system.sh`
- `yawl/stress-test/demo-receipt-chain.sh`
- `yawl/stress-test/scripts/start-github-mcp.sh`
- `yawl/test/a2a-handoff-test.sh`
- `yawl/test/dx-validation-tests.sh`
- `yawl/test/edge-cases/run_edge_cases.sh`
- `yawl/test/integration/phase-integration-test.sh`
- `yawl/test/self-assessment-validation.sh`
- `yawl/test-qlever-coverage.sh`
- `yawl/test-security-run.sh`
- `yawl/test-simulator.sh`
- `yawl/test-validate-cancellation-patterns.sh`
- `yawl/test_conformance_formula.sh`
- `yawl/test_layer4_conformance_pipeline.sh`
- `yawl/tests/shell/run_all_tests.sh`
- `yawl/tests/shell/test_emit_diagrams.sh`
- `yawl/tests/shell/test_emit_facts.sh`
- `yawl/tests/shell/test_emit_receipt.sh`
- `yawl/tests/shell/test_emit_yawl_xml.sh`
- `yawl/tests/shell/test_gen_v6_diagrams.sh`
- `yawl/tests/shell/test_util.sh`
- `yawl/tests/test-round-trip.sh`
- `yawl/tools/gen_v6_diagrams.sh`
- `yawl/validate_pattern_implementation.sh`
- `yawl/validation/test-performance-validation.sh`
- `yawl/validation/validation-scripts/test-performance-validation.sh`
- `yawl/validation/validation-scripts/validate-all.sh`
- `yawl/validation/validation-scripts/validate-compatibility.sh`
- `yawl/validation/validation-scripts/validate-compliance.sh`
- `yawl/validation/validation-scripts/validate-performance-v2-docker.sh`
- `yawl/validation/validation-scripts/validate-performance-v2.sh`
- `yawl/validation/validation-scripts/validate-performance.sh`
- `yawl/validation/validation-scripts/validate-security.sh`
- `yawl/verify-layer1.sh`
- `yawl/verify-shacl-implementation.sh`
- `yawl/verify_conformance_formulas.sh`
- `yawl/verify_scoped_value_inheritance.sh`
- `yawl/verify_test_coverage.sh`
- `yawl/yawl-data-modelling/dm-bridge-ggen/validate.sh`
- `yawl/yawl-engine/validate-scoped-value.sh`
- `yawl/yawl-erlang-bridge/build_bridge.sh`
- `yawl/yawl-erlang-bridge/scripts/start-beam-bridge.sh`
- `yawl/yawl-erlang-bridge/yawl-erlang-bridge/build_test.sh`
- `yawl/yawl-erlang-bridge/yawl-erlang-bridge/run_jtbd_simple.sh`
- `yawl/yawl-erlang-bridge/yawl-erlang-bridge/test_jtbd_all.sh`
- `yawl/yawl-erlang-bridge/yawl-erlang-bridge/test_nif_only.sh`
- `yawl/yawl-erlang-bridge/yawl-erlang-bridge/validate_ei_implementation.sh`
- `yawl/yawl-mcp-a2a-app/run-message-throughput-benchmark.sh`
- `yawl/yawl-mcp-a2a-app/run-simple-test.sh`
- `yawl/yawl-mcp-a2a-app/test-analytics.sh`
- `yawl/yawl-mcp-a2a-app/validate-test.sh`
- `yawl/yawl-ml-bridge/build_all.sh`
- `yawl/yawl-ml-bridge/native/build.sh`
- `yawl/yawl-ml-bridge/test_otp_rust_python.sh`
- `yawl/yawl-native-bridge/scripts/build-qlever-ffi.sh`
- `yawl/yawl-native-bridge/scripts/build-rust4pm.sh`
- `yawl/yawl-native-bridge/scripts/generate-bridge-code.sh`
- `yawl/yawl-native-bridge/yawl-ei-bridge/Makefile`
- `yawl/yawl-native-bridge/yawl-ei-bridge/build.sh`
- `yawl/yawl-native-bridge/yawl-ei-bridge/verify.sh`
- `yawl/yawl-native-bridge/yawl-qlever-bridge/validate_bridge_pattern.sh`
- `yawl/yawl-rust/rust4pm/Makefile`
- `yawl/yawl-rust4pm/rust4pm/Makefile`
- `yawl/yawl-rust4pm/rust4pm/build-nif.sh`
- `yawl/yawl-rust4pm/rust4pm/build_nif.sh`
- `yawl/yawl-rust4pm/rust4pm/build_python.sh`
- `yawl/yawl-rust4pm/rust4pm/setup_python_dev.sh`
- `yawl/yawl-rust4pm/rust4pm/test_build.sh`
- `yawl/yawl-rust4pm/rust4pm/test_nif.sh`

## 3. Extracted Documentation & Context
### Source: `yawl/00-START-HERE.md`
```markdown
# YAWL Conservative Load Stress Test — START HERE

**Prepared**: 2026-02-28  
**Status**: READY FOR EXECUTION  
**Total Documentation**: 84 KB, 2,300+ lines

---

## What Is This?

This is a complete, production-ready stress test to validate YAWL's ability to handle **1M+ concurrent active cases** under normal operating conditions.

**Key Facts:**
- Duration: 4 hours (achievable in test environment)
- Load: 500 cases/second (conservative, realistic)
- Expected: 7.2 million total cases created
- Success: Sustained >450 cases/sec with <500 MB/hour heap growth

---

## Quick Start (5 minutes)

### 1. Understand What You're Testing
```
Can YAWL handle 1M concurrent active cases? ✓
How does latency degrade under realistic workload? ✓
What's case creation throughput at scale? ✓
```

### 2. Read the Documents (in order)
1. This file (00-START-HERE.md) — 2 min
2. STRESS_TEST_README.md — 5 min (quick reference)
3. STRESS_TEST_SUMMARY.md — 10 min (overview)

### 3. Run the Test
```bash
cd /home/user/yawl
unset JAVA_TOOL_OPTIONS  # Fix environment
mvn test -pl yawl-benchmark -P soak-tests \
  -Dsoak.duration.hours=4 \
...
```

### Source: `yawl/ACADEMIC_STANDARDS_VALIDATION_REPORT.md`
```markdown
# ACADEMIC STANDARDS VALIDATION REPORT
## PhD Thesis: YAWL at the Million-Case Boundary

**Validation Date**: 2026-02-28  
**Document**: `/home/user/yawl/PHD_THESIS_YAWL_MILLION_CASES.md`  
**Validator**: YAWL Validation Specialist  
**Assessment Level**: COMPREHENSIVE

---

## EXECUTIVE SUMMARY

The PhD thesis demonstrates **STRONG academic rigor** with **EXCELLENT empirical methodology** and **COMPREHENSIVE documentation**. The document achieves **92/100 compliance** with ACM/IEEE publication standards.

**Overall Status**: ✅ **PUBLICATION-READY with minor enhancements**

---

## 1. STRUCTURAL VALIDATION

### 1.1 Document Structure (Score: 95/100)

| Element | Status | Notes |
|---------|--------|-------|
| **Title** | ✅ PASS | Clear, specific, empirical focus |
| **Abstract** | ✅ PASS | 150-word structure, research questions implied |
| **Author/Institution** | ✅ PASS | Clearly identified as Anthropic team |
| **Date & Version** | ✅ PASS | Final version 1.0, February 2026 |
| **Table of Contents** | ⚠️ MISSING | No TOC section (recommend adding) |
| **Introduction** | ✅ PASS | Strong motivation and RQs |
| **Background** | ✅ PASS | Related work, YAWL architecture |
| **Methodology** | ✅ PASS | Detailed experimental design |
| **Results** | ✅ PASS | Comprehensive data presentation |
| **Discussion** | ✅ PASS | Implications section (Section 7) |
| **Limitations** | ✅ PASS | Honest acknowledgment (Section 8.1) |
| **Future Work** | ✅ PASS | Clear research directions |
| **Conclusion** | ✅ PASS | Comprehensive summary |
| **References** | ✅ PASS | 8 citations provided |

**Findings**:
...
```

### Source: `yawl/ACTOR_PATTERNS_BREAKING_POINTS.md`
```markdown
# ACTOR_PATTERNS_BREAKING_POINTS.md

> **YAWL v6.0.0 — Actor Framework Concurrency Breaking-Point Analysis**
> Generated: 2026-03-01 | JVM: JDK 25.0.2 + ZGC | Hardware: Container (16 vCPU, 2 GB heap)

---

## Executive Summary

Six targeted experiments were run against `VirtualThreadRuntime` to find exact failure boundaries.
Two bugs were discovered and fixed. The system scales to **1.46 million concurrent idle actors**
before heap exhaustion; carrier thread saturation is a non-issue for IO-bound actors.

| Experiment | Breaking Point | Root Cause |
|------------|----------------|------------|
| **1. Idle Actor OOM** | **1,458,990 concurrent actors** @ 2 GB | 1,454 B/actor (not 132 B) |
| **2. Active Actor Flood** | No saturation up to 100,000 tested | IO-bound VTs scale linearly |
| **3. Spawn Velocity** | No plateau up to 500,000 tested | CHM handles 500K without contention |
| **4. Mailbox OOM** | ~18 million queued messages @ 2 GB | 111 B/msg in unbounded queue |
| **5. ID Rollover** | LOW risk — wraps to MIN_VALUE | CHM handles negative int keys fine |
| **6. Stop Race (BUG)** | Fixed — was: 98.9% miss rate | `a.thread` null when stop() ran first |

---

## Experiment 1 — Idle Actor Sweep

**Method**: Spawn N actors, each immediately blocking on `recv()`. Measure heap before/after GC.

| N actors | Heap Before | Heap After | Bytes/Actor | Status |
|----------|-------------|------------|-------------|--------|
| 1,000 | 10 MB | 12 MB | 2,097 B | OK |
| 5,000 | 8 MB | 24 MB | 3,355 B | OK |
| 10,000 | 8 MB | 28 MB | 2,097 B | OK |
| 50,000 | 8 MB | 114 MB | 2,222 B | OK |
| 100,000 | 6 MB | 176 MB | 1,782 B | OK |
| 250,000 | 38 MB | 390 MB | 1,476 B | OK |
| 500,000 | 36 MB | 734 MB | 1,463 B | OK |
| 750,000 | 40 MB | 1,072 MB | 1,442 B | OK |
| 1,000,000 | 12 MB | 1,402 MB | 1,457 B | OK |
| **1,458,990** | 14 MB | 2,038 MB | 1,454 B | **OOM** |
...
```

*(Plus 877 other markdown files)*
