import { describe, it, expect } from 'vitest';
import {
  validatePartialOrder,
  validateChoiceGraph,
  validateGallCheckpointWorkflow,
  getWizard8VerbWorkflow
} from '../../src/powl-project-workflow.gall.js';
import { 
  PowlPartialOrder, 
  PowlChoiceGraph, 
  PowlNodeId, 
  PowlNode, 
  GallCheckpoint, 
  ProjectPath 
} from '../../src/ocel2-project-types.js';

describe('POWL/Gall Workflow Domain (Agent 4)', () => {
  it('should accept acyclic partial orders and refuse cycles', () => {
    const validPO: PowlPartialOrder = {
      kind: 'partial_order',
      id: 'po1' as PowlNodeId,
      children: [
        { kind: 'activity', id: 'a' as PowlNodeId, label: 'A' },
        { kind: 'activity', id: 'b' as PowlNodeId, label: 'B' }
      ],
      order: [
        { before: 'a' as PowlNodeId, after: 'b' as PowlNodeId }
      ]
    };

    // Valid passes
    validatePartialOrder(validPO);

    const cyclicPO: PowlPartialOrder = {
      kind: 'partial_order',
      id: 'po2' as PowlNodeId,
      children: [
        { kind: 'activity', id: 'a' as PowlNodeId, label: 'A' },
        { kind: 'activity', id: 'b' as PowlNodeId, label: 'B' }
      ],
      order: [
        { before: 'a' as PowlNodeId, after: 'b' as PowlNodeId },
        { before: 'b' as PowlNodeId, after: 'a' as PowlNodeId }
      ]
    };

    // Cyclic throws cycle error
    expect(() => {
      validatePartialOrder(cyclicPO);
    }).toThrow(/Cycle detected/);
  });

  it('should validate choice graphs ensure paths from ▷ to □', () => {
    const validChoice: PowlChoiceGraph = {
      kind: 'choice_graph',
      id: 'c1' as PowlNodeId,
      children: [
        { kind: 'activity', id: 'a' as PowlNodeId, label: 'A' }
      ],
      edges: [
        { from: '▷', to: 'a' as PowlNodeId },
        { from: 'a' as PowlNodeId, to: '□' }
      ],
      start: '▷',
      end: '□'
    };

    validateChoiceGraph(validChoice);

    const invalidChoice: PowlChoiceGraph = {
      kind: 'choice_graph',
      id: 'c2' as PowlNodeId,
      children: [
        { kind: 'activity', id: 'a' as PowlNodeId, label: 'A' },
        { kind: 'activity', id: 'b' as PowlNodeId, label: 'B' }
      ],
      edges: [
        { from: '▷', to: 'a' as PowlNodeId },
        { from: 'a' as PowlNodeId, to: '□' }
        // Node b is orphaned (no edges to/from it)
      ],
      start: '▷',
      end: '□'
    };

    expect(() => {
      validateChoiceGraph(invalidChoice);
    }).toThrow(/is not on a path from start ▷ to end □/);
  });

  it('should validate checkpoint constraints and Wizard default workflow', () => {
    const wizardWorkflow = getWizard8VerbWorkflow();
    validateChoiceGraph(wizardWorkflow);
    expect(wizardWorkflow.children.length).toBe(8);

    const cp: GallCheckpoint = {
      id: 'cp1',
      name: 'Init cp',
      purpose: 'Checkpoint for testing purposes long enough',
      proofCommand: 'npm run test',
      accountingDomainId: 'acc_dom_1',
      successMetric: 'Pass',
      refusalCondition: 'Fail',
      expectedArtifacts: ['/tmp/art.json' as ProjectPath],
      expectedReports: [],
      workflow: { kind: 'activity', id: 'a1' as PowlNodeId, label: 'a' }
    };

    validateGallCheckpointWorkflow(cp);
  });
});
