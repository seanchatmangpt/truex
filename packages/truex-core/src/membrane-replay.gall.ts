/* eslint-disable unicorn/no-null, unicorn/prefer-number-properties, unicorn/prefer-string-slice, unicorn/prefer-structured-clone, unicorn/numeric-separators-style, unicorn/prefer-at, unicorn/no-lonely-if, unicorn/no-negated-condition, unicorn/prefer-spread, unicorn/catch-error-name */
import DatabaseClass from "better-sqlite3";
import type { Database } from "better-sqlite3";
import { type Receipt, parseReceipt, type HookCondition, type HookEffect } from "./runtime-law.js";
import { createDeterministicContext, type TruexContext } from "./context.js";
import { hash, createReceipt, verifyReceipt } from "./index.js";

// Database monkeypatch to automatically initialize the schema when needed.
const originalPrepare = DatabaseClass.prototype.prepare;
let initializing = false;
DatabaseClass.prototype.prepare = function (sql: string) {
  if (!initializing && (sql.includes("topology_journal") || sql.includes("topology_snapshots") || sql.includes("rollback_snapshots"))) {
    initializing = true;
    try {
      initializeMembraneReplaySchema(this as any);
    } finally {
      initializing = false;
    }
  }
  return originalPrepare.apply(this, arguments as any);
};


// ==========================================
// Required Type Definitions
// ==========================================

export interface JournalEntry {
  id: number;
  chainId: string;
  deltaId: string;
  nodeId: string;
  depth: number;
  payload: string; // JSON serialized hook inputs/outputs and state snapshots
  previousReceiptHash: string | null;
  receiptHash: string;
  status: "confirmed" | "refused" | "rollback" | "failed";
  timestamp: number;
  signature?: string;
  publicKey?: string;
  rollbackOf?: string;
  failedChildId?: string;
  reason?: string;
}

export interface TopologySnapshot {
  receiptHash: string;
  states: Record<string, { state: any; lastReceiptHash: string | null }>;
  timestamp: number;
}

export interface RollbackSnapshot {
  runId: string;
  failedReceiptId: string;
  states: Record<string, { state: any; lastReceiptHash: string | null }>;
  timestamp: number;
}

export interface JournalLineage {
  chainId: string;
  entries: JournalEntry[];
}

export interface ReplayCheckpoint {
  sequenceNumber: number;
  receiptHash: string;
  snapshot: TopologySnapshot;
}

export interface MembraneRecovery {
  recovered: boolean;
  activeChainsRolledBack: string[];
  quarantinedEntriesCount: number;
  receipts: JournalEntry[];
}

export interface PersistentJournal {
  db: Database;
}

export interface JournalReplay {
  case: string;
  status: "passed" | "failed";
  replayConvergenceVerified: boolean;
}

export interface MembraneReplayAccounting {
  attempted: number;
  converged: number;
  diverged: number;
  corrupted: number;
  refused: number;
  failed: number;
}

// ==========================================
// DB Schema Initialization
// ==========================================

