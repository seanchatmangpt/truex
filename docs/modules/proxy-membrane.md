# Module: Consequence Membrane (Proxy)

> **Path:** `src/proxy/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Proxy module (`createProxy`) is the foundational boundary layer of the Truex substrate. It does not merely wrap objects; it constructs the **Consequence Membrane**. All interaction between raw state (the substrate) and the external environment (algorithms, modules, agents) must pass through this membrane. It provides the interception traps that allow the Invariants, ACL, Transactions, and Simulation modules to enforce their respective boundary laws before operational deltas are applied.

## 2. Accounting Domains

* **Trap Exhaustion:** The membrane supports the full suite of JavaScript metaprogramming traps (`get`, `set`, `has`, `deleteProperty`, `ownKeys`, `apply`, `construct`, `defineProperty`, `setPrototypeOf`, `getPrototypeOf`, `isExtensible`, `preventExtensions`). This ensures that no mutation pathway bypasses the accounting layer.

## 3. Key Invariants

* **MEMB-1 (Deep Wrapping):** Operations that return nested objects or functions through the membrane are automatically wrapped in recursive child membranes (`wrapValue`), ensuring that nested state remains protected by the same consequence laws.
* **MEMB-2 (Global Prototype Protection):** The membrane actively refuses any attempt to mutate raw global prototypes (`Object.prototype`, `Array.prototype`, etc.), protecting the runtime against prototype-pollution attacks.
* **MEMB-3 (Jidoka Halt):** If a fatal violation occurs (e.g., a prototype breakout via `__proto__` or a severe invariant breach), the membrane triggers the `[JIDOKA FATAL ERROR]` halt, initiating emergency rollbacks on all active transactions before terminally refusing execution.

## 4. Verbs / Commands

* `createProxy(target, parentContext)`: Initializes the boundary membrane around a raw substrate, generating the interceptor arrays.
* `define*Interceptor(fn)`: A family of functions (e.g., `defineGetInterceptor`, `defineSetInterceptor`) that hook into the specific operation traps.
* `isRawGlobalPrototype(proto)`: Evaluates if a given object is an unprotected global prototype.

## 5. Refusal Conditions

The Proxy Membrane explicitly refuses operations if:
* A mutation is attempted on a raw global prototype (`Mutation of raw global prototype is refused`).
* A prototype breakout is attempted via `__proto__` property write (`Prototype mutation/breakout attempted`).
* A boolean interceptor (like `set` or `deleteProperty`) evaluates to `false` via the downstream modules.

## 6. Proof Command

To prove the membrane wrapping, trap execution, and prototype protection:

```bash
npx vitest run packages/truex-core/test/membrane.test.ts
```