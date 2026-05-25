/**
 * @module map
 * @description
 * Gall Classification: S11 Wizard Verb
 * Purpose: Implements the `map` verb. Scans the workspace to build a project
 * topology linking objects (files) and relationships.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { hash } from '../../hash.js';
import type { WizardVerb, WizardVerbKind, WizardContext, ProjectConsequenceCell, WizardDecision } from '../project-cell.js';

export interface ProjectTopology {
  objects: Record<string, { type: string, size: number }>;
  relationships: Array<{ from: string, to: string, type: string }>;
  hash: string;
}

export class MapVerb implements WizardVerb {
  kind: WizardVerbKind = 'map';

  async attempt(ctx: WizardContext, cell: ProjectConsequenceCell, args: Record<string, any>): Promise<{
    decision: WizardDecision;
    nextCell: ProjectConsequenceCell;
    receiptHash?: string;
  }> {
    if (cell.evidenceState === 'uninitialized') {
       return {
          decision: {
            id: ctx.uuid(),
            kind: 'refuse',
            reason: 'Cannot map an uninitialized project cell',
            timestamp: ctx.clock()
          },
          nextCell: cell
       };
    }

    try {
      const truexDir = path.join(ctx.cwd, '.truex');
      const topology: ProjectTopology = { objects: {}, relationships: [], hash: '' };

      const scanDir = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.truex' || entry.name === 'dist') continue;
          
          const fullPath = path.join(dir, entry.name);
          const relPath = path.relative(ctx.cwd, fullPath);

          if (entry.isDirectory()) {
            scanDir(fullPath);
          } else {
             // Basic heuristic mapping
             let type = 'source_file';
             if (relPath.includes('.test.') || relPath.includes('.spec.')) type = 'test_file';
             if (relPath.includes('.md')) type = 'doc_file';
             if (relPath === 'package.json') type = 'dependency';

             const stat = fs.statSync(fullPath);
             topology.objects[relPath] = { type, size: stat.size };
          }
        }
      };

      scanDir(ctx.cwd);
      topology.hash = hash(topology.objects);

      fs.writeFileSync(path.join(truexDir, 'project.evidence', 'topology.json'), JSON.stringify(topology, null, 2));

      const nextCell: ProjectConsequenceCell = {
        ...cell,
        evidenceState: 'mapped'
      };

      fs.writeFileSync(path.join(truexDir, 'project.cell.json'), JSON.stringify(nextCell, null, 2));

      // Emit Receipt
      const receiptId = `receipt-map-${ctx.clock()}`;
      const receipt = {
        receipt_id: receiptId,
        verb: 'map',
        project_cell_id: cell.projectId,
        attempt_id: args.attemptId || ctx.uuid(),
        decision_id: `decision-${ctx.uuid()}`,
        parent_receipt_hash: args.parentReceiptHash || null,
        input_hash: hash(cell),
        output_hash: hash(nextCell),
        project_root_hash_before: topology.hash,
        project_root_hash_after: topology.hash,
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
          reason: 'Project mapped successfully',
          timestamp: ctx.clock()
        },
        nextCell,
        receiptHash
      };

    } catch (error_: any) {
      return {
        decision: {
          id: ctx.uuid(),
          kind: 'refuse',
          reason: `Failed to map project: ${error_.message}`,
          timestamp: ctx.clock()
        },
        nextCell: cell
      };
    }
  }
}
