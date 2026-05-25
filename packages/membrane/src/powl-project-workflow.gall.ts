import { createHash } from 'node:crypto';

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
    if (!visited.has(id) && hasCycle(id)) {
        throw new Error('Cyclic partial order refused.');
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

export function validatePowlNode(node: PowlNode) {
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

export function getTelco8VerbWorkflow(): PowlChoiceGraph {
  const nodes: PowlNode[] = [
    { type: 'activity', id: 'act_listen' as PowlNodeId, label: 'listen' },
    { type: 'activity', id: 'act_dial' as PowlNodeId, label: 'dial' },
    { type: 'activity', id: 'act_handshake' as PowlNodeId, label: 'handshake' },
    { type: 'activity', id: 'act_encode' as PowlNodeId, label: 'encode' },
    { type: 'activity', id: 'act_route' as PowlNodeId, label: 'route' },
    { type: 'activity', id: 'act_transmit' as PowlNodeId, label: 'transmit' },
    { type: 'activity', id: 'act_verify' as PowlNodeId, label: 'verify' },
    { type: 'activity', id: 'act_settle' as PowlNodeId, label: 'settle' }
  ];

  return {
    type: 'choice_graph',
    id: 'telco_8_verb_powl' as PowlNodeId,
    nodes,
    edges: [
      { from: 'act_listen' as PowlNodeId, to: 'act_dial' as PowlNodeId },
      { from: 'act_dial' as PowlNodeId, to: 'act_handshake' as PowlNodeId },
      { from: 'act_handshake' as PowlNodeId, to: 'act_encode' as PowlNodeId },
      { from: 'act_encode' as PowlNodeId, to: 'act_route' as PowlNodeId },
      { from: 'act_route' as PowlNodeId, to: 'act_transmit' as PowlNodeId },
      { from: 'act_transmit' as PowlNodeId, to: 'act_verify' as PowlNodeId },
      { from: 'act_verify' as PowlNodeId, to: 'act_settle' as PowlNodeId }
    ],
    start: 'act_listen' as PowlNodeId,
    end: 'act_settle' as PowlNodeId
  };
}

export interface HookedConsequenceAttempt {
  id: string;
  verb: string;
  target: any;
  args: any[];
  timestamp: string;
}

export class PowlExecutionEngine {
  private currentMask: bigint = 0n;
  private nodeToIndex: Map<PowlNodeId, number> = new Map();
  private indexToNode: Map<number, PowlNode> = new Map();
  private transitionMatrix: bigint[] = [];
  private verbToMask: Map<string, bigint> = new Map();
  private silentMask: bigint = 0n;

  constructor(private workflow: PowlNode) {
    this.flatten(workflow);
    this.transitionMatrix = new Array(this.nodeToIndex.size).fill(0n);
    this.buildTransitions(workflow);
    this.initialize();
  }

  private flatten(node: PowlNode) {
    if (!this.nodeToIndex.has(node.id)) {
      const index = this.nodeToIndex.size;
      this.nodeToIndex.set(node.id, index);
      this.indexToNode.set(index, node);
      
      if (node.type === 'activity') {
        const mask = this.verbToMask.get(node.label) || 0n;
        this.verbToMask.set(node.label, mask | (1n << BigInt(index)));
      } else if (node.type === 'silent') {
        this.silentMask |= (1n << BigInt(index));
      }
      
      if (node.type === 'partial_order' || node.type === 'choice_graph') {
        for (const child of node.nodes) {
          this.flatten(child);
        }
      }
    }
  }

  private buildTransitions(node: PowlNode) {
    if (node.type === 'choice_graph' || node.type === 'partial_order') {
      for (const edge of node.edges) {
        const fromIdx = this.nodeToIndex.get(edge.from)!;
        const toIdx = this.nodeToIndex.get(edge.to)!;
        this.transitionMatrix[fromIdx] |= (1n << BigInt(toIdx));
      }
      for (const child of node.nodes) {
        this.buildTransitions(child);
      }
    }
  }

  private initialize() {
    if (this.workflow.type === 'choice_graph') {
      const idx = this.nodeToIndex.get(this.workflow.start)!;
      this.currentMask |= (1n << BigInt(idx));
    } else if (this.workflow.type === 'partial_order') {
      const targets = new Set(this.workflow.edges.map(e => e.to));
      for (const node of this.workflow.nodes) {
        if (!targets.has(node.id)) {
          const idx = this.nodeToIndex.get(node.id)!;
          this.currentMask |= (1n << BigInt(idx));
        }
      }
    }
    this.handleSilentTransitions();
  }

  public validateAttempt(attempt: HookedConsequenceAttempt): boolean {
    const verbMask = this.verbToMask.get(attempt.verb) || 0n;
    const activeVerbNodes = this.currentMask & verbMask;

    // Branchless bit manipulation: if activeVerbNodes is non-zero, it means valid transition
    const isValid = activeVerbNodes !== 0n;
    
    if (isValid) {
      // Transition: For each active node of this verb, move to its next nodes
      let temp = activeVerbNodes;
      while (temp !== 0n) {
        const lsb = temp & -temp;
        const idx = this.getBitIndex(lsb);
        this.currentMask &= ~lsb;
        this.currentMask |= this.transitionMatrix[idx];
        temp ^= lsb;
      }
      this.handleSilentTransitions();
    }
    
    return isValid;
  }

  private getBitIndex(lsb: bigint): number {
    return lsb.toString(2).length - 1;
  }

  private handleSilentTransitions() {
    let changed = true;
    while (changed) {
      const activeSilent = this.currentMask & this.silentMask;
      if (activeSilent === 0n) {
        changed = false;
      } else {
        const lsb = activeSilent & -activeSilent;
        const idx = this.getBitIndex(lsb);
        this.currentMask &= ~lsb;
        this.currentMask |= this.transitionMatrix[idx];
        changed = true;
      }
    }
  }
  
  public getCurrentVerbs(): string[] {
    const verbs: string[] = [];
    let temp = this.currentMask;
    while (temp !== 0n) {
      const lsb = temp & -temp;
      const idx = this.getBitIndex(lsb);
      const node = this.indexToNode.get(idx);
      if (node && node.type === 'activity') {
        verbs.push(node.label);
      }
      temp ^= lsb;
    }
    return verbs;
  }
}

