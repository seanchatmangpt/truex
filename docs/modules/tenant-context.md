# Module: Tenant Context (Multitenancy)

> **Path:** `src/multitenancy/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Tenant Context module allows multiple isolated actors (tenants) to interact with the same underlying Truex substrate without cloning objects or risking data leakage. It manufactures **pure behavioral views**. Each tenant operates within a tailored consequence membrane that enforces strict visibility limits, applies automatic data transformations, and projects tenant-specific virtual properties onto a single shared target.

## 2. Key Invariants

* **TENANT-1 (Fail-Closed Visibility):** A tenant cannot read, mutate, enumerate, or detect the existence of any property outside of their explicitly granted `visibleKeys` boundary. Attempting to do so yields an explicit refusal or acts as if the property does not exist.
* **TENANT-2 (No Substrate Cloning):** Tenant membranes do not duplicate the underlying substrate. Data remains singular and synchronized across all valid viewers, conserving system memory.
* **TENANT-3 (Safe Disposal):** Tenant contexts are explicitly disposable. Calling `dispose()` severs all strong references, removes the tenant from the WeakMap registry, and terminally refuses any further attempts to interact via that tenant's membrane.
* **TENANT-4 (Virtual Field Isolation):** A tenant cannot mutate virtual fields projected onto their view (`Cannot set virtual property`).

## 3. Verbs / Commands

* `createTenantContext(target, tenantId, config)`: Creates an isolated membrane for a specific tenant, defining their `visibleKeys`, `virtualProperties`, and I/O transforms.
* `createMultipleTenants(target, tenantsConfig)`: A utility to efficiently map a single substrate to multiple isolated tenant views.
* `call(fn)`: Executes logic within the specific tenant's context, ensuring that nested operations inherit the tenant's bounded view.
* `updateConfig(newConfig)`: Mutates the tenant's active boundary (e.g., expanding or restricting visibility).
* `dispose()`: Deterministically shreds the tenant membrane.

## 4. Refusal Conditions

The Tenant Context engine will explicitly refuse an operation if:
* A tenant attempts to access or modify a property not granted in their `visibleKeys` (`Property not visible to tenant`).
* A tenant attempts to write to a dynamically computed virtual property (`Cannot set virtual property`).
* Any operation is attempted on a membrane after `dispose()` has been called (`Tenant context has been disposed`).

## 5. Proof Command

To prove the isolation, behavioral projection, and memory safety of the multi-tenant views:

```bash
npx vitest run test/multitenancy/
```