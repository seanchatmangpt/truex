/**
 * @module emit-project-evidence-gapclose-facts
 * @description
 * Gall Classification: S12G (Project Evidence Gapclose) Fact Emitter
 * Purpose: Extracts facts about the Object-Centric Project Evidence Gap Discovery & Repair (S12G).
 * Reads the doctor's execution reports, processes the gap ledger, and formats them for the Observatory.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const BASE_DIR = process.cwd();
const OUTPUT_FILE = 'docs/v1/latest/facts/project-evidence-gapclose.json';

/**
 * Emitter for gathering facts related to Project Evidence Gapclose verification.
 */
export class ProjectEvidenceGapcloseFactsEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Project Evidence Gapclose Facts Emitter',
      description: 'Extracts facts about Object-Centric Project Evidence Gap Discovery & Repair (S12G)',
      outputPath: OUTPUT_FILE
    };
  }

  protected async collectFacts() {
    const reportPath = path.join(BASE_DIR, 'docs/vision2030/project-evidence-gapclose-proof.report.json');
    const ledgerPath = path.join(BASE_DIR, 'docs/reports/S12-GAP-LEDGER.md');
    
    let reportData: any = {};
    if (fs.existsSync(reportPath)) {
      reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    }

    let ledgerContent = '';
    if (fs.existsSync(ledgerPath)) {
      ledgerContent = fs.readFileSync(ledgerPath, 'utf8');
    }

    // Extract statuses/domains from S12-GAP-LEDGER.md
    const gapDomains: any[] = [];
    const lines = ledgerContent.split('\n');
    for (const line of lines) {
      if (line.includes('S12G-')) {
        const parts = line.split('|').map(p => p.trim()).filter(Boolean);
        if (parts.length >= 8) {
          // Domain | Attempted | Succeeded | Failed | Refused | Quarantined | Skipped | Status
          gapDomains.push({
            domain: parts[0].replace(/\*\*/g, ''),
            attempted: Number.parseInt(parts[1], 10),
            succeeded: Number.parseInt(parts[2], 10),
            failed: Number.parseInt(parts[3], 10),
            refused: Number.parseInt(parts[4], 10),
            quarantined: Number.parseInt(parts[5], 10),
            skipped: Number.parseInt(parts[6], 10),
            status: parts[7]
          });
        }
      }
    }

    return {
      version: "1.0.0",
      layer: "Project Evidence Gapclose (S12G)",
      description: "Verifies POWL/Gall workflows, ensuring cycle rejection, choice graphs, checkpoint structures, and ledger integrity.",
      report: reportData,
      ledger: {
        path: 'docs/reports/S12-GAP-LEDGER.md',
        domains: gapDomains
      }
    };
  }
}

export async function emitProjectEvidenceGapcloseFacts() {
  const emitter = new ProjectEvidenceGapcloseFactsEmitter();
  return emitter.emit();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-project-evidence-gapclose-facts.ts') || 
  process.argv[1].endsWith('emit-project-evidence-gapclose-facts.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  await emitProjectEvidenceGapcloseFacts();
}
