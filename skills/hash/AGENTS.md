# Operational Law: Hash Primitive ($S_{-1}$)

## Root Axioms

- `same input = same hash`
- `different input = different hash`
- Stable, canonical serialization of JSON keys alphabetically.
- Mutation on input must alter the hash outcome (tamper resistance).

## Ontology Boundaries

- **State (Field8)**: A raw JS value / object structure.
- **Event**: A request to obtain a unique fingerprint of a state.
- **Consequence**: A 64-character hexadecimal BLAKE3 digest proving canonical representation.
