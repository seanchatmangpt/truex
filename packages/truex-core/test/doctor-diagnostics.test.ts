/* eslint-disable unicorn/no-null, @typescript-eslint/no-unused-vars */
import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { createDeterministicContext } from "../src/context.js";
import { hash } from "../src/hash.js";
import { createReceipt, verifyReceipt, verifyChain } from "../src/receipt.js";
import {
  parseQuad,
  parseGraphDelta,
  parseHookCondition,
  parseHookEffect,
  parseHookDefinition,
  parseReceipt,
} from "../src/runtime-law.js";
import { GallTruexPureEngine, MemoryReceiptStore, GallTruexSqliteEngine } from "../src/replay.js";
import type { HookDefinition, Quad } from "../src/runtime-law.js";

describe("Doctor Diagnostic Check - Core Validation Boundaries & Engine", () => {
  describe("1. Validation Boundaries (runtime-law)", () => {
    it("parseQuad rejects malformed or incomplete inputs", () => {
      expect(() => parseQuad(null)).toThrow("Quad must be an object");
      expect(() => parseQuad(123)).toThrow("Quad must be an object");
      expect(() => parseQuad({})).toThrow("Quad.subject must be a non-empty string");
      expect(() => parseQuad({ subject: "" })).toThrow("Quad.subject must be a non-empty string");
      expect(() => parseQuad({ subject: "s" })).toThrow("Quad.predicate must be a non-empty string");
      expect(() => parseQuad({ subject: "s", predicate: "" })).toThrow("Quad.predicate must be a non-empty string");
      expect(() => parseQuad({ subject: "s", predicate: "p" })).toThrow("Quad.object must be a non-empty string");
      expect(() => parseQuad({ subject: "s", predicate: "p", object: "" })).toThrow("Quad.object must be a non-empty string");
      expect(() => parseQuad({ subject: "s", predicate: "p", object: 123 })).toThrow("Quad.object must be a non-empty string");
      expect(() => parseQuad({ subject: "s", predicate: "p", object: "o", graph: 123 })).toThrow("Quad.graph must be a string or null");
      
      const parsed = parseQuad({ subject: "s", predicate: "p", object: "o", graph: null });
      expect(parsed).toEqual({ subject: "s", predicate: "p", object: "o", graph: null });
    });

    it("parseGraphDelta rejects malformed or incomplete inputs", () => {
      expect(() => parseGraphDelta(null)).toThrow("GraphDelta must be an object");
      expect(() => parseGraphDelta({})).toThrow("GraphDelta.id must be a non-empty string");
      expect(() => parseGraphDelta({ id: "" })).toThrow("GraphDelta.id must be a non-empty string");
      expect(() => parseGraphDelta({ id: "d1" })).toThrow("GraphDelta.adds must be an array");
      expect(() => parseGraphDelta({ id: "d1", adds: [] })).toThrow("GraphDelta.deletes must be an array");
      expect(() => parseGraphDelta({ id: "d1", adds: [{}], deletes: [] })).toThrow("Quad.subject must be a non-empty string");
    });

    it("parseHookCondition rejects invalid kinds and fields", () => {
      expect(() => parseHookCondition(null)).toThrow("HookCondition must be an object");
      expect(() => parseHookCondition({})).toThrow("Unknown HookCondition kind");
      expect(() => parseHookCondition({ kind: "delta-match" })).toThrow("HookCondition of kind delta-match must specify a non-empty predicate");
      expect(() => parseHookCondition({ kind: "delta-match", predicate: "" })).toThrow("HookCondition of kind delta-match must specify a non-empty predicate");
      expect(() => parseHookCondition({ kind: "delta-match", predicate: 123 })).toThrow("HookCondition of kind delta-match must specify a non-empty predicate");
    });

    it("parseHookEffect rejects invalid types and schemas", () => {
      expect(() => parseHookEffect(null)).toThrow("HookEffect must be an object");
      expect(() => parseHookEffect({ kind: "emit-event" })).toThrow("HookEffect of kind emit-event must specify a non-empty event type");
      expect(() => parseHookEffect({ kind: "emit-event", type: "" })).toThrow("HookEffect of kind emit-event must specify a non-empty event type");
      expect(() => parseHookEffect({ kind: "add-quad" })).toThrow("Quad must be an object");
      expect(() => parseHookEffect({ kind: "unknown-effect" })).toThrow("Unknown HookEffect kind");
    });

    it("parseReceipt validates fields exhaustively", () => {
      expect(() => parseReceipt(null)).toThrow("Receipt must be an object");
      expect(() => parseReceipt({})).toThrow("Receipt.id must be a non-empty string");
      expect(() => parseReceipt({
        id: "r1", eventId: "e1", deltaId: "d1", inputHash: "ih", outputHash: "oh", previousReceiptHash: 123, status: "confirmed", receiptHash: "rh"
      })).toThrow("Receipt.previousReceiptHash must be a string or null");
      expect(() => parseReceipt({
        id: "r1", eventId: "e1", deltaId: "d1", inputHash: "ih", outputHash: "oh", previousReceiptHash: null, status: "invalid-status", receiptHash: "rh"
      })).toThrow("Receipt.status must be \"confirmed\" or \"refused\"");
    });
  });

  describe("2. State Transition Completeness (Mathematical Verification)", () => {
    const alwaysHook: HookDefinition = {
      id: "h-always",
      name: "Always Hook",
      condition: { kind: "always" },
      effects: [{ kind: "emit-event", type: "evt-always" }]
    };

    const predicateHook: HookDefinition = {
      id: "h-pred",
      name: "Predicate Hook",
      condition: { kind: "delta-match", predicate: "schema:name" },
      effects: [
        { kind: "emit-event", type: "evt-name-added" },
        { kind: "add-quad", quad: { subject: "urn:derived", predicate: "schema:log", object: "processed" } }
      ]
    };

    it("evaluates condition matching combinations correctly", () => {
      const store = new MemoryReceiptStore();
      const engine = new GallTruexPureEngine([alwaysHook, predicateHook], store);
      const ctx = createDeterministicContext(1);

      // Transition 1: delta does not trigger predicateHook, only alwaysHook
      const delta1 = {
        id: "delta-1",
        adds: [{ subject: "urn:item", predicate: "schema:status", object: "active" }],
        deletes: []
      };
      const res1 = engine.evaluate(ctx, delta1);
      expect(res1.matchedHookIds).toEqual(["h-always"]);
      expect(res1.emittedEvents).toHaveLength(1);
      expect(res1.emittedEvents[0]?.type).toBe("evt-always");
      expect(res1.emittedQuads).toHaveLength(0);

      // Transition 2: delta triggers both predicateHook and alwaysHook
      const delta2 = {
        id: "delta-2",
        adds: [{ subject: "urn:item", predicate: "schema:name", object: "Alice" }],
        deletes: []
      };
      const res2 = engine.evaluate(ctx, delta2);
      expect(res2.matchedHookIds).toContain("h-always");
      expect(res2.matchedHookIds).toContain("h-pred");
      expect(res2.emittedEvents).toHaveLength(2);
      expect(res2.emittedQuads).toHaveLength(1);
      expect(res2.emittedQuads[0]?.subject).toBe("urn:derived");

      // Transition 3: delta predicate matching ONLY checks 'adds', not 'deletes'
      const delta3 = {
        id: "delta-3",
        adds: [],
        deletes: [{ subject: "urn:item", predicate: "schema:name", object: "Alice" }]
      };
      const res3 = engine.evaluate(ctx, delta3);
      expect(res3.matchedHookIds).toEqual(["h-always"]);
      expect(res3.emittedEvents).toHaveLength(1);
      expect(res3.emittedQuads).toHaveLength(0);
    });
  });

  describe("3. SQLite Engine & Persistence Membrane Verification", () => {
    it("persists state correctly and executes transactional rollback on failure", () => {
      const db = new Database(":memory:");
      const hook: HookDefinition = {
        id: "h-persist",
        name: "Persist Hook",
        condition: { kind: "always" },
        effects: [
          { kind: "emit-event", type: "event-persisted" },
          { kind: "add-quad", quad: { subject: "urn:s", predicate: "urn:p", object: "urn:o" } }
        ]
      };

      const engine = new GallTruexSqliteEngine(db, [hook]);
      const delta = {
        id: "delta-sqlite-test",
        adds: [],
        deletes: []
      };

      // Scenario A: Normal successful execution
      const ctx1 = createDeterministicContext(10);
      const res1 = engine.evaluate(ctx1, delta);

      // Verify DB contains records
      const quads = db.prepare("SELECT * FROM gall_quads").all();
      const events = db.prepare("SELECT * FROM gall_events").all();
      const receipts = db.prepare("SELECT * FROM gall_receipts").all();

      expect(quads).toHaveLength(1);
      expect(events).toHaveLength(1);
      expect(receipts).toHaveLength(1);

      // Scenario B: Rollback verification on database constraint failure
      // We run the engine again using the exact same deterministic context seed (10).
      // This causes the engine to generate the same receipt ID as in Scenario A,
      // triggering a UNIQUE constraint failure.
      const ctx3 = createDeterministicContext(10); 
      
      const quadsBefore = db.prepare("SELECT count(*) as count FROM gall_quads").get() as { count: number };
      const eventsBefore = db.prepare("SELECT count(*) as count FROM gall_events").get() as { count: number };

      expect(() => {
        engine.evaluate(ctx3, delta);
      }).toThrow(); // SqliteError: UNIQUE constraint failed: gall_receipts.id

      // Verify transaction rollback: no partial quads or events were written
      const quadsAfter = db.prepare("SELECT count(*) as count FROM gall_quads").get() as { count: number };
      const eventsAfter = db.prepare("SELECT count(*) as count FROM gall_events").get() as { count: number };

      expect(quadsAfter.count).toBe(quadsBefore.count);
      expect(eventsAfter.count).toBe(eventsBefore.count);

      db.close();
    });
  });

  describe("4. Tampering, Chains and Replay Divergence", () => {
    it("replay detects modified delta (input divergence)", () => {
      const store = new MemoryReceiptStore();
      const engine = new GallTruexPureEngine([], store);
      const ctx = createDeterministicContext(100);

      const delta = { id: "d1", adds: [], deletes: [] };
      const res = engine.evaluate(ctx, delta);

      expect(engine.replay(delta, res.receipt)).toBe(true);

      const mutatedDelta = { id: "d1", adds: [{ subject: "a", predicate: "b", object: "c" }], deletes: [] };
      expect(engine.replay(mutatedDelta, res.receipt)).toBe(false);
    });

    it("replay detects modified expected receipt (tamper detection)", () => {
      const store = new MemoryReceiptStore();
      const engine = new GallTruexPureEngine([], store);
      const ctx = createDeterministicContext(100);

      const delta = { id: "d1", adds: [], deletes: [] };
      const res = engine.evaluate(ctx, delta);

      const tamperedReceipt = { ...res.receipt, outputHash: "invalid_output_hash" };
      expect(engine.replay(delta, tamperedReceipt)).toBe(false);
    });

    it("verifyReceipt and verifyChain reject altered fields or lineage breaks", () => {
      const ctx = createDeterministicContext(200);
      const r1 = createReceipt(ctx, "e1", "d1", "in1", "out1", null);
      const r2 = createReceipt(ctx, "e2", "d2", "in2", "out2", r1.receiptHash);

      expect(verifyReceipt(r1)).toBe(true);
      expect(verifyReceipt(r2)).toBe(true);
      expect(verifyChain(r1, r2)).toBe(true);

      // Tampering r1 hash
      const tamperedR1 = { ...r1, receiptHash: "fakehash" };
      expect(verifyReceipt(tamperedR1)).toBe(false);
      expect(verifyChain(tamperedR1, r2)).toBe(false);

      // Lineage break
      const r2Broken = { ...r2, previousReceiptHash: "otherhash" };
      expect(verifyChain(r1, r2Broken)).toBe(false);
    });
  });
});
