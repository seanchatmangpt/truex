# Operational Law: JS Proxy Membrane Primitive ($S_3$)

## Root Axioms

- `Memory wrapped in membrane must be isolated and intercepted.`
- Shallow bypasses (such as nested objects, descriptors, or property definitions) are strict violations.
- Prototype pollution or prototype modification assignment is forbidden.
- Transaction changes must be tracked in a journal and revertible on execution failure.
- Multi-agent asynchronous context isolation must use native async tracking (`AsyncLocalStorage`).
- Telemetry trace generation must be completely deterministic (context-injected clocks).

## Ontology Boundaries

- **State (Field8)**: Isolated JS objects wrapped by proxies.
- **Event**: Property read, write, descriptor, definition, transaction, or enumeration events.
- **Consequence**: Secure containment, capability ACL check, simulation rollback, or receipted OCEL event logs.
