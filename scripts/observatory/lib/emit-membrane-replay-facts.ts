import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const BASE_DIR = process.cwd();
const SOURCE_FILE = path.join(BASE_DIR, 'packages/truex-core/src/membrane-replay.gall.ts');
const OUTPUT_FILE = 'docs/v1/latest/facts/membrane-replay.json';
const DB_PATH = path.join(BASE_DIR, 'gall_truex.db');

export class MembraneReplayFactsEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Membrane Replay Facts Emitter',
      description: 'Extracts architectural facts and DB metrics about the S7 Membrane Replay layer',
      outputPath: OUTPUT_FILE
    };
  }

  protected async collectFacts() {
    const facts: any = {
      version: "1.0.0",
      layer: "Membrane Replay (S7)",
      description: "SQLite WAL-backed transaction logging, crash recovery, and deterministic partial-order replay.",
      schema: {
        tables: ['topology_journal', 'topology_snapshots', 'rollback_snapshots'],
        journalFields: []
      },
      exportedMethods: [],
      realtimeStats: {
        totalJournalEntries: 0,
        confirmedEntries: 0,
        rollbackEntries: 0,
        failedEntries: 0,
        reconstructedChainsCount: 0,
        lastUpdated: new Date().toISOString()
      }
    };

    // 1. Analyze Source Code for Exported Functions
    if (fs.existsSync(SOURCE_FILE)) {
      const content = fs.readFileSync(SOURCE_FILE, 'utf8');
      
      // Match: export function name
      const methodMatches = content.matchAll(/export function ([a-zA-Z0-9_]+)/g);
      for (const match of methodMatches) {
        facts.exportedMethods.push(match[1]);
      }

      // Analyze topology_journal fields
      const journalFieldsMatch = content.match(/CREATE TABLE IF NOT EXISTS topology_journal \(([\s\S]+?)\)/);
      if (journalFieldsMatch) {
        const fields = journalFieldsMatch[1]
          .split(',')
          .map(f => f.trim().split(/\s+/)[0].replace(/--.*/, '').trim())
          .filter(f => f && !f.startsWith('CREATE') && !f.startsWith('PRIMARY') && !f.startsWith('UNIQUE'));
        facts.schema.journalFields = fields;
      }
    }

    // 2. Query Live Database for Realtime Stats
    if (fs.existsSync(DB_PATH)) {
      try {
        const db = new Database(DB_PATH);
        
        const journalTableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='topology_journal'").get();
        if (journalTableCheck) {
          const totalEntries = db.prepare('SELECT COUNT(*) as count FROM topology_journal').get() as { count: number };
          facts.realtimeStats.totalJournalEntries = totalEntries.count;

          const confirmed = db.prepare("SELECT COUNT(*) as count FROM topology_journal WHERE status = 'confirmed'").get() as { count: number };
          facts.realtimeStats.confirmedEntries = confirmed.count;

          const rollback = db.prepare("SELECT COUNT(*) as count FROM topology_journal WHERE status = 'rollback'").get() as { count: number };
          facts.realtimeStats.rollbackEntries = rollback.count;

          const failed = db.prepare("SELECT COUNT(*) as count FROM topology_journal WHERE status = 'failed'").get() as { count: number };
          facts.realtimeStats.failedEntries = failed.count;

          const uniqueChains = db.prepare("SELECT COUNT(DISTINCT chain_id) as count FROM topology_journal").get() as { count: number };
          facts.realtimeStats.reconstructedChainsCount = uniqueChains.count;
        }

        db.close();
      } catch (error_) {
        console.warn(`[Membrane Replay Facts] Could not read stats from DB: ${error_ instanceof Error ? error_.message : String(error_)}`);
      }
    }

    return facts;
  }
}

export async function emitMembraneReplayFacts() {
  const emitter = new MembraneReplayFactsEmitter();
  return emitter.emit();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-membrane-replay-facts.ts') || 
  process.argv[1].endsWith('emit-membrane-replay-facts.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitMembraneReplayFacts();
}
