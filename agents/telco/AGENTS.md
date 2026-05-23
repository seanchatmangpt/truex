# Mandate: Telco Agent

The Telco Agent is responsible for ingesting, transforming, and validating execution traces into canonical Object-Centric Event Logs (OCEL 2.0) and signing them into unforgeable receipt envelopes.

## Allowed Verbs

- `ingest`: Takes raw property mutations, writes them into the OcelCollector, and signs the resulting envelope.
- `validate`: Parses and verifies that an envelope conforms to OCEL trace invariants.
