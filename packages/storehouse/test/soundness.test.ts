import { describe, it, expect } from 'vitest';
import { 
  PowlExecutionEngine, 
  PowlChoiceGraph, 
  PowlNodeId, 
  HookedConsequenceAttempt,
  GallCheckpointRegistry,
  generateWorkflowHash
} from '../../membrane/src/powl-project-workflow.gall.js';

/**
 * Formal Invariants for the Stewardship Loop:
 * 
 * 1. LINEARITY: The sequence must follow field -> increase -> first_portion -> storehouse -> receiver -> receipt -> new_field.
 * 2. EXCLUSIVITY: At the 'increase' stage, a choice must be made between 'first_portion' (stewardship) and 'hoarding' (terminal failure).
 * 3. GENESIS: The 'first_portion' acts as the cryptographic anchor for the provision's transition from private increase to public stewardship.
 * 4. COMPLETION: No 'new_field' (Success) can be reached without an 'act_receipt' from an 'act_receiver'.
 * 5. TERMINALITY: 'Hoarding' leads to a terminal state ('act_end') that permits no further productive stewardship activities.
 */

describe('Storehouse Stewardship Soundness', () => {
  const storehouseWorkflow: PowlChoiceGraph = {
    type: 'choice_graph',
    id: 'stewardship_loop',
    start: 'act_field',
    end: 'act_end',
    nodes: [
      { type: 'activity', id: 'act_field' as PowlNodeId, label: 'field' },
      { type: 'activity', id: 'act_increase' as PowlNodeId, label: 'increase' },
      { type: 'activity', id: 'act_first_portion' as PowlNodeId, label: 'first_portion' },
      { type: 'activity', id: 'act_storehouse' as PowlNodeId, label: 'storehouse' },
      { type: 'activity', id: 'act_receiver' as PowlNodeId, label: 'receiver' },
      { type: 'activity', id: 'act_receipt' as PowlNodeId, label: 'receipt' },
      { type: 'activity', id: 'act_new_field' as PowlNodeId, label: 'new_field' },
      { type: 'activity', id: 'act_hoarding' as PowlNodeId, label: 'hoarding' },
      { type: 'silent', id: 'act_end' as PowlNodeId }
    ],
    edges: [
      { from: 'act_field' as PowlNodeId, to: 'act_increase' as PowlNodeId },
      { from: 'act_increase' as PowlNodeId, to: 'act_first_portion' as PowlNodeId, condition: 'stewardship' } as any,
      { from: 'act_increase' as PowlNodeId, to: 'act_hoarding' as PowlNodeId, condition: 'hoarding' } as any,
      { from: 'act_first_portion' as PowlNodeId, to: 'act_storehouse' as PowlNodeId },
      { from: 'act_storehouse' as PowlNodeId, to: 'act_receiver' as PowlNodeId },
      { from: 'act_receiver' as PowlNodeId, to: 'act_receipt' as PowlNodeId },
      { from: 'act_receipt' as PowlNodeId, to: 'act_new_field' as PowlNodeId },
      { from: 'act_new_field' as PowlNodeId, to: 'act_end' as PowlNodeId },
      { from: 'act_hoarding' as PowlNodeId, to: 'act_end' as PowlNodeId }
    ]
  };

  const createAttempt = (verb: string, outcome?: string): HookedConsequenceAttempt => ({
    id: Math.random().toString(36).substring(7),
    verb,
    target: {},
    args: [],
    timestamp: new Date().toISOString(),
    outcome
  });

  it('proves that Hoarding is a terminal sink state that is terminally refused', () => {
    const engine = new PowlExecutionEngine(storehouseWorkflow);
    
    // Valid path to hoarding
    expect(engine.validateAttempt(createAttempt('field'))).toBe(true);
    expect(engine.validateAttempt(createAttempt('increase', 'hoarding'))).toBe(true);
    expect(engine.validateAttempt(createAttempt('hoarding'))).toBe(true);
    
    // Once in hoarding, the only next step is act_end (silent), 
    // which the engine processes automatically.
    // Therefore, no more activities should be available.
    const currentVerbs = engine.getCurrentVerbs();
    expect(currentVerbs).toHaveLength(0);
    
    // Any further stewardship attempt must be refused
    expect(engine.validateAttempt(createAttempt('first_portion'))).toBe(false);
    expect(engine.validateAttempt(createAttempt('storehouse'))).toBe(false);
    expect(engine.validateAttempt(createAttempt('new_field'))).toBe(false);
  });

  it('verifies that the First Portion acts as the cryptographic genesis hash for the stewardship sequence', () => {
    const registry: GallCheckpointRegistry = {
      id: 'stewardship_v1',
      checkpoints: {
        act_field: { id: 'act_field', name: 'Field', proofCommand: 'p', accountingDomain: 'd', refusalCondition: 'r', handoffArtifact: 'a' },
        act_increase: { id: 'act_increase', name: 'Increase', proofCommand: 'p', accountingDomain: 'd', refusalCondition: 'r', handoffArtifact: 'a' },
        act_first_portion: { id: 'act_first_portion', name: 'First Portion', proofCommand: 'p', accountingDomain: 'd', refusalCondition: 'r', handoffArtifact: 'a' },
        act_storehouse: { id: 'act_storehouse', name: 'Storehouse', proofCommand: 'p', accountingDomain: 'd', refusalCondition: 'r', handoffArtifact: 'a' },
        act_receiver: { id: 'act_receiver', name: 'Receiver', proofCommand: 'p', accountingDomain: 'd', refusalCondition: 'r', handoffArtifact: 'a' },
        act_receipt: { id: 'act_receipt', name: 'Receipt', proofCommand: 'p', accountingDomain: 'd', refusalCondition: 'r', handoffArtifact: 'a' },
        act_new_field: { id: 'act_new_field', name: 'New Field', proofCommand: 'p', accountingDomain: 'd', refusalCondition: 'r', handoffArtifact: 'a' },
        act_hoarding: { id: 'act_hoarding', name: 'Hoarding', proofCommand: 'p', accountingDomain: 'd', refusalCondition: 'r', handoffArtifact: 'a' }
      },
      workflow: storehouseWorkflow
    };

    const initialHash = generateWorkflowHash(registry);
    
    // Modify the First Portion checkpoint - this should change the identity of the entire stewardship workflow
    const modifiedRegistry = JSON.parse(JSON.stringify(registry));
    modifiedRegistry.checkpoints.act_first_portion.proofCommand = 'npm run first-portion-genesis-proof';
    
    const modifiedHash = generateWorkflowHash(modifiedRegistry);
    expect(modifiedHash).not.toBe(initialHash);
    
    // The hash covers the checkpoint definitions, proving that 'first_portion''s formal 
    // definition is baked into the workflow's integrity.
  });

  it('proves that no provision can be promoted to Success (new_field) without an Appointed Receiver completion receipt', () => {
    const engine = new PowlExecutionEngine(storehouseWorkflow);
    
    // Progress through the loop
    expect(engine.validateAttempt(createAttempt('field'))).toBe(true);
    expect(engine.validateAttempt(createAttempt('increase', 'stewardship'))).toBe(true);
    expect(engine.validateAttempt(createAttempt('first_portion'))).toBe(true);
    expect(engine.validateAttempt(createAttempt('storehouse'))).toBe(true);
    
    // Attempting to jump to new_field without receiver/receipt
    expect(engine.validateAttempt(createAttempt('new_field'))).toBe(false);
    
    // Must go through receiver
    expect(engine.validateAttempt(createAttempt('receiver'))).toBe(true);
    
    // Still cannot reach new_field without receipt
    expect(engine.validateAttempt(createAttempt('new_field'))).toBe(false);
    
    // Complete receipt
    expect(engine.validateAttempt(createAttempt('receipt'))).toBe(true);
    
    // Now can promote to new_field
    expect(engine.validateAttempt(createAttempt('new_field'))).toBe(true);
    
    // Final state reached
    expect(engine.getCurrentVerbs()).toHaveLength(0);
  });
});
