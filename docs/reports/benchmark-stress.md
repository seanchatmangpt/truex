# Benchmark Stress Report: Failure Invariants

**Status:** ✅ Passed

## Verified Invariants
- malformed delta correctly refused by parser (parseGraphDelta)
- receipt tamper correctly detected
- replay divergence correctly detected (seed mismatch)
- replay divergence correctly detected (input mutation)
- capacity breach (Muri) correctly blocked by Jidoka line stop
- non-matching predicate correctly blocked by Muda check

## Detected Failures
None

## Observations
- The Jidoka Line Stop successfully blocked mutations exceeding the capacity breach limit.
- Receipt tampering and replay divergence (seed mismatch) were correctly detected, ensuring the integrity of the operational field.