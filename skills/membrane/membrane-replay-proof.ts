import Database from "better-sqlite3";
import { hash } from "../../packages/truex-core/src/hash.js";
import { createDeterministicContext } from "../../packages/truex-core/src/context.js";
import { createReceipt } from "../../packages/truex-core/src/receipt.js";
import {
  appendJournalEntry,
  loadJournal,
  reconstructTopologyState,
  replayJournalLineage,
  verifyJournalIntegrity,
  generateReplayTopologyHash,
  generateNormalizedReplayTopologyHash,
  initializeMembraneReplaySchema,
  saveRollbackSnapshot,
  recoverFromCrash,
  type JournalEntry
} from "../../packages/truex-core/src/membrane-replay.gall.js";

export interface MembraneReplayProofReport {
  case: string;
  status: string;
  passed: boolean;
  domains: {
    journalLineage: {
      attempted: number;
      converged: number;
      corrupted: number;
      tampered: number;
      truncated: number;
      successRatePct: number;
      successRatePctString: string;
    };
    crashRecovery: {
      attempted: number;
      recovered: number;
      failed: number;
      successRatePct: number;
      successRatePctString: string;
    };
    partialOrder: {
      attempted: number;
      converged: number;
      diverged: number;
      successRatePct: number;
      successRatePctString: string;
    };
    vkgProjection: {
      attempted: number;
      converged: number;
      diverged: number;
      successRatePct: number;
      successRatePctString: string;
    };
  };
  proofs: {
    abcChainLineageVerified: boolean;
    walReconstructionSuccess: boolean;
    tamperingRefusalSuccess: boolean;
    corruptionRefusalSuccess: boolean;
    crashRecoveryRollbackSuccess: boolean;
    partialOrderNormalizedHashConvergence: boolean;
    vkgProjectionConsistencyVerified: boolean;
  };
  metrics: {
    totalJournalEntries: number;
    reconstructedChains: number;
    restoredHooksCount: number;
    tamperedRejects: number;
    corruptedRejects: number;
    recoveredCrashes: number;
    durationMs: number;
    replayTopologyHash: string;
    normalizedReplayTopologyHash: string;
  };
  invariants: string[];
  failures: string[];
}

