# Module: Capability ACL

> **Path:** `src/security/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Capability ACL module establishes **possession-based security** within the Truex consequence membrane. It enforces the rule that *having the context equates to having the authority*. Instead of relying on global identity checks or downstream business logic, the ACL boundary ensures that no unauthorized operational attempt (`read`, `write`, `delete`, `apply`, `construct`) can even interact with the target substrate.

Capabilities are strictly **fail-closed**: operations are terminally refused unless explicitly granted by the active context.

## 2. Key Invariants

* **ACL-1 (Fail-Closed Context):** All operations on the protected membrane are terminally refused by default. A specific permission (`canRead`, `canWrite`, etc.) must be explicitly granted.
* **ACL-2 (Possession Boundary):** Authority is scoped to the execution context (`call()` closure). There is no global state leakage; when the closure yields, the authority evaporates.
* **ACL-3 (Prototype Containment):** Access to raw global prototypes (via `Reflect.getPrototypeOf`) is strictly refused when a capability context is active, preventing sandbox escape or ACL bypass.

## 3. Verbs / Commands

* `createCapabilityContext(target, capabilities)`: Defines the capability envelope, explicitly mapping what the context is allowed to do (`canRead`, `canWrite`, `canDelete`, `canConstruct`, `canApply`).
* `registerCapabilityInterceptors(proxyInterface, context)`: Binds the capability boundary to the specific membrane.
* `call(fn)`: Executes the enclosed block with the bound authority. Operations outside this block using the same membrane will be refused.

## 4. Refusal Conditions

The Capability Context will explicitly refuse an operation if:
* The active context does not grant `canRead` for a requested property (`Access denied: No read capability`).
* The active context does not grant `canWrite` for a mutating attempt (`return false`).
* The active context does not grant `canDelete` for a `deleteProperty` attempt (`return false`).
* A function execution is attempted without `canApply`.
* An object instantiation is attempted without `canConstruct`.
* The operation attempts to access the raw global prototype (`TypeError: Access to raw global prototype is refused`).
* An operation is attempted on the membrane while no capability context is active at all.

## 5. Proof Command

To prove the capability boundary laws hold against access attempts and sandbox bypasses:

```bash
npx vitest run test/security/
```