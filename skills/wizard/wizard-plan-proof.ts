/**
 * @module proofs
 * @description
 * Gall Classification: S11 Wizard Boundary
 * Purpose: Provides autonomic proof integration for the wizard verb plan.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { InitVerb } from '../../packages/membrane/src/wizard/verbs/init.js';
import { MapVerb } from '../../packages/membrane/src/wizard/verbs/map.js';
import { PlanVerb } from '../../packages/membrane/src/wizard/verbs/plan.js';
import type { ProjectConsequenceCell } from '../../packages/membrane/src/wizard/project-cell.js';

export async function proveWizardPlan() {
  const invariants: string[] = [];
  const failures: string[] = [];
  
  try {
    const testDir = path.join(process.cwd(), '.cache', 'tmp-cli-test');
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
    
    // Create a dummy file
    fs.writeFileSync(path.join(testDir, 'dummy.ts'), 'console.log("hello");');

    const ctx = createDeterministicContext(42);
    // @ts-ignore
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
      intent: 'Test planning',
      scope: ['.'],
      boundary: ['.'],
      admissibleVerbs: ['init', 'map', 'plan'],
      evidenceState: 'uninitialized'
    };

    const initVerb = new InitVerb();
    const initResult = await initVerb.attempt(wizardCtx as any, initialCell, { force: true });

    const mapVerb = new MapVerb();
    const mapResult = await mapVerb.attempt(wizardCtx as any, initResult.nextCell, { parentReceiptHash: initResult.receiptHash });

    const planVerb = new PlanVerb();
    const planResult = await planVerb.attempt(wizardCtx as any, mapResult.nextCell, { 
      parentReceiptHash: mapResult.receiptHash,
      goal: 'Compile the project' 
    });

    if (planResult.decision.kind === 'admit') {
      invariants.push('Plan verb successfully admitted');
      
      const planFile = path.join(testDir, '.truex', 'project.evidence', 'plan.json');
      if (fs.existsSync(planFile)) {
         const route = JSON.parse(fs.readFileSync(planFile, 'utf8'));
         
         const checkpoints = Object.keys(route.checkpoints);
         if (checkpoints.length > 0) {
            const cp = route.checkpoints[checkpoints[0]];
            if (cp.proof_command) invariants.push('Checkpoint has proof command');
            else failures.push('Checkpoint missing proof command');

            if (route.route_spine[0].operator === 'ACT') invariants.push('POWL8 route spine operator used');
            else failures.push('POWL8 operator missing');
         } else {
            failures.push('No checkpoints generated');
         }
      } else {
         failures.push('Plan file was not created');
      }
    } else {
      failures.push(`Plan verb refused: ${planResult.decision.reason}`);
    }

    // Test failure mode: goal lacks project boundary
    const failCell = { ...mapResult.nextCell, boundary: [] };
    const failPlanResult = await planVerb.attempt(wizardCtx as any, failCell, { 
       parentReceiptHash: mapResult.receiptHash,
       goal: '' // No goal, no boundary
    });

    if (failPlanResult.decision.kind === 'refuse' && failPlanResult.decision.reason === 'goal lacks project boundary') {
       invariants.push('Plan verb correctly refused when goal lacks project boundary');
    } else {
       failures.push('Plan verb failed to refuse invalid boundary/goal');
    }

  } catch (error: any) {
    failures.push(`Unexpected wizard plan proof error: ${error.message}`);
  }

  return {
    passed: failures.length === 0,
    invariants,
    failures
  };
}