export async function proveMembraneReplay(): Promise<MembraneReplayProofReport> {
  const start = Date.now();
  const failures: string[] = [];
  const invariants: string[] = [
    "cascading hook transactions persist correctly to SQLite WAL",
    "unmutated journal lineage replays and converges identically",
    "any tampering of receipt hash in WAL causes integrity validation check to fail",
    "corrupted payload in WAL is detected as corrupted and fails validation",
    "interleaved schedule execution of independent branches converges to same normalized topology hash and VKG projection",
    "crash recovery rollbacks active uncommitted transactions to pre-run snapshot state and appends recovery receipt"
  ];

  // Variables to capture status of tests
  let abcChainLineageVerified = false;
  let walReconstructionSuccess = false;
  let tamperingRefusalSuccess = false;
  let corruptionRefusalSuccess = false;
  let crashRecoveryRollbackSuccess = false;
  let partialOrderNormalizedHashConvergence = false;
  let vkgProjectionConsistencyVerified = false;

  let totalJournalEntries = 0;
  let reconstructedChains = 0;
  let restoredHooksCount = 0;
  let tamperedRejects = 0;
  let corruptedRejects = 0;
  let recoveredCrashes = 0;

  // Decoupled accounting counts
  let lineageAttempted = 0;
  let lineageConverged = 0;
  let lineageCorrupted = 0;
  let lineageTampered = 0;
  let lineageTruncated = 0;

  let crashAttempted = 0;
  let crashRecovered = 0;
  let crashFailed = 0;

  let partialAttempted = 0;
  let partialConverged = 0;
  let partialDiverged = 0;

  let vkgAttempted = 0;
  let vkgConverged = 0;
  let vkgDiverged = 0;

  // 1. Reconstruction & Replay Proof
  try {
    const db = new Database(":memory:");
    const chainId = "chain-abc";
    lineageAttempted++;

    const parentSeed = 42;
    const hookA = {
      condition: { kind: "delta-match", predicate: "trigger:A" },
      behavior: (state: any, delta: any, ctx: any) => ({
        nextState: { processedA: true },
        effects: [{ kind: "add-quad", quad: { subject: "urn:node:B", predicate: "trigger:B", object: "value:B", graph: null } }],
      }),
      initialState: { processedA: false },
    };
    const hookB = {
      condition: { kind: "delta-match", predicate: "trigger:B" },
      behavior: (state: any, delta: any, ctx: any) => ({
        nextState: { processedB: true },
        effects: [{ kind: "add-quad", quad: { subject: "urn:node:C", predicate: "trigger:C", object: "value:C", graph: null } }],
      }),
      initialState: { processedB: false },
    };
    const hookC = {
      condition: { kind: "delta-match", predicate: "trigger:C" },
      behavior: (state: any, delta: any, ctx: any) => ({
        nextState: { processedC: true },
        effects: [{ kind: "emit-event", type: "chain_completed" }],
      }),
      initialState: { processedC: false },
    };

    const registeredHooks = new Map<string, any>([
      ["hook-A", hookA],
      ["hook-B", hookB],
      ["hook-C", hookC],
    ]);

    const rootDelta = {
      id: "delta-root",
      adds: [{ subject: "urn:node:A", predicate: "trigger:A", object: "value:A", graph: null }],
      deletes: [],
    };

    const stepCtxA = createDeterministicContext(101);
    const receiptA = createReceipt(
      stepCtxA,
      "evt_A",
      "delta-root",
      hash({ delta: rootDelta, stateBefore: { processedA: false } }),
      hash({ effects: hookA.behavior(hookA.initialState, rootDelta, stepCtxA).effects, stateAfter: { processedA: true } }),
      null,
      "confirmed"
    );

    appendJournalEntry(db, {
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
      timestamp: Date.now(),
    });
    totalJournalEntries++;

    const stepCtxB = createDeterministicContext(102);
    const receiptB = createReceipt(
      stepCtxB,
      "evt_B",
      "delta-B",
      hash({ delta: { id: "delta-B" }, stateBefore: { processedB: false } }),
      hash({ effects: hookB.behavior(hookB.initialState, { id: "delta-B" }, stepCtxB).effects, stateAfter: { processedB: true } }),
      receiptA.receiptHash,
      "confirmed"
    );

    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-B",
      nodeId: "hook-B",
      depth: 1,
      payload: JSON.stringify({
        delta: { id: "delta-B" },
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
      timestamp: Date.now(),
    });
    totalJournalEntries++;

    const stepCtxC = createDeterministicContext(103);
    const receiptC = createReceipt(
      stepCtxC,
      "evt_C",
      "delta-C",
      hash({ delta: { id: "delta-C" }, stateBefore: { processedC: false } }),
      hash({ effects: hookC.behavior(hookC.initialState, { id: "delta-C" }, stepCtxC).effects, stateAfter: { processedC: true } }),
      receiptB.receiptHash,
      "confirmed"
    );

    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-C",
      nodeId: "hook-C",
      depth: 2,
      payload: JSON.stringify({
        delta: { id: "delta-C" },
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
      timestamp: Date.now(),
    });
    totalJournalEntries++;

    // Reconstruct state from WAL
    const reconstructed = reconstructTopologyState(db, chainId);
    if (
      reconstructed["hook-A"]?.processedA === true &&
      reconstructed["hook-B"]?.processedB === true &&
      reconstructed["hook-C"]?.processedC === true
    ) {
      walReconstructionSuccess = true;
      reconstructedChains++;
    }

    const integrity = verifyJournalIntegrity(db, chainId);
    if (integrity.valid) {
      abcChainLineageVerified = true;
      lineageConverged++;
    } else {
      failures.push(`ABC chain integrity check failed: ${integrity.status}`);
    }

    // 2. Tampering & Corruption Checks
    const tamperedDb = new Database(":memory:");
    initializeMembraneReplaySchema(tamperedDb);
    const entryT = appendJournalEntry(tamperedDb, {
      chainId: "tampered-chain",
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
      timestamp: Date.now(),
    });

    tamperedDb.prepare("UPDATE topology_journal SET receipt_hash = ? WHERE id = ?").run("tampered_hash", entryT.id);
    const tamperedIntegrity = verifyJournalIntegrity(tamperedDb, "tampered-chain");
    if (!tamperedIntegrity.valid && tamperedIntegrity.status === "tampered") {
      tamperingRefusalSuccess = true;
      tamperedRejects++;
      lineageTampered++;
    } else {
      failures.push("Tampering was not detected by integrity validation");
    }

    const corruptedDb = new Database(":memory:");
    initializeMembraneReplaySchema(corruptedDb);
    corruptedDb.prepare(`
      INSERT INTO topology_journal (
        chain_id, delta_id, node_id, depth, payload, previous_receipt_hash, receipt_hash, status, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run("corrupted-chain", "delta-1", "hook-A", 0, "INVALID_JSON", null, "corrupt_hash", "confirmed", Date.now());

    const corruptedIntegrity = verifyJournalIntegrity(corruptedDb, "corrupted-chain");
    if (!corruptedIntegrity.valid && corruptedIntegrity.status === "corrupted") {
      corruptionRefusalSuccess = true;
      corruptedRejects++;
      lineageCorrupted++;
    } else {
      failures.push("Corruption was not detected by integrity validation");
    }

  } catch (err: any) {
    failures.push(`Reconstruction / Replay proof block threw: ${err.message}`);
  }

  // 3. Crash Recovery Proof
  try {
    crashAttempted++;
    const db = new Database(":memory:");
    const chainId = "chain-crash";

    const hookA = {
      id: "hook-A",
      state: { count: 10 },
      lastReceiptHash: "prev_hash",
    };
    const registeredHooks = new Map<string, any>([
      ["hook-A", hookA],
    ]);

    saveRollbackSnapshot(db, chainId, "failed_rcpt_id_123", {
      "hook-A": { state: { count: 0 }, lastReceiptHash: null },
    });

    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-1",
      nodeId: "hook-A",
      depth: 0,
      payload: JSON.stringify({
        delta: { id: "delta-1" },
        stateBefore: { count: 0 },
        stateAfter: { count: 10 },
        inputHash: "input",
        outputHash: "output",
        eventId: "evt_1",
        receiptId: "rcpt_1",
      }),
      previousReceiptHash: null,
      receiptHash: "rcpt_1_hash",
      status: "confirmed",
      timestamp: Date.now(),
    });
    totalJournalEntries++;

    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-2",
      nodeId: "hook-B",
      depth: 1,
      payload: JSON.stringify({ error: "Backpressure capacity breach" }),
      previousReceiptHash: "rcpt_1_hash",
      receiptHash: "failed_rcpt_id_123",
      status: "failed",
      timestamp: Date.now(),
    });
    totalJournalEntries++;

    const recoveryResult = recoverFromCrash(db, registeredHooks, 42);
    if (
      recoveryResult.recovered &&
      hookA.state.count === 0 &&
      hookA.lastReceiptHash === null &&
      recoveryResult.receipts.some(r => r.status === "refused" && r.failedChildId === "failed_rcpt_id_123")
    ) {
      crashRecoveryRollbackSuccess = true;
      crashRecovered++;
      recoveredCrashes++;
      restoredHooksCount++;
    } else {
      failures.push("Crash recovery rollback failed to restore hook state correctly");
      crashFailed++;
    }

  } catch (err: any) {
    failures.push(`Crash recovery proof threw: ${err.message}`);
    crashFailed++;
  }

  // 4. Partial Order Replay & VKG Projection Consistency Proof
  let replayTopologyHashVal = "";
  let normalizedReplayTopologyHashVal = "";
  try {
    partialAttempted++;
    vkgAttempted++;
    const db1 = new Database(":memory:");
    const db2 = new Database(":memory:");

    const chainId1 = "chain-schedule-1";
    const chainId2 = "chain-schedule-2";

    // Replay-compatible helper definition inside proof
    const appendReplayCompatible = (
      db: Database,
      entry: {
        chainId: string;
        deltaId: string;
        nodeId: string;
        depth: number;
        delta: any;
        stateBefore: any;
        stateAfter: any;
        previousReceiptHash: string | null;
        status: "confirmed";
        timestamp: number;
      }
    ) => {
      const stepHash = hash({
        nodeId: entry.nodeId,
        delta: entry.delta,
        previousReceiptHash: entry.previousReceiptHash,
        parentSeed: 42,
      });
      const stepSeed = parseInt(stepHash.substring(0, 8), 16) >>> 0;
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
        "confirmed"
      );
      return appendJournalEntry(db, {
        chainId: entry.chainId,
        deltaId: entry.deltaId,
        nodeId: entry.nodeId,
        depth: entry.depth,
        payload: JSON.stringify({
          delta: entry.delta,
          stateBefore: entry.stateBefore,
          stateAfter: entry.stateAfter,
          inputHash: receipt.inputHash,
          outputHash: receipt.outputHash,
          eventId: receipt.eventId,
          receiptId: receipt.id,
        }),
        previousReceiptHash: entry.previousReceiptHash,
        receiptHash: receipt.receiptHash,
        status: entry.status,
        timestamp: entry.timestamp,
      });
    };

    // Branch Alpha execution
    const entryA1 = appendReplayCompatible(db1, {
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
    });
    totalJournalEntries++;

    const entryB1 = appendReplayCompatible(db1, {
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
    });
    totalJournalEntries++;

    // Branch Beta execution (reverse order)
    const entryB2 = appendReplayCompatible(db2, {
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
    });
    totalJournalEntries++;

    const entryA2 = appendReplayCompatible(db2, {
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
    });
    totalJournalEntries++;

    const lineage1 = loadJournal(db1, chainId1);
    const lineage2 = loadJournal(db2, chainId2);

    const rawHash1 = generateReplayTopologyHash(lineage1);
    const rawHash2 = generateReplayTopologyHash(lineage2);
    replayTopologyHashVal = rawHash1;

    const normHash1 = generateNormalizedReplayTopologyHash(lineage1);
    const normHash2 = generateNormalizedReplayTopologyHash(lineage2);
    normalizedReplayTopologyHashVal = normHash1;

    if (rawHash1 !== rawHash2 && normHash1 === normHash2) {
      partialOrderNormalizedHashConvergence = true;
      partialConverged++;
    } else {
      failures.push("Normalized topology hash mismatch on different scheduling orders");
      partialDiverged++;
    }

    const state1 = reconstructTopologyState(db1, chainId1);
    const state2 = reconstructTopologyState(db2, chainId2);
    const vkgHash1 = hash(state1);
    const vkgHash2 = hash(state2);

    if (vkgHash1 === vkgHash2) {
      vkgProjectionConsistencyVerified = true;
      vkgConverged++;
    } else {
      failures.push("VKG projection state mismatch on different scheduling orders");
      vkgDiverged++;
    }

  } catch (err: any) {
    failures.push(`Partial order and VKG consistency checks threw: ${err.message}`);
    partialDiverged++;
    vkgDiverged++;
  }

  const durationMs = Date.now() - start;

  const getPct = (val: number, attempted: number) => (attempted === 0 ? 0 : parseFloat(((val / attempted) * 100).toFixed(3)));
  const getPctStr = (val: number, attempted: number) => `${getPct(val, attempted).toFixed(3)}%`;

  return {
    case: "membrane-journal-replay",
    status: failures.length === 0 ? "passed" : "failed",
    passed: failures.length === 0,
    domains: {
      journalLineage: {
        attempted: lineageAttempted,
        converged: lineageConverged,
        corrupted: lineageCorrupted,
        tampered: lineageTampered,
        truncated: lineageTruncated,
        successRatePct: getPct(lineageConverged, lineageAttempted),
        successRatePctString: getPctStr(lineageConverged, lineageAttempted)
      },
      crashRecovery: {
        attempted: crashAttempted,
        recovered: crashRecovered,
        failed: crashFailed,
        successRatePct: getPct(crashRecovered, crashAttempted),
        successRatePctString: getPctStr(crashRecovered, crashAttempted)
      },
      partialOrder: {
        attempted: partialAttempted,
        converged: partialConverged,
        diverged: partialDiverged,
        successRatePct: getPct(partialConverged, partialAttempted),
        successRatePctString: getPctStr(partialConverged, partialAttempted)
      },
      vkgProjection: {
        attempted: vkgAttempted,
        converged: vkgConverged,
        diverged: vkgDiverged,
        successRatePct: getPct(vkgConverged, vkgAttempted),
        successRatePctString: getPctStr(vkgConverged, vkgAttempted)
      }
    },
    proofs: {
      abcChainLineageVerified,
      walReconstructionSuccess,
      tamperingRefusalSuccess,
      corruptionRefusalSuccess,
      crashRecoveryRollbackSuccess,
      partialOrderNormalizedHashConvergence,
      vkgProjectionConsistencyVerified
    },
    metrics: {
      totalJournalEntries,
      reconstructedChains,
      restoredHooksCount,
      tamperedRejects,
      corruptedRejects,
      recoveredCrashes,
      durationMs,
      replayTopologyHash: replayTopologyHashVal,
      normalizedReplayTopologyHash: normalizedReplayTopologyHashVal
    },
    invariants,
    failures
  };
}
