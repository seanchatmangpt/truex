import fc from 'fast-check';
import type { HookDefinition, GraphDelta, Quad, HookCondition, HookEffect } from '../../src/runtime-law.js';

export const quadArbitrary = fc.record({
  subject: fc.string({ minLength: 1 }),
  predicate: fc.string({ minLength: 1 }),
  object: fc.string({ minLength: 1 }),
  graph: fc.option(fc.string({ minLength: 1 }))
}) as fc.Arbitrary<Quad>;

export const graphDeltaArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  adds: fc.array(quadArbitrary),
  deletes: fc.array(quadArbitrary)
}) as fc.Arbitrary<GraphDelta>;

export const hookConditionArbitrary = fc.oneof(
  fc.record({ kind: fc.constant('always' as const) }),
  fc.record({ kind: fc.constant('delta-match' as const), predicate: fc.string({ minLength: 1 }) })
) as fc.Arbitrary<HookCondition>;

export const hookEffectArbitrary = fc.oneof(
  fc.record({ kind: fc.constant('emit-event' as const), type: fc.string({ minLength: 1 }) }),
  fc.record({ kind: fc.constant('add-quad' as const), quad: quadArbitrary })
) as fc.Arbitrary<HookEffect>;

export const hookDefinitionArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  condition: hookConditionArbitrary,
  effects: fc.array(hookEffectArbitrary, { minLength: 1, maxLength: 10 })
}) as fc.Arbitrary<HookDefinition>;
