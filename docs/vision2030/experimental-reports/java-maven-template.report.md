# Experimental Project Report: java-maven-template

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/java-maven-template`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `java-maven-template/bin/docker-test.sh`
- `java-maven-template/cloud-config.sh`
- `java-maven-template/deploy.sh`
- `java-maven-template/dx-standalone.sh`
- `java-maven-template/dx.sh`
- `java-maven-template/stress-tests.sh`
- `java-maven-template/yawl/Makefile`
- `java-maven-template/yawl/build_nif.sh`
- `java-maven-template/yawl/compile_consensus_test.sh`
- `java-maven-template/yawl/debug-compile.sh`
- `java-maven-template/yawl/deploy/artifact-validation.sh`
- `java-maven-template/yawl/deploy/monitoring-validation.sh`
- `java-maven-template/yawl/deploy/staging-validation.sh`
- `java-maven-template/yawl/docker/backup.sh`
- `java-maven-template/yawl/docker/entrypoint.sh`
- `java-maven-template/yawl/docker/healthcheck.sh`
- `java-maven-template/yawl/docker/mcp-healthcheck.sh`
- `java-maven-template/yawl/docker/restore.sh`
- `java-maven-template/yawl/fix-all-remaining-errors.sh`
- `java-maven-template/yawl/fix-legacy-imports.sh`
- `java-maven-template/yawl/fix-legacy-src-imports.sh`
- `java-maven-template/yawl/fix_verify_calls.sh`
- `java-maven-template/yawl/generate-ocel.sh`
- `java-maven-template/yawl/q-validate.sh`
- `java-maven-template/yawl/run-cancellation-tests.sh`
- `java-maven-template/yawl/run-groq-selfplay-test.sh`
- `java-maven-template/yawl/run-groq-test.sh`
- `java-maven-template/yawl/run-moderate-soak-test.sh`
- `java-maven-template/yawl/run-performance-tests.sh`
- `java-maven-template/yawl/run_tests.sh`
- `java-maven-template/yawl/scripts/aggregate-gc-comparison.sh`
- `java-maven-template/yawl/scripts/analyze-build-timings.sh`
- `java-maven-template/yawl/scripts/analyze-gc-logs.sh`
- `java-maven-template/yawl/scripts/analyze-latency-degradation.sh`
- `java-maven-template/yawl/scripts/analyze-test-times.sh`
- `java-maven-template/yawl/scripts/ast-differ.sh`
- `java-maven-template/yawl/scripts/benchmark-build.sh`
- `java-maven-template/yawl/scripts/benchmark-integration-tests.sh`
- `java-maven-template/yawl/scripts/benchmark-multi-gc.sh`
- `java-maven-template/yawl/scripts/benchmark-qlever.sh`
- `java-maven-template/yawl/scripts/build-analytics.sh`
- `java-maven-template/yawl/scripts/build-erlang-beams.sh`
- `java-maven-template/yawl/scripts/build-erlang.sh`
- `java-maven-template/yawl/scripts/build-otp28-from-source.sh`
- `java-maven-template/yawl/scripts/build-rust4pm.sh`
- `java-maven-template/yawl/scripts/build-semantic-cache.sh`
- `java-maven-template/yawl/scripts/build-test-impact-graph.sh`
- `java-maven-template/yawl/scripts/cache-cleanup.sh`
- `java-maven-template/yawl/scripts/cds-helper.sh`
- `java-maven-template/yawl/scripts/check-test-shards.sh`
- `java-maven-template/yawl/scripts/cluster-tests.sh`
- `java-maven-template/yawl/scripts/collect-build-metrics.sh`
- `java-maven-template/yawl/scripts/collect-metrics.sh`
- `java-maven-template/yawl/scripts/compute-semantic-hash.sh`
- `java-maven-template/yawl/scripts/convert-libei-to-dylib.sh`
- `java-maven-template/yawl/scripts/convert-thesis.sh`
- `java-maven-template/yawl/scripts/deploy-parallelization.sh`
- `java-maven-template/yawl/scripts/detect-semantic-changes.sh`
- `java-maven-template/yawl/scripts/dx-incremental.sh`
- `java-maven-template/yawl/scripts/dx-v2.sh`
- `java-maven-template/yawl/scripts/dx.sh`
- `java-maven-template/yawl/scripts/establish-baselines.sh`
- `java-maven-template/yawl/scripts/final-gate-v3.sh`
- `java-maven-template/yawl/scripts/final-gate.sh`
- `java-maven-template/yawl/scripts/fix-dx-pipeline.sh`
- `java-maven-template/yawl/scripts/gc-profile.sh`
- `java-maven-template/yawl/scripts/generate-cds-archives.sh`
- `java-maven-template/yawl/scripts/generate-performance-report.sh`
- `java-maven-template/yawl/scripts/generate-test-data.sh`
- `java-maven-template/yawl/scripts/generate-validation-report.sh`
- `java-maven-template/yawl/scripts/h2-snapshot-utils.sh`
- `java-maven-template/yawl/scripts/hyper-validate-comprehensive.sh`
- `java-maven-template/yawl/scripts/hyper-validate.sh`
- `java-maven-template/yawl/scripts/jextract-generate.sh`
- `java-maven-template/yawl/scripts/load-ontologies.sh`
- `java-maven-template/yawl/scripts/manage-warm-cache.sh`
- `java-maven-template/yawl/scripts/maven-wrapper.sh`
- `java-maven-template/yawl/scripts/metrics-dashboard.sh`
- `java-maven-template/yawl/scripts/metrics-runner.sh`
- `java-maven-template/yawl/scripts/monitor-build-performance.sh`
- `java-maven-template/yawl/scripts/mvnd-enforce.sh`
- `java-maven-template/yawl/scripts/phase6-consolidate.sh`
- `java-maven-template/yawl/scripts/predict-test-times.sh`
- `java-maven-template/yawl/scripts/realtime-metrics-monitor.sh`
- `java-maven-template/yawl/scripts/remote-cache-management.sh`
- `java-maven-template/yawl/scripts/run-all-shards.sh`
- `java-maven-template/yawl/scripts/run-feedback-tests.sh`
- `java-maven-template/yawl/scripts/run-integration-shards.sh`
- `java-maven-template/yawl/scripts/run-mcp-validation-tests.sh`
- `java-maven-template/yawl/scripts/run-parallel-stress-tests.sh`
- `java-maven-template/yawl/scripts/run-shard.sh`
- `java-maven-template/yawl/scripts/run-test-tier.sh`
- `java-maven-template/yawl/scripts/run-zai-sim.sh`
- `java-maven-template/yawl/scripts/run_stress_tests.sh`
- `java-maven-template/yawl/scripts/schedule-tests-by-predictions.sh`
- `java-maven-template/yawl/scripts/self-assessment-invariant-test.sh`
- `java-maven-template/yawl/scripts/start-beam-bridge.sh`
- `java-maven-template/yawl/scripts/stress-test-orchestrator.sh`
- `java-maven-template/yawl/scripts/test-cds-performance.sh`
- `java-maven-template/yawl/scripts/test-incremental-build.sh`
- `java-maven-template/yawl/scripts/test-optimizations.sh`
- `java-maven-template/yawl/scripts/test-self-play-loop-v3.sh`
- `java-maven-template/yawl/scripts/test-semantic-caching.sh`
- `java-maven-template/yawl/scripts/test-sessionstart-hook.sh`
- `java-maven-template/yawl/scripts/test-warm-cache.sh`
- `java-maven-template/yawl/scripts/train-prediction-model.sh`
- `java-maven-template/yawl/scripts/tune-build-parameters.sh`
- `java-maven-template/yawl/scripts/validate-caching.sh`
- `java-maven-template/yawl/scripts/validate-cds-setup.sh`
- `java-maven-template/yawl/scripts/validate-compatibility.sh`
- `java-maven-template/yawl/scripts/validate-impact-graph.sh`
- `java-maven-template/yawl/scripts/validate-parallel-isolation.sh`
- `java-maven-template/yawl/scripts/validate-receipts.sh`
- `java-maven-template/yawl/scripts/validate-yengine-parallelization.sh`
- `java-maven-template/yawl/scripts/verify-1m-agent-deployment.sh`
- `java-maven-template/yawl/scripts/verify-baselines.sh`
- `java-maven-template/yawl/scripts/verify-self-play-loop.sh`
- `java-maven-template/yawl/scripts/verify-tip-system.sh`
- `java-maven-template/yawl/stress-test/demo-receipt-chain.sh`
- `java-maven-template/yawl/test/a2a-handoff-test.sh`
- `java-maven-template/yawl/test/dx-validation-tests.sh`
- `java-maven-template/yawl/test/self-assessment-validation.sh`
- `java-maven-template/yawl/test-qlever-coverage.sh`
- `java-maven-template/yawl/test-security-run.sh`
- `java-maven-template/yawl/test-simulator.sh`
- `java-maven-template/yawl/test-validate-cancellation-patterns.sh`
- `java-maven-template/yawl/test_conformance_formula.sh`
- `java-maven-template/yawl/test_layer4_conformance_pipeline.sh`
- `java-maven-template/yawl/tests/test-round-trip.sh`
- `java-maven-template/yawl/tools/gen_v6_diagrams.sh`
- `java-maven-template/yawl/validate_pattern_implementation.sh`
- `java-maven-template/yawl/validation/test-performance-validation.sh`
- `java-maven-template/yawl/verify-layer1.sh`
- `java-maven-template/yawl/verify-shacl-implementation.sh`
- `java-maven-template/yawl/verify_conformance_formulas.sh`
- `java-maven-template/yawl/verify_scoped_value_inheritance.sh`
- `java-maven-template/yawl/verify_test_coverage.sh`
- `java-maven-template/yawl/yawl-engine/validate-scoped-value.sh`
- `java-maven-template/yawl/yawl-erlang-bridge/build_bridge.sh`
- `java-maven-template/yawl/yawl-mcp-a2a-app/run-message-throughput-benchmark.sh`
- `java-maven-template/yawl/yawl-mcp-a2a-app/run-simple-test.sh`
- `java-maven-template/yawl/yawl-mcp-a2a-app/test-analytics.sh`
- `java-maven-template/yawl/yawl-mcp-a2a-app/validate-test.sh`
- `java-maven-template/yawl/yawl-ml-bridge/build_all.sh`

## 3. Extracted Documentation & Context
### Source: `java-maven-template/CHANGELOG.md`
```markdown
# Changelog

