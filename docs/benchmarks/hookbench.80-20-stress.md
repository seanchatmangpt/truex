# Hookbench 80/20 Stress Validation

## Stress Matrix Status

| ID | Case Name | Category | Status | Expected Failure | Observed Behavior |
|----|-----------|----------|--------|------------------|-------------------|
| stress-01 | malformed input | malformed input | ✅ | true | Successfully rejected malformed delta: GraphDelta.adds must be an array |
| stress-02 | capacity breach / Muri | capacity breach | ✅ | true | Successfully blocked capacity breach: Semantic Law Violation (Muri): Input delta size exceeds processing capacity. |
| stress-03 | nonmatching predicate / Muda | nonmatching predicate | ✅ | false | Mismatched predicate correctly bypassed hook |
| stress-04 | forbidden predicate / policy refusal | policy refusal | ✅ | true | Forbidden predicate correctly identified for refusal |
| stress-05 | receipt tamper | receipt integrity | ✅ | true | Tampered receipt correctly rejected |
| stress-06 | receipt chain reorder | receipt linkage | ✅ | true | Replay successfully blocked reordered chain |
| stress-07 | replay input divergence | replay inputs | ✅ | true | Replay successfully failed on input mutation |
| stress-08 | replay law divergence | replay rules | ✅ | true | Replay successfully failed on law mutation |
| stress-09 | seed/context divergence | deterministic entropy | ✅ | true | Replay successfully failed on seed mismatch |
| stress-10 | timing/memory nondeterminism in report hash | report deterministic stability | ✅ | false | Stable hash generated across identical runs |
| stress-11 | eval-only misclassified as receipt-backed | classification safety | ✅ | false | Eval-only correctly classified with zero receipts |
| stress-12 | benchmark metric miscalculation | telemetry accuracy | ✅ | false | Metric math is verified and correct |
| stress-13 | WAL persistence mismatch | SQLite journal integrity | ✅ | false | WAL successfully writes and reads back identical deltas |
| stress-14 | rollback failure | transaction isolation | ✅ | false | Transaction rollbacks successfully revert all delta mutations |
| stress-15 | observatory stale report | observatory freshness | ✅ | false | Observatory reports successfully exist and are active |
| stress-16 | Recursive Hook Storms | topology failure frontier | ✅ | false | Successfully triggered 20 recursive sub-deltas |
| stress-17 | Cyclical Hook Activation | topology failure frontier | ✅ | true | Cycle detected and halted via safety limit |
| stress-18 | Cascading Rollback Divergence | topology failure frontier | ✅ | false | Clean rollback achieved after partial cascade failure |
| stress-19 | Interrupted Receipt Persistence | topology failure frontier | ✅ | true | Atomic rollback confirmed after interrupted 5-step cascade |

## Summary
- **Total Cases:** 19
- **Passed:** 19
- **Failed:** 0