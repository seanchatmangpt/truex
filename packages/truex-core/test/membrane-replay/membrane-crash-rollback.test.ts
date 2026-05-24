/* eslint-disable unicorn/no-null, @typescript-eslint/no-non-null-assertion */
import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { hash } from "../../src/hash.js";
import {
  appendJournalEntry,
  saveRollbackSnapshot,
  recoverFromCrash,
  loadJournal,
  reconstructTopologyState,
} from "../../src/membrane-replay.gall.js";

describe("Membrane Crash Recovery + Rollback Tests", () => {
  const parentSeed = 42;

  it("1. should handle simulated crash during topology execution and initiate rollback", () => {
    const db = new Database(":memory:");
    const chainId = "chain-crash-topology";

    const hookA = { id: "hook-A", state: { count: 10 }, lastReceiptHash: "prev_hash" };
    const registeredHooks = new Map<string, any>([["hook-A", hookA]]);

    // Save snapshot of pre-run states
    saveRollbackSnapshot(db, chainId, "failed_rcpt_1", {
      "hook-A": { state: { count: 2 }, lastReceiptHash: "init_hash" },
    });

    // Write confirmed entry (successful before crash)
    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-1",
      nodeId: "hook-A",
      depth: 0,
      payload: JSON.stringify({ stateBefore: { count: 2 }, stateAfter: { count: 10 } }),
      previousReceiptHash: "init_hash",
      receiptHash: "rcpt_A_hash",
      status: "confirmed",
      timestamp: Date.now(),
    });

    // Write failed entry (the crash event)
    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-2",
      nodeId: "hook-B",
      depth: 1,
      payload: JSON.stringify({ error: "Memory constraint violation" }),
      previousReceiptHash: "rcpt_A_hash",
      receiptHash: "failed_rcpt_1",
      status: "failed",
      timestamp: Date.now(),
    });

    // Run recovery
    const recoveryResult = recoverFromCrash(db, registeredHooks, parentSeed);

    // Assert recovery successfully completed
    expect(recoveryResult.recovered).toBe(true);
    expect(recoveryResult.activeChainsRolledBack).toContain(chainId);
    expect(hookA.state.count).toBe(2);
    expect(hookA.lastReceiptHash).toBe("init_hash");
  });

  it("2. should recover hook states and reconstruct database state from WAL only", () => {
    const db = new Database(":memory:");
    const chainId = "chain-wal-recovery";

    // Write historical confirmed entries in WAL (journal)
    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-1",
      nodeId: "hook-A",
      depth: 0,
      payload: JSON.stringify({ stateBefore: {}, stateAfter: { status: "ready" } }),
      previousReceiptHash: null,
      receiptHash: "rcpt_1_hash",
      status: "confirmed",
      timestamp: Date.now(),
    });

    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-2",
      nodeId: "hook-B",
      depth: 1,
      payload: JSON.stringify({ stateBefore: {}, stateAfter: { value: 100 } }),
      previousReceiptHash: "rcpt_1_hash",
      receiptHash: "rcpt_2_hash",
      status: "confirmed",
      timestamp: Date.now(),
    });

    // Reconstruct state from SQLite journal (representing WAL only load)
    const reconstructed = reconstructTopologyState(db, chainId);

    expect(reconstructed["hook-A"]).toEqual({ status: "ready" });
    expect(reconstructed["hook-B"]).toEqual({ value: 100 });
  });

  it("3. should detect incomplete transitions and avoid double rollback", () => {
    const db = new Database(":memory:");
    const chainId = "chain-incomplete";

    const hookA = { id: "hook-A", state: { val: "new" }, lastReceiptHash: "rcpt_A" };
    const registeredHooks = new Map<string, any>([["hook-A", hookA]]);

    // Snapshot indicates execution started but hasn't completed or rolled back
    saveRollbackSnapshot(db, chainId, "failed_rcpt_id_inc", {
      "hook-A": { state: { val: "old" }, lastReceiptHash: "init" },
    });

    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-1",
      nodeId: "hook-A",
      depth: 0,
      payload: JSON.stringify({ stateBefore: { val: "old" }, stateAfter: { val: "new" } }),
      previousReceiptHash: "init",
      receiptHash: "rcpt_A",
      status: "confirmed",
      timestamp: Date.now(),
    });

    // First recovery detects the incomplete transition and rolls it back
    const res1 = recoverFromCrash(db, registeredHooks, parentSeed);
    expect(res1.recovered).toBe(true);
    expect(res1.activeChainsRolledBack).toContain(chainId);

    // Second recovery should not roll back again as rollback entries are already present
    const res2 = recoverFromCrash(db, registeredHooks, parentSeed);
    expect(res2.recovered).toBe(false);
    expect(res2.activeChainsRolledBack).not.toContain(chainId);
  });

  it("4. should guarantee rollback restoration convergence of memory and persistent states", () => {
    const db = new Database(":memory:");
    const chainId = "chain-convergence";

    const hookA = { id: "hook-A", state: { score: 100 }, lastReceiptHash: "rcpt_1" };
    const registeredHooks = new Map<string, any>([["hook-A", hookA]]);

    saveRollbackSnapshot(db, chainId, "failed_rcpt_conv", {
      "hook-A": { state: { score: 10 }, lastReceiptHash: "init" },
    });

    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-1",
      nodeId: "hook-A",
      depth: 0,
      payload: JSON.stringify({ stateBefore: { score: 10 }, stateAfter: { score: 100 } }),
      previousReceiptHash: "init",
      receiptHash: "rcpt_1",
      status: "confirmed",
      timestamp: Date.now(),
    });

    // Recover
    recoverFromCrash(db, registeredHooks, parentSeed);

    // Verify memory state converges to pre-run snapshot state
    expect(hookA.state.score).toBe(10);
    expect(hookA.lastReceiptHash).toBe("init");

    // Verify database state reconstruction also converges to pre-run snapshot state
    const reconstructed = reconstructTopologyState(db, chainId);
    expect(reconstructed["hook-A"]).toEqual({ score: 10 });
  });

  it("5. should block downstream authority progression when a child step fails", () => {
    const db = new Database(":memory:");
    const chainId = "chain-downstream-block";

    // hook-A succeeded, hook-B failed. hook-C (downstream) cannot run.
    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-1",
      nodeId: "hook-A",
      depth: 0,
      payload: JSON.stringify({ stateBefore: {}, stateAfter: { a: 1 } }),
      previousReceiptHash: null,
      receiptHash: "rcpt_A",
      status: "confirmed",
      timestamp: Date.now(),
    });

    // hook-B is quarantined/failed
    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-2",
      nodeId: "hook-B",
      depth: 1,
      payload: JSON.stringify({ error: "Downstream authority block" }),
      previousReceiptHash: "rcpt_A",
      receiptHash: "failed_rcpt_B",
      status: "failed",
      timestamp: Date.now(),
    });

    const hookA = { id: "hook-A", state: { a: 1 }, lastReceiptHash: "rcpt_A" };
    const registeredHooks = new Map<string, any>([["hook-A", hookA]]);

    saveRollbackSnapshot(db, chainId, "failed_rcpt_B", {
      "hook-A": { state: { a: 0 }, lastReceiptHash: null },
    });

    recoverFromCrash(db, registeredHooks, parentSeed);

    const journal = loadJournal(db, chainId);

    // Assert hook-A was rolled back and no downstream confirmed entries exist after failed_rcpt_B
    const failureIndex = journal.findIndex(x => x.receiptHash === "failed_rcpt_B");
    expect(failureIndex).toBeGreaterThan(-1);

    const afterFailure = journal.slice(failureIndex + 1);
    // All entries written after failure are either rollback or recovery receipt, never confirmed downstream steps
    for (const entry of afterFailure) {
      expect(entry.status).not.toBe("confirmed");
    }
  });

  it("6. should persist quarantined failed entries during and after recovery", () => {
    const db = new Database(":memory:");
    const chainId = "chain-quarantine";

    const hookA = { id: "hook-A", state: { active: true }, lastReceiptHash: "rcpt_1" };
    const registeredHooks = new Map<string, any>([["hook-A", hookA]]);

    saveRollbackSnapshot(db, chainId, "failed_rcpt_q", {
      "hook-A": { state: { active: false }, lastReceiptHash: null },
    });

    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-1",
      nodeId: "hook-A",
      depth: 0,
      payload: JSON.stringify({ stateBefore: { active: false }, stateAfter: { active: true } }),
      previousReceiptHash: null,
      receiptHash: "rcpt_1",
      status: "confirmed",
      timestamp: Date.now(),
    });

    // Quarantine entry
    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-2",
      nodeId: "hook-B",
      depth: 1,
      payload: JSON.stringify({ error: "Capacity limit exceeded" }),
      previousReceiptHash: "rcpt_1",
      receiptHash: "failed_rcpt_q",
      status: "failed",
      timestamp: Date.now(),
    });

    // Run recovery
    const res = recoverFromCrash(db, registeredHooks, parentSeed);

    // Assert quarantine count is correct
    expect(res.quarantinedEntriesCount).toBe(1);

    // Assert quarantined entry is preserved in database
    const journal = loadJournal(db, chainId);
    const quarantined = journal.find(e => e.receiptHash === "failed_rcpt_q");
    expect(quarantined).toBeDefined();
    expect(quarantined!.status).toBe("failed");
    expect(JSON.parse(quarantined!.payload).error).toBe("Capacity limit exceeded");
  });

  it("7. should emit audit recovery receipt at the end of crash recovery", () => {
    const db = new Database(":memory:");
    const chainId = "chain-recovery-receipt";

    const hookA = { id: "hook-A", state: { step: 1 }, lastReceiptHash: "rcpt_1" };
    const registeredHooks = new Map<string, any>([["hook-A", hookA]]);

    saveRollbackSnapshot(db, chainId, "failed_rcpt_rec", {
      "hook-A": { state: { step: 0 }, lastReceiptHash: null },
    });

    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-1",
      nodeId: "hook-A",
      depth: 0,
      payload: JSON.stringify({ stateBefore: { step: 0 }, stateAfter: { step: 1 } }),
      previousReceiptHash: null,
      receiptHash: "rcpt_1",
      status: "confirmed",
      timestamp: Date.now(),
    });

    recoverFromCrash(db, registeredHooks, parentSeed);

    const journal = loadJournal(db, chainId);
    const lastEntry = journal[journal.length - 1];

    // Assert recovery receipt was emitted correctly
    expect(lastEntry.nodeId).toBe("crash-recovery-service");
    expect(lastEntry.status).toBe("refused");
    expect(lastEntry.reason).toBe("Crash recovery completed");
    expect(lastEntry.failedChildId).toBe("failed_rcpt_rec");
  });

  it("8. should reference failed receipt ID across all rollback and recovery entries", () => {
    const db = new Database(":memory:");
    const chainId = "chain-lineage-ref";
    const failedReceiptId = "failed_rcpt_lin";

    const hookA = { id: "hook-A", state: { val: 2 }, lastReceiptHash: "rcpt_2" };
    const hookB = { id: "hook-B", state: { val: 4 }, lastReceiptHash: "rcpt_3" };
    const registeredHooks = new Map<string, any>([
      ["hook-A", hookA],
      ["hook-B", hookB],
    ]);

    saveRollbackSnapshot(db, chainId, failedReceiptId, {
      "hook-A": { state: { val: 1 }, lastReceiptHash: "rcpt_1" },
      "hook-B": { state: { val: 3 }, lastReceiptHash: "rcpt_2" },
    });

    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-1",
      nodeId: "hook-A",
      depth: 0,
      payload: JSON.stringify({ stateBefore: { val: 1 }, stateAfter: { val: 2 } }),
      previousReceiptHash: "rcpt_1",
      receiptHash: "rcpt_2",
      status: "confirmed",
      timestamp: Date.now(),
    });

    appendJournalEntry(db, {
      chainId,
      deltaId: "delta-2",
      nodeId: "hook-B",
      depth: 1,
      payload: JSON.stringify({ stateBefore: { val: 3 }, stateAfter: { val: 4 } }),
      previousReceiptHash: "rcpt_2",
      receiptHash: "rcpt_3",
      status: "confirmed",
      timestamp: Date.now(),
    });

    recoverFromCrash(db, registeredHooks, parentSeed);

    const journal = loadJournal(db, chainId);

    // Rollbacks happen in reverse order of confirmation: hook-B, then hook-A, then recovery receipt
    const rollbacks = journal.filter(e => e.status === "rollback");
    expect(rollbacks.length).toBe(2);

    // Each rollback entry must reference failed receipt ID
    for (const entry of rollbacks) {
      expect(entry.failedChildId).toBe(failedReceiptId);
      expect(entry.reason).toBe("Crash recovery rollback");
    }

    // Recovery receipt must also reference failed receipt ID
    const recoveryReceipt = journal.find(e => e.nodeId === "crash-recovery-service")!;
    expect(recoveryReceipt).toBeDefined();
    expect(recoveryReceipt.failedChildId).toBe(failedReceiptId);
  });
});
