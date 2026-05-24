/**
 * @module emit-topology-facts
 * @description
 * Gall Classification: S5 Topology Mapping
 * Purpose: Extracts topology facts, chain/rollback/storm accounting, and VKG projection facts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const DB_PATH = path.resolve(process.cwd(), 'gall_truex.db');
const OUTPUT_FILE = 'docs/v1/latest/facts/topology.json';

/**
 * Emitter for gathering facts regarding system topology, chain interactions,
 * rollback metrics, and VKG quad projections from the SQLite database.
 */
export class TopologyFactsEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Topology Facts Emitter',
      description: 'Extracts topology facts, chain/rollback/storm accounting, and VKG projection facts',
      outputPath: OUTPUT_FILE
    };
  }

  protected async collectFacts() {
    const facts: any = {
      version: "1.0.0",
      configuration: {
        maxDepth: 10,
        maxEmittedDeltas: 50,
        refuseOnBreach: true
      },
      accounting: {
        totalChains: 0,
        confirmedReceipts: 0,
        refusedReceipts: 0,
        rollbackReceipts: 0,
        preventedStorms: 0
      },
      vkgProjections: {
        totalQuads: 0,
        opsBreakdown: {
          adds: 0,
          deletes: 0,
          states: 0
        }
      },
      diagram: `flowchart TD
      subgraph Cascade ["Recursive Cascading Loop"]
          A[Root Delta] -->|triggers| H1[Stage 1 Hook]
          H1 -->|produces| D1[Cascading Delta]
          D1 -->|triggers| H2[Stage 2 Hook]
          H2 -->|produces| E1[Causal Event / Complete]
      end`
    };

    if (fs.existsSync(DB_PATH)) {
      try {
        const db = new Database(DB_PATH);
        
        // 1. Chain Accounting
        const receiptsCount = db.prepare("SELECT COUNT(*) as count FROM receipts").get() as { count: number };
        facts.accounting.totalChains = receiptsCount?.count || 0;

        const confirmedCount = db.prepare("SELECT COUNT(*) as count FROM receipts WHERE status = 'confirmed'").get() as { count: number };
        facts.accounting.confirmedReceipts = confirmedCount?.count || 0;

        const refusedCount = db.prepare("SELECT COUNT(*) as count FROM receipts WHERE status = 'refused'").get() as { count: number };
        facts.accounting.refusedReceipts = refusedCount?.count || 0;

        // Rollback receipts are events or receipts starting with evt_rollback_ or containing rollback
        const rollbackCount = db.prepare("SELECT COUNT(*) as count FROM receipts WHERE event_id LIKE '%rollback%' OR id LIKE '%rollback%'").get() as { count: number };
        facts.accounting.rollbackReceipts = rollbackCount?.count || 0;

        // Storms / Refusals from cycles or breaches
        facts.accounting.preventedStorms = facts.accounting.refusedReceipts + facts.accounting.rollbackReceipts;

        // 2. VKG Projections Facts
        const quadsCount = db.prepare("SELECT COUNT(*) as count FROM quads").get() as { count: number };
        facts.vkgProjections.totalQuads = quadsCount?.count || 0;

        const breakdown = db.prepare("SELECT op_type, COUNT(*) as count FROM quads GROUP BY op_type").all() as { op_type: string; count: number }[];
        for (const row of breakdown) {
          if (row.op_type === 'add') facts.vkgProjections.opsBreakdown.adds = row.count;
          if (row.op_type === 'delete') facts.vkgProjections.opsBreakdown.deletes = row.count;
          if (row.op_type === 'state') facts.vkgProjections.opsBreakdown.states = row.count;
        }

        db.close();
      } catch (error) {
        console.warn(`[Topology Facts] Could not read stats from DB: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return facts;
  }
}

/**
 * Instantiates the TopologyFactsEmitter and executes the fact extraction process.
 * @returns A promise resolving to the emitted facts object.
 */
export async function emitTopologyFacts() {
  const emitter = new TopologyFactsEmitter();
  return emitter.emit();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-topology-facts.ts') || 
  process.argv[1].endsWith('emit-topology-facts.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitTopologyFacts();
}
