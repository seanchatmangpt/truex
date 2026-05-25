# Telco Agent Ingestion and Validation Report

## Executive Summary
- **Case:** telco-ingest-validate-chain
- **Status:** ✅ Passed
- **Layer:** S8
- **Report Hash:** 61f340a167798d4168103618ae72c044c2905ff4800a4d94dbc8fe416d281a44

## Operational Metrics
| Metric | Value |
|--------|-------|
| Transitions Ingested | 1000.000 |
| Valid Envelopes Signed | 1000.000 |
| Invalid Envelopes Rejected | 3.000 |
| Ingest Duration (ms) | 131.897 |
| Validation Duration (ms) | 30.680 |
| Ingestion Throughput (ops/sec) | 7581.681 |
| Validation Throughput (ops/sec) | 32594.568 |

## Validated Invariants
*   **Invariant:** valid ingested transition creates conforming signed envelope
*   **Invariant:** tampered ocel payload fails validation (tamper resistance proof)
*   **Invariant:** tampered ocelBatchHash fails validation (tamper resistance proof)
*   **Invariant:** tampered receiptHash fails validation (tamper resistance proof)