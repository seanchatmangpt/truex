/**
 * @module plan
 * @description
 * Gall Classification: S11 Wizard Verb
 * Purpose: Implements the `plan` verb. Converts topology into an admissible 
 * project route using POWL8 structures (concurrency, choices).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { hash } from '../../hash.js';
import type { WizardVerb, WizardVerbKind, WizardContext, ProjectConsequenceCell, WizardDecision } from '../project-cell.js';
import type { ProjectRoute, ProjectCheckpoint, RouteCell } from '../project-route.js';

export class PlanVerb implements WizardVerb {
  kind: WizardVerbKind = 'plan';

  async attempt(ctx: WizardContext, cell: ProjectConsequenceCell, args: Record<string, any>): Promise<{
    decision: WizardDecision;
    nextCell: ProjectConsequenceCell;
    receiptHash?: string;
  }> {
    if (cell.evidenceState !== 'mapped') {
       return {
          decision: {
            id: ctx.uuid(),
            kind: 'refuse',
            reason: 'Cannot plan unless the project is mapped',
            timestamp: ctx.clock()
          },
          nextCell: cell
       };
    }

    try {
      const truexDir = path.join(ctx.cwd, '.truex');
      const evidenceDir = path.join(truexDir, 'project.evidence');
      const topologyFile = path.join(evidenceDir, 'topology.json');

      if (!fs.existsSync(topologyFile)) {
         throw new Error('Topology file not found. Run map first.');
      }

      const topology = JSON.parse(fs.readFileSync(topologyFile, 'utf-8'));
      
      if (!args.goal || cell.boundary.length === 0 && !args.goal) {
         return {
            decision: {
               id: ctx.uuid(),
               kind: 'refuse',
               reason: 'goal lacks project boundary',
               timestamp: ctx.clock()
            },
            nextCell: cell
         };
      }

      // Generate a basic route and checkpoint
      const checkpointId = `cp-${ctx.uuid()}`;
      const checkpoint: ProjectCheckpoint = {
        checkpoint_id: checkpointId,
        objective: args.goal || 'Complete task',
        owned_files: Object.keys(topology.objects),
        allowed_verbs: ['forge', 'bind', 'prove', 'harden'],
        proof_command: 'npx vitest run',
        failure_modes: ['timeout', 'assertion_failed'],
        rollback_plan: 'git checkout HEAD -- .',
        receipt_parent: args.parentReceiptHash || null,
        handoff_relevance: true,
        agent_assignment: 'agent-1'
      };

      const routeCell: RouteCell = {
        route_cell_id: `rc-${ctx.uuid()}`,
        operator: 'ACT',
        children: [checkpointId],
        blocked_alternatives: [],
        entry_condition: 'mapped',
        exit_condition: 'proven',
        proof_obligation: 'npx vitest run'
      };

      const route: ProjectRoute = {
        id: `route-${ctx.uuid()}`,
        checkpoints: { [checkpointId]: checkpoint },
        route_spine: [routeCell],
        created_at: ctx.clock()
      };

      fs.writeFileSync(path.join(evidenceDir, 'plan.json'), JSON.stringify(route, null, 2));

      const nextCell: ProjectConsequenceCell = {
        ...cell,
        evidenceState: 'planned'
      };

      fs.writeFileSync(path.join(truexDir, 'project.cell.json'), JSON.stringify(nextCell, null, 2));

      // Emit Receipt
      const receiptId = `receipt-plan-${ctx.clock()}`;
      const receipt = {
        receipt_id: receiptId,
        verb: 'plan',
        project_cell_id: cell.projectId,
        attempt_id: args.attemptId || ctx.uuid(),
        decision_id: `decision-${ctx.uuid()}`,
        parent_receipt_hash: args.parentReceiptHash || null,
        input_hash: hash(cell),
        output_hash: hash(nextCell),
        project_root_hash_before: topology.hash,
        project_root_hash_after: topology.hash, // Plan shouldn't change the actual source files
        mailbox_transition_id: null,
        replay_fixture_id: null,
        accounting_entry_id: null,
        created_at_monotonic: ctx.clock()
      };

      const receiptHash = hash(receipt);
      fs.writeFileSync(path.join(truexDir, 'project.receipts', `${receiptHash}.json`), JSON.stringify(receipt, null, 2));

      return {
        decision: {
          id: receipt.decision_id,
          kind: 'admit',
          reason: 'Project route planned successfully',
          timestamp: ctx.clock()
        },
        nextCell,
        receiptHash
      };

    } catch (e: any) {
      return {
        decision: {
          id: ctx.uuid(),
          kind: 'refuse',
          reason: `Failed to plan project: ${e.message}`,
          timestamp: ctx.clock()
        },
        nextCell: cell
      };
    }
  }
}
