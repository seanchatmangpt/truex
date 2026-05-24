# Truex Hook OTP Mailbox & FIFO Stress Report

**Date:** 2026-05-24T10:01:19.326Z
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
| 1 | 1 | 100 | 10406.64 | 0.075 | 0.1344 | 1.101 | 20.43 | 23.78 | 23.87 | 80.75 | 93.31 | No | 35159.84 | 0 |
| 1 | 2 | 100 | 15037.12 | 0.0646 | 0.0809 | 0.3578 | 23.82 | 23.01 | 23.82 | 93.31 | 101.31 | No | -8457.84 | 0 |
| 1 | 8 | 100 | 16566.46 | 0.0575 | 0.0692 | 0.2802 | 23.02 | 19.17 | 23.02 | 101.31 | 109.13 | No | -40382.00 | 0 |
| 1 | 64 | 100 | 18851.18 | 0.0491 | 0.0603 | 0.15 | 19.19 | 31.22 | 31.22 | 109.13 | 109.23 | No | 126098.72 | 0 |
| 10 | 1 | 100 | 18856.36 | 0.4075 | 0.5916 | 0.6486 | 31.23 | 28.05 | 31.23 | 109.23 | 109.34 | No | -33370.80 | 0 |
| 10 | 2 | 100 | 19699.9 | 0.3996 | 0.5605 | 0.6173 | 27.66 | 23.35 | 27.66 | 109.34 | 109.39 | No | -45182.88 | 0 |
| 10 | 8 | 100 | 19106.61 | 0.398 | 0.5657 | 0.6528 | 23.37 | 19.44 | 23.37 | 109.39 | 109.42 | No | -41198.96 | 0 |
| 10 | 64 | 100 | 20911.94 | 0.3728 | 0.447 | 0.4839 | 19.45 | 31.43 | 31.43 | 109.42 | 109.47 | No | 125583.44 | 0 |
| 100 | 1 | 100 | 19949.79 | 2.4887 | 3.7143 | 3.8249 | 31.45 | 27.07 | 31.45 | 109.48 | 109.70 | No | -45927.60 | 0 |
| 100 | 2 | 100 | 20819.42 | 2.5872 | 3.8545 | 3.9632 | 27.08 | 22.66 | 27.08 | 109.70 | 109.75 | No | -46320.88 | 0 |
| 100 | 8 | 100 | 20921.41 | 2.2923 | 3.8094 | 3.9218 | 22.67 | 18.22 | 22.67 | 109.75 | 109.80 | No | -46671.44 | 0 |
| 100 | 64 | 100 | 21976.41 | 2.34 | 3.5454 | 3.6558 | 18.23 | 29.60 | 29.60 | 109.80 | 109.80 | No | 119298.56 | 0 |
| 1000 | 1 | 1000 | 21301.26 | 23.8864 | 36.3771 | 37.3805 | 29.61 | 32.91 | 32.91 | 109.80 | 110.14 | No | 3457.14 | 0 |
| 1000 | 2 | 1000 | 21621.97 | 23.4308 | 35.8363 | 37.1414 | 32.96 | 19.98 | 32.96 | 110.14 | 110.23 | No | -13604.85 | 0 |
| 1000 | 8 | 1000 | 22222.57 | 22.841 | 35.1671 | 36.4323 | 20.03 | 22.84 | 22.84 | 110.23 | 110.28 | No | 2944.46 | 0 |
| 1000 | 64 | 1000 | 22329.9 | 22.7773 | 35.1684 | 36.2072 | 22.88 | 25.67 | 25.67 | 110.28 | 110.89 | No | 2919.68 | 0 |
| 10000 | 1 | 10000 | 21981.19 | 224.3149 | 355.6185 | 367.077 | 25.71 | 56.33 | 56.33 | 110.89 | 153.08 | No | 3210.24 | 0 |
| 10000 | 2 | 10000 | 22271.81 | 227.958 | 349.8871 | 361.005 | 56.76 | 53.00 | 56.76 | 153.08 | 160.88 | No | -393.76 | 0 |
| 10000 | 8 | 10000 | 22497.29 | 224.7316 | 346.8685 | 357.7885 | 53.41 | 26.78 | 53.41 | 160.88 | 163.69 | No | -2792.53 | 0 |
| 10000 | 64 | 10000 | 21896.24 | 236.7235 | 358.7653 | 369.6603 | 27.18 | 85.33 | 85.33 | 163.69 | 225.73 | No | 6097.82 | 0 |
| 100000 | 1 | 100000 | 22582.03 | 2218.7043 | 3446.1736 | 3554.6104 | 85.73 | 134.32 | 134.32 | 225.73 | 281.02 | No | 509.54 | 0 |
| 100000 | 2 | 100000 | 22543.29 | 2231.2886 | 3446.9007 | 3555.6783 | 138.26 | 126.44 | 138.26 | 281.78 | 323.91 | No | -123.97 | 0 |
| 100000 | 8 | 100000 | 22624.66 | 2211.0388 | 3443.2261 | 3551.6788 | 130.40 | 103.12 | 130.40 | 324.67 | 335.64 | No | -285.99 | 0 |
| 100000 | 64 | 100000 | 22553.2 | 2229.6161 | 3450.8985 | 3559.8811 | 107.05 | 166.18 | 166.18 | 336.41 | 349.91 | No | 620.05 | 0 |

## Analysis & Insights

1. **Mailbox Saturation Limits:** Stresses with mailbox limits from 1 to 100,000 show that the Hook OTP implementation handles large message depths efficiently. Performance stays high even with 100,000 messages in queue.
2. **Producer Contention under Multi-Producer Interleaving:** As the number of producers increases from 1 to 64, we observe no degradation in ordering or causal linkage, showing that the single-threaded Node event loop processes the interleaving cleanly.
3. **Memory Footprint & Telemetry:** Heap before, after, and peak usage along with RSS were tracked. The approximate bytes per message were calculated as the heap difference divided by the message count. Peak memory scales predictably with mailbox size.
4. **FIFO and Replay Correctness:** No FIFO violations or receipt chain violations were detected across any of the stress parameters under multi-producer interleaving.
