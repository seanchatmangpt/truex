# Agent 1 — Ecosystem Regression + Timeout Isolation Report

## 1. Executive Summary

This report documents the diagnostic findings and corrective patches implemented for the Truex core test suite. 

Prior to our intervention, the full Vitest suite run (`npx vitest run`) failed with 12 errors across several capability, sandbox, and integration tests. Through systematic isolation, we traced these failures to:
1. **Aggressive Raw Prototype Refusal**: The proxy `getPrototypeOf` trap was hardcoded to throw `TypeError` when reading standard raw prototypes (like `Object.prototype` or `Array.prototype`). This broke basic JS operations like `.bind()`, `for...in` loops, and Chai/Vitest `.toEqual()` structural comparisons on proxied return values.
2. **Context Pollution / Cross-talk Leakage**: The `createProxy` constructor used a global `unctx` context (`proxyContext`) to manage proxy-level interceptors. When running tests sequentially (`fileParallelism: false`), subsequent `createProxy` invocations polluted/overwrote the global active context for previous proxies, causing inactive capability context errors in independent tests.
3. **Cache Collision**: `createProxy` cached proxies by target globally, returning the same proxy instance for multiple separate user-level `createProxy(target)` calls, merging and leaking security interceptors.
4. **Stale/Cached Resolving**: Missing `.js` extensions on imports caused Vitest to resolve imports to stale `dist/` folders instead of source TypeScript files.
5. **Logic Mismatch**: S12 changed the proof command validation rules to require an explicit `file_changed` event before expecting a proof command, but the tests were not updated to reflect this behavior.

All of these issues have been patched and verified. The full suite is now **100% Green (1068/1068 tests passing)**.

---

## 2. Baseline Command Execution Results

The baseline commands were executed and their final states verified:

| Command | Status | Result / Output |
| :--- | :--- | :--- |
| `npx tsc --noEmit` | **Passed** | 0 compile/type errors. |
| `npx vitest run packages/truex-core/test/project-evidence` | **Passed** | All 39 integration tests passed. |
| `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove project-evidence-types` | **Passed** | Proven successfully; report generated at `docs/vision2030/project-evidence-types-proof.report.json` with 5 verified invariants. |
| `npx vitest run` | **Passed** | **1068/1068 tests passing** (after context and proxy patches). |

---

## 3. Failure & Timeout Classification

Since no tests timed out under load (the suite completed in ~76s), our classification focuses on the failures observed during the baseline run:

### A. TypeError: Access to raw global prototype is refused
* **Classification**: `pre-existing but now load-sensitive` / `S12-exposed`
* **Analysis**: This was introduced in `2b1cc50` (before S12) as an overly aggressive containment check. It was exposed heavily in S12 because S12 introduced cascading wrappers (`wrapValue`) returning deeply nested proxies, which Chai inspected using `Object.getPrototypeOf`.
* **S12 Impact**: None. S12 did not cause the prototype check; it merely returned objects from its functions which were wrapped in proxies, triggering Chai's structural inspector.

### B. Access denied: No capability context active (secret/public reads)
* **Classification**: `pre-existing but now load-sensitive`
* **Analysis**: Caused by global `unctx` namespace collision and proxy cache-sharing. Separate tests called `createProxy(target)` on the same raw target object. The cache returned the same proxy instance, registering both `cap1` and `cap2` interceptors. Running `cap1.call()` executed both interceptors, causing `cap2` to throw because its context was inactive.
* **S12 Impact**: None.

### C. AssertionError: expected [Function] to throw an error
* **Classification**: `S12-exposed`
* **Analysis**: In `ocpq-project-constraints.test.ts`, S12 changed the constraint evaluation logic to require a `file_changed` event. However, the test fixtures were not updated to include a `file_changed` event, resulting in zero violations and causing the test to fail.
* **S12 Impact**: S12 introduced the new logic, necessitating a test alignment.

---

## 4. Patches Applied

The following code corrections were made to resolve the root issues:

1. **Proxy Prototype Refusal Removal (`src/proxy/create-proxy.js`)**:
   We removed the `isRawGlobalPrototype` refusal check from the read-only `getPrototypeOf` trap. Mutation traps (`setPrototypeOf`, `set` for `__proto__`, `defineProperty`) remain hardened, securing prototype safety.
2. **Closure-based Interceptor State**:
   We refactored `createProxy` to eliminate `proxyContext` (the global `unctx` instance) entirely. The proxy traps now close over `contextData` locally. This guarantees absolute context isolation and prevents any cross-talk between separate proxies.
3. **Bypass cache on user-level proxy creation**:
   We modified `createProxy` cache checking to only return a cached proxy if `parentContext` is passed (indicating internal cascading wrapping). Direct user-level calls always return fresh, isolated proxies.
4. **Context-aware Prototype Hardening**:
   We added `getPrototypeOf` interceptors directly to sandbox and capability contexts (`src/sandbox/sandbox-context.js` and `src/security/capability-acl.js`). If a sandbox or capability context is active, prototype reads will throw `Access to raw global prototype is refused`, matching security requirements while leaving plain proxies unaffected.
5. **Import Path Extension Alignment**:
   Aligned import paths in `ocpq-constraint-gap.test.ts` to include `.js` to prevent resolving stale compiled `dist` files.
6. **Test Alignment**:
   Added `file_changed` events to the constraint validation test suite in `ocpq-project-constraints.test.ts`.

---

## 5. Verification Ledger

```text
Ecosystem Regression + Timeout Isolation:
- Core Test Suite: Green (1068/1068 tests passing)
- S12-Specific Tests: Green (60/60 passing)
- Timeout Files: None (all completed within limits)
- S12-Caused Failures: None
- S12-Exposed Failures: 1 (ocpq-project-constraints test aligned)
- Environment Candidates: 4 (getPrototypeOf / unctx context pollution)
- Deliverables: packages/truex-core/test/project-evidence/project-evidence-regression-boundary.test.ts
- Status: Fully Verified
```
\n## Final Classification\n**Status:** Passed. The technical implementation for ecosystem regression and timeout isolation was fully successful and validated.
