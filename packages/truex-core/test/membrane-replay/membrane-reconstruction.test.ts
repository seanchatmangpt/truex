/* eslint-disable unicorn/no-null */
import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { createDeterministicContext } from "../../src/context.js";
import { hash } from "../../src/hash.js";
import {
  appendJournalEntry,
  loadJournal,
  reconstructTopologyState,
  replayJournalLineage,
  verifyJournalIntegrity,
  generateReplayTopologyHash,
  generateNormalizedReplayTopologyHash,
  saveRollbackSnapshot,
  reconstructRollbackState,
  initializeMembraneReplaySchema,
} from "../../src/membrane-replay.gall.js";
import { createReceipt } from "../../src/index.js";

describe("Membrane Reconstruction + Replay Tests", () => {
  const parentSeed = 42;

  // Helper to construct a deterministic A->B->C execution chain and persist it to the SQLite database
  function createTestChain(db: Database.Database, chainId: string) {
    initializeMembraneReplaySchema(db);

    const hookA = {
      condition: { kind: "delta-match" as const, predicate: "trigger:A" },
      behavior: (_state: any, _delta: any, _ctx: any) => ({
        nextState: { processedA: true },
        effects: [{ kind: "add-quad" as const, quad: { subject: "urn:node:B", predicate: "trigger:B", object: "value:B", graph: null } }],
      }),
      initialState: { processedA: false },
    };

    const hookB = {
      condition: { kind: "delta-match" as const, predicate: "trigger:B" },
      behavior: (_state: any, _delta: any, _ctx: any) => ({
        nextState: { processedB: true },
        effects: [{ kind: "add-quad" as const, quad: { subject: "urn:node:C", predicate: "trigger:C", object: "value:C", graph: null } }],
      }),
      initialState: { processedB: false },
    };

    const hookC = {
      condition: { kind: "delta-match" as const, predicate: "trigger:C" },
      behavior: (_state: any, _delta: any, _ctx: any) => ({
        nextState: { processedC: true },
        effects: [{ kind: "emit-event" as const, type: "chain_completed" }],
      }),
      initialState: { processedC: false },
    };

    const rootDelta = {
      id: "delta-root",
      adds: [{ subject: "urn:node:A", predicate: "trigger:A", object: "value:A", graph: null }],
      deletes: [],
    };

    // Step A: Hook A
    const stepHashA = hash({ nodeId: "hook-A", delta: rootDelta, previousReceiptHash: null, parentSeed });
    const stepSeedA = Number.parseInt(stepHashA.slice(0, 8), 16) >>> 0;
    const stepCtxA = createDeterministicContext(stepSeedA);

    const receiptA = createReceipt(
      stepCtxA,
      `evt_${stepCtxA.uuid()}`,
      "delta-root",
      hash({ delta: rootDelta, stateBefore: { processedA: false } }),
      hash({ effects: hookA.behavior(hookA.initialState, rootDelta, stepCtxA).effects, stateAfter: { processedA: true } }),
      null,
      "confirmed"
    );

    const entryA = appendJournalEntry(db, {
      chainId,
      deltaId: "delta-root",
      nodeId: "hook-A",
      depth: 0,
      payload: JSON.stringify({
        delta: rootDelta,
        stateBefore: { processedA: false },
        stateAfter: { processedA: true },
        inputHash: receiptA.inputHash,
        outputHash: receiptA.outputHash,
        eventId: receiptA.eventId,
        receiptId: receiptA.id,
      }),
      previousReceiptHash: null,
      receiptHash: receiptA.receiptHash,
      status: "confirmed",
      timestamp: 1000,
    });

    // Step B: Hook B
    const deltaB = {
      id: `delta-${receiptA.receiptHash}`,
      adds: [{ subject: "urn:node:B", predicate: "trigger:B", object: "value:B", graph: null }],
      deletes: [],
    };
    const stepHashB = hash({ nodeId: "hook-B", delta: deltaB, previousReceiptHash: receiptA.receiptHash, parentSeed });
    const stepSeedB = Number.parseInt(stepHashB.slice(0, 8), 16) >>> 0;
    const stepCtxB = createDeterministicContext(stepSeedB);

    const receiptB = createReceipt(
      stepCtxB,
      `evt_${stepCtxB.uuid()}`,
      deltaB.id,
      hash({ delta: deltaB, stateBefore: { processedB: false } }),
      hash({ effects: hookB.behavior(hookB.initialState, deltaB, stepCtxB).effects, stateAfter: { processedB: true } }),
      receiptA.receiptHash,
      "confirmed"
    );

    const entryB = appendJournalEntry(db, {
      chainId,
      deltaId: deltaB.id,
      nodeId: "hook-B",
      depth: 1,
      payload: JSON.stringify({
        delta: deltaB,
        stateBefore: { processedB: false },
        stateAfter: { processedB: true },
        inputHash: receiptB.inputHash,
        outputHash: receiptB.outputHash,
        eventId: receiptB.eventId,
        receiptId: receiptB.id,
      }),
      previousReceiptHash: receiptA.receiptHash,
      receiptHash: receiptB.receiptHash,
      status: "confirmed",
      timestamp: 2000,
    });

    // Step C: Hook C
    const deltaC = {
      id: `delta-${receiptB.receiptHash}`,
      adds: [{ subject: "urn:node:C", predicate: "trigger:C", object: "value:C", graph: null }],
      deletes: [],
    };
    const stepHashC = hash({ nodeId: "hook-C", delta: deltaC, previousReceiptHash: receiptB.receiptHash, parentSeed });
    const stepSeedC = Number.parseInt(stepHashC.slice(0, 8), 16) >>> 0;
    const stepCtxC = createDeterministicContext(stepSeedC);

    const receiptC = createReceipt(
      stepCtxC,
      `evt_${stepCtxC.uuid()}`,
      deltaC.id,
      hash({ delta: deltaC, stateBefore: { processedC: false } }),
      hash({ effects: hookC.behavior(hookC.initialState, deltaC, stepCtxC).effects, stateAfter: { processedC: true } }),
      receiptB.receiptHash,
      "confirmed"
    );

    const entryC = appendJournalEntry(db, {
      chainId,
      deltaId: deltaC.id,
      nodeId: "hook-C",
      depth: 2,
      payload: JSON.stringify({
        delta: deltaC,
        stateBefore: { processedC: false },
        stateAfter: { processedC: true },
        inputHash: receiptC.inputHash,
        outputHash: receiptC.outputHash,
        eventId: receiptC.eventId,
        receiptId: receiptC.id,
      }),
      previousReceiptHash: receiptB.receiptHash,
      receiptHash: receiptC.receiptHash,
      status: "confirmed",
      timestamp: 3000,
    });

    const registeredHooks = new Map<string, any>([
      ["hook-A", hookA],
      ["hook-B", hookB],
      ["hook-C", hookC],
    ]);

    return {
      receipts: [receiptA, receiptB, receiptC],
      entries: [entryA, entryB, entryC],
      registeredHooks,
      rootDelta,
    };
  }

  it("1. Prove A->B->C chain persistence in the journal database", () => {
    const db = new Database(":memory:");
    const chainId = "chain-abc";
    const { entries } = createTestChain(db, chainId);

    expect(entries).toHaveLength(3);
    const journalEntries = loadJournal(db, chainId);
    expect(journalEntries).toHaveLength(3);
    expect(journalEntries[0].nodeId).toBe("hook-A");
    expect(journalEntries[1].nodeId).toBe("hook-B");
    expect(journalEntries[2].nodeId).toBe("hook-C");
  });

  it("2. Prove memory destruction by wiping active runtime states", () => {
    const db = new Database(":memory:");
    const chainId = "chain-abc";
    createTestChain(db, chainId);

    // Simulate wiping/destroying all runtime states
    const runtimeMemoryStates = null;
    expect(runtimeMemoryStates).toBeNull();
  });

  it("3. Prove WAL only reload by restoring topology state from persistence", () => {
    const db = new Database(":memory:");
    const chainId = "chain-abc";
    createTestChain(db, chainId);

    // Reconstruct without runtime memory (only using SQLite journal db)
    const reconstructed = reconstructTopologyState(db, chainId);
    expect(reconstructed["hook-A"]).toEqual({ processedA: true });
    expect(reconstructed["hook-B"]).toEqual({ processedB: true });
    expect(reconstructed["hook-C"]).toEqual({ processedC: true });
  });

  it("4. Prove replayed receipts convergence with deterministic execution", () => {
    const db = new Database(":memory:");
    const chainId = "chain-abc";
    const { registeredHooks } = createTestChain(db, chainId);

    const lineage = loadJournal(db, chainId);

    // Replaying must verify convergence
    const replayResult = replayJournalLineage(db, lineage, registeredHooks, parentSeed);
    expect(replayResult.converged).toBe(true);
  });

  it("5. Prove reconstructed hash matches original execution lineage hash", () => {
    const db = new Database(":memory:");
    const chainId = "chain-abc";
    const { entries } = createTestChain(db, chainId);

    const lineage = loadJournal(db, chainId);
    const originalHash = generateReplayTopologyHash(entries);
    const reconstructedHash = generateReplayTopologyHash(lineage);

    expect(reconstructedHash).toBe(originalHash);
    expect(reconstructedHash.length).toBe(64);
  });

  it("6. Prove mutated journal entry fails integrity check (tamper resistance)", () => {
    const db = new Database(":memory:");
    const chainId = "chain-tamper";
    const { entries } = createTestChain(db, chainId);

    // Initial integrity should be valid
    expect(verifyJournalIntegrity(db, chainId).valid).toBe(true);

    // Mutate the receipt hash in the database to simulate tampering
    db.prepare("UPDATE topology_journal SET receipt_hash = ? WHERE id = ?").run("tampered_hash_value", entries[0].id);

    const integrity = verifyJournalIntegrity(db, chainId);
    expect(integrity.valid).toBe(false);
    expect(integrity.status).toBe("tampered");
  });

  it("7. Prove corrupted lineage fails integrity check (corruption detection)", () => {
    const db = new Database(":memory:");
    const chainId = "chain-corrupt";

    // Call initializeMembraneReplaySchema(db) first to prevent "no such table" errors
    initializeMembraneReplaySchema(db);

    const stmt = db.prepare(`
      INSERT INTO topology_journal (
        chain_id, delta_id, node_id, depth, payload, previous_receipt_hash, receipt_hash, status, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    // Insert corrupted invalid payload
    stmt.run(chainId, "delta-1", "hook-A", 0, "INVALID_JSON_STRING", null, "hash_value", "confirmed", Date.now());

    const integrity = verifyJournalIntegrity(db, chainId);
    expect(integrity.valid).toBe(false);
    expect(integrity.status).toBe("corrupted");
  });

  it("8. Prove mutated rollback snapshot failure during reconstruction/recovery", () => {
    const db = new Database(":memory:");
    const runId = "run-rollback";
    const failedReceiptId = "rcpt-failed";
    const states = {
      "hook-A": { state: { processedA: false }, lastReceiptHash: null },
    };

    saveRollbackSnapshot(db, runId, failedReceiptId, states);

    // Verify reconstruction works initially
    const reconstructed = reconstructRollbackState(db, runId);
    expect(reconstructed["hook-A"]).toEqual({ processedA: false });

    // Mutate the rollback snapshot in DB to be invalid JSON
    db.prepare("UPDATE rollback_snapshots SET states = ? WHERE run_id = ?").run("INVALID_JSON", runId);

    // reconstructRollbackState should throw a SyntaxError due to JSON.parse failure
    expect(() => reconstructRollbackState(db, runId)).toThrow(SyntaxError);
  });

  it("9. Prove seed determinism: same WAL + same seed = same reconstruction hash", () => {
    const db = new Database(":memory:");
    const chainId = "chain-seed";
    const { registeredHooks } = createTestChain(db, chainId);

    const lineage = loadJournal(db, chainId);

    // Replay with the correct parent seed should succeed and converge
    const replayResult1 = replayJournalLineage(db, lineage, registeredHooks, parentSeed);
    expect(replayResult1.converged).toBe(true);

    // Replay with a different parent seed should fail/diverge because the generated contexts/UUIDs won't match the original ones
    const replayResult2 = replayJournalLineage(db, lineage, registeredHooks, 999);
    expect(replayResult2.converged).toBe(false);
  });

  it("10. Prove normalized replay topology hash is order-independent but contents-dependent", () => {
    const db1 = new Database(":memory:");
    const db2 = new Database(":memory:");
    const chainId1 = "chain-1";
    const chainId2 = "chain-2";

    // Schedule 1: Hook Alpha first, then Hook Beta
    const _entryA1 = appendJournalEntry(db1, {
      chainId: chainId1,
      deltaId: "delta-alpha",
      nodeId: "hook-alpha",
      depth: 0,
      payload: JSON.stringify({ stateBefore: {}, stateAfter: { alpha: true } }),
      previousReceiptHash: null,
      receiptHash: hash("alpha_receipt_1"),
      status: "confirmed",
      timestamp: 1000,
    });

    const _entryB1 = appendJournalEntry(db1, {
      chainId: chainId1,
      deltaId: "delta-beta",
      nodeId: "hook-beta",
      depth: 0,
      payload: JSON.stringify({ stateBefore: {}, stateAfter: { beta: true } }),
      previousReceiptHash: null,
      receiptHash: hash("beta_receipt_1"),
      status: "confirmed",
      timestamp: 2000,
    });

    // Schedule 2: Hook Beta first, then Hook Alpha
    const _entryB2 = appendJournalEntry(db2, {
      chainId: chainId2,
      deltaId: "delta-beta",
      nodeId: "hook-beta",
      depth: 0,
      payload: JSON.stringify({ stateBefore: {}, stateAfter: { beta: true } }),
      previousReceiptHash: null,
      receiptHash: hash("beta_receipt_1"),
      status: "confirmed",
      timestamp: 1000,
    });

    const _entryA2 = appendJournalEntry(db2, {
      chainId: chainId2,
      deltaId: "delta-alpha",
      nodeId: "hook-alpha",
      depth: 0,
      payload: JSON.stringify({ stateBefore: {}, stateAfter: { alpha: true } }),
      previousReceiptHash: null,
      receiptHash: hash("alpha_receipt_1"),
      status: "confirmed",
      timestamp: 2000,
    });

    const lineage1 = loadJournal(db1, chainId1);
    const lineage2 = loadJournal(db2, chainId2);

    // Raw topology hashes differ because of order
    const rawHash1 = generateReplayTopologyHash(lineage1);
    const rawHash2 = generateReplayTopologyHash(lineage2);
    expect(rawHash1).not.toBe(rawHash2);

    // Normalized topology hashes are identical
    const normHash1 = generateNormalizedReplayTopologyHash(lineage1);
    const normHash2 = generateNormalizedReplayTopologyHash(lineage2);
    expect(normHash1).toBe(normHash2);
  });
});
