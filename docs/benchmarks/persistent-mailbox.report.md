# Persistent Mailbox & Queue-State Discipline Report

## 1. Scope Boundary
This report validates the SQLite-backed persistent mailbox and queue-state discipline (Gall Checkpoint S10), verifying duplicate detection, concurrency execution limits, terminal message transitions, lineage integrity, and crash/startup recovery scan.

## 2. Invariant Verification Summary
| Invariant | Result |
| --- | --- |
| PM1: Duplicate and Depth Limits | ✅ Passed |
| PM2: Concurrency & Queue Draining | ✅ Passed |
| PM3: Message Transitions & Consequences | ✅ Passed |
| PM4: Integrity Validation & Tamper Rejection | ✅ Passed |
| PM5: Stalled Message Recovery Scan | ✅ Passed |

## 3. Decoupled Accounting Domains (PM1-PM5)

### Domain PM1 — Message Enqueue
*   **Attempted:** 6.000
*   **Succeeded (Enqueued):** 3.000
*   **Refused:** 2.000
*   **Duplicate Confirmed:** 1.000
*   **Failed:** 0.000
*   **Success Rate:** 50.000%

### Domain PM2 — Message Claim
*   **Attempted:** 5.000
*   **Succeeded (Claimed):** 3.000
*   **Locked (Concurrency Limit):** 1.000
*   **Empty:** 1.000
*   **Failed:** 0.000
*   **Success Rate:** 60.000%

### Domain PM3 — Consequence Resolution & Transitions
*   **Attempted:** 9.000
*   **Confirmed:** 1.000
*   **Refused/Discarded:** 4.000
*   **Retryable/RolledBack:** 4.000
*   **Failed:** 0.000
*   **Success Rate:** 11.111%

### Domain PM4 — Replay & Integrity
*   **Attempted:** 2.000
*   **Valid:** 1.000
*   **Tampered:** 1.000
*   **Failed:** 0.000
*   **Success Rate:** 50.000%

### Domain PM5 — Rescue Recovery
*   **Attempted:** 2.000
*   **Rescued Retryable:** 1.000
*   **Rescued Refused:** 1.000
*   **Failed:** 0.000
*   **Success Rate:** 50.000%

## 4. Telemetry Performance Metrics
*   **Enqueue Attempts:** 6.000
*   **Claim Attempts:** 5.000
*   **Transition Attempts:** 9.000
*   **Integrity Attempts:** 2.000
*   **Rescue Attempts:** 2.000
*   **Execution Duration:** 18.000 ms
*   **Mailbox Report Hash:** `e17d64c391fad605468b011d2a703155406015c7eab1fc92aec2b37f723ab7b5`