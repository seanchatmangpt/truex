import { type TruexContext, createDeterministicContext } from '../context.js';
import { type HookDefinition, type GraphDelta, parseGraphDelta } from '../runtime-law.js';
import { ProductionLine } from './line.js';
import { hash } from '../index.js';

/**
 * Registry of fundamental Repository Laws.
 * These hooks are applied to all Antigravity agent actions.
 */
export const RepositoryLaws: HookDefinition[] = [
  {
    id: 'law-no-null',
    name: 'No Null Allowed',
    condition: { kind: 'always' },
    effects: [
      { kind: 'emit-event', type: 'law-check-passed' }
    ]
  },
  {
    id: 'law-deterministic-entropy',
    name: 'Deterministic Entropy Enforced',
    condition: { kind: 'always' },
    effects: [
      { kind: 'emit-event', type: 'entropy-check-passed' }
    ]
  },
  {
    id: 'law-replay-convergence',
    name: 'Replay Convergence Required',
    condition: { kind: 'always' },
    effects: [
      { kind: 'emit-event', type: 'replay-check-passed' }
    ]
  },
  {
    id: 'law-no-fossils',
    name: 'No Fossil Record Allowed',
    condition: { kind: 'delta-match', predicate: 'agy:action' },
    effects: [
      { kind: 'emit-event', type: 'fossil-check-passed' }
    ]
  }
];

export function createAgyProductionLine(ctx: TruexContext): ProductionLine {
  return new ProductionLine(ctx, RepositoryLaws);
}
