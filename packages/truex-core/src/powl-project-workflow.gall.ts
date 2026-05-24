import { createHash } from 'crypto';

export type PowlNodeId = string;

export interface PowlActivity {
  type: 'activity';
  id: PowlNodeId;
  label: string;
}

export interface PowlSilent {
  type: 'silent';
  id: PowlNodeId;
}

export interface PowlOrderEdge {
  from: PowlNodeId;
  to: PowlNodeId;
}

export interface PowlPartialOrder {
  type: 'partial_order';
  id: PowlNodeId;
  nodes: PowlNode[];
  edges: PowlOrderEdge[];
}

export interface PowlChoiceEdge {
  from: PowlNodeId;
  to: PowlNodeId;
  condition?: string;
}

export interface PowlChoiceGraph {
  type: 'choice_graph';
  id: PowlNodeId;
  start: PowlNodeId;
  end: PowlNodeId;
  nodes: PowlNode[];
  edges: PowlChoiceEdge[];
}

export type PowlNode =
  | PowlActivity
  | PowlSilent
  | PowlPartialOrder
  | PowlChoiceGraph;

export interface GallCheckpoint {
  id: string;
  name: string;
  proofCommand: string;
  accountingDomain: string;
  refusalCondition: string;
  handoffArtifact: string;
}

export interface GallCheckpointEdge {
  from: string;
  to: string;
}

export interface GallCheckpointChoice {
  from: string;
  to: string;
  condition?: string;
}

export interface GallCheckpointWorkflow {
  id: string;
  checkpoints: GallCheckpoint[];
  edges: GallCheckpointEdge[];
  choices: GallCheckpointChoice[];
}

export interface GallCheckpointRegistry {
  id: string;
  checkpoints: Record<string, GallCheckpoint>;
  workflow: PowlNode;
}

export function validatePartialOrder(node: PowlPartialOrder): boolean {
  const nodeIds = new Set(node.nodes.map((n) => n.id));

  for (const edge of node.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      throw new Error(`Partial order edge endpoint missing: ${edge.from} -> ${edge.to}`);
    }
  }

  // Check for cycles using DFS
  const adj = new Map<string, string[]>();
  for (const id of nodeIds) adj.set(id, []);
  for (const edge of node.edges) {
    adj.get(edge.from)!.push(edge.to);
  }

  const visited = new Set<string>();
  const stack = new Set<string>();

  function hasCycle(curr: string): boolean {
    visited.add(curr);
    stack.add(curr);

    for (const neighbor of adj.get(curr) || []) {
      if (!visited.has(neighbor)) {
        if (hasCycle(neighbor)) return true;
      } else if (stack.has(neighbor)) {
        return true; // cycle detected
      }
    }

    stack.delete(curr);
    return false;
  }

  for (const id of nodeIds) {
    if (!visited.has(id)) {
      if (hasCycle(id)) {
        throw new Error('Cyclic partial order refused.');
      }
    }
  }

  return true;
}

export function validateChoiceGraph(node: PowlChoiceGraph): boolean {
  const nodeIds = new Set(node.nodes.map((n) => n.id));

  if (!nodeIds.has(node.start)) {
    throw new Error(`Choice graph start node not found: ${node.start}`);
  }
  if (!nodeIds.has(node.end)) {
    throw new Error(`Choice graph end node not found: ${node.end}`);
  }

  // Every node must be on a path from start to end.
  // 1. BFS/DFS from start.
  // 2. BFS/DFS from end (reversed edges).
  const forwardAdj = new Map<string, string[]>();
  const reverseAdj = new Map<string, string[]>();
  for (const id of nodeIds) {
    forwardAdj.set(id, []);
    reverseAdj.set(id, []);
  }

  for (const edge of node.edges) {
    if (forwardAdj.has(edge.from)) forwardAdj.get(edge.from)!.push(edge.to);
    if (reverseAdj.has(edge.to)) reverseAdj.get(edge.to)!.push(edge.from);
  }

  const reachableFromStart = new Set<string>();
  const startQueue = [node.start];
  reachableFromStart.add(node.start);
  while (startQueue.length > 0) {
    const curr = startQueue.shift()!;
    for (const next of forwardAdj.get(curr) || []) {
      if (!reachableFromStart.has(next)) {
        reachableFromStart.add(next);
        startQueue.push(next);
      }
    }
  }

  const reachesEnd = new Set<string>();
  const endQueue = [node.end];
  reachesEnd.add(node.end);
  while (endQueue.length > 0) {
    const curr = endQueue.shift()!;
    for (const prev of reverseAdj.get(curr) || []) {
      if (!reachesEnd.has(prev)) {
        reachesEnd.add(prev);
        endQueue.push(prev);
      }
    }
  }

  for (const id of nodeIds) {
    if (!reachableFromStart.has(id) || !reachesEnd.has(id)) {
      throw new Error(`Choice graph node not on start-end path refused: ${id}`);
    }
  }

  return true;
}

