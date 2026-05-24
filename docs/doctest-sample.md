# Doctest Examples

This file contains doctest examples to verify the Truex doctest runner.

## TypeScript Doctest

```typescript doctest name="hash-assertion"
import { hash } from "packages/truex-core/src/index.js";

const val = { x: 42, y: "hello" };
const h = hash(val);
expect(h).toHaveLength(64);
```

## Bash Doctest

```bash doctest name="doctor-prove-hook"
npx tsx scripts/truex.ts doctor prove hook
# expect: exitCode 0
```

## Ignored / Skipped Doctests

```typescript doctest name="ignored-doctest"
// no-doctest
throw new Error("This should not be run!");
```

```typescript doctest name="deferred-doctest"
// defer-doctest
throw new Error("This is deferred!");
```
