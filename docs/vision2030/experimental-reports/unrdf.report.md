# Experimental Project Report: unrdf

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/unrdf`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `unrdf/Makefile`
- `unrdf/benchmarks/package.json`
- `unrdf/beta-test/beta-readiness-validation.sh`
- `unrdf/beta-test/beta-test-harness.sh`
- `unrdf/codegen/generated/package.json`
- `unrdf/examples/blockchain-audit/package.json`
- `unrdf/examples/distributed-orchestration/package.json`
- `unrdf/examples/graph-analytics/package.json`
- `unrdf/examples/graphql-gateway/package.json`
- `unrdf/examples/knowledge-rag/package.json`
- `unrdf/examples/package.json`
- `unrdf/k8s/doctor-check.sh`
- `unrdf/open-ontologies/Makefile`
- `unrdf/open-ontologies/benchmark/marketplace_benchmark.sh`
- `unrdf/open-ontologies/studio/package.json`
- `unrdf/otel/run-process-mining.sh`
- `unrdf/otel/scripts/pm4py-conformance-gate.sh`
- `unrdf/otel/scripts/trace-baseline.sh`
- `unrdf/package.json`
- `unrdf/packages/ai-ml-innovations/package.json`
- `unrdf/packages/atomvm/package.json`
- `unrdf/packages/blockchain/package.json`
- `unrdf/packages/caching/package.json`
- `unrdf/packages/chatman-equation/package.json`
- `unrdf/packages/cli/package.json`
- `unrdf/packages/codegen/package.json`
- `unrdf/packages/collab/package.json`
- `unrdf/packages/composables/package.json`
- `unrdf/packages/consensus/package.json`
- `unrdf/packages/core/package.json`
- `unrdf/packages/daemon/package.json`
- `unrdf/packages/dark-matter/package.json`
- `unrdf/packages/decision-fabric/package.json`
- `unrdf/packages/diataxis-kit/package.json`
- `unrdf/packages/domain/package.json`
- `unrdf/packages/engine-gateway/package.json`
- `unrdf/packages/event-automation/package.json`
- `unrdf/packages/federation/package.json`
- `unrdf/packages/fusion/package.json`
- `unrdf/packages/geosparql/package.json`
- `unrdf/packages/graph-analytics/package.json`
- `unrdf/packages/hooks/package.json`
- `unrdf/packages/integration-tests/package.json`
- `unrdf/packages/kgc-4d/package.json`
- `unrdf/packages/kgc-4d-playground/package.json`
- `unrdf/packages/kgc-cli/package.json`
- `unrdf/packages/kgc-docs/package.json`
- `unrdf/packages/kgc-multiverse/package.json`
- `unrdf/packages/kgc-probe/package.json`
- `unrdf/packages/kgc-runtime/package.json`
- `unrdf/packages/kgc-substrate/package.json`
- `unrdf/packages/kgc-swarm/package.json`
- `unrdf/packages/kgc-tools/package.json`
- `unrdf/packages/kgn/package.json`
- `unrdf/packages/knowledge-engine/package.json`
- `unrdf/packages/manufacturing/package.json`
- `unrdf/packages/ml-inference/package.json`
- `unrdf/packages/ml-versioning/package.json`
- `unrdf/packages/observability/package.json`
- `unrdf/packages/otel/package.json`
- `unrdf/packages/oxigraph/package.json`
- `unrdf/packages/pictl-algorithms/package.json`
- `unrdf/packages/pictl-semantics/package.json`
- `unrdf/packages/project-engine/package.json`
- `unrdf/packages/rdf-graphql/package.json`
- `unrdf/packages/react/package.json`
- `unrdf/packages/receipts/package.json`
- `unrdf/packages/self-healing-workflows/package.json`
- `unrdf/packages/semantic-search/package.json`
- `unrdf/packages/serverless/package.json`
- `unrdf/packages/spatial-kg/package.json`
- `unrdf/packages/streaming/package.json`
- `unrdf/packages/temporal-discovery/package.json`
- `unrdf/packages/test-utils/package.json`
- `unrdf/packages/v6-compat/package.json`
- `unrdf/packages/v6-core/package.json`
- `unrdf/packages/validation/package.json`
- `unrdf/packages/truex-kernel/Makefile`
- `unrdf/packages/truex-kernel/package.json`
- `unrdf/packages/zkp/package.json`
- `unrdf/playground/hooks-showcase/package.json`
- `unrdf/playground/package.json`
- `unrdf/profiling/QUICK-START.sh`
- `unrdf/scripts/common-tasks.sh`
- `unrdf/scripts/count-otel-per-package.sh`
- `unrdf/scripts/debug-helpers.sh`
- `unrdf/scripts/debug-test.sh`
- `unrdf/scripts/deploy-production.sh`
- `unrdf/scripts/deploy-staging.sh`
- `unrdf/scripts/dev-package.sh`
- `unrdf/scripts/dev-start.sh`
- `unrdf/scripts/dev-workflow.sh`
- `unrdf/scripts/generate-certs.sh`
- `unrdf/scripts/health-check.sh`
- `unrdf/scripts/install-hooks.sh`
- `unrdf/scripts/package.json`
- `unrdf/scripts/pre-commit.sh`
- `unrdf/scripts/quick-start.sh`
- `unrdf/scripts/rollback.sh`
- `unrdf/scripts/validate-env.sh`
- `unrdf/scripts/validation-commands.sh`
- `unrdf/sidecar/package.json`
- `unrdf/src/package.json`
- `unrdf/src/projection/package.json`
- `unrdf/src/receipts/package.json`
- `unrdf/test/narrative-state-chain/package.json`
- `unrdf/validation/validate-corrections.sh`

## 3. Extracted Documentation & Context
### Source: `unrdf/BREAKING_CHANGES.md`
```markdown
# UNRDF v6 Breaking Changes

