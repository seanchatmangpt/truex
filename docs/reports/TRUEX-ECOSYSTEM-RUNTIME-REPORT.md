# TRUEX ECOSYSTEM RUNTIME REPORT

**Timestamp:** 2026-05-25T18:57:19.683Z
**Report Hash:** dc5a14eaacb92db84a902b973aa39963aeb33cb98597b15acc420f3a27a1c12a

## 1. Core Primitives Status

| Primitive | Status | Invariants Verified |
|-----------|--------|---------------------|
| hash | ✅ Passed | same input = same hash, different input = different hash, stable ordering (JSON keys sorted), tamper changes hash |
| receipt | ✅ Passed | receipt signs, signature verifies, tampered receipt fails signature verification, wrong public key fails signature verification, receipt generated with valid hash, receipt chaining verified, tampered receipt fails verification, broken chain fails verification |
| replay | ✅ Passed | replay converges correctly, replay diverges on input mutation, replay diverges on engine mutation (law changed) |
| engine | ✅ Passed | graph delta accepted, hook matched, effects generated, receipt generated deterministically, replay matched output, bad input structurally refused |
| sqlite | ✅ Passed | SQLite opens, Schema migrated, GraphDelta accepted, Hook matched, Effects persisted, Receipt persisted, Receipt readback verified, Replay converged, Bad input refused |
| membrane | ✅ Passed | object mutation allowed, prototype mutation refused, readonly boundary enforced, transaction rollback succeeded, descriptor access checked, defineProperty trapped, deep proxy wrapping captured |
| adapter | ✅ Passed | valid agent proposal admitted, unauthorized proposal refused by ACL gate, speculative failure yields Refused receipt, structural failure yields Refused receipt, admitted receipt validates cryptographically |
| hook | ✅ Passed | same delta yields same hook match, same law yields same effect, tampered delta yields divergent input hash (refusal proof), same replay yields convergence, tampered receipt correctly refused (TPS proof) |
| repository | ✅ Passed | all skills pass sandbox validation (no Math.random or clock dependencies), task markdown files compile successfully to GraphDelta |
| topology | ✅ Passed | single hook execution registered correctly as depth-0 activation, cascading hooks execute in order with correct receipt chain lineage, hook storm mitigated: cyclic loop detected and refused, seeded execution is completely deterministic and reproducible |

## 2. High-Level Ecosystem Accounting

| Category | Attempted | Succeeded | Failed | Refused | Quarantined | Skipped | Success % | Failure % | Refusal % | Quarantine % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ecosystem Overall | 2192 | 2187 | 0 | 2 | 3 | 0 | 99.772% | 0.000% | 0.091% | 0.137% |
| Surfaces | 2192 | 2187 | 0 | 2 | 3 | 0 | 99.772% | 0.000% | 0.091% | 0.137% |
| Benchmarks | 2001000 | 2001000 | 0 | 0 | 0 | 0 | 100.000% | 0.000% | 0.000% | 0.000% |
| Stress Cases | 10 | 10 | 0 | 0 | 0 | 0 | 100.000% | 0.000% | 0.000% | 0.000% |
| Commands | 7 | 7 | 0 | 0 | 0 | 0 | 100.000% | 0.000% | 0.000% | 0.000% |
| AGY Bridge | 2 | 1 | 0 | 1 | 0 | 0 | 50.000% | 0.000% | 50.000% | 0.000% |
| Observatory | 29 | 29 | 0 | 0 | 0 | 0 | 100.000% | 0.000% | 0.000% | 0.000% |

## 3. Ecosystem Summary Table

| Surface | Attempted | Succeeded | Failed | Refused | Quarantined | Skipped | Success % | Failure % | Refusal % | Quarantine % |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Vitest full suite | 1346 | 1346 | 0 | 0 | 0 | 0 | 100.000% | 0.000% | 0.000% | 0.000% |
| HookBench T3 eval-only | 400 | 400 | 0 | 0 | 0 | 0 | 100.000% | 0.000% | 0.000% | 0.000% |
| HookBench receipt-backed | 400 | 400 | 0 | 0 | 0 | 0 | 100.000% | 0.000% | 0.000% | 0.000% |
| Hook OTP runtime | 5 | 1 | 0 | 1 | 3 | 0 | 20.000% | 0.000% | 20.000% | 60.000% |
| OTP non-mockable stress | 10 | 10 | 0 | 0 | 0 | 0 | 100.000% | 0.000% | 0.000% | 0.000% |
| AGY bridge refusal/admission | 2 | 1 | 0 | 1 | 0 | 0 | 50.000% | 0.000% | 50.000% | 0.000% |
| Observatory run | 29 | 29 | 0 | 0 | 0 | 0 | 100.000% | 0.000% | 0.000% | 0.000% |

