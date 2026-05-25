/**
 * @module skills/replay/proofs
 * @description
 * Gall Classification: Proof Layer (S1 Replay Primitives)
 * Purpose: Proves replay convergence invariants, verifying that identical inputs and laws
 * yield identical consequences, while mutated inputs or engine laws strictly diverge.
 */

import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { hash } from "../hash/mutations.js";
import { createDeterministicContext } from "../../packages/membrane/src/context.js";
import { verifyConvergence, MemoryReceiptStore, GallTruexPureEngine, GallTruexSqliteEngine } from "./mutations.js";
import type { HookDefinition } from "../../packages/membrane/src/runtime-law.js";

/**
 * Report structure for Replay proofs.
 */
export type ReplayProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
};

/**
 * Executes tests to prove replay convergence invariants.
 * @returns {ReplayProofReport} The proof results.
 */
export function proveReplay(): ReplayProofReport {
  const failures: string[] = [];
  const invariants = [
    "replay converges correctly",
    "replay diverges on input mutation",
    "replay diverges on engine mutation (law changed)"
  ];

  try {
    const μ = (input: number) => input * 2;
    const expectedInputHash = hash(10);
    const expectedOutputHash = hash(20);

    const resultConverged = verifyConvergence(μ, 10, expectedInputHash, expectedOutputHash);
    if (!resultConverged) failures.push("replay convergence failed");

    const resultDivergedInput = verifyConvergence(μ, 11, expectedInputHash, expectedOutputHash);
    if (resultDivergedInput) failures.push("replay converged unexpectedly on mutated input");

    const μHacked = (input: number) => input * 3;
    const resultDivergedEngine = verifyConvergence(μHacked, 10, expectedInputHash, expectedOutputHash);
    if (resultDivergedEngine) failures.push("replay converged unexpectedly on mutated law");

  } catch (error_: any) {
    failures.push(`Execution error: ${error_.message}`);
  }

  return {
    passed: failures.length === 0,
    failures,
    invariants
  };
}

/**
 * Executes tests to prove engine evaluation and replay correctness.
 * @returns {ReplayProofReport} The proof results.
 */
export function proveEngine(): ReplayProofReport {
  const failures: string[] = [];
  const invariants = [
    "graph delta accepted",
    "hook matched",
    "effects generated",
    "receipt generated deterministically",
    "replay matched output",
    "bad input structurally refused"
  ];

  try {
    const receiptStore = new MemoryReceiptStore();
    const hooks: HookDefinition[] = [
      {
        id: "status.changed",
        name: "Status Changed",
        condition: { kind: "delta-match", predicate: "schema:status" },
        effects: [
          { kind: "emit-event", type: "status_changed" },
          {
            kind: "add-quad",
            quad: { subject: "urn:truex:system", predicate: "prov:generated", object: "urn:truex:event:status_changed" }
          }
        ]
      }
    ];

    const engine = new GallTruexPureEngine(hooks, receiptStore);
    const ctx = createDeterministicContext(100);

    const delta = {
      id: "delta-001",
      adds: [{ subject: "urn:item:1", predicate: "schema:status", object: "confirmed" }],
      deletes: []
    };

    const first = engine.evaluate(ctx, delta);
    if (first.deltaId !== "delta-001") failures.push("delta acceptance failed");

    if (!first.matchedHookIds.includes("status.changed")) failures.push("hook matching failed");

    if (first.emittedEvents.length !== 1 || first.emittedQuads.length !== 1) failures.push("effects generation failed");

    if (!first.receipt.receiptHash) failures.push("receipt generation failed");

    if (!engine.replay(delta, first.receipt)) failures.push("replay validation failed");

    let badInputFailed = false;
    try {
      engine.evaluate(ctx, {
        id: "bad-delta",
        adds: [{ subject: "", predicate: "schema:status", object: "confirmed" }],
        deletes: []
      });
    } catch {
      badInputFailed = true;
    }

    if (!badInputFailed) failures.push("bad input was not refused");

  } catch (error_: any) {
    failures.push(`Execution error: ${error_.message}`);
  }

  return {
    passed: failures.length === 0,
    failures,
    invariants
  };
}

/**
 * Executes tests to prove SQLite persistence and replay integration.
 * @returns {ReplayProofReport} The proof results.
 */
export function proveSqlite(): ReplayProofReport {
  const failures: string[] = [];
  const invariants = [
    "SQLite opens",
    "Schema migrated",
    "GraphDelta accepted",
    "Hook matched",
    "Effects persisted",
    "Receipt persisted",
    "Receipt readback verified",
    "Replay converged",
    "Bad input refused"
  ];

  const dbPath = path.resolve(process.cwd(), 'gall_truex_proof_skills.db');
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  let db: Database.Database | null = null;
  try {
    db = new Database(dbPath);
    if (!db.open) failures.push("SQLite open failed");

    const hooks: HookDefinition[] = [
      {
        id: "status.changed",
        name: "Status Changed",
        condition: { kind: "delta-match", predicate: "schema:status" },
        effects: [
          { kind: "emit-event", type: "status_changed" },
          {
            kind: "add-quad",
            quad: { subject: "urn:truex:system", predicate: "prov:generated", object: "urn:truex:event:status_changed" }
          }
        ]
      }
    ];

    const engine = new GallTruexSqliteEngine(db, hooks);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const names = new Set(tables.map(t => t.name));
    if (!names.has("gall_quads") || !names.has("gall_events") || !names.has("gall_receipts")) {
      failures.push("schema migration failed");
    }

    const ctx = createDeterministicContext(100);
    const delta = {
      id: "delta-001",
      adds: [{ subject: "urn:item:1", predicate: "schema:status", object: "confirmed" }],
      deletes: []
    };

    const first = engine.evaluate(ctx, delta);
    if (first.deltaId !== "delta-001") failures.push("delta acceptance failed");

    if (!first.matchedHookIds.includes("status.changed")) failures.push("hook matching failed");

    const qCount = db.prepare('SELECT count(*) as count FROM gall_quads').get() as { count: number };
    const eCount = db.prepare('SELECT count(*) as count FROM gall_events').get() as { count: number };
    if (qCount.count === 0 || eCount.count === 0) failures.push("effects persistence failed");

    if (!first.receipt.receiptHash) failures.push("receipt persistence failed");

    const readback = engine.getStore().read(first.receipt.id);
    if (!readback || readback.id !== first.receipt.id) failures.push("receipt readback failed");

    if (!engine.replay(delta, first.receipt)) failures.push("replay convergence failed");

    let badInputFailed = false;
    try {
      engine.evaluate(ctx, {
        id: "bad-delta",
        adds: [{ subject: "", predicate: "schema:status", object: "confirmed" }],
        deletes: []
      });
    } catch {
      badInputFailed = true;
    }
    if (!badInputFailed) failures.push("bad input was not refused");

  } catch (error_: any) {
    failures.push(`Execution error: ${error_.message}`);
  } finally {
    if (db) db.close();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  }

  return {
    passed: failures.length === 0,
    failures,
    invariants
  };
}
