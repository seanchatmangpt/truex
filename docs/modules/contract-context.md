# Module: Call-Level Contracts

> **Path:** `src/contracts/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Contracts module governs the execution boundary (`apply` and `construct`) of the Truex consequence membrane. While Invariants protect data structures, Contracts enforce the protocol, tempo, and sequence of function execution. It prevents unstructured execution by imposing deterministic bounds on input arguments, output types, execution duration (timeouts), invocation frequency (rate limiting), and execution purity (side-effect denial).

## 2. Accounting Domains

* **Temporal Execution Budget:** Enforces a strict execution window (`timeout` in ms) for any synchronous function call. `execution_elapsed_time <= timeout`.
* **Rate Budget:** Conserves the volume of operational attempts over time. `calls <= maxCalls_per_window`.

## 3. Key Invariants

* **CONT-1 (Execution Bounds):** Function arguments must pass structural validation (`validate`, `maxArgs`), and return outputs must conform to expected typings (`returnType`), otherwise the execution is terminally refused.
* **CONT-2 (Purity Isolation):** If an operation is marked as `pure`, the substrate state is hashed before execution and verified afterward. Any detected side-effect triggers an immediate, terminal refusal.
* **CONT-3 (Deterministic Sequencing):** If a `sequence` is defined, the membrane remembers execution history. Any function attempted out of the declared sequence is terminally refused.
* **CONT-4 (Temporal Bounds):** An operation must complete within its specified `timeout`. The module actively measures start and elapsed timestamps, refusing the result if the budget is breached.

## 4. Verbs / Commands

* `createContractContext(target, contracts)`: Defines the behavioral boundaries (purity, sequencing, rate limits) for specific methods on a substrate.
* `registerContractInterceptors(proxyInterface, contractCtx)`: Binds the contract rules to the `apply` and `construct` interception traps.
* `validateCall(methodName, args)`: Evaluates a "dry-run" proposal to see if a call *would* be admitted under the current sequencing and rate laws.
* `call(fn)`: Executes logic within the bounds of the active contract.
* `getSequenceState()` / `getRateLimitStats()`: Queries the deterministic metrics of the active contract engine.

## 5. Refusal Conditions

The Contract Context explicitly refuses execution (throwing an `Error`) if:
* Argument limits or validation rules are violated (`argument validation failed`).
* A required prior method in the protocol sequence has not yet been executed (`requires [method] to be called first`).
* The rate limit window is exhausted (`Rate limit exceeded`).
* A function marked `pure` mutates the underlying substrate.
* The execution duration exceeds the allocated timeout limit (`execution exceeded timeout`).
* The return value violates the expected type signature (`must return [type]`).

## 6. Proof Command

To prove the execution boundaries, sequence tracking, and temporal constraints:

```bash
npx vitest run test/contracts/
```