All notable changes to the McLaren Atlas JOTP (Java OTP) project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - 2026-03-09

### Overview

This release introduces comprehensive Enterprise Integration Patterns (EIP) for reactive messaging,
McLaren Atlas OTP stress testing at 1 million virtual threads, and a complete Result<T,E>
railway-oriented programming test suite. The changes represent a significant milestone in
bringing Erlang/OTP-style fault tolerance to Java 26.

**Statistics:**
- **15 new test files** added
- **8,304 lines** of new test code
- **10 commits** ahead of origin/main
- **212 files changed** in total diff from origin/main
- **44,929 insertions**, **326 deletions**

---

### Added

#### Enterprise Composition Framework (`org.acme`)

##### Application Container
- `Application` — Top-level application container with supervisor tree integration
  - Builder pattern for service registration
  - Infrastructure component injection (MessageBus, EventStore, MetricsCollector)
  - Health check integration
  - Lifecycle management (start/stop)
  - Configuration via `ApplicationConfig`

- `ApplicationConfig` — Typed configuration access with environment support
...
```

### Source: `java-maven-template/CLAUDE.md`
```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Tool: mvnd (Maven Daemon, Maven 4) — REQUIRED

**mvnd is mandatory.** Raw `mvn`/`./mvnw` is not used — mvnd 2.0.0-rc-3 (bundling Maven 4) is the build tool.

