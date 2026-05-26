# Experimental Project Report: chicago-tdd-tools

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/chicago-tdd-tools`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `chicago-tdd-tools/registry/Makefile`
- `chicago-tdd-tools/registry/package.json`
- `chicago-tdd-tools/scripts/check-dog-fooding.sh`
- `chicago-tdd-tools/scripts/doc-coverage.sh`
- `chicago-tdd-tools/scripts/docs-check.sh`
- `chicago-tdd-tools/scripts/fix-common-lints.sh`
- `chicago-tdd-tools/scripts/install-hooks.sh`
- `chicago-tdd-tools/scripts/weaver-bootstrap.sh`
- `chicago-tdd-tools/vendors/weaver/cross-arch-build.sh`

## 3. Extracted Documentation & Context
### Source: `chicago-tdd-tools/CI_FIXES_SUMMARY.md`
```markdown
# Summary: CI/Unit Test Fixes - Final Status

**Date**: 2025-11-14
**Status**: ✅ **ALL TESTS PASSING - CI READY**
**Commits**: 3 commits with fixes and documentation
**Tests**: 289/289 passing (100%)

---

## Changes Made

### 1. Fixed Timeout Configuration (Commit 1)
**File**: `.config/nextest.toml`
- **Change**: Increased per-test timeout from 1s → 5s
- **Change**: Increased global timeout from 10s → 60s
- **Reason**: `#[should_panic]` tests have framework overhead (~0.1-0.2s) + parallel execution adds latency
- **Impact**: Fixed 16 assertion module timeouts
- **Documentation**: Added FMEA analysis notes

### 2. Added FMEA Documentation (Commits 1 & 2)
**Files Created**:
- `FMEA_ROOT_CAUSE_ANALYSIS.md` - Complete analysis of 18 failure modes
- `FMEA_SUMMARY_TABLE.md` - Quick reference table with root causes
- `UNIT_TEST_FAILURE_RCA.md` - Detailed RCA of timeout issue
- `FMEA_EXECUTIVE_SUMMARY.md` - High-level overview for stakeholders

**Coverage**:
- ✅ 2 Critical risks (RPN 560 & 315 each) - FIXED
- ✅ 6 High risks (RPN 100-200 range) - FIXED
- ⚠️ 3 Medium risks (RPN 50-100) - MONITORING
- ✅ 8 Low risks (RPN < 50) - WELL-CONTROLLED

### 3. Fixed Weaver Integration Tests (Commit 3)
**File**: `src/observability/weaver/mod.rs`
- **Change**: Skip weaver tests by default
- **Opt-in**: Set `WEAVER_REQUIRE_TEST=1` to run them
- **Reason**: Tests require external weaver binary which isn't reliably available across all environments
- **Impact**: Tests now gracefully skip instead of failing

**Modified Tests**:
...
```

### Source: `chicago-tdd-tools/CLAUDE.md`
```markdown
# CLAUDE.md - AI Assistant Guide for Chicago TDD Tools

**Version:** 1.1.0 | **Updated:** 2025-11-14
**Purpose:** Compressed guide for AI assistants. Assumes LLM understands Rust patterns.

---

## Core Identity

Rust testing framework enforcing Chicago-style TDD (Classicist) through compile-time guarantees. Type system encodes invariants—if it compiles, correctness follows. Quality default, prevention over detection.

**Stats:** ~8,000 LOC | Rust 2021+ | MIT License | https://github.com/seanchatmangpt/chicago-tdd-tools

**Principles:**
1. **Poka-Yoke Design** - Mistakes prevented at compilation, not runtime
2. **Type-First Thinking** - Types as primary design tool, compiler enforces correctness
3. **80/20 Thinking** - Second idea solves 80% of problems with 20% extra effort
4. **Zero-Cost Abstractions** - Performance through generics, const generics, macros
5. **AAA Pattern** - Arrange-Act-Assert enforced via type-level state machines

---

## Codebase Structure

### Directory Layout

```
chicago-tdd-tools/
├── src/                          # Main library (~8000 lines)
│   ├── lib.rs                    # Library root with prelude and module exports
│   ├── core/                     # Core testing infrastructure
│   │   ├── fixture.rs            # Test fixtures and setup utilities
│   │   ├── async_fixture.rs      # Async fixtures (async feature)
│   │   ├── builders.rs           # Fluent builders for test data
│   │   ├── assertions.rs         # Assertion helpers and utilities
│   │   ├── state.rs              # Type-level AAA enforcement
│   │   ├── poka_yoke.rs          # Error prevention through type safety
│   │   ├── const_assert.rs       # Compile-time assertions
│   │   ├── alert.rs              # Visual alert helpers (log integration)
│   │   └── macros/               # Test and assertion macros
...
```

### Source: `chicago-tdd-tools/COOKBOOK_DIATAXIS_PLAN.md`
```markdown
# Cookbook Diátaxis Restructuring Plan

**Goal**: Transform the 20-pattern cookbook from pure pattern language into a navigable Diátaxis framework that serves learners at every stage.

---

## Current State Analysis

### Existing Assets
- **20 Patterns** across 3 families:
  - Testing Patterns (5): AAA, Error Paths, Boundaries, Resource Cleanup, Real Collaborators
  - Architecture Patterns (5): Generic Base, Extension Layer, Composition, Single Source, Capability Groups
  - Design Patterns (10): Zero-Cost, Type Safety, Sealed Traits, Compile-Time, Type State, Fixture Lifecycle, Builder Test Data, Timeout Defense, Feature Gating, Macro Enforcement
- **Format**: Alexander-style (Context, Problem, Solution, Forces, Examples, Related Patterns)
- **Content Quality**: Strong, technical, theoretical foundation

### Weaknesses
- No learning path guidance
- No "decision matrix" for choosing patterns
- Limited practical, step-by-step implementation guides
- No content-type labeling
- Missing real-world examples and use cases
- Limited cross-references and navigation

---

## Diátaxis Framework Application

### How Diátaxis Maps to Cookbook

| Diátaxis Type | What It Is | Cookbook Application |
|---------------|-----------|----------------------|
| **Tutorials** | Learning-oriented, progressive | Pattern Learning Paths (3 sequences) |
| **How-to Guides** | Problem-oriented, practical | "Implement Pattern X" guides (1 per pattern) |
| **Reference** | Lookup-oriented, complete | Enhanced pattern documentation (existing + improvements) |
| **Explanations** | Understanding-oriented | Pattern philosophy, when/why (context expansion) |

---

## Implementation Plan
...
```

*(Plus 149 other markdown files)*
