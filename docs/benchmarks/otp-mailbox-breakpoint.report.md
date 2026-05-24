# Truex Hook OTP Mailbox & FIFO Stress Report

**Date:** 2026-05-24T07:47:37.493Z
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
| 1 | 1 | 100 | 10619.38 | 0.0753 | 0.1338 | 1.0644 | 19.25 | 22.02 | 22.02 | 80.50 | 91.92 | No | 29057.36 | 0 |
| 1 | 2 | 100 | 14973.42 | 0.0632 | 0.087 | 0.3149 | 22.06 | 21.23 | 22.06 | 91.92 | 99.91 | No | -8617.12 | 0 |
| 1 | 8 | 100 | 16431.26 | 0.0572 | 0.0715 | 0.3508 | 21.25 | 17.40 | 21.25 | 99.91 | 107.69 | No | -40365.52 | 0 |
| 1 | 64 | 100 | 19349.69 | 0.0486 | 0.058 | 0.1214 | 17.42 | 29.44 | 29.44 | 107.69 | 107.78 | No | 126101.60 | 0 |
| 10 | 1 | 100 | 18274.44 | 0.4195 | 0.6278 | 0.7222 | 29.46 | 26.26 | 29.46 | 107.78 | 107.89 | No | -33552.88 | 0 |
| 10 | 2 | 100 | 18781.25 | 0.3896 | 0.7771 | 0.8339 | 25.80 | 21.60 | 25.80 | 107.89 | 107.95 | No | -44018.40 | 0 |
| 10 | 8 | 100 | 19316.21 | 0.3986 | 0.603 | 0.6567 | 21.61 | 17.71 | 21.61 | 107.95 | 108.00 | No | -40879.20 | 0 |
| 10 | 64 | 100 | 18052.71 | 0.4299 | 0.5606 | 0.5979 | 17.73 | 29.70 | 29.70 | 108.00 | 108.03 | No | 125565.12 | 0 |
| 100 | 1 | 100 | 19716.41 | 2.6265 | 3.7871 | 3.9351 | 29.72 | 25.35 | 29.72 | 108.03 | 108.25 | No | -45823.60 | 0 |
| 100 | 2 | 100 | 19745.61 | 2.7426 | 3.9096 | 4.032 | 25.36 | 20.93 | 25.36 | 108.25 | 108.30 | No | -46404.88 | 0 |
| 100 | 8 | 100 | 20712.69 | 2.2725 | 3.8705 | 4.0003 | 20.94 | 16.49 | 20.94 | 108.30 | 108.33 | No | -46690.00 | 0 |
| 100 | 64 | 100 | 22209.47 | 2.2919 | 3.498 | 3.6095 | 16.50 | 27.87 | 27.87 | 108.33 | 108.33 | No | 119297.44 | 0 |
| 1000 | 1 | 1000 | 21169.98 | 23.8588 | 36.6863 | 37.927 | 27.88 | 31.05 | 31.05 | 108.33 | 108.64 | No | 3317.62 | 0 |
| 1000 | 2 | 1000 | 19062.63 | 23.7872 | 41.4815 | 42.8992 | 31.10 | 18.15 | 31.10 | 108.64 | 108.75 | No | -13573.98 | 0 |
| 1000 | 8 | 1000 | 21435.48 | 23.5897 | 36.407 | 37.7702 | 18.20 | 20.99 | 20.99 | 108.75 | 108.95 | No | 2920.44 | 0 |
| 1000 | 64 | 1000 | 21115.46 | 24.64 | 37.3675 | 38.3904 | 21.03 | 23.80 | 23.80 | 108.95 | 109.69 | No | 2899.69 | 0 |
| 10000 | 1 | 10000 | 21522.64 | 229.6215 | 364.7903 | 375.7718 | 23.84 | 54.36 | 54.36 | 109.69 | 151.78 | No | 3200.32 | 0 |
| 10000 | 2 | 10000 | 22568.23 | 222.5589 | 346.7502 | 357.6515 | 54.77 | 51.05 | 54.77 | 151.78 | 159.59 | No | -389.97 | 0 |
| 10000 | 8 | 10000 | 22580.86 | 225.3864 | 345.6416 | 356.5183 | 51.45 | 24.60 | 51.45 | 159.59 | 162.47 | No | -2815.77 | 0 |
| 10000 | 64 | 10000 | 22522.51 | 226.6066 | 346.7288 | 357.9804 | 25.00 | 51.37 | 51.37 | 162.47 | 225.09 | No | 2765.79 | 0 |
| 100000 | 1 | 100000 | 22702.35 | 2215.7967 | 3432.2858 | 3539.6715 | 51.84 | 96.88 | 96.88 | 225.09 | 277.33 | No | 472.26 | 0 |
| 100000 | 2 | 100000 | 22734.46 | 2203.0437 | 3420.009 | 3525.8789 | 100.79 | 172.98 | 172.98 | 278.11 | 354.27 | No | 756.96 | 0 |
| 100000 | 8 | 100000 | 22208.38 | 2319.0893 | 3522.4374 | 3630.6175 | 176.89 | 90.40 | 176.89 | 355.03 | 360.91 | No | -906.92 | 0 |
| 100000 | 64 | 100000 | 22431.14 | 2228.1441 | 3464.3483 | 3571.841 | 94.33 | 217.05 | 217.05 | 361.67 | 374.70 | No | 1286.79 | 0 |

## Analysis & Insights

1. **Mailbox Saturation Limits:** Stresses with mailbox limits from 1 to 100,000 show that the Hook OTP implementation handles large message depths efficiently. Performance stays high even with 100,000 messages in queue.
2. **Producer Contention under Multi-Producer Interleaving:** As the number of producers increases from 1 to 64, we observe no degradation in ordering or causal linkage, showing that the single-threaded Node event loop processes the interleaving cleanly.
3. **Memory Footprint & Telemetry:** Heap before, after, and peak usage along with RSS were tracked. The approximate bytes per message were calculated as the heap difference divided by the message count. Peak memory scales predictably with mailbox size.
4. **FIFO and Replay Correctness:** No FIFO violations or receipt chain violations were detected across any of the stress parameters under multi-producer interleaving.