**Install once:**
```bash
# Download mvnd 2.0.0-rc-3 (Linux x86_64)
# https://github.com/apache/maven-mvnd/releases/download/2.0.0-rc-3/maven-mvnd-2.0.0-rc-3-linux-amd64.tar.gz
# Symlink: ln -sf /path/to/mvnd/bin/mvnd /usr/local/bin/mvnd
```

**Start proxy before building** (required when `https_proxy` is active in the environment):
```bash
python3 maven-proxy-v2.py &   # starts local proxy on 127.0.0.1:3128
```

**Configure Maven to use local proxy** (add to `~/.m2/settings.xml`):
```xml
<settings>
  <proxies>
    <proxy><id>local</id><active>true</active><protocol>https</protocol>
      <host>127.0.0.1</host><port>3128</port>
      <nonProxyHosts>localhost|127.0.0.1</nonProxyHosts></proxy>
    <proxy><id>local-http</id><active>true</active><protocol>http</protocol>
      <host>127.0.0.1</host><port>3128</port>
      <nonProxyHosts>localhost|127.0.0.1</nonProxyHosts></proxy>
  </proxies>
</settings>
```

## Commands

```bash
./mvnw test              # Run unit tests only
./mvnw verify            # Run all tests (unit + integration) and quality checks
./mvnw spotless:apply    # Format code (Google Java Format, AOSP style)
...
```

