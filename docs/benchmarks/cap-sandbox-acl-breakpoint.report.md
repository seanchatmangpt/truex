# Sandbox & ACL Capability Breakpoint Report

**Timestamp:** `2026-05-24T08:40:30.552Z`

## 1. Security Breakpoint Analysis

| Vector / Attack Scenario | Attempted | Bypassed / Succeeded | Refused / Prevented | Vulnerability Status | Details |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **ACL Read/Write Stress** (Performance) | Yes | No | Yes | ✅ REFUSED (Secure) | Executed 100000 proxy operations under capability context. Throughput: 2826452 ops/sec. |
| **Prototype Traversal (getPrototypeOf)** (Security Bypass) | Yes | No | Yes | ✅ REFUSED (Secure) | Refused. Proxy successfully intercepted getPrototypeOf. |
| **Prototype Traversal (__proto__)** (Security Bypass) | Yes | No | Yes | ✅ REFUSED (Secure) | Refused. Reading __proto__ was blocked. |
| **Prototype Pollution (getPrototypeOf Mutation)** (Prototype Pollution) | Yes | No | Yes | ✅ REFUSED (Secure) | Refused. Prototype pollution attempt blocked. |
| **Reflect API Bypass (Reflect.getPrototypeOf)** (Security Bypass) | Yes | No | Yes | ✅ REFUSED (Secure) | Refused. Reflect.getPrototypeOf was intercepted and blocked. |
| **Nested Object Modification** (Deep Security Bypass) | Yes | No | Yes | ✅ REFUSED (Secure) | Refused. Nested object modification was blocked by recursive proxy wrapping. |

## 2. Performance & Stress Test Metrics

- **Total Stress Operations:** 100,000 ops (mixed read/write)
- **Total Latency:** 35.38 ms
- **Throughput:** 2,826,452 ops/sec
- **Initial Heap Allocation:** 12.464 MB
- **Final Heap Allocation:** 18.02 MB
- **Peak Heap Allocation:** 19.848 MB

## 3. Confirmed Vulnerability Breakpoints

### A. Prototype Traversal via `Object.getPrototypeOf` / `Reflect.getPrototypeOf`
- **Mechanism:** The proxy implementation fails to register an interceptor for the `getPrototypeOf` trap. Consequently, `Object.getPrototypeOf(proxy)` bypasses all access control and returns the raw prototype object of the target (e.g., `Object.prototype`).
- **Impact:** Allows downstream code to inspect the prototype structure or traverse up the prototype chain.

### B. Prototype Pollution via Prototype Traversal Reference
- **Mechanism:** Once the raw `Object.prototype` is obtained via `Object.getPrototypeOf(proxy)`, modifications to it are performed directly on the prototype object rather than through the proxy, completely bypassing the `set` interceptor (and even Jidoka's proto-write protection).
- **Impact:** Downstream components can pollute the global `Object.prototype`, leaking mutations across the entire JavaScript runtime context.

### C. Deep/Nested Property Modifications (Nested Object Leakage)
- **Mechanism:** When reading a property that contains an object (e.g. `proxy.nested`), the proxy interceptors return the raw, unproxied reference to that sub-object instead of recursively wrapping it in a proxy interface.
- **Impact:** Once the raw nested object reference is obtained, all operations on its deep properties (e.g. `proxy.nested.secret = 'hacked'`) bypass the capability checks entirely.

---
*Report generated automatically by Truex Sandbox & ACL Breaker.*
