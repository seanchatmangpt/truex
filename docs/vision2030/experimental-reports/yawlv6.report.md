# Experimental Project Report: yawlv6

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/yawlv6`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `yawlv6/Makefile`
- `yawlv6/apache-tomcat-10.1.29/execute_sql_injection_tests.sh`
- `yawlv6/build/procletService/runEditor.sh`
- `yawlv6/deploy/systemd/yawl-engine-healthcheck.sh`
- `yawlv6/exampleSpecs/wcp-patterns/generate_patterns.sh`
- `yawlv6/scripts/benchmark-maven.sh`
- `yawlv6/scripts/runtime-validation/benchmark-all-specs.sh`
- `yawlv6/scripts/runtime-validation/extract-hibernate-patterns.sh`
- `yawlv6/scripts/runtime-validation/stress-cascade-delete.sh`
- `yawlv6/scripts/runtime-validation/validate-wcp-predicates.sh`
- `yawlv6/scripts/van-der-aalst/04-report.sh`

## 3. Extracted Documentation & Context
### Source: `yawlv6/CLAUDE.md`
```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YAWL (Yet Another Workflow Language) v5.2 - A BPM/Workflow system with a formal foundation, service-oriented architecture, and support for complex data transformations. The system handles workflow specifications, execution, and resource management.

## Build Commands

```bash
# Build all WAR files (default target)
ant -f build/build.xml buildWebApps

# Build all release material
ant -f build/build.xml buildAll

# Compile source only
ant -f build/build.xml compile

# Clean build artifacts
ant -f build/build.xml clean
```

## Testing

```bash
# Run all unit tests (JUnit 4)
ant -f build/build.xml unitTest

# Run resourcing tests only
ant -f build/build.xml resourcingtest
```

Test suites are organized in `test/org/yawlfoundation/yawl/`:
- `TestAllYAWLSuites.java` - Master suite running all tests
- Individual suites: Elements, Engine, Schema, Authentication, Logging, etc.

## Database Configuration

...
```

### Source: `yawlv6/MATURITY_MATRIX_EVALUATION.md`
```markdown
# Definition of Done Maturity Matrix Evaluation
## YAWL v6.0 Modernization Project

**Assessment Date:** March 30, 2026
**Project Status:** ADVANCED (Phase 6 Complete)
**Overall Maturity Level:** 4.2/5.0 (Measured)

---

## Executive Summary

The YAWL v6.0 modernization project has achieved advanced maturity across all critical dimensions. With 6 phases completed and comprehensive metrics in place, the project demonstrates:

- **Build System:** 5/5 (Optimized) - Maven with full automation
- **Code Quality:** 4.5/5 (Measured) - 78% coverage, minimal technical debt
- **Testing:** 4.5/5 (Measured) - 272 tests, 77% pass rate on Java 25
- **Architecture:** 4.5/5 (Measured) - Virtual threads, async patterns verified
- **Deployment:** 4/5 (Measured) - Containerized, Kubernetes-ready
- **Security:** 5/5 (Optimized) - Zero critical vulnerabilities, hardened dependencies
- **Performance:** 4.5/5 (Measured) - 15x throughput, 70x latency improvement
- **Documentation:** 4/5 (Measured) - Comprehensive, but gaps in operational runbooks

**Weighted Overall:** **4.2/5** = **84% Complete**

---

## Maturity Level Definitions

| Level | Name | Definition | Characteristics |
|-------|------|-----------|-----------------|
| 1 | **Initial** | Ad-hoc, unpredictable processes | Manual, inconsistent, undocumented |
| 2 | **Managed** | Repeatable processes | Basic documentation, some automation |
| 3 | **Defined** | Standardized, documented | Processes documented, gates enforced |
| 4 | **Measured** | Quantified & controlled | Metrics tracked, SLOs defined |
| 5 | **Optimized** | Continuous improvement | Automated optimization, predictive |

---

## Detailed Maturity Matrix

...
```

### Source: `yawlv6/MERGE_TO_MAIN_PLAN.md`
```markdown
# YAWL v6 Merge-to-Main Plan

**Assessment Date:** 2026-03-30
**Branch Status:** READY FOR MERGE (since 2026-03-28)
**Assessment Type:** READ-ONLY + Documentation

---

## CRITICAL FINDINGS

### Divergence Metrics
- **master → origin/main:** 315 commits ahead
- **origin/main → master:** 1 commit ahead
- **Total Divergence:** 316 commits have diverged
- **File Changes:** 13,551 files changed (+538K/-2.5M lines)
- **Branch Point:** Commit `12ee1f128` (origin/main) vs `b0aa5309e` (origin/master)

### Uncommitted Changes
**13 files modified, 1 untracked:**

**Modified Test Documentation (M):**
- `yawl-core/docs/test/org.yawlfoundation.yawl.testing.dtr.InterfaceAPIReferenceTest.md`
- `yawl-core/docs/test/org.yawlfoundation.yawl.testing.dtr.OpenTelemetryObservabilityDocTest.md`
- `yawl-core/docs/test/org.yawlfoundation.yawl.testing.dtr.WorkflowPatternsDocTest.md`
- `yawl-core/docs/test/org.yawlfoundation.yawl.testing.dtr.YAWLQuickStartDocTest.md`
- `yawl-core/docs/test/org.yawlfoundation.yawl.testing.dtr.YEngineDocTest.md`
- `yawl-core/docs/test/org.yawlfoundation.yawl.testing.dtr.YMarshalAndSpecsDocTest.md`
- `yawl-core/docs/test/org.yawlfoundation.yawl.testing.dtr.YStatelessEngineDocTest.md`
- `yawl-core/docs/test/org.yawlfoundation.yawl.testing.dtr.YawlDtrExampleTest.md`
- `yawl-core/docs/test/org.yawlfoundation.yawl.testing.dtr.YawlTestInfrastructureDocTest.md`

**Modified Source Files (M):**
- `yawl-core/src/Java26TestRefactoringTemplates.md`
- `yawl-core/src/test/java/org/yawlfoundation/yawl/integration/PerformanceRegressionTest.java`
- `yawl-webapp/src/main/webapp/WEB-INF/web.xml`

**Untracked Files (??):**
- `docs/BENCHMARK_RUN_RESULTS.md`

### Build Status
...
```

*(Plus 40 other markdown files)*
