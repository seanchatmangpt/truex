/* eslint-disable unicorn/no-null */
import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import fc from "fast-check";
import { hash } from "../../src/hash.js";
import { createDeterministicContext } from "../../src/context.js";
import { createReceipt } from "../../src/receipt.js";
import {
  appendJournalEntry,
  loadJournal,
  generateReplayTopologyHash,
  generateNormalizedReplayTopologyHash,
  reconstructTopologyState,
  verifyJournalIntegrity,
  replayJournalLineage,
} from "../../src/membrane-replay.gall.js";

const parentSeed = 42;

// Helper to create a replay-compatible journal entry
function appendReplayCompatibleJournalEntry(
  db: Database.Database,
  entry: {
    chainId: string;
    deltaId: string;
    nodeId: string;
    depth: number;
    delta: any;
    stateBefore: any;
    stateAfter: any;
    previousReceiptHash: string | null;
    status: "confirmed" | "refused" | "rollback" | "failed";
    timestamp: number;
  },
  seed: number
) {
  const stepHash = hash({
    nodeId: entry.nodeId,
    delta: entry.delta,
    previousReceiptHash: entry.previousReceiptHash,
    parentSeed: seed,
  });
  const stepSeed = Number.parseInt(stepHash.slice(0, 8), 16) >>> 0;
  const stepCtx = createDeterministicContext(stepSeed);

  const eventId = `evt_${stepCtx.uuid()}`;
  const inputHash = hash({ delta: entry.delta, stateBefore: entry.stateBefore });
  const outputHash = hash({ effects: [], stateAfter: entry.stateAfter });

  const receipt = createReceipt(
    stepCtx,
    eventId,
    entry.deltaId,
    inputHash,
    outputHash,
    entry.previousReceiptHash,
    entry.status === "confirmed" ? "confirmed" : "refused"
  );

  const payload = JSON.stringify({
    delta: entry.delta,
    stateBefore: entry.stateBefore,
    stateAfter: entry.stateAfter,
    inputHash: receipt.inputHash,
    outputHash: receipt.outputHash,
    eventId: receipt.eventId,
    receiptId: receipt.id,
  });

  return appendJournalEntry(db, {
    chainId: entry.chainId,
    deltaId: entry.deltaId,
    nodeId: entry.nodeId,
    depth: entry.depth,
    payload,
    previousReceiptHash: entry.previousReceiptHash,
    receiptHash: receipt.receiptHash,
    status: entry.status,
    timestamp: entry.timestamp,
  });
}

