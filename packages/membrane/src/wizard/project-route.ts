/**
 * @module project-route
 * @description
 * Gall Classification: S11 Wizard Boundary
 * Purpose: Defines the POWL8 Route Spine and Project Checkpoint structures for
 * the Wizard's planning phase.
 */

import type { WizardVerbKind } from './project-cell.js';

export type Powl8Operator = 'ACT' | 'CHOICE' | 'PARTIAL' | 'JOIN' | 'LOOP' | 'SILENT' | 'BLOCK' | 'EMIT';

export interface RouteCell {
  route_cell_id: string;
  operator: Powl8Operator;
  children: string[];
  blocked_alternatives?: string[];
  entry_condition?: string;
  exit_condition?: string;
  proof_obligation?: string;
  receipt_parent?: string;
}

export interface ProjectCheckpoint {
  checkpoint_id: string;
  objective: string;
  owned_files: string[];
  allowed_verbs: WizardVerbKind[];
  proof_command: string;
  failure_modes: string[];
  rollback_plan: string;
  receipt_parent: string | null;
  handoff_relevance: boolean;
  agent_assignment?: string;
}

export interface ProjectRoute {
  id: string;
  checkpoints: Record<string, ProjectCheckpoint>;
  route_spine: RouteCell[];
  created_at: number;
}
