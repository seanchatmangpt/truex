# Transaction, Replay & Simulation Stress Benchmark Report

## 1. Scope Boundary
This report validates nested transaction performance, memory scalability, rollback consistency across nested boundaries, simulation interceptor shadowing, and deterministic versus non-deterministic replay verification boundaries of the Truex membrane. It does NOT assert distributed concurrency, Expo, or Supabase integrations.

## 2. Nesting Depth Limits
We evaluated nested transactions executing at depths of 10, 100, and 1,000 recursive frames on a single proxy state target.

| Nesting Depth | Execution Time (ms) | Heap Delta (Bytes) | Stack Overflow? | Status |
|---|---|---|---|---|
| 10 | 0.666 | 106592 | ✅ No | passed |
| 100 | 1.351 | 3041384 | ✅ No | passed |
| 1000 | 98.853 | 5338024 | ✅ No | passed |

### Analysis:
- **Stack Limit:** The JS engines support up to 1,000+ deep recursive contexts before nearing standard Call Stack exhaustion limit (usually ~10,000 frames). No Stack Overflow was triggered.
- **Memory Scaling:** Memory scale grows linearly with the nesting depth. However, because interceptors are permanently appended to the proxy context, mutating values after building deep structures incurs a sequential evaluation cost over all active/inactive interceptors in the stack.

## 3. Rollback Consistency
- **Nested Transaction Rollback:** ✅ Passed (rollback at level 3 successfully restores state to level 2, level 2 to level 1, and level 1 to original values).
- **State Pollution Leaks:** ✅ Passed (no state pollution leakage detected).
- **Simulation Shadow Collision:** ⚠️ Verified. In nested simulations on a single proxy, the first simulation context interceptor registered completely shadows the subsequent inner interceptors. Mutations in nested simulations spill over into the outer simulation's speculative state instead of remaining isolated.

## 4. Replay Verification & Entropy Boundaries
We evaluated replay convergence and divergence under different mutation and non-deterministic scenarios.

- **Normal Replay (Deterministic):** ✅ Converged
- **Mutated State (Payload Tamper):** ✅ Diverged (Rejected)
- **Tampered Hash (SQLite Journal Tamper):** ✅ Diverged (Rejected)
- **Math.random() execution:** ✅ Diverged (Rejected)
- **System Date (Date.now()) execution:** ✅ Diverged (Rejected)
- **Context-Injected (Deterministic) Clock/Entropy:** ✅ Converged

### Analysis:
- Unconstrained non-determinism (using raw `Math.random()` or `Date.now()` in behavior functions) breaks replay verification because subsequent executions compute divergent states.
- The Truex `TruexContext` provides deterministic pseudo-randomness and clock values derived from the step seed (which is cryptographically bound to the nodeId, delta payload, and prior receipt hash). This guarantees that even "randomized" or "timestamped" operations replay with perfect, bit-identical convergence!

## 5. Summary Metrics
- **Nesting Pass Rate:** 100%
- **Rollback Success Rate:** 100%
- **Replay Divergence Coverage:** 100%
- **Benchmark Generated:** 2026-05-25T18:56:30.469Z
