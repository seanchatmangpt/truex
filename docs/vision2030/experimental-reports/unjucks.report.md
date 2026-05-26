# Experimental Project Report: unjucks

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/unjucks`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `unjucks/docker/kgen/docker-entrypoint.sh`
- `unjucks/docker/scripts/cleanroom-test-suite.sh`
- `unjucks/docker/scripts/cleanroom-test-wrapper.sh`
- `unjucks/docker/scripts/collect-test-results.sh`
- `unjucks/docker/scripts/comprehensive-validation.sh`
- `unjucks/docker/scripts/container-validator.sh`
- `unjucks/docker/scripts/coordination-init.sh`
- `unjucks/docker/scripts/health-monitor.sh`
- `unjucks/docker/scripts/performance-monitor.sh`
- `unjucks/docker/scripts/performance-tests.sh`
- `unjucks/docker/scripts/resource-stress.sh`
- `unjucks/docker/scripts/run-docker-tests.sh`
- `unjucks/docker/scripts/security-scan.sh`
- `unjucks/docker/scripts/test-runner.sh`
- `unjucks/docker/scripts/validate-cleanroom.sh`
- `unjucks/docker/scripts/validate-testing-environment.sh`
- `unjucks/examples/03-enterprise/package.json`
- `unjucks/infrastructure/scripts/blue-green-deploy.sh`
- `unjucks/monitoring/scripts/deploy-observability.sh`
- `unjucks/monitoring/scripts/validate-deployment.sh`
- `unjucks/package.json`
- `unjucks/packages/kgen-cli/package.json`
- `unjucks/packages/kgen-core/package.json`
- `unjucks/packages/kgen-marketplace/package.json`
- `unjucks/packages/kgen-rules/package.json`
- `unjucks/packages/kgen-templates/package.json`
- `unjucks/packages/package.json`
- `unjucks/scripts/act-testing/act-workflow-tester.sh`
- `unjucks/scripts/automated-cleanroom.sh`
- `unjucks/scripts/batch-import-update.sh`
- `unjucks/scripts/benchmarks/clean-room-setup.sh`
- `unjucks/scripts/buildah-setup.sh`
- `unjucks/scripts/cleanroom-test.sh`
- `unjucks/scripts/cleanup-test-artifacts.sh`
- `unjucks/scripts/cleanup-test-bloat.sh`
- `unjucks/scripts/cleanup-test-data-conservative.sh`
- `unjucks/scripts/context-bundle-cli.sh`
- `unjucks/scripts/context-toolkit-cli.sh`
- `unjucks/scripts/deploy-docs.sh`
- `unjucks/scripts/docker/run-docker-tests.sh`
- `unjucks/scripts/docker-performance-optimizer.sh`
- `unjucks/scripts/github-setup.sh`
- `unjucks/scripts/latex-ci-setup.sh`
- `unjucks/scripts/latex-validation.sh`
- `unjucks/scripts/mcp-diagnostics.sh`
- `unjucks/scripts/mcp-health-check.sh`
- `unjucks/scripts/mcp-manager.sh`
- `unjucks/scripts/organize-workflows.sh`
- `unjucks/scripts/performance-ci.sh`
- `unjucks/scripts/prime-development-phase.sh`
- `unjucks/scripts/registry-cleanup.sh`
- `unjucks/scripts/release/rollback.sh`
- `unjucks/scripts/release/validate-release.sh`
- `unjucks/scripts/setup-bloat-prevention.sh`
- `unjucks/scripts/targeted-import-update.sh`
- `unjucks/scripts/test-cleanroom-setup.sh`
- `unjucks/scripts/test-enterprise-containers.sh`
- `unjucks/scripts/test-installation.sh`
- `unjucks/scripts/test-security-workflows.sh`
- `unjucks/scripts/test-workflows.sh`
- `unjucks/scripts/validate-containers.sh`
- `unjucks/scripts/validate-secrets.sh`
- `unjucks/scripts/validate-workflows.sh`
- `unjucks/src/api/package.json`
- `unjucks/src/cli/package.json`
- `unjucks/src/commands/package.json`
- `unjucks/src/package.json`
- `unjucks/src/types/package.json`
- `unjucks/tests/docker-validation/package.json`
- `unjucks/tests/docker-validation/run-validation.sh`
- `unjucks/tests/export-quality/package.json`
- `unjucks/tests/final-validation/package.json`
- `unjucks/tests/final-validation.sh`
- `unjucks/tests/injection-targets/package.json`
- `unjucks/tests/package.json`
- `unjucks/tests/performance/run-all-tests.sh`
- `unjucks/tests/production/host-validation.sh`
- `unjucks/tests/production/production-validation.sh`
- `unjucks/tests/scripts/validate-test-baseline.sh`
- `unjucks/tests/semantic-web-clean-room/package.json`
- `unjucks/tests/workflows/act-test-runner.sh`
- `unjucks/vscode-extension/package.json`

## 3. Extracted Documentation & Context
### Source: `unjucks/BACKUP_FILE_MANAGEMENT_PROPOSAL.md`
```markdown
# Backup File Management Proposal

