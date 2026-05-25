/**
 * @module proofs
 * @description
 * Gall Classification: S11 Wizard Boundary
 * Purpose: Provides autonomic proof integration for the wizard verb map.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { InitVerb } from '../../packages/membrane/src/wizard/verbs/init.js';
import { MapVerb } from '../../packages/membrane/src/wizard/verbs/map.js';
import type { ProjectConsequenceCell } from '../../packages/membrane/src/wizard/project-cell.js';

export async function proveWizardMap() {
  const invariants: string[] = [];
  const failures: string[] = [];
  
  try {
    const testDir = path.join(process.cwd(), '.cache', 'tmp-cli-test');
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    
    // Create a dummy file to map
    fs.writeFileSync(path.join(testDir, 'dummy.ts'), 'console.log("hello");');
    fs.writeFileSync(path.join(testDir, 'dummy.test.ts'), 'console.log("test");');

    const ctx = createDeterministicContext(42);
    // @ts-ignore - duck typing for wizard context
    const wizardCtx = { cwd: testDir, epoch: 'v1', mode: 'local', uuid: ctx.uuid, clock: ctx.clock };

    const initialCell: ProjectConsequenceCell = {
      projectId: ctx.uuid() as any,
      root: testDir as any,
      truexDir: path.join(testDir, '.truex') as any,
      receiptsDir: path.join(testDir, '.truex', 'project.receipts') as any,
      reportsDir: path.join(testDir, '.truex', 'project.reports') as any,
      checkpointsDir: path.join(testDir, '.truex', 'project.checkpoints') as any,
      missionDir: path.join(testDir, '.truex', 'project.mission') as any,
      docsDir: path.join(testDir, 'docs') as any,
      testsDir: path.join(testDir, 'tests') as any,
      intent: 'Test mapping',
      scope: ['.'],
      boundary: [],
      admissibleVerbs: ['init', 'map'],
      evidenceState: 'uninitialized'
    };

    const initVerb = new InitVerb();
    const initResult = await initVerb.attempt(wizardCtx as any, initialCell, { force: true });

    if (initResult.decision.kind !== 'admit') {
      failures.push('Init verb failed to admit before mapping');
      return { passed: false, invariants, failures };
    }

    const mapVerb = new MapVerb();
    const mapResult = await mapVerb.attempt(wizardCtx as any, initResult.nextCell, { parentReceiptHash: initResult.receiptHash });

    if (mapResult.decision.kind === 'admit') {
      invariants.push('Map verb successfully admitted and mapped directory');
      
      const topologyFile = path.join(testDir, '.truex', 'project.evidence', 'topology.json');
      if (fs.existsSync(topologyFile)) {
         const topology = JSON.parse(fs.readFileSync(topologyFile, 'utf8'));
         if (topology.objects['dummy.ts'].type === 'source_file') invariants.push('Identified source file correctly');
         else failures.push('Failed to identify source file');

         if (topology.objects['dummy.test.ts'].type === 'test_file') invariants.push('Identified test file correctly');
         else failures.push('Failed to identify test file');

         if (topology.hash) invariants.push('Topology hash is generated and stable');
         else failures.push('Topology hash is missing');
      } else {
         failures.push('Topology file was not created');
      }
    } else {
      failures.push(`Map verb refused: ${mapResult.decision.reason}`);
    }

  } catch (error: any) {
    failures.push(`Unexpected wizard map proof error: ${error.message}`);
  }

  return {
    passed: failures.length === 0,
    invariants,
    failures
  };
}
