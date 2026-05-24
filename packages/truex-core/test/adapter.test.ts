import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { createDeterministicContext } from "../src/context.js";
import { hash } from "../src/hash.js";
import { GallTruexSqliteEngine } from "../../../skills/replay/mutations.js";
import { TruexAgentAdapter } from "../../../skills/adapter/mutations.js";
import type { HookDefinition } from "../src/runtime-law.js";
import { verifyReceipt } from "../../../skills/receipt/invariant.js";

describe("TruexAgentAdapter - Decoupled Consequence Authority", () => {
  it("admits valid authorized agent proposals and generates confirmed receipts", () => {
    const db = new Database(":memory:");
    const ctx = createDeterministicContext(100);

    const hooks: HookDefinition[] = [
      {
        id: "step-hook",
        name: "Step Hook",
        condition: { kind: "delta-match", predicate: "schema:stepName" },
        effects: [{ kind: "emit-event", type: "step_recorded" }]
      }
    ];

    const engine = new GallTruexSqliteEngine(db, hooks);

    const allowedAgentsACL = new Map<string, Set<string>>();
    allowedAgentsACL.set("DoctorAgent", new Set(["schema:stepName"]));

    const adapter = new TruexAgentAdapter(engine, ctx, allowedAgentsACL);

    const proposal = {
      agentId: "DoctorAgent",
      proposalId: "prop-1",
      delta: {
        id: "delta-1",
        adds: [{ subject: "urn:audit", predicate: "schema:stepName", object: "Analyze" }],
        deletes: []
      }
    };

    const res = adapter.submit(proposal);
    expect(res.committed).toBe(true);
    expect(res.receipt.status).toBe("confirmed");
    expect(verifyReceipt(res.receipt)).toBe(true);

    // Verify side effects persisted in SQLite
    const eventCount = db.prepare("SELECT count(*) as count FROM gall_events").get() as { count: number };
    expect(eventCount.count).toBe(1);

    db.close();
  });

  it("refuses unauthorized proposal by ACL gate and rollbacks changes", () => {
    const db = new Database(":memory:");
    const ctx = createDeterministicContext(200);
    const hooks: HookDefinition[] = [];
    const engine = new GallTruexSqliteEngine(db, hooks);

    const allowedAgentsACL = new Map<string, Set<string>>();
    allowedAgentsACL.set("DoctorAgent", new Set(["schema:stepName"]));
    allowedAgentsACL.set("MaliciousAgent", new Set());

    const adapter = new TruexAgentAdapter(engine, ctx, allowedAgentsACL);

    const proposal = {
      agentId: "MaliciousAgent",
      proposalId: "prop-2",
      delta: {
        id: "delta-2",
        adds: [{ subject: "urn:audit", predicate: "schema:stepName", object: "Hack" }],
        deletes: []
      }
    };

    const res = adapter.submit(proposal);
    expect(res.committed).toBe(false);
    expect(res.receipt.status).toBe("refused");
    expect(res.reason).toContain("ACL Gate Refused");

    // Verify no events or other quads were written to SQLite
    const quadsCount = db.prepare("SELECT count(*) as count FROM gall_quads").get() as { count: number };
    expect(quadsCount.count).toBe(0);

    db.close();
  });

  it("refuses structurally malformed proposals during intake validation", () => {
    const db = new Database(":memory:");
    const ctx = createDeterministicContext(300);
    const hooks: HookDefinition[] = [];
    const engine = new GallTruexSqliteEngine(db, hooks);

    const allowedAgentsACL = new Map<string, Set<string>>();
    const adapter = new TruexAgentAdapter(engine, ctx, allowedAgentsACL);

    const proposal = {
      agentId: "DoctorAgent",
      proposalId: "prop-3",
      delta: {
        id: "delta-3",
        adds: [{ subject: "", predicate: "schema:stepName", object: "Empty" }], // Empty subject is structural error
        deletes: []
      }
    };

    const res = adapter.submit(proposal);
    expect(res.committed).toBe(false);
    expect(res.receipt.status).toBe("refused");
    expect(res.reason).toContain("Intake Validation Failed");

    db.close();
  });

  it("handles speculative execution failures and rolls back speculative database updates", () => {
    const db = new Database(":memory:");
    const hooks: HookDefinition[] = [
      {
        id: "error-hook",
        name: "Error Hook",
        condition: { kind: "always" },
        effects: [{ kind: "emit-event", type: "event-trigger" }]
      }
    ];

    const engine = new GallTruexSqliteEngine(db, hooks);
    const allowedAgentsACL = new Map<string, Set<string>>();
    allowedAgentsACL.set("DoctorAgent", new Set(["schema:stepName"]));

    // We will pre-populate the gall_events table with a specific duplicate ID.
    const proposalDelta = {
      id: "delta-4",
      adds: [{ subject: "urn:audit", predicate: "schema:stepName", object: "Speculate", graph: null }],
      deletes: []
    };
    const stepSeedHash = hash({
      deltaInput: proposalDelta,
      previousReceiptHash: null,
      parentSeed: 400
    });
    const stepSeed = parseInt(stepSeedHash.substring(0, 8), 16) >>> 0;
    const stepCtx = createDeterministicContext(stepSeed);
    const duplicateEventId = stepCtx.uuid();

    // Insert duplicate record manually
    db.prepare("INSERT INTO gall_events (id, hookId, type, deltaId) VALUES (?, ?, ?, ?)")
      .run(duplicateEventId, "pre-existing", "old-type", "old-delta");

    // Initialize adapter with the same seed context so it generates the same first event ID
    const ctx = createDeterministicContext(400);
    const adapter = new TruexAgentAdapter(engine, ctx, allowedAgentsACL);

    const proposal = {
      agentId: "DoctorAgent",
      proposalId: "prop-4",
      delta: proposalDelta
    };

    // This should fail due to UNIQUE constraint failed on gall_events.id and generate a Refused receipt
    const res = adapter.submit(proposal);
    expect(res.committed).toBe(false);
    expect(res.receipt.status).toBe("refused");
    expect(res.reason).toContain("Execution Rejected");
    expect(res.reason).toContain("UNIQUE constraint failed");

    // Verify that the table state did not change (it only contains the pre-existing event)
    const eventRows = db.prepare("SELECT * FROM gall_events").all();
    expect(eventRows).toHaveLength(1);
    expect((eventRows[0] as any).hookId).toBe("pre-existing");

    db.close();
  });
});
