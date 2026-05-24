/**
 * @module PowlProjectWorkflow
 * @description
 * Gall Classification: Gall S12 (POWL 2.0 Workflow Engine)
 * Purpose: Models and validates POWL workflows and Gall checkpoints.
 */

import {
  PowlNode,
  PowlNodeId,
  PowlPartialOrder,
  PowlChoiceGraph,
  GallCheckpoint,
  ProjectPath
} from './ocel2-project-types.js';

export function validatePartialOrder(node: PowlPartialOrder): void {
  const childIds = new Set(node.children.map(c => c.id));
  
  // 1. Check endpoints exist
  for (const edge of node.order) {
    if (!childIds.has(edge.before) || !childIds.has(edge.after)) {
      throw new Error(`Edge endpoints must exist within children: ${edge.before} -> ${edge.after}`);
    }
  }

  // 2. Cycle detection (Acyclic check)
  const adj = new Map<string, string[]>();
  for (const edge of node.order) {
    const list = adj.get(edge.before as string) || [];
    list.push(edge.after as string);
    adj.set(edge.before as string, list);
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();

  function dfs(v: string): boolean {
    visited.add(v);
    recStack.add(v);
    
    const neighbors = adj.get(v) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }
    
    recStack.delete(v);
    return false;
  }

  for (const childId of childIds) {
    if (!visited.has(childId as string)) {
      if (dfs(childId as string)) {
        throw new Error(`POWL validation failed: Cycle detected in partial order graph.`);
      }
    }
  }
}

export function validateChoiceGraph(node: PowlChoiceGraph): void {
  // Must have one start "▷" and one end "□"
  if (node.start !== '▷' || node.end !== '□') {
    throw new Error('Choice graph must have exactly start ▷ and end □');
  }

  const nodeIds = new Set<string>(node.children.map(c => c.id as string));
  nodeIds.add('▷');
  nodeIds.add('□');

  // Verify all edges connect valid nodes
  for (const edge of node.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      throw new Error(`Choice graph edge endpoints must exist: ${edge.from} -> ${edge.to}`);
    }
  }

  // A choice graph node must lie on a path from ▷ to □.
  // We can verify this by running reachability checks.
  const forwardAdj = new Map<string, string[]>();
  const backwardAdj = new Map<string, string[]>();

  for (const edge of node.edges) {
    const fList = forwardAdj.get(edge.from) || [];
    fList.push(edge.to);
    forwardAdj.set(edge.from, fList);

    const bList = backwardAdj.get(edge.to) || [];
    bList.push(edge.from);
    backwardAdj.set(edge.to, bList);
  }

  // Reachable from start ▷
  const reachableFromStart = new Set<string>();
  function dfsForward(v: string) {
    reachableFromStart.add(v);
    for (const n of forwardAdj.get(v) || []) {
      if (!reachableFromStart.has(n)) dfsForward(n);
    }
  }
  dfsForward('▷');

  // Can reach end □
  const canReachEnd = new Set<string>();
  function dfsBackward(v: string) {
    canReachEnd.add(v);
    for (const n of backwardAdj.get(v) || []) {
      if (!canReachEnd.has(n)) dfsBackward(n);
    }
  }
  dfsBackward('□');

  for (const nodeId of nodeIds) {
    if (!reachableFromStart.has(nodeId) || !canReachEnd.has(nodeId)) {
      throw new Error(`Choice graph node "${nodeId}" is not on a path from start ▷ to end □`);
    }
  }
}

export function validateGallCheckpointWorkflow(checkpoint: GallCheckpoint): void {
  if (!checkpoint.id || !checkpoint.name || !checkpoint.purpose) {
    throw new Error('Checkpoint is vague: missing id, name or purpose');
  }
  if (!checkpoint.proofCommand || checkpoint.proofCommand.trim().length < 5) {
    throw new Error('Checkpoint must have valid proof command');
  }
  if (!checkpoint.accountingDomainId || checkpoint.accountingDomainId.trim().length < 5) {
    throw new Error('Checkpoint must have valid accounting domain');
  }
  if (!checkpoint.successMetric || !checkpoint.refusalCondition) {
    throw new Error('Checkpoint must specify success metrics and refusal conditions');
  }
  if (!checkpoint.expectedArtifacts || checkpoint.expectedArtifacts.length === 0) {
    throw new Error('Checkpoint must have handoff expected artifacts');
  }
}

/**
 * Projects a checkpoint registry to a POWL choice graph/partial order node.
 */
export function checkpointRegistryToPowl(checkpoints: GallCheckpoint[]): PowlNode {
  return {
    kind: 'partial_order',
    id: 'powl_registry_root' as PowlNodeId,
    children: checkpoints.map(cp => cp.workflow),
    order: []
  };
}

/**
 * Returns the default POWL workflow node for the 8 Wizard verbs.
 */
export function getWizard8VerbWorkflow(): PowlChoiceGraph {
  const children: PowlNode[] = [
    { kind: 'activity', id: 'act_init' as PowlNodeId, label: 'init' },
    { kind: 'activity', id: 'act_map' as PowlNodeId, label: 'map' },
    { kind: 'activity', id: 'act_plan' as PowlNodeId, label: 'plan' },
    { kind: 'activity', id: 'act_forge' as PowlNodeId, label: 'forge' },
    { kind: 'activity', id: 'act_bind' as PowlNodeId, label: 'bind' },
    { kind: 'activity', id: 'act_prove' as PowlNodeId, label: 'prove' },
    { kind: 'activity', id: 'act_harden' as PowlNodeId, label: 'harden' },
    { kind: 'activity', id: 'act_handoff' as PowlNodeId, label: 'handoff' }
  ];

  return {
    kind: 'choice_graph',
    id: 'wizard_8_verb_powl' as PowlNodeId,
    children,
    edges: [
      { from: '▷', to: 'act_init' as PowlNodeId },
      { from: 'act_init' as PowlNodeId, to: 'act_map' as PowlNodeId },
      { from: 'act_map' as PowlNodeId, to: 'act_plan' as PowlNodeId },
      { from: 'act_plan' as PowlNodeId, to: 'act_forge' as PowlNodeId },
      { from: 'act_forge' as PowlNodeId, to: 'act_bind' as PowlNodeId },
      { from: 'act_bind' as PowlNodeId, to: 'act_prove' as PowlNodeId },
      { from: 'act_prove' as PowlNodeId, to: 'act_harden' as PowlNodeId },
      { from: 'act_harden' as PowlNodeId, to: 'act_handoff' as PowlNodeId },
      { from: 'act_handoff' as PowlNodeId, to: '□' }
    ],
    start: '▷',
    end: '□'
  };
}