export function validateGallCheckpointWorkflow(checkpoint: GallCheckpoint): boolean {
  if (!checkpoint.proofCommand) {
    throw new Error(`Checkpoint without proof command refused: ${checkpoint.id}`);
  }
  if (!checkpoint.accountingDomain) {
    throw new Error(`Checkpoint without accounting domain refused: ${checkpoint.id}`);
  }
  if (!checkpoint.refusalCondition) {
    throw new Error(`Checkpoint without refusal condition refused: ${checkpoint.id}`);
  }
  if (!checkpoint.handoffArtifact) {
    throw new Error(`Checkpoint without handoff artifact refused: ${checkpoint.id}`);
  }
  return true;
}

export function checkpointRegistryToPowl(registry: GallCheckpointRegistry): PowlNode {
  // Validate all checkpoints in the registry
  for (const cp of Object.values(registry.checkpoints)) {
    validateGallCheckpointWorkflow(cp);
  }

  // Ensure the top-level node validates based on its type
  validatePowlNode(registry.workflow);

  return registry.workflow;
}

function validatePowlNode(node: PowlNode) {
  if (node.type === 'partial_order') {
    validatePartialOrder(node);
    for (const child of node.nodes) validatePowlNode(child);
  } else if (node.type === 'choice_graph') {
    validateChoiceGraph(node);
    for (const child of node.nodes) validatePowlNode(child);
  }
}

export function generateWorkflowHash(registry: GallCheckpointRegistry): string {
  const sortedCheckpoints = Object.values(registry.checkpoints)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cp => `${cp.id}:${cp.proofCommand}:${cp.accountingDomain}:${cp.refusalCondition}:${cp.handoffArtifact}`)
    .join('|');
  
  const workflowStr = JSON.stringify(registry.workflow);
  
  return createHash('sha256')
    .update(`${registry.id}|${sortedCheckpoints}|${workflowStr}`)
    .digest('hex');
}