## 4. Benchmark Detail Table

| Benchmark | Mode | Hooks | Deltas | Hook-Delta Evaluations | Matches | Receipts | Refusals | Duration ms | Eval/sec | Delta/sec | Memory Δ MB | Stable Hash |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| HookBench T3 | eval-only | 1000 | 1000 | 1000000 | 10 | 0 | 0 | 0.011 | 36924213.053 | 1846210.653 | 0.080 | ec94d1929396c93c9c129fc90614b653318edb1fff59c2e42ae5f5d1df5ae929 |
| HookBench receipt-backed | receipt-backed | 1000 | 1000 | 1000000 | 10 | 10 | 0 | 0.752 | 531590.426 | 26579.521 | 2.096 | 75844061a5238f4d2dceabb7ae621a4759900d8df0b202cf3998d97234f6b00e |
| Hook OTP mailbox | eval-only | 1 | 500 | 500 | 500 | 0 | 0 | 0.071 | 7005253.940 | 7005253.940 | 0.000 | c7031e5ce3d24089024944638dfafccb916f72027a0ab551d658062ae894fd74 |
| Hook OTP full loop | receipt-backed | 1 | 500 | 500 | 500 | 500 | 0 | 17.184 | 29096.975 | 29096.975 | 0.000 | c7031e5ce3d24089024944638dfafccb916f72027a0ab551d658062ae894fd74 |

## 5. Stress Detail Table

| Stress Case | Attempted | Passed | Failed | Refused | Quarantined | Replay Converged | Receipt Verified | Reported | Duration ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FIFO Causal Chain | 1 | 1 | 0 | 0 | 0 | ✅ Yes | ✅ Yes | ✅ Yes | 71.000 |
| Sibling Crash Containment | 1 | 1 | 0 | 0 | 0 | ✅ Yes | ✅ Yes | ✅ Yes | 1.000 |
| Restart Budget Exhaustion | 1 | 1 | 0 | 0 | 0 | ✅ Yes | ✅ Yes | ✅ Yes | 0.000 |
| Poison Message Quarantine | 1 | 1 | 0 | 0 | 0 | ✅ Yes | ✅ Yes | ✅ Yes | 1.000 |
| Capacity Backpressure | 1 | 1 | 0 | 0 | 0 | ✅ Yes | ✅ Yes | ✅ Yes | 1.000 |
| Replay Under Schedule Noise | 1 | 1 | 0 | 0 | 0 | ✅ Yes | ✅ Yes | ✅ Yes | 0.000 |
| Tamper After Process | 1 | 1 | 0 | 0 | 0 | ❌ No | ❌ No | ✅ Yes | 0.000 |
| Deterministic Lifecycle Hash | 1 | 1 | 0 | 0 | 0 | ✅ Yes | ✅ Yes | ✅ Yes | 57.000 |
| Observable Artifact Integrity | 1 | 1 | 0 | 0 | 0 | ✅ Yes | ✅ Yes | ✅ Yes | 19.000 |
| AGY Bridge Visibility | 1 | 1 | 0 | 0 | 0 | ✅ Yes | ✅ Yes | ✅ Yes | 844.000 |

## 6. Command Evidence Table

| Command | Exit Code | Duration ms | Passed | Failed | Notes |
|---|---:|---:|---:|---:|---|
| `npx vitest run packages/membrane/test/hook-otp/hook-otp-nonmockable-stress.test.ts` | 0 | 2076.000 | ✅ Yes | ✅ No | OTP non-mockable stress vitest run complete |
| `npx vitest run packages/membrane/test/hook-otp` | 0 | 3937.000 | ✅ Yes | ✅ No | OTP standard unit test run complete |
| `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove hook-otp` | 0 | 1509.000 | ✅ Yes | ✅ No | Doctor prove hook-otp validation complete |
| `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove benchmark` | 0 | 3077.000 | ✅ Yes | ✅ No | Doctor prove benchmark validation complete |
| `TSX_DISABLE_CACHE=1 npx tsx scripts/truex.ts doctor prove ecosystem` | 0 | 98435.000 | ✅ Yes | ✅ No | Self-invocation doctor ecosystem proof wrapper |
| `TSX_DISABLE_CACHE=1 npx tsx scripts/observatory/index.ts` | 0 | 2576.000 | ✅ Yes | ✅ No | Observatory emitters fact generation complete |
| `npx vitest run` | 0 | 83604.000 | ✅ Yes | ✅ No | Repository test suite validation complete |

---
*Report generated automatically by Truex Doctor.*