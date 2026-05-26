# Telco Agent Ingestion and Validation Report

## Executive Summary
- **Case:** telco-ingest-validate-chain
- **Status:** ✅ Passed
- **Layer:** S8
- **Report Hash:** 40b750ea3581e3d401777a859a61060ed9ea3de764c83188ad462373dda35d44

## Operational Metrics
| Metric | Value |
|--------|-------|
| Transitions Ingested | 1000.000 |
| Valid Envelopes Signed | 1000.000 |
| Invalid Envelopes Rejected | 3.000 |
| Ingest Duration (ms) | 135.502 |
| Validation Duration (ms) | 30.464 |
| Ingestion Throughput (ops/sec) | 7379.960 |
| Validation Throughput (ops/sec) | 32825.720 |

## Validated Invariants
*   **Invariant:** valid ingested transition creates conforming signed envelope
*   **Invariant:** tampered ocel payload fails validation (tamper resistance proof)
*   **Invariant:** tampered ocelBatchHash fails validation (tamper resistance proof)
*   **Invariant:** tampered receiptHash fails validation (tamper resistance proof)