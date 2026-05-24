# Telco Agent Ingestion and Validation Report

## Executive Summary
- **Case:** telco-ingest-validate-chain
- **Status:** ✅ Passed
- **Layer:** S8
- **Report Hash:** 45a0cf2f9cc382004863155f819d13ece6d1c08b141827bbecc474715ac58191

## Operational Metrics
| Metric | Value |
|--------|-------|
| Transitions Ingested | 1000.000 |
| Valid Envelopes Signed | 1000.000 |
| Invalid Envelopes Rejected | 3.000 |
| Ingest Duration (ms) | 154.812 |
| Validation Duration (ms) | 29.668 |
| Ingestion Throughput (ops/sec) | 6459.441 |
| Validation Throughput (ops/sec) | 33706.776 |

## Validated Invariants
*   **Invariant:** valid ingested transition creates conforming signed envelope
*   **Invariant:** tampered ocel payload fails validation (tamper resistance proof)
*   **Invariant:** tampered ocelBatchHash fails validation (tamper resistance proof)
*   **Invariant:** tampered receiptHash fails validation (tamper resistance proof)