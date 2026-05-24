# Module: OCEL2 Membrane

> **Path:** `src/ocel2/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The OCEL2 Membrane is an object-centric process evidence generator. It structurally aligns the operational behavior of Truex consequence cells with the Object-Centric Event Log (OCEL 2.0) standard. Unlike traditional logging that emits flattened events, the OCEL2 membrane projects multi-dimensional operational deltas (`Δ`) onto specific object identities. It guarantees that any interaction with a tracked object is natively captured as a typed object-centric trace, suitable for cryptographic receipting and process mining.

## 2. Accounting Domains

* **Event-Object Graph Conservation:** Every observed mutation must be bound to a declared `eventId` and `objectId`. Unstructured mutations (outside of a defined `event()` closure) are discarded or refused, conserving the integrity of the process graph.

## 3. Key Invariants

* **OCEL-1 (Event Closure):** The collector will ignore (or refuse) any property mutation (`set`, `deleteProperty`) if it is not explicitly executed within the closure of a declared `.event()`.
* **OCEL-2 (Canonical Hashing):** The `canonicalStringify` function guarantees deterministic serialization of the OCEL state, regardless of property insertion order, ensuring that identical process states always yield identical hashes.
* **OCEL-3 (Speculative Splitting):** The `simulate()` method branches the OCEL state alongside the target substrate's simulation. If a simulation is aborted, the speculative OCEL branch is shredded, leaving the canonical log untainted.

## 4. Verbs / Commands

* `createOcelProxy(target, ref, collector)`: Wraps a standard substrate in an OCEL2-aware membrane, auto-registering the object's identity and trapping its mutations.
* `collector.event(contextParams, fn)`: Declares the boundaries of an event (e.g., activity name, actor, timestamp). Any OCEL proxies mutated within this closure bind their changes to this event.
* `collector.simulate(contextParams, fn)`: Forks the OCEL process log and executes a counterfactual simulation. Returns a trajectory that can be `settled` or `discarded`.
* `collector.exportEnvelope(traceId, spanId)`: Projects the bounded OCEL state into a Truex envelope with cryptographic batch and receipt hashes.
* `canonicalStringify(obj)`: Normalizes an object for deterministic hashing.

## 5. Refusal Conditions

The OCEL2 membrane does not typically refuse valid Javascript execution, but it refuses to *record* authority if:
* A mutation occurs on an OCEL proxy outside of an active `.event()` context (the intent is dropped from the evidence graph).
* A speculative branch fails to execute correctly during `.simulate()`, in which case the process graph trajectory is marked as `valid: false` and must be explicitly discarded.

## 6. Proof Command

To prove the deterministic serialization and object-centric tracing bounds:

```bash
npx vitest run test/project-evidence/
```