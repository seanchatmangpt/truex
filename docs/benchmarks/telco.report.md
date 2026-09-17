# Telco Agent Ingestion and Validation Report

## Executive Summary
- **Case:** telco-ingest-validate-chain
- **Status:** ✅ Passed
- **Layer:** S8
- **Report Hash:** 5c1992a6a8e3c50e52781a0dc14d573d5627e4b3eab77a1932cc4d5bca20e11e

## Operational Metrics
| Metric | Value |
|--------|-------|
| Transitions Ingested | 1000.000 |
| Valid Envelopes Signed | 1000.000 |
| Invalid Envelopes Rejected | 3.000 |
| Ingest Duration (ms) | 90.284 |
| Validation Duration (ms) | 35.625 |
| Ingestion Throughput (ops/sec) | 11076.221 |
| Validation Throughput (ops/sec) | 28070.175 |

## Validated Invariants
*   **Invariant:** valid ingested transition creates conforming signed envelope
*   **Invariant:** tampered ocel payload fails validation (tamper resistance proof)
*   **Invariant:** tampered ocelBatchHash fails validation (tamper resistance proof)
*   **Invariant:** tampered receiptHash fails validation (tamper resistance proof)