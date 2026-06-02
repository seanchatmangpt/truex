# Experimental Project Report: unjucks

> **Status:** Passed Global Audit & Re-mapped
> **Path:** `/Users/sac/unjucks`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build
  - *Details:* The test suite fails during CLI and execution testing due to a module compatibility issue: Node.js throws a `SyntaxError: Named export 'glob' not found. The requested module 'glob' is a CommonJS module, which may not support all module.exports as named exports.` in `dist/cli-entry.mjs` and several source files. In addition, workspace-level build orchestration fails because the root `npm install` doesn't fully resolve `workspace:*` protocols when using npm directly, and local `pnpm install` fails on Node v20 due to `pnpm`'s dependency on the `node:sqlite` built-in module.

## 2. Executable Entry Points
- `unjucks/package.json`
- `unjucks/packages/kgen-cli/package.json`
- `unjucks/packages/kgen-core/package.json`
- `unjucks/packages/kgen-marketplace/package.json`
- `unjucks/packages/kgen-rules/package.json`
- `unjucks/packages/kgen-templates/package.json`
- `unjucks/scripts/automated-cleanroom.sh`
- `unjucks/scripts/cleanroom-test.sh`
- `unjucks/scripts/mcp-manager.sh`
- `unjucks/tests/final-validation.sh`

## 3. Extracted Documentation & Context

### Source: `unjucks/KGEN-PRD.md`
```markdown
kgen is a deterministic, stateless command-line utility designed to function as a core compiler within an autonomous development swarm. Its primary function is to translate abstract knowledge models, represented as RDF graphs, into concrete, file-based artifacts such as source code, configuration, and documentation.

The system's core philosophy is Knowledge as Source. The knowledge graph is the single, canonical source of truth for a system's architecture and policies. All file artifacts are considered ephemeral, reproducible build products derived from that graph. This approach eliminates state drift, enables perfect auditability, and allows for high-speed, predictable system evolution driven by changes to the knowledge model.
```

### Source: `unjucks/DETERMINISTIC-VALIDATION-SUMMARY.md`
```markdown
# DETERMINISTIC RENDERING VALIDATION SUMMARY
The deterministic renderer hardening mission has achieved 100% success with comprehensive validation demonstrating guaranteed byte-identical outputs.

## HASH ANALYSIS:
   Unique content hashes: 1
   Unique contents: 1
   Unique context hashes: 1
   IDENTICAL: All renders produced same hash
   Content Hash: 043cc36cd88de332fb547fad4bb529110bf637202e1a431986248c86852bb9aa
   Hash Integrity: VERIFIED

## TECHNICAL ACHIEVEMENTS
1. Non-Deterministic Pattern Elimination: 254+ instances of Date.now(), Math.random(), and timestamps removed.
2. Hardened Deterministic Engine: All renders use static build time (2024-01-01T00:00:00.000Z) and deterministic seeds.
3. Comprehensive Filter System: Built-in Nunjucks filters for `hash`, `uuid`, `random`, `normalizePath`, `sortKeys`, and `canonical` json format.
4. Cross-Platform Compatibility: Line endings normalized to Unix style (\n) and cross-platform paths handled.
```

### Source: `unjucks/SHACL-VALIDATION-SUMMARY.md`
```markdown
# KGEN SHACL Validation System - Implementation Summary
Replaced mixed validation approaches with a comprehensive SHACL-only validation system using `shacl-engine` and `rdf-ext`.

## Core Components Delivered:
1. SHACL Validation Engine: Pure SHACL validation using shacl-engine, rdf-ext, and clownface. Target ≤20ms for typical graphs.
2. SHACL Gates: Build-blocking validation gates (pre-build, artifact-generation, post-build, release).
3. Performance Optimizer: Caching system for validation results/shapes, parallel validation, and incremental validation.
4. CLI Integration: Command-line interface for SHACL validation.
```

## 4. Architectural Lessons & Doctrine
- **Knowledge as Source:** All concrete artifacts are downstream, reproducible projections of the RDF knowledge graph (Turtle `.ttl`). The graph serves as the source of truth, eliminating state drift.
- **Hardened Determinism:** General-purpose code generation is stochastic by default (due to random numbers, temporal stamps, path separators, and environment variables). Eliminating this entropy and compiling artifacts deterministically allows the swarm to run O(1) hash comparisons rather than computationally expensive validations.
- **Autonomic Semantic Gates:** SHACL constraint shapes are integrated directly as CI/CD gates. This shifts conformance verification from a post-generation testing step into a compile-time gate.

## 5. Vision 2030 Vector Mapping
This project serves as a crucial bridge between two vectors:

### Vector 5 (Manufacturing Engine) - Primary
The Knowledge Graph Engine (`kgen`) acts as the compiler core of the autonomous development swarm. By translating abstract Turtle models into code and config schemas (`Spec → Ontology → CONSTRUCT → Template → Code`), it builds the deterministic assembly line of software. Instead of hand-building workflows, the engine manufactures them dynamically.

### Vector 3 (Projection Surfaces) - Secondary
Unjucks serves as a document and asset renderer. It translates the single semantic data model (e.g. `person.ttl`) into human-consumable outputs (such as ATS-compliant LaTeX resumes, PDFs, spreadsheets, and UI templates), serving as a flexible projection surface.
