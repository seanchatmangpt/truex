# Module: Virtual Context

> **Path:** `src/virtualization/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Virtual Context module introduces deterministic, dynamically computed fields to the Truex consequence membrane without polluting the underlying raw substrate. It allows the system to project computed or external data onto an object at runtime. Because computation can lead to infinite loops or unbounded execution, this module strictly bounds lazy evaluation with execution fuel, depth checks, and cyclic-dependency detection.

## 2. Accounting Domains

* **Computation Fuel Budget:** Every read operation on a computed field consumes fuel to guarantee bounded execution duration. `fuel_consumed <= max_fuel`.
* **Stack Depth Limit:** Prevents re-entrancy exhaustion and stack overflow attacks when evaluating nested virtual networks. `eval_depth <= maxDepth`.

## 3. Key Invariants

* **VIRT-1 (No Unintentional Substrate Pollution):** Virtual fields and cached projections are maintained strictly within the boundary context (or an explicitly defined external storage), preserving the exact state of the underlying raw substrate.
* **VIRT-2 (Deterministic Computability):** Lazy evaluations (`compute()`) are tracked. If the computation exceeds the allocated fuel or stack depth, it is terminally refused.
* **VIRT-3 (Circular Dependency Block):** Virtual fields that recursively call each other trigger a deterministic `CircularDependencyError` rather than hanging the event loop.

## 4. Verbs / Commands

* `createVirtualContext(target, virtualSpec, options)`: Creates the virtual boundary, mapping the `virtualFields` definitions, `redirects`, and evaluation bounds (`fuel`, `maxDepth`).
* `registerVirtualInterceptors(proxyInterface, virtualCtx)`: Binds the virtual definitions to the membrane (handles `get`, `set`, `has`, `ownKeys`, `getOwnPropertyDescriptor`, `deleteProperty`).
* `call(fn)`: Executes the workload. The projected virtual properties only exist within this closure.
* `invalidateCache(field)`: Deterministically forces a re-evaluation of a memoized virtual field on the next access.
* `getVirtualValue(field)`: Bypasses memoization to force a direct, immediate computation of the field.

## 5. Refusal Conditions

The Virtual Context engine will refuse computation (via `CircularDependencyError` or `RecursionRefusalError`) if:
* A `compute()` function attempts to read a field that is currently being computed higher in the stack (`Circular virtual dependency detected`).
* The stack depth (`maxDepth`) is breached (`Maximum recursion depth exceeded`).
* The computation fuel budget is exhausted (`Fuel budget exhausted`).

## 6. Proof Command

To prove the virtual context's fuel boundaries and evaluation constraints:

```bash
npx vitest run test/invariants/cap-inv-contract-virtual-breakpoint.test.ts
```