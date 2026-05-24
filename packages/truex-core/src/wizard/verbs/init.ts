/**
 * @module init
 * @description
 * Gall Classification: S11 Wizard Verb
 * Purpose: Implements the `init` verb. Creates a bounded project cell, establishes
 * the `.truex` directory structure, and emits the genesis receipt.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { hash } from '../../hash.js';
import type { WizardVerb, WizardVerbKind, WizardContext, ProjectConsequenceCell, WizardDecision, WizardVerbAttempt } from '../project-cell.js';

export class InitVerb implements WizardVerb {
  kind: WizardVerbKind = 'init';

  async attempt(ctx: WizardContext, cell: ProjectConsequenceCell, args: Record<string, any>): Promise<{
    decision: WizardDecision;
    nextCell: ProjectConsequenceCell;
    receiptHash?: string;
  }> {
    try {
      const truexDir = path.join(ctx.cwd, '.truex');
      const dirsToCreate = [
        'project.receipts',
        'project.mailbox',
        'project.evidence',
        'project.replay',
        'project.doctor',
        'project.observatory',
        'project.handoff'
      ];

      if (fs.existsSync(truexDir) && !args.force) {
        return {
          decision: {
            id: ctx.uuid(),
            kind: 'refuse',
            reason: '.truex already exists and force was not specified',
            timestamp: ctx.clock()
          },
          nextCell: cell
        };
      }

      if (!fs.existsSync(truexDir)) {
        fs.mkdirSync(truexDir, { recursive: true });
      }

      for (const dir of dirsToCreate) {
        const fullDir = path.join(truexDir, dir);
        if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
      }

      // Read root dir to create a genesis hash
      const files = fs.readdirSync(ctx.cwd).sort();
      const rootHash = hash(files);

      const nextCell: ProjectConsequenceCell = {
        ...cell,
        evidenceState: 'initialized'
      };

      fs.writeFileSync(path.join(truexDir, 'project.cell.json'), JSON.stringify(nextCell, null, 2));

      // Emit Genesis Receipt
      const receiptId = `receipt-init-${ctx.clock()}`;
      const receipt = {
        receipt_id: receiptId,
        verb: 'init',
        project_cell_id: cell.projectId,
        attempt_id: args.attemptId || ctx.uuid(),
        decision_id: `decision-${ctx.uuid()}`,
        parent_receipt_hash: null, // Genesis has no parent
        input_hash: hash(cell),
        output_hash: hash(nextCell),
        project_root_hash_before: rootHash,
        project_root_hash_after: rootHash, // Init shouldn't change the actual source files
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
          reason: 'Project initialized successfully',
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
          reason: `Failed to initialize project: ${e.message}`,
          timestamp: ctx.clock()
        },
        nextCell: cell
      };
    }
  }
}