## Overview

UNRDF v6 represents a major architectural shift from v5, focusing on performance, type safety, and production readiness through the adoption of Oxigraph as the core RDF store.

## Migration Priority: HIGH

**Timeline**: vlatest.1 → vlatest.1 → vlatest stable
**Status**: Currently in alpha - not production ready
**Migration Guide**: See `/home/user/unrdf/docs/v6/MIGRATION_PLAN.md`

---

## Core Breaking Changes

### 1. RDF Store Implementation (CRITICAL)

**Before (v5)**:
```javascript
import { Store } from 'n3';
const store = new Store();
```

**After (v6)**:
```javascript
import { createStore } from '@unrdf/oxigraph';
const store = createStore();
```

**Impact**: ALL code using `new Store()` from N3 must migrate
**Reason**: Oxigraph provides 3-10x better performance and WASM-based native execution
**Migration**: Use `@unrdf/v6-compat` adapters for gradual migration

### 2. Data Factory Changes (HIGH)

**Before (v5)**:
```javascript
import { DataFactory } from 'n3';
const { namedNode, literal } = DataFactory;
...
```

### Source: `unrdf/BROWSER-COMPATIBILITY-IMPLEMENTATION.md`
```markdown
# Browser Compatibility Implementation Summary - UNRDF v[VERSION]

**Status**: ✅ **COMPLETED**  
**Date**: 2025-11-16  
**Version**: v[VERSION]

## Overview

Successfully implemented comprehensive browser compatibility for UNRDF with ≥90% feature parity and optimized performance. All acceptance criteria have been met.

## Implementation Summary

### ✅ Completed Components (11/11)

| Component | Files | Lines | Status |
|-----------|-------|-------|--------|
| Browser Shims | 3 files | ~850 | ✅ Complete |
| IndexedDB Storage | 2 files | ~1100 | ✅ Complete |
| Query Executor | 1 file | ~300 | ✅ Complete |
| Lockchain Writer | 1 file | ~450 | ✅ Complete |
| Examples | 3 files | ~1200 | ✅ Complete |
| Build Config | 1 file | ~250 | ✅ Complete |
| Tests | 4 files | ~1800 | ✅ Complete |
| Validation | 1 file | ~350 | ✅ Complete |
| Documentation | 1 file | ~800 | ✅ Complete |
| **TOTAL** | **17 files** | **~7100 lines** | ✅ **100%** |

## Files Created

### Core Browser Support (`/src/browser/`)

1. **browser-shim.mjs** (320 lines)
   - Browser-compatible shims for Node.js APIs
   - fs, path, crypto utilities
   - BrowserWorker class (Web Worker wrapper)
   - Environment detection

2. **indexeddb-fs.mjs** (480 lines)
   - Virtual file system using IndexedDB
   - POSIX-like operations (readFile, writeFile, mkdir, readdir)
...
```

### Source: `unrdf/CODEGEN_EXAMPLES.md`
```markdown
# Code generation examples

Use **`unrdf sync`** with **`unrdf.toml`** and templates under your project’s `templates/` directory.

- Tutorial: `docs/diataxis/tutorials/sync-first-api.md`
- Multi-format: `docs/diataxis/tutorials/sync-multi-format.md`
- Example project: `examples/openapi/` (uses `unrdf.toml`)

...
```

*(Plus 1128 other markdown files)*