### Source: `java-maven-template/INNOVATION-1-OTP-JDBC.md`
```markdown
# OTP-Native JDBC: The Database Driver That Cannot Leak Connections

**Technical Specification — Innovation 1**
Status: Proposal | Date: 2026-03-08 | Author: Architecture Working Group

---

## Table of Contents

1. Motivation — Why Current Pools Leak
2. Core Concepts and Design Principles
3. Full API Design with Code Examples
4. Supervision Tree Architecture
5. Performance Analysis vs HikariCP
6. Integration with Existing JDBC Code
7. Blue Ocean Analysis
8. Implementation Roadmap

---

## 1. Motivation: Why Current Connection Pools Leak

### 1.1 The Fundamental Problem with Imperative Pools

HikariCP, c3p0, DBCP2, and every mainstream JDBC connection pool share one architectural flaw: **connection ownership is a convention, not a structural guarantee.** When a caller acquires a connection from the pool, it receives a raw `Connection` object — a mutable, shared-state object that can be passed to any thread, stored in a field, serialized into a closure, or simply forgotten.

The pool relies entirely on the caller to call `connection.close()` (which, for pooled connections, means "return to pool"). This call is voluntary. It can be skipped by:

- An uncaught exception escaping a `try` block with no `finally`
- A developer forgetting to close in a code path reached only under specific conditions
- A `Thread` that is interrupted before cleanup runs
- Returning from a method early without hitting the cleanup branch
- Placing a `Connection` in a `ThreadLocal` and then the thread dying without cleanup
- Passing the connection across an async boundary (e.g., into a `CompletableFuture`) where the original scope's `finally` block closes it prematurely — or never closes it at all

HikariCP mitigates this with a leak-detection timer that logs a stack trace after a configurable threshold (default: 0, i.e., disabled). This is a detection mechanism, not a prevention mechanism. You learn about the leak after it has already happened, potentially after the pool is exhausted and your application is returning HTTP 500 under load.

### 1.2 The Impedance Mismatch with Structured Concurrency

Java 25's `StructuredTaskScope` introduces lexically scoped concurrency: child tasks cannot outlive their enclosing scope. The JDK now enforces what good Java developers have always tried to achieve manually. But connection pools predate this model entirely. A `HikariDataSource.getConnection()` call returns outside any structured scope; the pool has no knowledge of the scope that acquired it, and the scope has no knowledge of the pool.
...
```

*(Plus 395 other markdown files)*
