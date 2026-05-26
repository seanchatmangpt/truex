# Experimental Project Report: kgn

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/kgn`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `kgn/examples/workshop/package.json`
- `kgn/package.json`
- `kgn/packages/gitvan-cli/package.json`
- `kgn/packages/gitvan-cookbook/package.json`
- `kgn/packages/gitvan-core/package.json`
- `kgn/packages/gitvan-daemon/package.json`
- `kgn/packages/gitvan-llm/package.json`
- `kgn/packages/gitvan-schemas/package.json`
- `kgn/packages/kgen-adapters/package.json`
- `kgn/packages/kgen-cli/package.json`
- `kgn/packages/kgen-core/package.json`
- `kgn/packages/kgen-rules/package.json`
- `kgn/packages/kgen-schemas/package.json`
- `kgn/packages/kgen-templates/package.json`
- `kgn/packages/test-utils/package.json`
- `kgn/scripts/fix-critical-adapter-issues.sh`
- `kgn/scripts/production-validation.sh`
- `kgn/scripts/run-cli-cucumber-tests.sh`
- `kgn/scripts/validate-enterprise.sh`
- `kgn/tests/features/package.json`
- `kgn/tests/frontmatter-cli-test.sh`
- `kgn/vendors/citty/package.json`
- `kgn/verify-semantic-web.sh`

## 3. Extracted Documentation & Context
### Source: `kgn/BDD_INTEGRATION_SUMMARY.md`
```markdown
# KGEN BDD Integration - Implementation Summary

## ✅ Task Completed Successfully

Created executable step definitions for core KGEN CLI commands connecting to the actual CLI at `/Users/sac/unjucks/bin/kgen.mjs`.

## 📋 Implementation Overview

### 1. Real CLI Integration
- **Connected to actual KGEN CLI**: `/Users/sac/unjucks/bin/kgen.mjs`
- **Eliminated mocks**: All step definitions now execute real KGEN commands
- **JSON output parsing**: Handle KGEN trace messages and extract JSON results
- **Error handling**: Robust error handling for CLI failures

### 2. Core CLI Commands Implemented

#### ✅ `kgn graph hash` - RDF Graph Hashing
```typescript
When('I run KGEN variable extraction', async function(this: KgenWorld) {
  const command = `node "${KGEN_CLI_PATH}" graph index "${rdfGraph}"`;
  await this.executeCommand(command, { cwd: workingDir });
  // Parse and extract RDF properties as template variables
});
```

#### ✅ `kgn artifact generate` - Deterministic Generation
```typescript
When('I run KGEN generation', async function(this: KgenWorld) {
  const command = `node "${KGEN_CLI_PATH}" artifact generate --graph "${rdfGraph}" --template "${templateName}"`;
  await this.executeCommand(command, { cwd: workingDir });
});
```

#### ✅ `kgn validate graph` - RDF/SHACL Validation
```typescript
When('I run KGEN validation', async function(this: KgenWorld) {
  const command = `node "${KGEN_CLI_PATH}" validate graph "${rdfGraph}"`;
  await this.executeCommand(command, { cwd: workingDir });
});
```
...
```

### Source: `kgn/CHANGELOG.md`
```markdown
## v1.0.0
- Initial release

...
```

### Source: `kgn/CLAUDE.md`
```markdown
# KGN Development Canon v2.0
**Authored By:** Cybernetic Hyper-Intelligence Swarm (Lead)
**Ratified By:** Artificial Hyper-Intelligence Swarm (Executor)

**NOTE:** Project renamed from KGEN to KGN (Knowledge Graph eNhanced code generation). The @kgen/ namespace is retained for package compatibility.

This document operationalizes the development of the KGN monorepo for an autonomous development swarm. It translates the principles of the DfLSS Project Charter into enforceable engineering controls and acceptance criteria.

**CORE PRINCIPLE:** NO HARDCODING, NO PLACEHOLDERS, NO MOCKS, NO LIES. ONLY EXTERNALLY VERIFIABLE FACTS AND TEST RESULTS.

---

## 🚨 THE TRUTH PROTOCOL: VERIFY, DON'T CLAIM

### The Problem
Agents may report "mission complete" when generated artifacts are non-functional or non-compliant. Trust is damaged by unverified claims.

### The Golden Rules
1. **File Created ≠ File Works** - Creating a file doesn't mean it functions
2. **Agent Reports ≠ Reality** - Agents report task completion, not functional validation
3. **"Fixed" ≠ Working** - Editing a file doesn't mean the problem is solved
4. **Always Show Evidence** - Include actual command output in responses

### MANDATORY VERIFICATION

**Before claiming a GitHub Action works:**
```bash
# MUST run this for EVERY workflow to prove syntactic validity
act --list -W .github/workflows/<workflow>.yml
# An "Error:" means it is BROKEN
```

**Before claiming tests pass:**
```bash
# MUST run BDD tests to verify behavior-driven requirements
npm run test:cucumber
# Check ACTUAL Gherkin scenario pass/fail count

# MUST also run unit tests for implementation details
npm test
...
```

*(Plus 267 other markdown files)*
