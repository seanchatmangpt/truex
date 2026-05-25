import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  validatePowlNode,
  type PowlNode,
  type PowlNodeId
} from '../src/powl-project-workflow.gall.js';

describe('POWL Fuzzing', () => {
  const nodeIdArb = fc.string({ minLength: 1, maxLength: 10 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '_'));

  const activityArb = fc.record({
    type: fc.constant('activity' as const),
    id: nodeIdArb,
    label: fc.string()
  });

  const silentArb = fc.record({
    type: fc.constant('silent' as const),
    id: nodeIdArb
  });

  const { nodeArb } = fc.letrec(tie => ({
    nodeArb: fc.oneof(
      { depthFactor: 0.5 },
      activityArb,
      silentArb,
      tie('partialOrderArb'),
      tie('choiceGraphArb')
    ),
    partialOrderArb: fc.record({
      type: fc.constant('partial_order' as const),
      id: nodeIdArb,
      nodes: fc.array(tie('nodeArb'), { minLength: 1, maxLength: 3 }),
      edges: fc.array(fc.record({
        from: nodeIdArb,
        to: nodeIdArb
      }), { maxLength: 5 })
    }),
    choiceGraphArb: fc.record({
      type: fc.constant('choice_graph' as const),
      id: nodeIdArb,
      start: nodeIdArb,
      end: nodeIdArb,
      nodes: fc.array(tie('nodeArb'), { minLength: 1, maxLength: 3 }),
      edges: fc.array(fc.record({
        from: nodeIdArb,
        to: nodeIdArb,
        condition: fc.option(fc.string())
      }), { maxLength: 5 })
    })
  }));

  it('fuzz validatePowlNode with random graphs', () => {
    fc.assert(
      fc.property(nodeArb, (node) => {
        try {
          validatePowlNode(node as PowlNode);
          return true;
        } catch (e) {
          // If it throws, it should be one of our expected refusal messages
          const msg = (e as Error).message;
          return (
            msg.includes('refused') ||
            msg.includes('missing') ||
            msg.includes('not found') ||
            msg.includes('not on start-end path')
          );
        }
      }),
      { numRuns: 100 }
    );
  });

  it('detects cycles in forged partial orders', () => {
    // Manually construct a cyclic partial order that might be hard to find
    const cyclicNode: PowlNode = {
        type: 'partial_order',
        id: 'root',
        nodes: [
            { type: 'activity', id: 'a', label: 'A' },
            { type: 'activity', id: 'b', label: 'B' },
            { type: 'activity', id: 'c', label: 'C' }
        ],
        edges: [
            { from: 'a', to: 'b' },
            { from: 'b', to: 'c' },
            { from: 'c', to: 'a' }
        ]
    };
    expect(() => validatePowlNode(cyclicNode)).toThrow(/Cyclic partial order refused/);
  });

  it('detects unreachable nodes in choice graphs', () => {
    const unreachableNode: PowlNode = {
        type: 'choice_graph',
        id: 'root',
        start: 's',
        end: 'e',
        nodes: [
            { type: 'activity', id: 's', label: 'Start' },
            { type: 'activity', id: 'e', label: 'End' },
            { type: 'activity', id: 'orphan', label: 'Orphan' }
        ],
        edges: [
            { from: 's', to: 'e' }
        ]
    };
    expect(() => validatePowlNode(unreachableNode)).toThrow(/Choice graph node not on start-end path refused/);
  });
});
