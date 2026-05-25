# Package: @truex/membrane

> **Path:** `packages/membrane/`
> **Gall Classification:** Tier 2 - Consequence Membrane

## 1. Product Thesis

The Membrane package (formerly `proxyable`) is the **JavaScript Execution Boundary**. It intercepts all application-level operational attempts using standard JS Proxies and converts them into formal `HookedConsequenceAttempt` objects. It is the primary interface for VKG Hooks, Invariants, and ACLs, ensuring that no raw substrate mutation occurs without first passing through the full Truex admission pipeline.

## 2. Key Invariants

* **MEM-1 (Trap Exhaustion):** All 13 JavaScript proxy traps must be implemented to prevent bypass attacks.
* **MEM-2 (Deep Wrapping):** Any object returned by the membrane must be automatically wrapped in a child membrane.

## 3. Verbs / Commands

* `createProxy(target)`: Initializes the consequence membrane around a raw object.
* `membrane.call(fn)`: Executes logic within a specific bounded context (ACL, Transaction, etc.).

## 4. Refusal Conditions

The Membrane refuses an operation if:
* An Invariant evaluates to `false`.
* The current context lacks the required Capability (ACL Refusal).
* A prototype breakout attempt (`__proto__`) is detected.

## 5. Proof Command

```bash
pnpm --filter @truex/membrane test
```