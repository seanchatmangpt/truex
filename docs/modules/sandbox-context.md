# Module: Sandboxing & Structural Containment

> **Path:** `src/sandbox/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Sandbox module establishes the **containment boundary** for the Truex consequence membrane. While the ACL protects data access, the Sandbox prevents structural discovery and meta-programming breakouts. It actively denies an external agent from reflecting the shape of the substrate, traversing its prototype chain, or dynamically modifying its descriptor behaviors. It creates an opaque execution envelope where the substrate's internal architecture is invisible.

## 2. Accounting Domains

* **Operational Trap Surface:** Operates strictly across the meta-programming axes (`ownKeys`, `getOwnPropertyDescriptor`, `defineProperty`, `setPrototypeOf`, `getPrototypeOf`, `isExtensible`, `preventExtensions`).

## 3. Key Invariants

* **SAND-1 (Opaque Structure):** Unless `allowEnumeration` is explicitly granted, calls to `Object.keys()` or `Reflect.ownKeys()` will return an empty array, denying structural discovery.
* **SAND-2 (Descriptor Masking):** Unless `allowDescriptors` is granted, `Reflect.getOwnPropertyDescriptor()` will return `undefined`, hiding the `configurable`, `enumerable`, and `writable` traits of the substrate.
* **SAND-3 (Prototype Lockdown):** Any attempt to dynamically alter the prototype chain (`setPrototypeOf`) or freeze the object (`preventExtensions`) while the sandbox is active is terminally refused.
* **SAND-4 (Restricted Keys):** Certain explicit keys (`restrictedKeys`) can be completely masked from all traps, appearing as if they do not exist.

## 4. Verbs / Commands

* `createSandboxContext(target, policy)`: Generates the sandbox boundary around a substrate, configuring the structural denial policy (`allowEnumeration`, `allowDescriptors`, `allowConstruction`, `restrictedKeys`).
* `registerSandboxInterceptors(proxyInterface, sandboxCtx)`: Hooks the structural containment rules into the membrane.
* `call(fn)`: Executes logic within the opaque sandbox environment.
* `updatePolicy(newPolicy)`: Dynamically mutates the allowed traversal boundaries during active execution.

## 5. Refusal Conditions

The Sandbox engine explicitly refuses operations (throwing `Error` or `TypeError`) if:
* An instantiation is attempted (`construct`) and `allowConstruction` is false (`Sandbox violation: Object construction is not allowed`).
* A function execution is attempted (`apply`) and `allowApply` is false (`Sandbox violation: Function application is not allowed`).
* A structural modification trap (`defineProperty`, `setPrototypeOf`, `preventExtensions`) is triggered while the sandbox is active (`Sandbox violation: Object structure modification is not allowed`).
* An explicit operation defined in `restrictedOperations` is invoked.

## 6. Proof Command

To prove the containment boundaries and structural masking:

```bash
npx vitest run test/sandbox/
```