export function createWizardWorkflow(): GallCheckpointRegistry {
  const init: GallCheckpoint = {
    id: 'cp_init', name: 'Init',
    proofCommand: 'npm run init-proof', accountingDomain: 'budget_init',
    refusalCondition: 'invalid project spec', handoffArtifact: 'spec.json'
  };
  const map: GallCheckpoint = {
    id: 'cp_map', name: 'Map',
    proofCommand: 'npm run map-proof', accountingDomain: 'budget_map',
    refusalCondition: 'mapping failure', handoffArtifact: 'map.json'
  };
  const plan: GallCheckpoint = {
    id: 'cp_plan', name: 'Plan',
    proofCommand: 'npm run plan-proof', accountingDomain: 'budget_plan',
    refusalCondition: 'planning failure', handoffArtifact: 'plan.json'
  };
  const forge: GallCheckpoint = {
    id: 'cp_forge', name: 'Forge',
    proofCommand: 'npm run forge-proof', accountingDomain: 'budget_forge',
    refusalCondition: 'forge failure', handoffArtifact: 'forge_output'
  };
  const bind: GallCheckpoint = {
    id: 'cp_bind', name: 'Bind',
    proofCommand: 'npm run bind-proof', accountingDomain: 'budget_bind',
    refusalCondition: 'bind failure', handoffArtifact: 'bindings.json'
  };
  const prove: GallCheckpoint = {
    id: 'cp_prove', name: 'Prove',
    proofCommand: 'npm run prove-proof', accountingDomain: 'budget_prove',
    refusalCondition: 'prove failure', handoffArtifact: 'proof.json'
  };
  const harden: GallCheckpoint = {
    id: 'cp_harden', name: 'Harden',
    proofCommand: 'npm run harden-proof', accountingDomain: 'budget_harden',
    refusalCondition: 'harden failure', handoffArtifact: 'harden.json'
  };
  const refuse: GallCheckpoint = {
    id: 'cp_refuse', name: 'Refuse',
    proofCommand: 'npm run refuse-proof', accountingDomain: 'budget_refuse',
    refusalCondition: 'irrecoverable failure', handoffArtifact: 'refuse.json'
  };
  const handoff: GallCheckpoint = {
    id: 'cp_handoff', name: 'Handoff',
    proofCommand: 'npm run handoff-proof', accountingDomain: 'budget_handoff',
    refusalCondition: 'handoff failure', handoffArtifact: 'handoff.json'
  };

  const workflow: PowlPartialOrder = {
    type: 'partial_order',
    id: 'wizard_workflow',
    nodes: [
      { type: 'activity', id: 'cp_init', label: 'Init' },
      { type: 'activity', id: 'cp_map', label: 'Map' },
      { type: 'activity', id: 'cp_plan', label: 'Plan' },
      {
        type: 'partial_order',
        id: 'concurrent_forge_bind',
        nodes: [
          { type: 'activity', id: 'cp_forge', label: 'Forge' },
          { type: 'activity', id: 'cp_bind', label: 'Bind' }
        ],
        edges: [] // concurrent
      },
      {
        type: 'choice_graph',
        id: 'prove_choice',
        start: 'cp_prove',
        end: 'prove_end_silent',
        nodes: [
          { type: 'activity', id: 'cp_prove', label: 'Prove' },
          { type: 'activity', id: 'cp_harden', label: 'Harden' },
          { type: 'activity', id: 'cp_refuse', label: 'Refuse' },
          { type: 'silent', id: 'prove_end_silent' }
        ],
        edges: [
          { from: 'cp_prove', to: 'prove_end_silent', condition: 'success' },
          { from: 'cp_prove', to: 'cp_harden', condition: 'fail_recoverable' },
          { from: 'cp_harden', to: 'cp_prove' }, // loop back
          { from: 'cp_prove', to: 'cp_refuse', condition: 'fail_irrecoverable' },
          { from: 'cp_refuse', to: 'prove_end_silent' } // converge
        ]
      },
      { type: 'activity', id: 'cp_handoff', label: 'Handoff' }
    ],
    edges: [
      { from: 'cp_init', to: 'cp_map' },
      { from: 'cp_map', to: 'cp_plan' },
      { from: 'cp_plan', to: 'concurrent_forge_bind' },
      { from: 'concurrent_forge_bind', to: 'prove_choice' },
      { from: 'prove_choice', to: 'cp_handoff' }
    ]
  };

  return {
    id: 'wizard_v1',
    checkpoints: {
      cp_init: init,
      cp_map: map,
      cp_plan: plan,
      cp_forge: forge,
      cp_bind: bind,
      cp_prove: prove,
      cp_harden: harden,
      cp_refuse: refuse,
      cp_handoff: handoff
    },
    workflow
  };
}

export function getWizard8VerbWorkflow(): PowlChoiceGraph {
  const nodes: PowlNode[] = [
    { type: 'activity', id: 'act_init' as PowlNodeId, label: 'init' },
    { type: 'activity', id: 'act_map' as PowlNodeId, label: 'map' },
    { type: 'activity', id: 'act_plan' as PowlNodeId, label: 'plan' },
    { type: 'activity', id: 'act_forge' as PowlNodeId, label: 'forge' },
    { type: 'activity', id: 'act_bind' as PowlNodeId, label: 'bind' },
    { type: 'activity', id: 'act_prove' as PowlNodeId, label: 'prove' },
    { type: 'activity', id: 'act_harden' as PowlNodeId, label: 'harden' },
    { type: 'activity', id: 'act_handoff' as PowlNodeId, label: 'handoff' }
  ];

  return {
    type: 'choice_graph',
    id: 'wizard_8_verb_powl' as PowlNodeId,
    nodes,
    edges: [
      { from: 'act_init' as PowlNodeId, to: 'act_map' as PowlNodeId },
      { from: 'act_map' as PowlNodeId, to: 'act_plan' as PowlNodeId },
      { from: 'act_plan' as PowlNodeId, to: 'act_forge' as PowlNodeId },
      { from: 'act_forge' as PowlNodeId, to: 'act_bind' as PowlNodeId },
      { from: 'act_bind' as PowlNodeId, to: 'act_prove' as PowlNodeId },
      { from: 'act_prove' as PowlNodeId, to: 'act_harden' as PowlNodeId },
      { from: 'act_harden' as PowlNodeId, to: 'act_handoff' as PowlNodeId }
    ],
    start: 'act_init' as PowlNodeId,
    end: 'act_handoff' as PowlNodeId
  };
}