## Executive Summary

This proposal addresses the critical issue of backup file accumulation in the unjucks repository, which was causing git commits to include 2000+ files. Through systematic analysis and implementation of gitignore patterns, we've reduced the commit size to 1493 files, representing a 25% reduction in repository bloat.

## Problem Statement

### Current Situation
- **Repository Bloat**: Git commits were including 2000+ files due to backup file accumulation
- **Backup File Patterns**: Multiple backup file naming conventions were not properly ignored:
  - `.backup-1757703744269` (timestamp-based)
  - `.backup.1757265299934` (dot-separated timestamp)
  - `.backup` (simple extension)
- **Tracked Backup Files**: 5 backup files were already tracked in git history
- **Performance Impact**: Large commits slow down git operations and increase repository size

### Root Cause Analysis
1. **Incomplete .gitignore Patterns**: Existing patterns didn't cover all backup file naming conventions
2. **Legacy Tracked Files**: Backup files were committed before proper ignore rules were established
3. **Multiple Backup Mechanisms**: Different tools creating backups with varying naming patterns

## Proposed Solution

### 1. Enhanced .gitignore Patterns
**Status**: ✅ IMPLEMENTED

Added comprehensive backup file patterns to `.gitignore`:
```gitignore
# Backup files (865+ files identified - major bloat source)
*.bak
*.bak[0-9]
*.bak[0-9][0-9]
*.backup
*.backup[0-9]
*.backup-[0-9]*          # NEW: Covers timestamp-based backups
*~
.#*
#*#
*.orig
...
```

### Source: `unjucks/BUILD_SYSTEM_TEST_REPORT.md`
```markdown
# Build System Test Report
**Testing Date:** September 12, 2025  
**Tester:** Build System Tester Agent  
**Projects Tested:** unjucks (~/unjucks) vs kgen (~/kgen)

## Executive Summary

✅ **BOTH build systems work but have different architectures and issues**
- unjucks: Simple single package, fast builds, minimal tests
- kgen: Complex workspace with pnpm, ES modules work, extensive tests fail

---

## 1. npm install Test Results

### UNJUCKS (~/unjucks)
✅ **SUCCESS**: `npm install` completed in 953ms
⚠️  **WARNINGS**: 5 vulnerabilities (4 moderate, 1 critical)
- 1,014 packages audited
- Node modules count: ~465 packages

### KGEN (~/kgen)  
❌ **FAIL**: `npm install` failed with unsupported workspace syntax
```
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
```
✅ **SUCCESS**: `pnpm install` worked (requires pnpm)
- 447 packages resolved
- Peer dependency warnings for @vitest/ui version mismatch

---

## 2. npm run build Test Results

### UNJUCKS Build
✅ **SUCCESS**: 0.158 seconds total
```bash
> echo 'KGEN CLI - Build verification complete'
KGEN CLI - Build verification complete
...
```

### Source: `unjucks/CACHE_UPGRADE_SUMMARY.md`
```markdown
# LRU Cache System Upgrade Summary

## Overview
Successfully upgraded all basic in-memory caches across the KGEN system to use a standardized LRU (Least Recently Used) cache implementation with comprehensive statistics tracking and TTL expiration.

## Key Accomplishments

### ✅ Standardized LRU Cache Module Created
- **File**: `/src/kgen/cache/lru-cache.js`
- **Features**: 
  - LRU eviction when cache is full
  - TTL expiration support
  - Comprehensive hit/miss statistics
  - Memory usage tracking
  - Event-driven architecture
  - Export/import functionality
  - Cleanup and destroy methods

### ✅ Specialized Cache Types
Created specialized cache implementations extending the base LRU cache:

1. **SPARQLQueryCache**: For SPARQL query result caching
   - Crypto-based cache key generation
   - Query metadata storage
   - Optimized for complex query results

2. **TemplateCache**: For template content caching
   - Context-aware cache keys
   - File modification time validation
   - Template-specific metadata

### ✅ Core System Upgrades

#### SPARQL Query Service (`/src/kgen/provenance/queries/sparql.js`)
- **Before**: Basic `Map()` with simple LRU eviction
- **After**: Full `SPARQLQueryCache` with statistics and TTL
- **Benefits**: 
  - 75% hit rate in testing
  - Automatic eviction of stale queries
  - Detailed cache performance metrics
...
```

*(Plus 1001 other markdown files)*
