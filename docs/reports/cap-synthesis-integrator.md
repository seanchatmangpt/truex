# CAPABILITY SYNTHESIS INTEGRATOR REPORT

This report integrates the capability stress tests and validates the domain accounting constraints under the `truex` CLI.

**Integrator Timestamp:** 2026-05-24T05:43:52.210Z
**Report Hash:** 9ba62814c7b6e0ae25bb2337b3cb72557cddab1670fb6a05de7ed95dc72b0596

## 1. Capability Limits & Telemetry Table

| Capability | Axis Tested | Highest Tolerated Limit | Recommended Safe Operating Envelope | Degraded Boundary | Refused Boundary | Failed/Broken Point |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **ACL** | Read/write restrictions, bypass attempts (getPrototypeOf, pollution) | 100,000 operations | Up to 100,000 proxy ops, latency < 35ms, shallow properties | High nesting depths trigger linear slowdown due to chain traversal | Direct unauthorized access throws access violation | `getPrototypeOf` & `Reflect.getPrototypeOf` bypass ACL traps completely |
| **Transactions** | Nesting depth limits, rollback contamination metrics | 1,000 deep nested transactions | Nesting depth <= 100 (latency < 2ms, memory < 3.5MB) | Depth > 100 (execution latency increases linearly, depth 1000 takes ~100ms) | Re-registering existing transaction interceptors | V8 maximum recursion depth (~10,000 frames) causes stack overflow |
| **Replay** | Sample counts, divergence rates, non-determinism breaking points | Deterministic sequences converge 100% | Seeded Mulberry32 PRNG & context-injected clock (`ctx.clock()`) | Clock skew or minor drift in asynchronous task execution | Mutation validation rules triggered on state divergence checks | Unseeded `Math.random()`, raw `Date.now()`, or network-dependent IO |
| **Invariants** | Circular lock detection, validation limits | Custom recursion guards prevent infinite loop | Programmatic recursion guards on cross-field constraints | Custom validation loops taking up to 5-10ms | Validation rules triggered on target range checks | Circular loops without guards crash V8 stack (~483 frames, RangeError) |
| **Sandbox** | Key filters, prototype escape attempts, scope sizes | Basic shallow key reads/writes are isolated | Simple shallow key isolation, standard objects | Memory overhead of Proxy wrapping on access | Key access within restrictedKeys throws block/refusal | Prototype traversal/pollution or nested object reference leakage |
| **Multitenancy** | Tenant scaling limits, memory bleed metrics | 10,000 coexisting tenant contexts | Up to 5,000 tenants, with periodic config purging | Memory retention in Map `tenantConfigs` (retains ~34.69 MB post-GC) | Unauthorized tenant cross-boundary config accesses | Heap exhaustion (OOM) under infinite tenant instantiation |
| **Audit** | Log entry boundaries, memory overhead | 100,000 entries accumulated in memory | Up to 10,000 entries; flush/rotate after 5,000 entries | Heap growth to 68MB (peak 80MB) and RSS of 191MB | Filter rules rejecting unauthorized audit events | `includeStackTrace: true` increases memory by 15x, causing premature OOM |
| **Virtual Values** | Compute recursion depth, circular computation recovery | 1,000 recursive dependency levels | Memoized virtual fields up to 100 levels (0ms resolution) | Non-memoized recursive lookups (O(2^N) or O(N) evaluation time) | Cycle detection catches virtual self-reference | Circular dependency loop (vA -> vB -> vA) without cycle checks |
| **Contracts** | Side-effect isolation, check latency | Pre/postconditions evaluated with 100% isolation | Standard pure and stateful contracts | Method wrapper proxying adds minimal call latency | Contract violations throw error and trigger transaction rollback | Execution context failure or thread freezing |
| **Simulation** | Simulation block nesting limits, concurrent write consistency | Nested simulation shadowing supported | Shallow simulations with standard local state rollback | Nested simulation shadowing causes spillover into outer context | Target range checks or verification rules aborting simulation | V8 Proxy Receiver Leak (passing proxy as receiver to Reflect.set mutates target) |

## 2. Integrated Telemetry Results

### A. ACL & Sandbox Telemetry
- **Measured Operations:** 100,000 ops
- **Measured Latency:** 30.331 ms
- **Measured Throughput:** 3,296,970 ops/sec
- **Peak Heap Memory:** 19.076 MB

### B. Nested Transaction Telemetry
- **Nesting Depth 10:** latency = 0.507 ms, memory delta = 144160 bytes
- **Nesting Depth 100:** latency = 1.084 ms, memory delta = 3038568 bytes
- **Nesting Depth 1000:** latency = 99.606 ms, memory delta = 13838920 bytes

### C. Multi-Tenant Scaling Telemetry
- **Active Spawner Count:** 10,000 tenants
- **Creation Latency P50 / P95 / P99:** 0.000667 ms / 0.001959 ms / 0.003042 ms
- **Operation Latency P50 / P95 / P99:** 0.000792 ms / 0.001083 ms / 0.002208 ms
- **State Bleed Verification:** State bleed detected? **No**
- **Strong Map Heap Post-GC Retention:** 34.64 MB (starting from 12.71 MB)

### E. Audit Log Saturation Telemetry
- **Audit Entries Written:** 100,000 entries
- **Peak Heap Memory (Audit):** 80.84 MB (initial: 34.69 MB, final: 68 MB)
- **Peak RSS Memory (Audit):** 191.39 MB (initial: 121.33 MB, final: 191.39 MB)

---
*Integrated and verified by the Doctor Integrator Agent.*