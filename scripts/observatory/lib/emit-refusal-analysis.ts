/**
 * @module emit-refusal-analysis
 * @description
 * Gall Classification: Observatory Diagnostics
 * Purpose: Analyzes refusal receipts within the Truex graph and proposes corrective actions 
 * to align with Repository Laws.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../../');
const DB_PATH = path.join(ROOT_DIR, 'gall_truex.db');
const OUTPUT_FILE = 'docs/v1/latest/facts/refusal-analysis.json';

/**
 * Emitter for identifying recent invariant refusals and synthesizing actionable 
 * correction proposals based on the recorded delta content.
 */
export class RefusalAnalysisEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Refusal Analysis Emitter',
      description: 'Analyzes refusal receipts and proposes corrective actions',
      outputPath: OUTPUT_FILE
    };
  }

  protected async collectFacts() {
    if (!fs.existsSync(DB_PATH)) {
      return {
        has_refusals: false,
        message: 'No database found.'
      };
    }

    const db = new Database(DB_PATH);
    
    try {
      // Get the latest refusal by joining with wal_deltas (which has an auto-inc ID)
      const latestRefusal = db.prepare(`
        SELECT r.id as receipt_id, r.event_id, r.delta_id, r.status, w.payload, w.created_at
        FROM receipts r
        JOIN wal_deltas w ON r.delta_id = w.delta_id
        WHERE r.status = ?
        ORDER BY w.id DESC
        LIMIT 1
      `).get('refused') as any;

      if (!latestRefusal) {
        return {
          has_refusals: false,
          message: 'No refusal receipts found in database.'
        };
      }

      const fact = {
        has_refusals: true,
        latest_refusal: {
          id: latestRefusal.receipt_id,
          event_id: latestRefusal.event_id,
          timestamp: latestRefusal.created_at,
          delta: JSON.parse(latestRefusal.payload)
        },
        correction_proposals: [] as any[]
      };

      const delta = fact.latest_refusal.delta;
      if (delta) {
        // Propose corrections based on delta content
        const adds = delta.adds || [];
        
        // Identify the semantic action associated with the refused delta.
        // The agy-bridge enforces policies like the FOSSIL rule on file modifications.
        const toolAction = adds.find((q: any) => q.predicate === 'agy:action')?.object;

        if (toolAction === 'write_file' || toolAction === 'replace') {
          fact.correction_proposals.push({
            violation: "Semantic Law: Fossil Record",
            reason: "Static 'FOSSIL' keywords indicate brittle architecture. Systems must be dynamic and evolvable.",
            suggestion: "Remove the 'FOSSIL' keyword and replace with a dynamic ontology reference or a variant-based approach.",
            artifact_type: "RefinementRule"
          });
        }
      }

      return fact;
    } finally {
      db.close();
    }
  }
}

/**
 * Instantiates the RefusalAnalysisEmitter and executes the analysis extraction process.
 * @returns A promise resolving to the emitted facts object.
 */
export async function emitRefusalAnalysis() {
  const emitter = new RefusalAnalysisEmitter();
  return emitter.emit();
}

// Self-execute if run as a script
const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-refusal-analysis.ts') || 
  process.argv[1].endsWith('emit-refusal-analysis.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitRefusalAnalysis();
}
