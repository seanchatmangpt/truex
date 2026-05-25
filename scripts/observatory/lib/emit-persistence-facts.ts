/**
 * @module emit-persistence-facts
 * @description
 * Gall Classification: S3 Persistence Facts Emitter
 * Purpose: Extracts architectural facts about the SQLite persistence layer, WAL journaling, and snapshotting.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const BASE_DIR = process.cwd();
const PERSISTENCE_DIR = path.join(BASE_DIR, 'packages/membrane/src/persistence');
const OUTPUT_FILE = 'docs/v1/latest/facts/persistence.json';
const DB_PATH = path.join(BASE_DIR, 'gall_truex.db');

/**
 * Emitter for retrieving structural schemas, journaling capabilities, and realtime
 * storage metrics from the persistence membrane.
 */
export class PersistenceFactsEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Persistence Facts Emitter',
      description: 'Extracts architectural facts about the SQLite persistence layer',
      outputPath: OUTPUT_FILE
    };
  }

  protected async collectFacts() {
    const schemaPath = path.join(PERSISTENCE_DIR, 'schema.ts');
    const journalPath = path.join(PERSISTENCE_DIR, 'journal.ts');
    const snapshotPath = path.join(PERSISTENCE_DIR, 'snapshot.ts');
    const indexPath = path.join(PERSISTENCE_DIR, 'index.ts');

    const facts: any = {
      version: "1.0.0",
      layer: "Persistence Membrane",
      sqlite: {
        engine: 'better-sqlite3',
        mechanisms: [],
        tables: [],
        optimizations: []
      },
      journaling: {
        name: 'DeltaJournal',
        description: "Zero-Loss Cold-Load source of truth",
        table: 'wal_deltas',
        fields: []
      },
      snapshotting: {
        manager: 'SnapshotManager',
        format: 'StateSnapshot',
        capabilities: []
      },
      orchestration: {
        controller: 'PersistenceOrchestrator',
        lifecycle: []
      },
      realtimeStats: {
        totalDeltas: 0,
        appliedDeltas: 0,
        receiptChainHeight: 0,
        lastUpdated: new Date().toISOString()
      },
      actuationTriggers: []
    };

    // 1. Analyze Schema & WAL
    if (fs.existsSync(schemaPath)) {
      const content = fs.readFileSync(schemaPath, 'utf8');
      
      // Identify WAL mechanisms
      if (content.includes("journal_mode = WAL")) {
        facts.sqlite.mechanisms.push('Write-Ahead Logging (WAL)');
      }
      if (content.includes("synchronous = NORMAL")) {
        facts.sqlite.optimizations.push('synchronous = NORMAL');
      }

      // Extract tables
      const tableMatches = content.matchAll(/CREATE TABLE IF NOT EXISTS ([a-z0-9_]+)/g);
      for (const match of tableMatches) {
        if (!facts.sqlite.tables.includes(match[1])) {
          facts.sqlite.tables.push(match[1]);
        }
      }

      // Analyze wal_deltas structure specifically
      const walSchemaMatch = content.match(/CREATE TABLE IF NOT EXISTS wal_deltas \(([\s\S]+?)\)/);
      if (walSchemaMatch) {
        const fields = walSchemaMatch[1].split(',').map(f => f.trim().split(/\s+/)[0].replace(/--.*/, '').trim()).filter(Boolean);
        facts.journaling.fields = fields;
      }
    }

    // 2. Analyze DeltaJournal
    if (fs.existsSync(journalPath)) {
      const content = fs.readFileSync(journalPath, 'utf8');
      facts.journaling.methods = [];
      const methodMatches = content.matchAll(/([a-zA-Z0-9_]+)\(.*\)\s*:\s*[a-zA-Z0-9_<>\[\]|{} ]+\s*{/g);
      for (const match of methodMatches) {
        if (!['constructor'].includes(match[1])) {
          facts.journaling.methods.push(match[1]);
        }
      }
    }

    // 3. Analyze Snapshotting
    if (fs.existsSync(snapshotPath)) {
      const content = fs.readFileSync(snapshotPath, 'utf8');
      if (content.includes('static create')) facts.snapshotting.capabilities.push('Deterministic Creation');
      if (content.includes('static applyDelta')) facts.snapshotting.capabilities.push('Atomic State Evolution');
      if (content.includes('static hashState')) facts.snapshotting.capabilities.push('State Integrity Hashing');
      if (content.includes('static replay')) facts.snapshotting.capabilities.push('Historical Replay Recovery');
      
      const interfaceMatch = content.match(/interface StateSnapshot {([\s\S]+?)}/);
      if (interfaceMatch) {
          facts.snapshotting.structure = interfaceMatch[1].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('/') && !l.startsWith('*'));
      }
    }

    // 4. Analyze Orchestration
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      if (content.includes('Execute -> Receipt -> Persist -> Crash -> Cold-Load -> Replay -> Converge')) {
        facts.orchestration.lifecycle = ['Execute', 'Receipt', 'Persist', 'Crash', 'Cold-Load', 'Replay', 'Converge'];
      }
    }

    // 5. Extract Real-time Stats from DB
    if (fs.existsSync(DB_PATH)) {
      try {
        const db = new Database(DB_PATH);
        
        const deltaCount = db.prepare('SELECT COUNT(*) as count FROM wal_deltas').get() as { count: number };
        facts.realtimeStats.totalDeltas = deltaCount.count;

        const appliedCount = db.prepare('SELECT COUNT(*) as count FROM wal_deltas WHERE applied = 1').get() as { count: number };
        facts.realtimeStats.appliedDeltas = appliedCount.count;

        const receiptCount = db.prepare('SELECT COUNT(*) as count FROM receipts').get() as { count: number };
        facts.realtimeStats.receiptChainHeight = receiptCount.count;

        db.close();
      } catch (error_) {
        console.warn(`[Persistence Facts] Could not read stats from DB: ${error_ instanceof Error ? error_.message : String(error_)}`);
      }
    }

    // 6. Actuation Triggers (Motor Feed)
    const walPath = `${DB_PATH}-wal`;
    const WAL_THRESHOLD_BYTES = 10 * 1024 * 1024; // 10MB default threshold

    if (fs.existsSync(walPath)) {
      const stats = fs.statSync(walPath);
      if (stats.size > WAL_THRESHOLD_BYTES) {
        facts.actuationTriggers.push({
          id: `wal-size-${Date.now()}`,
          trigger: 'SnapshotRequired',
          reason: `WAL size (${(stats.size / 1024 / 1024).toFixed(2)} MB) exceeds threshold (${(WAL_THRESHOLD_BYTES / 1024 / 1024).toFixed(2)} MB)`,
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // Alternative: If too many unapplied deltas, also suggest a snapshot
      const UNAPPLIED_THRESHOLD = 1000;
      const unapplied = facts.realtimeStats.totalDeltas - facts.realtimeStats.appliedDeltas;
      if (unapplied > UNAPPLIED_THRESHOLD) {
        facts.actuationTriggers.push({
          id: `unapplied-deltas-${Date.now()}`,
          trigger: 'SnapshotRequired',
          reason: `${unapplied} unapplied deltas exceed threshold (${UNAPPLIED_THRESHOLD})`,
          severity: 'medium',
          timestamp: new Date().toISOString()
        });
      }
    }

    return facts;
  }
}

/**
 * Instantiates the PersistenceFactsEmitter and executes the fact extraction process.
 * @returns A promise resolving to the emitted facts object.
 */
export async function emitPersistenceFacts() {
  const emitter = new PersistenceFactsEmitter();
  return emitter.emit();
}

// Self-execute if run as a script
const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-persistence-facts.ts') || 
  process.argv[1].endsWith('emit-persistence-facts.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitPersistenceFacts();
}