describe("Membrane Partial Order & VKG Persistence Tests", () => {
  it("should prove persisted topology replay remains schedule-independent (persisting two independent branches)", () => {
    const db1 = new Database(":memory:");
    const db2 = new Database(":memory:");

    const chainId1 = "chain-schedule-1";
    const chainId2 = "chain-schedule-2";

    // Define two independent hooks
    const hookAlpha = {
      condition: { kind: "delta-match", predicate: "alpha" },
      behavior: (state: any, delta: any, ctx: any) => ({
        nextState: { alpha: delta.val },
        effects: [],
      }),
      initialState: { alpha: 0 },
    };

    const hookBeta = {
      condition: { kind: "delta-match", predicate: "beta" },
      behavior: (state: any, delta: any, ctx: any) => ({
        nextState: { beta: delta.val },
        effects: [],
      }),
      initialState: { beta: 0 },
    };

    const registeredHooks = new Map<string, any>([
      ["hook-alpha", hookAlpha],
      ["hook-beta", hookBeta],
    ]);

    // Schedule 1: Hook Alpha first, then Hook Beta
    const entryA1 = appendReplayCompatibleJournalEntry(
      db1,
      {
        chainId: chainId1,
        deltaId: "delta-alpha",
        nodeId: "hook-alpha",
        depth: 0,
        delta: { val: 100 },
        stateBefore: { alpha: 0 },
        stateAfter: { alpha: 100 },
        previousReceiptHash: null,
        status: "confirmed",
        timestamp: 1000,
      },
      parentSeed
    );

    const entryB1 = appendReplayCompatibleJournalEntry(
      db1,
      {
        chainId: chainId1,
        deltaId: "delta-beta",
        nodeId: "hook-beta",
        depth: 0,
        delta: { val: 200 },
        stateBefore: { beta: 0 },
        stateAfter: { beta: 200 },
        previousReceiptHash: null,
        status: "confirmed",
        timestamp: 2000,
      },
      parentSeed
    );

    // Schedule 2: Hook Beta first, then Hook Alpha
    const entryB2 = appendReplayCompatibleJournalEntry(
      db2,
      {
        chainId: chainId2,
        deltaId: "delta-beta",
        nodeId: "hook-beta",
        depth: 0,
        delta: { val: 200 },
        stateBefore: { beta: 0 },
        stateAfter: { beta: 200 },
        previousReceiptHash: null,
        status: "confirmed",
        timestamp: 1000,
      },
      parentSeed
    );

    const entryA2 = appendReplayCompatibleJournalEntry(
      db2,
      {
        chainId: chainId2,
        deltaId: "delta-alpha",
        nodeId: "hook-alpha",
        depth: 0,
        delta: { val: 100 },
        stateBefore: { alpha: 0 },
        stateAfter: { alpha: 100 },
        previousReceiptHash: null,
        status: "confirmed",
        timestamp: 2000,
      },
      parentSeed
    );

    // Load lineages
    const lineage1 = loadJournal(db1, chainId1);
    const lineage2 = loadJournal(db2, chainId2);

    // Integrity checks
    expect(verifyJournalIntegrity(db1, chainId1).valid).toBe(true);
    expect(verifyJournalIntegrity(db2, chainId2).valid).toBe(true);

    // 1. Non-normalized schedule replay hashes differ
    const rawHash1 = generateReplayTopologyHash(lineage1);
    const rawHash2 = generateReplayTopologyHash(lineage2);
    expect(rawHash1).not.toBe(rawHash2);

    // 2. Reconstructed normalized topology hash converges
    const normHash1 = generateNormalizedReplayTopologyHash(lineage1);
    const normHash2 = generateNormalizedReplayTopologyHash(lineage2);
    expect(normHash1).toBe(normHash2);

    // 3. VKG projection state and hash converges
    const state1 = reconstructTopologyState(db1, chainId1);
    const state2 = reconstructTopologyState(db2, chainId2);
    expect(state1).toEqual(state2);

    const vkgHash1 = hash(state1);
    const vkgHash2 = hash(state2);
    expect(vkgHash1).toBe(vkgHash2);

    // 4. Replay both schedules successfully
    const replay1 = replayJournalLineage(db1, lineage1, registeredHooks, parentSeed);
    expect(replay1.converged).toBe(true);

    const replay2 = replayJournalLineage(db2, lineage2, registeredHooks, parentSeed);
    expect(replay2.converged).toBe(true);
  });

  it("should detect projection divergence after WAL mutation", () => {
    const db = new Database(":memory:");
    const chainId = "chain-mutate";

    // Setup an initial state
    const entry = appendReplayCompatibleJournalEntry(
      db,
      {
        chainId,
        deltaId: "delta-alpha",
        nodeId: "hook-alpha",
        depth: 0,
        delta: { val: 100 },
        stateBefore: { alpha: 0 },
        stateAfter: { alpha: 100 },
        previousReceiptHash: null,
        status: "confirmed",
        timestamp: 1000,
      },
      parentSeed
    );

    const originalState = reconstructTopologyState(db, chainId);
    expect(originalState["hook-alpha"]).toEqual({ alpha: 100 });

    // Mutate the payload to simulate WAL tampering
    db.prepare("UPDATE topology_journal SET payload = ? WHERE node_id = ?").run(
      JSON.stringify({
        delta: { val: 100 },
        stateBefore: { alpha: 0 },
        stateAfter: { alpha: 999 }, // Tampered state
        inputHash: "fake_input",
        outputHash: "fake_output",
        eventId: "fake_event",
        receiptId: "fake_receipt",
      }),
      "hook-alpha"
    );

    const mutatedState = reconstructTopologyState(db, chainId);
    expect(mutatedState["hook-alpha"]).toEqual({ alpha: 999 });

    // The projection diverges from original
    expect(hash(mutatedState)).not.toBe(hash(originalState));

    // The integrity validation must detect this tampering
    const integrity = verifyJournalIntegrity(db, chainId);
    expect(integrity.valid).toBe(false);
    expect(integrity.status).toBe("tampered");
  });

  it("should fail safely during replay after WAL truncation", () => {
    const db = new Database(":memory:");
    const chainId = "chain-truncation";

    // Create a dependent execution chain: Alpha (depth 0) -> Beta (depth 1, depends on Alpha)
    const entryA = appendReplayCompatibleJournalEntry(
      db,
      {
        chainId,
        deltaId: "delta-alpha",
        nodeId: "hook-alpha",
        depth: 0,
        delta: { val: 1 },
        stateBefore: { alpha: 0 },
        stateAfter: { alpha: 1 },
        previousReceiptHash: null,
        status: "confirmed",
        timestamp: 1000,
      },
      parentSeed
    );

    const entryB = appendReplayCompatibleJournalEntry(
      db,
      {
        chainId,
        deltaId: "delta-beta",
        nodeId: "hook-beta",
        depth: 1,
        delta: { val: 2 },
        stateBefore: { beta: 0 },
        stateAfter: { beta: 2 },
        previousReceiptHash: entryA.receiptHash,
        status: "confirmed",
        timestamp: 2000,
      },
      parentSeed
    );

    // Initially valid
    expect(verifyJournalIntegrity(db, chainId).valid).toBe(true);

    // Delete/truncate the parent entryA, leaving entryB orphaned
    db.prepare("DELETE FROM topology_journal WHERE id = ?").run(entryA.id);

    // Integrity checks should fail safely as truncated
    const integrity = verifyJournalIntegrity(db, chainId);
    expect(integrity.valid).toBe(false);
    expect(integrity.status).toBe("truncated");
  });

  it("should verify schedule-independence properties across randomized operations (property-based)", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            nodeIndex: fc.integer({ min: 0, max: 4 }), // map to one of 5 independent nodes
            val: fc.integer({ min: 1, max: 1000 }),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        (rawOps) => {
          // To ensure independence, we only keep the last operation for each nodeIndex.
          // This way, we have a set of independent node updates.
          const uniqueOpsMap = new Map<number, number>();
          for (const op of rawOps) {
            uniqueOpsMap.set(op.nodeIndex, op.val);
          }

          const ops = [...uniqueOpsMap.entries()].map(([nodeIndex, val]) => ({
            nodeId: `node-${nodeIndex}`,
            deltaId: `delta-${nodeIndex}`,
            delta: { val },
            stateBefore: { val: 0 },
            stateAfter: { val },
          }));

          if (ops.length < 2) return; // Need at least two to have schedule differences

          const db1 = new Database(":memory:");
          const db2 = new Database(":memory:");
          const chainId1 = "fc-chain-1";
          const chainId2 = "fc-chain-2";

          // Schedule 1: Order as generated
          const schedule1 = [...ops];
          // Schedule 2: Reversed or different order
          const schedule2 = [...ops].reverse();

          // Write Schedule 1
          for (const op of schedule1) {
            appendReplayCompatibleJournalEntry(
              db1,
              {
                chainId: chainId1,
                deltaId: op.deltaId,
                nodeId: op.nodeId,
                depth: 0,
                delta: op.delta,
                stateBefore: op.stateBefore,
                stateAfter: op.stateAfter,
                previousReceiptHash: null,
                status: "confirmed",
                timestamp: Date.now(),
              },
              parentSeed
            );
          }

          // Write Schedule 2
          for (const op of schedule2) {
            appendReplayCompatibleJournalEntry(
              db2,
              {
                chainId: chainId2,
                deltaId: op.deltaId,
                nodeId: op.nodeId,
                depth: 0,
                delta: op.delta,
                stateBefore: op.stateBefore,
                stateAfter: op.stateAfter,
                previousReceiptHash: null,
                status: "confirmed",
                timestamp: Date.now(),
              },
              parentSeed
            );
          }

          const lineage1 = loadJournal(db1, chainId1);
          const lineage2 = loadJournal(db2, chainId2);

          // 1. Normalized topology hashes MUST converge
          const normHash1 = generateNormalizedReplayTopologyHash(lineage1);
          const normHash2 = generateNormalizedReplayTopologyHash(lineage2);
          expect(normHash1).toBe(normHash2);

          // 2. VKG projection states MUST converge
          const state1 = reconstructTopologyState(db1, chainId1);
          const state2 = reconstructTopologyState(db2, chainId2);
          expect(state1).toEqual(state2);

          // 3. Non-normalized topology hashes MUST differ
          const rawHash1 = generateReplayTopologyHash(lineage1);
          const rawHash2 = generateReplayTopologyHash(lineage2);
          expect(rawHash1).not.toBe(rawHash2);
        }
      ),
      { numRuns: 50 }
    );
  });
});
