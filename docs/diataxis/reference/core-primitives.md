# Reference: Core Primitives

This document outlines the API footprint of the core operational structures in Truex.

### `TruexHook`
The bounded operational morphism: $H = (\Delta, C, E, R, \Pi)$
- `matches(delta: GraphDelta): boolean`
- `execute(ctx: TruexContext, delta: GraphDelta, prevHash: string): { effects, receipt, events }`
- `replay(ctx: TruexContext, delta: GraphDelta, expectedReceipt: Receipt): boolean`

### `GraphDelta`
The standard unit of state mutation in the Truex operating field.
```typescript
type GraphDelta = {
  id: string;
  adds: Quad[];
  deletes: Quad[];
}
```

### `Receipt`
The unforgeable proof of operational consequence.
```typescript
type Receipt = {
  id: string;
  eventId: string;
  deltaId: string;
  inputHash: string;
  outputHash: string;
  previousReceiptHash: string | undefined;
  status: 'confirmed' | 'refused';
  receiptHash: string;
}
```

### `TruexContext`
The bounded entropy container ensuring deterministic operations.
```typescript
type TruexContext = {
  seed: number;
  clock: () => number;
  uuid: () => string;
}
```