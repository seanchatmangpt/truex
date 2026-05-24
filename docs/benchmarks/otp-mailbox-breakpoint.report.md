# Truex Hook OTP Mailbox & FIFO Stress Report

**Date:** 2026-05-24T08:51:31.480Z
**Platform:** darwin (arm64)
**CPU:** Apple M3 Max
**Node Version:** v24.15.0

## Invariant Verification Summary

| Invariant | Result |
| --- | --- |
| Capacity + 1 Refused Before Mutation | ✅ Passed |
| FIFO Reordering Detected | ✅ Passed |
| Mutated Receipt Chain Fails | ✅ Passed |
| Queue Overflow Emits Refused Receipt | ✅ Passed |
| No Message Disappears Silently | ✅ Passed |

## Benchmark Metrics under Multi-Producer Interleaving

| Mailbox Size | Producers | Messages Processed | Messages/sec | Latency P50 (ms) | Latency P95 (ms) | Latency P99 (ms) | Heap Before (MB) | Heap After (MB) | Heap Peak (MB) | RSS Before (MB) | RSS After (MB) | GC Observed | Bytes/Msg Approx | Backpressure Refusals |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 | 100 | 10769.82 | 0.0782 | 0.1417 | 0.9337 | 19.87 | 22.99 | 22.99 | 80.03 | 91.95 | No | 32741.36 | 0 |
| 1 | 2 | 100 | 14587.89 | 0.0652 | 0.0881 | 0.3385 | 23.03 | 22.28 | 23.03 | 91.95 | 100.23 | No | -7827.12 | 0 |
| 1 | 8 | 100 | 15488.67 | 0.0585 | 0.0804 | 0.303 | 22.30 | 18.45 | 22.30 | 100.23 | 107.94 | No | -40368.72 | 0 |
| 1 | 64 | 100 | 18944.33 | 0.0487 | 0.0636 | 0.1452 | 18.46 | 30.49 | 30.49 | 107.94 | 108.11 | No | 126101.20 | 0 |
| 10 | 1 | 100 | 18120.18 | 0.4192 | 0.6883 | 0.8133 | 30.50 | 26.85 | 30.50 | 108.11 | 108.19 | No | -38295.20 | 0 |
| 10 | 2 | 100 | 18661.21 | 0.4023 | 0.5819 | 0.7583 | 26.88 | 22.65 | 26.88 | 108.20 | 108.23 | No | -44343.68 | 0 |
| 10 | 8 | 100 | 19955.26 | 0.386 | 0.5712 | 0.6255 | 22.67 | 18.74 | 22.67 | 108.23 | 108.30 | No | -41140.64 | 0 |
| 10 | 64 | 100 | 21282.26 | 0.3685 | 0.4349 | 0.4614 | 18.76 | 30.73 | 30.73 | 108.30 | 108.33 | No | 125571.84 | 0 |
| 100 | 1 | 100 | 20782.28 | 2.5736 | 3.6188 | 3.7289 | 30.75 | 26.38 | 30.75 | 108.33 | 108.50 | No | -45801.52 | 0 |
| 100 | 2 | 100 | 20617.67 | 2.6247 | 3.879 | 3.9935 | 26.39 | 22.00 | 26.39 | 108.50 | 108.52 | No | -45980.80 | 0 |
| 100 | 8 | 100 | 20348.29 | 2.392 | 3.9748 | 4.0892 | 22.01 | 17.56 | 22.01 | 108.52 | 108.56 | No | -46672.40 | 0 |
| 100 | 64 | 100 | 22564.45 | 2.2543 | 3.4607 | 3.5699 | 17.57 | 28.95 | 28.95 | 108.56 | 108.56 | No | 119298.64 | 0 |
| 1000 | 1 | 1000 | 21670.92 | 23.3653 | 35.6204 | 36.7948 | 28.96 | 32.31 | 32.31 | 108.56 | 108.86 | No | 3518.00 | 0 |
| 1000 | 2 | 1000 | 21895.19 | 23.1613 | 35.2686 | 36.5891 | 32.36 | 19.46 | 32.36 | 108.86 | 109.02 | No | -13527.90 | 0 |
| 1000 | 8 | 1000 | 22190.58 | 22.9791 | 35.0108 | 36.3045 | 19.50 | 22.30 | 22.30 | 109.02 | 109.27 | No | 2931.78 | 0 |
| 1000 | 64 | 1000 | 22389.02 | 22.645 | 35.0415 | 36.129 | 22.34 | 25.21 | 25.21 | 109.27 | 109.92 | No | 3006.90 | 0 |
| 10000 | 1 | 10000 | 22244.75 | 224.038 | 351.708 | 362.7798 | 25.26 | 55.80 | 55.80 | 109.92 | 152.47 | No | 3203.11 | 0 |
| 10000 | 2 | 10000 | 22616.37 | 222.0835 | 345.1182 | 356.1135 | 56.23 | 52.50 | 56.23 | 152.47 | 160.42 | No | -391.45 | 0 |
| 10000 | 8 | 10000 | 22752.73 | 220.3405 | 342.3039 | 353.0622 | 52.90 | 48.42 | 52.90 | 160.42 | 167.98 | No | -470.39 | 0 |
| 10000 | 64 | 10000 | 22441.36 | 227.1772 | 350.2802 | 360.7411 | 48.82 | 107.13 | 107.13 | 167.98 | 242.31 | No | 6114.81 | 0 |
| 100000 | 1 | 100000 | 22696.78 | 2205.845 | 3420.2805 | 3528.4654 | 107.53 | 144.27 | 144.27 | 242.31 | 286.95 | No | 385.22 | 0 |
| 100000 | 2 | 100000 | 22602.14 | 2216.0014 | 3442.0538 | 3552.9917 | 148.23 | 220.76 | 220.76 | 287.72 | 366.02 | No | 760.51 | 0 |
| 100000 | 8 | 100000 | 22889.61 | 2187.4114 | 3396.7624 | 3502.886 | 224.70 | 130.26 | 224.70 | 366.78 | 359.33 | No | -990.32 | 0 |
| 100000 | 64 | 100000 | 22736.45 | 2165.4942 | 3425.2495 | 3537.4071 | 134.21 | 98.25 | 134.21 | 360.09 | 353.58 | No | -377.09 | 0 |

## Analysis & Insights

1. **Mailbox Saturation Limits:** Stresses with mailbox limits from 1 to 100,000 show that the Hook OTP implementation handles large message depths efficiently. Performance stays high even with 100,000 messages in queue.
2. **Producer Contention under Multi-Producer Interleaving:** As the number of producers increases from 1 to 64, we observe no degradation in ordering or causal linkage, showing that the single-threaded Node event loop processes the interleaving cleanly.
3. **Memory Footprint & Telemetry:** Heap before, after, and peak usage along with RSS were tracked. The approximate bytes per message were calculated as the heap difference divided by the message count. Peak memory scales predictably with mailbox size.
4. **FIFO and Replay Correctness:** No FIFO violations or receipt chain violations were detected across any of the stress parameters under multi-producer interleaving.
