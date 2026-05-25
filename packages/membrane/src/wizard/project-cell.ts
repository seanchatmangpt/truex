/**
 * @module project-cell
 * @description
 * Gall Classification: S11 Wizard Boundary
 * Purpose: Defines the fundamental ProjectConsequenceCell and Wizard execution context 
 * that bounds the 8-verb lifecycle.
 */

import type { BoundaryProjectCell } from '../ocel2-project-types.js';

export type WizardVerbKind = 'init' | 'map' | 'plan' | 'forge' | 'bind' | 'prove' | 'harden' | 'handoff';

export type WizardDecisionKind = 
  | "admit" 
  | "refuse" 
  | "rewrite" 
  | "queue" 
  | "rollback" 
  | "quarantine" 
  | "escalate";

export interface WizardDecision {
  id: string;
  kind: WizardDecisionKind;
  reason: string;
  timestamp: number;
}

export interface WizardContext {
  cwd: string;
  epoch: string;
  mode: 'local' | 'repo' | 'mission' | 'handoff';
  uuid: () => string;
  clock: () => number;
}

export interface ProjectConsequenceCell extends BoundaryProjectCell {
  intent: string;
  scope: string[];
  boundary: string[];
  admissibleVerbs: WizardVerbKind[];
  evidenceState: 'uninitialized' | 'initialized' | 'mapped' | 'planned' | 'forging' | 'forged' | 'bound' | 'proof_pending' | 'proven' | 'hardening' | 'hardened' | 'handoff_ready' | 'handed_off' | 'refused' | 'rolled_back' | 'quarantined' | 'tampered' | 'stalled' | 'rescue_candidate' | 'human_exception';
}

export interface WizardVerbAttempt {
  attemptId: string;
  verb: WizardVerbKind;
  cell: ProjectConsequenceCell;
  args: Record<string, any>;
}

export interface WizardVerb {
  kind: WizardVerbKind;
  attempt(ctx: WizardContext, cell: ProjectConsequenceCell, args: Record<string, any>): Promise<{
    decision: WizardDecision;
    nextCell: ProjectConsequenceCell;
    receiptHash?: string;
  }>;
}
