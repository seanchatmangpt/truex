import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { createDeterministicContext } from "../src/context.js";
import { hash } from "../src/hash.js";
import { generateKeyPair, signReceiptHash, verifySignature } from "../src/signature.js";
import { GallTruexPureEngine, MemoryReceiptStore, GallTruexSqliteEngine } from "../src/replay.js";
import { parseGraphDelta } from "../src/runtime-law.js";
import type { HookDefinition } from "../src/runtime-law.js";

describe("Truex Core Decoupled Primitives", () => {
  it("context handles deterministic generation and clock ticking", () => {
    const ctx = createDeterministicContext(42);
    const uuid1 = ctx.uuid();
    const uuid2 = ctx.uuid();
    expect(uuid1).not.toBe(uuid2);
    expect(uuid1.length).toBe(36); // standard UUID format

    const time1 = ctx.clock();
    const time2 = ctx.clock();
    expect(time2).toBe(time1 + 1);

    // Replay determinism
    const ctxReplay = createDeterministicContext(42);
    expect(ctxReplay.uuid()).toBe(uuid1);
    expect(ctxReplay.uuid()).toBe(uuid2);
    expect(ctxReplay.clock()).toBe(time1);
  });

  it("hash deterministic stableJson sorts object keys", () => {
    const obj1 = { a: 1, b: { y: 2, x: 1 } };
    const obj2 = { b: { x: 1, y: 2 }, a: 1 };
    expect(hash(obj1)).toBe(hash(obj2));
  });

  it("signature signs and verifies receipt hashes using ML-DSA", () => {
    const keyPair = generateKeyPair();
    const message = hash({ statement: "Approve Mutation" });
    const signature = signReceiptHash(message, keyPair.secretKey);
    expect(signature.length).toBeGreaterThan(0);

    const verified = verifySignature(signature, message, keyPair.publicKey);
    expect(verified).toBe(true);

    const keyPair2 = generateKeyPair();
    const wrongKeyVerified = verifySignature(signature, message, keyPair2.publicKey);
    expect(wrongKeyVerified).toBe(false);

    const tamperedMessage = hash({ statement: "Hacked Mutation" });
    const tamperedVerified = verifySignature(signature, tamperedMessage, keyPair.publicKey);
    expect(tamperedVerified).toBe(false);
  });

  it("pure engine evaluates transitions and creates receipts", () => {
    const hooks: HookDefinition[] = [
      {
        id: "status-hook",
        name: "Status Hook",
        condition: { kind: "delta-match", predicate: "schema:status" },
        effects: [
          { kind: "emit-event", type: "status_changed" }
        ]
      }
    ];

    const store = new MemoryReceiptStore();
    const engine = new GallTruexPureEngine(hooks, store);
    const ctx = createDeterministicContext(100);

    const delta = {
      id: "delta-1",
      adds: [{ subject: "urn:item", predicate: "schema:status", object: "active" }],
      deletes: []
    };

    const result = engine.evaluate(ctx, delta);
    expect(result.deltaId).toBe("delta-1");
    expect(result.matchedHookIds).toContain("status-hook");
    expect(result.emittedEvents.length).toBe(1);
    expect(result.receipt.inputHash).toBe(hash(parseGraphDelta(delta)));

    // Replay converges
    const replayed = engine.replay(delta, result.receipt);
    expect(replayed).toBe(true);
  });

  it("sqlite engine persists quads, events, and receipts transactionally", () => {
    const db = new Database(":memory:");
    const hooks: HookDefinition[] = [
      {
        id: "quad-hook",
        name: "Quad Hook",
        condition: { kind: "always" },
        effects: [
          {
            kind: "add-quad",
            quad: { subject: "urn:sys", predicate: "prov:wasGeneratedBy", object: "urn:eval" }
          }
        ]
      }
    ];

    const engine = new GallTruexSqliteEngine(db, hooks);
    const ctx = createDeterministicContext(200);

    const delta = {
      id: "delta-sqlite",
      adds: [{ subject: "urn:subj", predicate: "schema:type", object: "user" }],
      deletes: []
    };

    const result = engine.evaluate(ctx, delta);
    expect(result.receipt.receiptHash).toBeDefined();

    // Verify row counts in SQLite tables
    const quadsCount = db.prepare("SELECT count(*) as count FROM gall_quads").get() as { count: number };
    const receiptsCount = db.prepare("SELECT count(*) as count FROM gall_receipts").get() as { count: number };
    expect(quadsCount.count).toBe(1);
    expect(receiptsCount.count).toBe(1);

    const store = engine.getStore();
    const readback = store.read(result.receipt.id);
    expect(readback).not.toBeNull();
    expect(readback?.receiptHash).toBe(result.receipt.receiptHash);

    // Convergence
    expect(engine.replay(delta, result.receipt)).toBe(true);

    db.close();
  });
});
