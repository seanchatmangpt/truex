/**
 * @module proofs
 * @description
 * Gall Classification: S11 Wizard Boundary
 * Purpose: Provides autonomic proof integration for the wizard verb contracts Phase A.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

export function proveWizardContracts() {
  const invariants: string[] = [];
  const failures: string[] = [];
  
  try {
    const srcPath = path.resolve(process.cwd(), 'packages/truex-core/src/wizard');
    const projectCellFile = path.join(srcPath, 'project-cell.ts');
    const projectReceiptsFile = path.join(srcPath, 'project-receipts.ts');

    if (!fs.existsSync(projectCellFile)) {
      failures.push('project-cell.ts missing');
    } else {
      const content = fs.readFileSync(projectCellFile, 'utf-8');
      if (content.includes('interface WizardContext')) invariants.push('WizardContext defined');
      else failures.push('Missing WizardContext');
      
      if (content.includes('interface WizardDecision')) invariants.push('WizardDecision defined');
      else failures.push('Missing WizardDecision');

      if (content.includes('interface ProjectConsequenceCell')) invariants.push('ProjectConsequenceCell defined');
      else failures.push('Missing ProjectConsequenceCell');

      if (content.includes('interface WizardVerbAttempt')) invariants.push('WizardVerbAttempt defined');
      else failures.push('Missing WizardVerbAttempt');

      if (content.includes('interface WizardVerb')) invariants.push('WizardVerb defined');
      else failures.push('Missing WizardVerb');
    }

    if (!fs.existsSync(projectReceiptsFile)) {
      failures.push('project-receipts.ts missing');
    } else {
      const content = fs.readFileSync(projectReceiptsFile, 'utf-8');
      if (content.includes('interface WizardReceipt')) invariants.push('WizardReceipt defined');
      else failures.push('Missing WizardReceipt');
    }
  } catch (error: any) {
    failures.push(`Unexpected wizard contracts proof error: ${error.message}`);
  }

  return {
    passed: failures.length === 0,
    invariants,
    failures
  };
}