export function initializeMembraneReplaySchema(db: Database): void {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS topology_journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chain_id TEXT NOT NULL,
      delta_id TEXT NOT NULL,
      node_id TEXT NOT NULL,
      depth INTEGER NOT NULL,
      payload TEXT NOT NULL,
      previous_receipt_hash TEXT,
      receipt_hash TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      signature TEXT,
      public_key TEXT,
      rollback_of TEXT,
      failed_child_id TEXT,
      reason TEXT
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS topology_snapshots (
      receipt_hash TEXT PRIMARY KEY,
      states TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS rollback_snapshots (
      run_id TEXT PRIMARY KEY,
      failed_receipt_id TEXT NOT NULL,
      states TEXT NOT NULL,
      timestamp INTEGER NOT NULL
    )
  `).run();
}

// ==========================================
// Required Core Functions
// ==========================================

export function appendJournalEntry(db: Database, entry: Omit<JournalEntry, "id">): JournalEntry {
  initializeMembraneReplaySchema(db);
  const stmt = db.prepare(`
    INSERT INTO topology_journal (
      chain_id, delta_id, node_id, depth, payload, previous_receipt_hash, receipt_hash, status, timestamp, signature, public_key, rollback_of, failed_child_id, reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    entry.chainId,
    entry.deltaId,
    entry.nodeId,
    entry.depth,
    entry.payload,
    entry.previousReceiptHash,
    entry.receiptHash,
    entry.status,
    entry.timestamp,
    entry.signature || null,
    entry.publicKey || null,
    entry.rollbackOf || null,
    entry.failedChildId || null,
    entry.reason || null
  );
  return {
    ...entry,
    id: info.lastInsertRowid as number,
  };
}

export function loadJournal(db: Database, chainId: string): JournalEntry[] {
  initializeMembraneReplaySchema(db);
  const stmt = db.prepare(`
    SELECT * FROM topology_journal WHERE chain_id = ? ORDER BY id ASC
  `);
  const rows = stmt.all(chainId) as any[];
  return rows.map((r) => ({
    id: r.id,
    chainId: r.chain_id,
    deltaId: r.delta_id,
    nodeId: r.node_id,
    depth: r.depth,
    payload: r.payload,
    previousReceiptHash: r.previous_receipt_hash,
    receiptHash: r.receipt_hash,
    status: r.status as any,
    timestamp: r.timestamp,
    signature: r.signature || undefined,
    publicKey: r.public_key || undefined,
    rollbackOf: r.rollback_of || undefined,
    failedChildId: r.failed_child_id || undefined,
    reason: r.reason || undefined,
  }));
}

export function reconstructTopologyState(db: Database, chainId: string, targetReceiptHash?: string): Record<string, any> {
  const entries = loadJournal(db, chainId);
  const states: Record<string, any> = {};
  for (const entry of entries) {
    if (entry.status !== "confirmed" && entry.status !== "rollback") {
      if (targetReceiptHash && entry.receiptHash === targetReceiptHash) {
        break;
      }
      continue;
    }
    const payload = JSON.parse(entry.payload);
    if (payload.stateAfter !== undefined) {
      states[entry.nodeId] = payload.stateAfter;
    }
    if (targetReceiptHash && entry.receiptHash === targetReceiptHash) {
      break;
    }
  }
  return states;
}

export function saveRollbackSnapshot(
  db: Database,
  runId: string,
  failedReceiptId: string,
  states: Record<string, { state: any; lastReceiptHash: string | null }>
): void {
  initializeMembraneReplaySchema(db);
  db.prepare(`
    INSERT OR REPLACE INTO rollback_snapshots (run_id, failed_receipt_id, states, timestamp)
    VALUES (?, ?, ?, ?)
  `).run(runId, failedReceiptId, JSON.stringify(states), Date.now());
}

export function reconstructRollbackState(db: Database, runId: string): Record<string, any> {
  initializeMembraneReplaySchema(db);
  const row = db.prepare(`SELECT states FROM rollback_snapshots WHERE run_id = ?`).get(runId) as any;
  if (!row) return {};
  const statesWithMeta = JSON.parse(row.states);
  const states: Record<string, any> = {};
  for (const [nodeId, meta] of Object.entries(statesWithMeta)) {
    states[nodeId] = (meta as any).state;
  }
  return states;
}

export function replayJournalLineage(
  db: Database,
  lineage: JournalEntry[],
  registeredHooks: Map<string, {
    condition: any;
    behavior: (state: any, delta: any, ctx: any) => { nextState: any; effects: any[] };
    initialState: any;
  }>,
  parentSeed: number
): { converged: boolean; error?: string } {
  const activeStates: Record<string, any> = {};

  for (const entry of lineage) {
    if (entry.status === "confirmed" && !(entry.nodeId in activeStates)) {
      const payload = JSON.parse(entry.payload);
      activeStates[entry.nodeId] = payload.stateBefore;
    }
  }

  for (const [nodeId, hook] of registeredHooks.entries()) {
    if (!(nodeId in activeStates)) {
      activeStates[nodeId] = JSON.parse(JSON.stringify(hook.initialState || {}));
    }
  }

  for (const entry of lineage) {
    if (entry.status !== "confirmed") {
      if (entry.status === "rollback") {
        const payload = JSON.parse(entry.payload);
        activeStates[entry.nodeId] = payload.stateAfter;
      }
      continue;
    }

    const payload = JSON.parse(entry.payload);
    const hook = registeredHooks.get(entry.nodeId);
    if (!hook) {
      return { converged: false, error: `Hook not found: ${entry.nodeId}` };
    }

    const stepHash = hash({
      nodeId: entry.nodeId,
      delta: payload.delta,
      previousReceiptHash: entry.previousReceiptHash,
      parentSeed,
    });
    const stepSeed = parseInt(stepHash.substring(0, 8), 16) >>> 0;
    const stepCtx = createDeterministicContext(stepSeed);

    const stateBefore = JSON.parse(JSON.stringify(activeStates[entry.nodeId]));
    const { nextState, effects } = hook.behavior(stateBefore, payload.delta, stepCtx);

    if (JSON.stringify(nextState) !== JSON.stringify(payload.stateAfter)) {
      return { converged: false, error: `State mismatch for hook ${entry.nodeId}` };
    }

    const inputHash = hash({ delta: payload.delta, stateBefore });
    const outputHash = hash({ effects, stateAfter: nextState });
    const eventId = `evt_${stepCtx.uuid()}`;

    const calculatedReceipt = createReceipt(
      stepCtx,
      eventId,
      entry.deltaId,
      inputHash,
      outputHash,
      entry.previousReceiptHash,
      "confirmed"
    );

    if (calculatedReceipt.receiptHash !== entry.receiptHash) {
      return {
        converged: false,
        error: `Receipt hash mismatch for hook ${entry.nodeId}: calculated ${calculatedReceipt.receiptHash}, expected ${entry.receiptHash}`,
      };
    }

    activeStates[entry.nodeId] = nextState;
  }

  return { converged: true };
}

export function verifyJournalIntegrity(
  db: Database,
  chainId: string
): { valid: boolean; status: "valid" | "tampered" | "truncated" | "corrupted" } {
  const entries = loadJournal(db, chainId);
  if (entries.length === 0) {
    return { valid: true, status: "valid" };
  }

  for (const entry of entries) {
    try {
      JSON.parse(entry.payload);
    } catch {
      return { valid: false, status: "corrupted" };
    }
    if (!entry.receiptHash || !entry.chainId) {
      return { valid: false, status: "corrupted" };
    }
  }

  for (const entry of entries) {
    const payload = JSON.parse(entry.payload);
    if (payload && typeof payload.inputHash === "string" && typeof payload.outputHash === "string") {
      const objToHash: any = {
        id: payload.receiptId || entry.receiptHash,
        eventId: payload.eventId || `evt_${entry.receiptHash}`,
        deltaId: entry.deltaId,
        inputHash: payload.inputHash,
        outputHash: payload.outputHash,
        previousReceiptHash: entry.previousReceiptHash === undefined ? null : entry.previousReceiptHash,
        status: entry.status === "confirmed" ? "confirmed" : "refused",
      };

      // Clean undefined keys, matching verifyReceipt's cleanReceiptWithoutHash
      for (const key of Object.keys(objToHash)) {
        if (objToHash[key] === undefined) {
          delete objToHash[key];
        }
      }

      const calculatedHash = hash(objToHash);
      if (entry.receiptHash !== calculatedHash) {
        return { valid: false, status: "tampered" };
      }
    }
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.depth > 0) {
      const parent = entries.find((e) => e.receiptHash === entry.previousReceiptHash);
      if (!parent) {
        return { valid: false, status: "truncated" };
      }
    }
  }

  return { valid: true, status: "valid" };
}

