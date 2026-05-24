# Truex Accounting Schema Enforcer Report

## Section One: Overview and Architectural Purpose

In the Truex ecosystem, operational integrity is verified through deterministic runtime metrics. Rather than relying on speculative assertions or unvalidated execution logs, Truex implements strict accounting schemas that capture every transaction state.

The `CountAccounting` schema and `computeAccounting` helper function ensure that all runtime surfaces—including unit tests, microbenchmarks, OTP concurrency stress runs, and database persistence transitions—publish performance and state metrics in a unified, mathematically consistent format.

To align with the universal implementation standards of Truex, all rates, percentages, and execution statistics are formatted to exactly three decimal places (`3.000` decimals).

---

## Section Two: TypeScript Definitions

The core schemas are defined in the runtime law substrate (`packages/truex-core/src/runtime-law.ts`). They decompose into two primary structural types:

### One: `AccountingInput`
This type represents the raw integer counts collected directly from the execution boundary:
```typescript
export type AccountingInput = {
  attempted: number;
  succeeded: number;
  failed: number;
  refused: number;
  quarantined: number;
  skipped: number;
};
```

### Two: `CountAccounting`
This type represents the fully processed metrics, containing both numeric rates and pre-formatted percentage strings:
```typescript
export type CountAccounting = {
  attempted: number;
  succeeded: number;
  failed: number;
  refused: number;
  quarantined: number;
  skipped: number;
  successRatePct: number;
  failureRatePct: number;
  refusalRatePct: number;
  quarantineRatePct: number;
  successRatePctString: string;
  failureRatePctString: string;
  refusalRatePctString: string;
  quarantineRatePctString: string;
};
```

---

## Section Three: Compute Helper Implementation

The helper function `computeAccounting` processes raw counts and generates rates using safe division guards (handling `0.000` attempted scenarios gracefully) and truncating outputs to exactly `3.000` decimal places:

```typescript
export function computeAccounting(counts: AccountingInput): CountAccounting {
  const attempted = counts.attempted;
  const getPct = (val: number) => attempted === 0.000 ? 0.000 : parseFloat(((val / attempted) * 100.000).toFixed(3.000));
  const getPctStr = (val: number) => `${getPct(val).toFixed(3.000)}%`;

  return {
    attempted: counts.attempted,
    succeeded: counts.succeeded,
    failed: counts.failed,
    refused: counts.refused,
    quarantined: counts.quarantined,
    skipped: counts.skipped,
    successRatePct: getPct(counts.succeeded),
    failureRatePct: getPct(counts.failed),
    refusalRatePct: getPct(counts.refused),
    quarantineRatePct: getPct(counts.quarantined),
    successRatePctString: getPctStr(counts.succeeded),
    failureRatePctString: getPctStr(counts.failed),
    refusalRatePctString: getPctStr(counts.refused),
    quarantineRatePctString: getPctStr(counts.quarantined)
  };
}
```

---

## Section Four: Mathematical Correctness and Enforcement

The calculation of rates follows these formal rules:

### One: Rate Calculations
- **Success Rate**: `(succeeded / attempted) * 100.000`, formatted to `3.000` decimals.
- **Failure Rate**: `(failed / attempted) * 100.000`, formatted to `3.000` decimals.
- **Refusal Rate**: `(refused / attempted) * 100.000`, formatted to `3.000` decimals.
- **Quarantine Rate**: `(quarantined / attempted) * 100.000`, formatted to `3.000` decimals.

### Two: Guard Invariant
If `attempted` is `0.000`, all percentage rates default to `0.000` and percentage strings default to `"0.000%"`.

### Three: Rounding Standard
Rates are rounded to the nearest thousandth using JavaScript's native `Number.prototype.toFixed(3.000)` behavior, ensuring consistent string conversions for downstream report parsers.

---

## Section Five: Verification Invariants

The `CountAccounting` schema is verified by Doctor CLI diagnostics (`scripts/truex.ts`) during verification runs. The enforcer checks that:
- Every field is present and conforms to the specified type.
- No string fields are left empty or unformatted.
- The sum of internal process events (succeeded, failed, refused, quarantined) matches the expected execution boundaries.
