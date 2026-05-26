# Experimental Project Report: claude

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/claude`

## 1. Audit Status
- **Test Status:** ⚠️ No Tests Found / Not Executable

## 2. Executable Entry Points
- *No standard executable entry points found (depth <= 2)*

## 3. Extracted Documentation & Context
### Source: `claude/rules/metrics.md`
```markdown
---
paths:
  - "src/ostar/metrics/**"
  - "tests/metrics/**"
---
# Metrics Module Rules

## Architecture

All metrics extend `Metric` ABC with `__call__(result: Dict) -> Dict` returning at minimum `{"score": float}`.

| Metric | What it checks | Formula |
|--------|---------------|---------|
| ParseMetric | Required fields on bestCandidate | 1.0/0.5/0.0 |
| ConstitutionalMetric | O* law compliance (Law 3, 5) | 1.0 - (violations × 0.2) |
| CoherenceMetric | Semantic coherence | 1.0 - (issues × 0.25) |
| CompositeMetric | Weighted average of all | parse 15%, const 35%, coherence 25%, fitness 25% |

## Constitutional Laws

- Law 5 (minimality): ≤5 namespaces, ≤2 private residue
- Law 3 (cite observables): non-empty rationale, overlap rationale per pair

## Label Classification

| Score | Label |
|-------|-------|
| ≥0.9 | excellent |
| ≥0.7 | good |
| ≥0.5 | acceptable |
| ≥0.3 | poor |
| <0.3 | reject |

## Testing

- All metrics are pure functions — no mocking needed, just pass dicts
- Test boundary conditions: perfect score, partial compliance, no candidate, wrong types
- Test `_safe_get` helper with nested keys, missing keys, non-dict values
- Test `evaluate_batch()` with empty list and label distribution counting

...
```

