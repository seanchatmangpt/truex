import { describe, it, expect } from 'vitest';
import {
  validatePartialOrder,
  validateChoiceGraph,
  validateGallCheckpointWorkflow,
  createWizardWorkflow,
  generateWorkflowHash,
  checkpointRegistryToPowl,
  type PowlPartialOrder,
  type PowlChoiceGraph,
  type GallCheckpoint
} from '../../src/powl-project-workflow.gall.js';

describe('POWL/Gall Workflow Types', () => {
  describe('Partial Order', () => {
    it('1. valid partial order accepted', () => {
      const order: PowlPartialOrder = {
        type: 'partial_order',
        id: 'po_1',
        nodes: [
          { type: 'activity', id: 'a1', label: 'A1' },
          { type: 'activity', id: 'a2', label: 'A2' }
        ],
        edges: [{ from: 'a1', to: 'a2' }]
      };
      expect(validatePartialOrder(order)).toBe(true);
    });

    it('2. cyclic partial order refused', () => {
      const order: PowlPartialOrder = {
        type: 'partial_order',
        id: 'po_2',
        nodes: [
          { type: 'activity', id: 'a1', label: 'A1' },
          { type: 'activity', id: 'a2', label: 'A2' }
        ],
        edges: [
          { from: 'a1', to: 'a2' },
          { from: 'a2', to: 'a1' }
        ]
      };
      expect(() => validatePartialOrder(order)).toThrow(/Cyclic partial order refused/);
    });

    it('3. missing partial order endpoint refused', () => {
      const order: PowlPartialOrder = {
        type: 'partial_order',
        id: 'po_3',
        nodes: [
          { type: 'activity', id: 'a1', label: 'A1' }
        ],
        edges: [{ from: 'a1', to: 'a2' }]
      };
      expect(() => validatePartialOrder(order)).toThrow(/Partial order edge endpoint missing: a1 -> a2/);
    });
  });

  describe('Choice Graph', () => {
    it('4. valid choice graph accepted', () => {
      const graph: PowlChoiceGraph = {
        type: 'choice_graph',
        id: 'cg_1',
        start: 'a1',
        end: 'a2',
        nodes: [
          { type: 'activity', id: 'a1', label: 'A1' },
          { type: 'activity', id: 'a2', label: 'A2' }
        ],
        edges: [{ from: 'a1', to: 'a2' }]
      };
      expect(validateChoiceGraph(graph)).toBe(true);
    });

    it('5. choice graph node not on start-end path refused', () => {
      const graph: PowlChoiceGraph = {
        type: 'choice_graph',
        id: 'cg_2',
        start: 'a1',
        end: 'a2',
        nodes: [
          { type: 'activity', id: 'a1', label: 'A1' },
          { type: 'activity', id: 'a2', label: 'A2' },
          { type: 'activity', id: 'a3', label: 'A3 (orphan)' }
        ],
        edges: [{ from: 'a1', to: 'a2' }]
      };
      expect(() => validateChoiceGraph(graph)).toThrow(/Choice graph node not on start-end path refused: a3/);
    });
  });

  describe('Gall Checkpoints', () => {
    const validCheckpoint: GallCheckpoint = {
      id: 'cp_1',
      name: 'Valid',
      proofCommand: 'test',
      accountingDomain: 'domain',
      refusalCondition: 'refuse',
      handoffArtifact: 'artifact'
    };

    it('6. checkpoint without proof command refused', () => {
      const cp = { ...validCheckpoint, proofCommand: '' };
      expect(() => validateGallCheckpointWorkflow(cp)).toThrow(/Checkpoint without proof command refused/);
    });

    it('7. checkpoint without accounting domain refused', () => {
      const cp = { ...validCheckpoint, accountingDomain: '' };
      expect(() => validateGallCheckpointWorkflow(cp)).toThrow(/Checkpoint without accounting domain refused/);
    });
  });

  describe('Wizard Workflow', () => {
    it('8. Wizard 8-verb workflow validates', () => {
      const registry = createWizardWorkflow();
      expect(checkpointRegistryToPowl(registry)).toBeDefined();
    });

    it('9. failed proof route points to harden/repair/refuse', () => {
      const registry = createWizardWorkflow();
      const workflow = registry.workflow as PowlPartialOrder;
      const proveChoice = workflow.nodes.find(n => n.id === 'prove_choice') as PowlChoiceGraph;
      
      const toHarden = proveChoice.edges.some(e => e.from === 'cp_prove' && e.to === 'cp_harden');
      const toRefuse = proveChoice.edges.some(e => e.from === 'cp_prove' && e.to === 'cp_refuse');
      
      expect(toHarden).toBe(true);
      expect(toRefuse).toBe(true);
    });

    it('10. registry projection produces stable workflow hash', () => {
      const registry1 = createWizardWorkflow();
      const registry2 = createWizardWorkflow();
      
      const hash1 = generateWorkflowHash(registry1);
      const hash2 = generateWorkflowHash(registry2);
      
      expect(hash1).toBe(hash2);
      expect(hash1.length).toBeGreaterThan(0);
    });
  });
});
