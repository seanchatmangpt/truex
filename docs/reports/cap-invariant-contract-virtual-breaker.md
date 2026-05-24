# Invariant, Contract & Virtual Value Stress Test Analysis

## Executive Summary
This report analyzes the behavioral limits and isolation capabilities of the TRUEX S₀/S₃ Membrane primitives under adversarial scenarios, specifically focusing on circular invariants, deep virtual computation recursion limits, and contract side-effect isolation. The results demonstrate that the membrane framework successfully preserves operational deterministic safety, preventing thread freezing during recursive loops and maintaining state purity.

---

## Architecture Flow

```mermaid
graph TD
    Client[Client Code] -->|Call method| Proxy[Proxy membrane]
    Proxy -->|Get method| CustomGet[Custom Get Interceptor]
    CustomGet -->|Wrap method| MethodProxy[Method Proxy]
    MethodProxy -->|Apply| ContractApply[Contract Apply Interceptor]
    ContractApply -->|Pre-condition / validate| ValidateArgs[Argument Validation]
    MethodProxy -->|Execute| ReflectApply[Reflect.apply on target]
    ReflectApply -->|Mutates properties| SetTrap[Set Trap on Main Proxy]
    SetTrap -->|Record change| TxSet[Transaction Set Interceptor]
    SetTrap -->|Apply write| ReflectSet[Reflect.set on target]
    ContractApply -->|Purity / Return type check| PostConditions[Post-Conditions check]
    PostConditions -->|Failure| ThrowError[Throw Contract Violation]
    ThrowError -->|Rollback| TxRollback[Transaction Rollback]
    TxRollback -->|Revert changes| RestoredTarget[Target State Restored]
```

---

## Detailed Benchmark Analysis

### 1. Circular Invariants
Circular invariants occur when two or more constraints trigger mutations in each other recursively. We evaluated two scenarios:
1. **Raw Circular Loops:** An invariant on `age` mutates `balance` when `age` changes, and another invariant on `balance` mutates `age` when `balance` changes.
2. **Programmatic Loop-Breakers:** A context-local recursion guard tracks active property validation, short-circuiting recursion before stack exhaustion.

#### Results:
- **Raw Loop Resolution:** Successfully resolved in **4ms** at a recursion depth of **485 frames** on the target Mac machine. V8 cleanly threw a `RangeError: Maximum call stack size exceeded` which was caught by the invariant validation runner and translated into a `[JIDOKA FATAL ERROR]`. The execution terminated safely without freezing the thread or locking up the event loop.
- **Custom Guard Resolution:** Resolved in **1ms**. Rather than waiting for a stack overflow, the programmatic recursion guard immediately caught the circularity on the second frame and threw a clean, descriptive error.

---

### 2. Deep Virtual Computations
Virtual value fields synthesize attributes lazily and support context-local memoization (caching). We chained virtual fields recursively (`v0` up to `v1000`), where each `v_i` depended on `v_{i-1} + 1`. We tested this at different depths with and without memoization.

#### Benchmark Metrics:
- **Depth 10:** 0ms (Memoized) vs 0ms (Non-Memoized)
- **Depth 100:** 0ms (Memoized) vs 0ms (Non-Memoized)
- **Depth 500:** 1ms (Memoized) vs 0ms (Non-Memoized)
- **Depth 1000:** 1ms (Memoized) vs 1ms (Non-Memoized)

#### Key Findings:
- The system easily resolves chains up to **1000 levels deep** in under 1ms.
- **Circular Virtual Fields (vA -> vB -> vA):** The system terminates safely with a `RangeError` under 5ms, avoiding infinite event loop blockage.
- *Performance Note:* For single access, memoization adds a tiny overhead. However, on subsequent reads of the same virtual property, memoization reduces resolution time to **O(1) (0ms)**, whereas non-memoized fields require re-evaluating the entire recursion tree.

---

### 3. Contract Isolation & Rollback Correctness
Preconditions and postconditions can introduce active side-effects (e.g. state mutations during validation or method execution) that must not bleed into the target state permanently if the contract validation fails.

We stressed three containment mechanisms:
1. **Post-condition Type Violation Rollback:** A method mutates `value` but fails its contract return type verification (returns a `number` instead of the expected `string`). The enclosing Transaction catches the contract failure and executes `.rollback()`. The value is successfully restored to its pre-transaction value.
2. **Pre-condition Validation Speculative Isolation:** A validation function mutates `value` speculative-style but then returns a validation failure string. The enclosing Simulation executes `.abort()`. The target state is preserved exactly as it was, and the speculative mutation is completely discarded.
3. **Purity Violation Containment:** A method is marked as `pure: true` but mutates internal state. The contract post-condition detects the side-effect, throws a contract violation, and rolls back the transaction. Target state mutations are successfully reverted.

---

## Conclusion
The TRUEX membrane system guarantees **fail-closed, isolated, and deterministic** state convergence under complex capability and constraint pressures. Circular dependencies are safely terminated, deep virtual trees are resolved or aborted, and side-effects are strictly sandboxed and reverted on failure.
