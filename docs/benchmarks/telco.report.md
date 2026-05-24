# Telco Agent Ingestion and Validation Report

## Executive Summary
- **Case:** telco-ingest-validate-chain
- **Status:** ✅ Passed
- **Layer:** S8
- **Report Hash:** c6ca683e2a9e3f6ceaea6d3795d6d17d6fa287814963777808c460acb0c7521a

## Operational Metrics
| Metric | Value |
|--------|-------|
| Transitions Ingested | 1000.000 |
| Valid Envelopes Signed | 1000.000 |
| Invalid Envelopes Rejected | 3.000 |
| Ingest Duration (ms) | 148.887 |
| Validation Duration (ms) | 31.255 |
| Ingestion Throughput (ops/sec) | 6716.507 |
| Validation Throughput (ops/sec) | 31994.582 |

## Validated Invariants
*   **Invariant:** valid ingested transition creates conforming signed envelope
*   **Invariant:** tampered ocel payload fails validation (tamper resistance proof)
*   **Invariant:** tampered ocelBatchHash fails validation (tamper resistance proof)
*   **Invariant:** tampered receiptHash fails validation (tamper resistance proof)