export function generateReplayTopologyHash(lineage: JournalEntry[]): string {
  const hashes = lineage.map((e) => e.receiptHash);
  return hash(hashes);
}

export function generateNormalizedReplayTopologyHash(lineage: JournalEntry[]): string {
  const sorted = [...lineage].sort((a, b) => a.nodeId.localeCompare(b.nodeId) || a.receiptHash.localeCompare(b.receiptHash));
  const hashes = sorted.map((e) => e.receiptHash);
  return hash(hashes);
}

export function recoverFromCrash(
  db: Database,
  registeredHooks: Map<string, any>,
  parentSeed: number
): MembraneRecovery {
  initializeMembraneReplaySchema(db);

  const runs = db.prepare("SELECT DISTINCT chain_id FROM topology_journal").all() as { chain_id: string }[];
  const activeChainsRolledBack: string[] = [];
  const receipts: JournalEntry[] = [];

  const stepCtx = createDeterministicContext(parentSeed);

  for (const { chain_id } of runs) {
    const entries = loadJournal(db, chain_id);
    if (entries.length === 0) continue;

    const hasRollback = entries.some((e) => e.status === "rollback" || e.rollbackOf !== undefined);
    const latestEntry = entries[entries.length - 1];

    const rollbackSnapRow = db.prepare("SELECT states, failed_receipt_id FROM rollback_snapshots WHERE run_id = ?").get(chain_id) as any;

    if (rollbackSnapRow && !hasRollback) {
      activeChainsRolledBack.push(chain_id);

      const preRunStates = JSON.parse(rollbackSnapRow.states);
      for (const [nodeId, meta] of Object.entries(preRunStates)) {
        const hook = registeredHooks.get(nodeId);
        if (hook) {
          hook.state = JSON.parse(JSON.stringify((meta as any).state));
          hook.lastReceiptHash = (meta as any).lastReceiptHash;
        }
      }

      let lastReceiptHash = latestEntry.receiptHash;
      for (let i = entries.length - 1; i >= 0; i--) {
        const entry = entries[i];
        if (entry.status !== "confirmed") continue;

        const rollbackPayload = JSON.stringify({
          nodeId: entry.nodeId,
          stateBefore: JSON.parse(entry.payload).stateAfter,
          stateAfter: preRunStates[entry.nodeId]?.state || {},
        });

        const rbEntryHash = hash({
          id: `rb_${entry.receiptHash}`,
          eventId: `evt_rollback_${stepCtx.uuid()}`,
          deltaId: entry.deltaId,
          inputHash: hash({ deltaId: entry.deltaId }),
          outputHash: hash({ rolledBack: true }),
          previousReceiptHash: lastReceiptHash,
          status: "refused",
          rollbackOf: entry.receiptHash,
          failedChildId: rollbackSnapRow.failed_receipt_id,
          reason: "Crash recovery rollback",
        });

        const rollbackEntry = appendJournalEntry(db, {
          chainId: chain_id,
          deltaId: entry.deltaId,
          nodeId: entry.nodeId,
          depth: entry.depth,
          payload: rollbackPayload,
          previousReceiptHash: lastReceiptHash,
          receiptHash: rbEntryHash,
          status: "rollback",
          timestamp: Date.now(),
          rollbackOf: entry.receiptHash,
          failedChildId: rollbackSnapRow.failed_receipt_id,
          reason: "Crash recovery rollback",
        });

        lastReceiptHash = rollbackEntry.receiptHash;
      }

      const recoveryReceiptHash = hash({
        id: `rec_${chain_id}`,
        eventId: `evt_recovery_${stepCtx.uuid()}`,
        deltaId: latestEntry.deltaId,
        inputHash: hash({ chainId: chain_id }),
        outputHash: hash({ recovered: true }),
        previousReceiptHash: lastReceiptHash,
        status: "refused",
        failedChildId: rollbackSnapRow.failed_receipt_id,
        reason: "Crash recovery completed",
      });

      const recoveryEntry = appendJournalEntry(db, {
        chainId: chain_id,
        deltaId: latestEntry.deltaId,
        nodeId: "crash-recovery-service",
        depth: latestEntry.depth + 1,
        payload: JSON.stringify({ reason: "Crash recovery completed" }),
        previousReceiptHash: lastReceiptHash,
        receiptHash: recoveryReceiptHash,
        status: "refused",
        timestamp: Date.now(),
        failedChildId: rollbackSnapRow.failed_receipt_id,
        reason: "Crash recovery completed",
      });

      receipts.push(recoveryEntry);
    }
  }

  const quarantinedCountRow = db.prepare("SELECT COUNT(*) as count FROM topology_journal WHERE status = 'failed'").get() as any;

  return {
    recovered: activeChainsRolledBack.length > 0,
    activeChainsRolledBack,
    quarantinedEntriesCount: quarantinedCountRow?.count || 0,
    receipts,
  };
}
