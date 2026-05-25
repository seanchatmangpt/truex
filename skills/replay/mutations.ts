/**
 * @module skills/replay/mutations
 * @description
 * Gall Classification: S2 Engine Primitives / S1 Replay Primitives
 * Purpose: Implements the core GallTruex evaluation engine, supporting both pure in-memory
 * and SQLite-backed receipt stores. Facilitates deterministic hook matching, execution,
 * receipt generation, and replay verification.
 */

import Database from 'better-sqlite3';
import { hash } from "../hash/mutations.js";
import { createReceipt } from "../receipt/mutations.js";
import { verifyReceipt } from "../receipt/invariant.js";
import {
  createDeterministicContext,
  type TruexContext,
} from "../../packages/membrane/src/context.js";
import {
  parseGraphDelta,
  parseReceipt,
  parseHookDefinition,
} from "../../packages/membrane/src/runtime-law.js";
import type {
  GraphDelta,
  HookCondition,
  HookEffect,
  HookDefinition,
  HookEvent,
  Receipt,
  Quad,
} from "../../packages/membrane/src/runtime-law.js";

/**
 * Represents the result of an engine evaluation.
 */
export type EvaluationResult = {
  deltaId: string;
  matchedHookIds: string[];
  emittedEvents: HookEvent[];
  emittedQuads: Quad[];
  receipt: Receipt;
};

/**
 * Evaluates if a hook condition matches a given delta.
 * @param {HookCondition} condition - The condition to evaluate.
 * @param {GraphDelta} delta - The graph delta.
 * @returns {boolean} True if the condition matches, false otherwise.
 */
export function conditionMatches(condition: HookCondition, delta: GraphDelta): boolean {
  if (condition.kind === "always") {
    return true;
  }
  if (condition.kind === "delta-match") {
    // Condition matching also checks delta.adds (can check deletes if expanded, but matching adds is default)
    return delta.adds.some((quad) => quad.predicate === condition.predicate);
  }
  throw new Error(`Unknown condition kind: ${(condition as any).kind}`);
}

/**
 * Functional convergence check for replay.
 * @param {function} computeFn - The computation function.
 * @param {TInput} input - The input.
 * @param {string} expectedInputHash - The expected input hash.
 * @param {string} expectedOutputHash - The expected output hash.
 * @returns {boolean} True if convergence is successful.
 */
export function verifyConvergence<TInput, TOutput>(
  computeFn: (input: TInput) => TOutput,
  input: TInput,
  expectedInputHash: string,
  expectedOutputHash: string
): boolean {
  const actualInputHash = hash(input);
  if (actualInputHash !== expectedInputHash) {
    return false;
  }

  const actualOutput = computeFn(input);
  const actualOutputHash = hash(actualOutput);

  return actualOutputHash === expectedOutputHash;
}

/**
 * In-memory implementation of a receipt store.
 */
export class MemoryReceiptStore {
  private receipts: Receipt[] = [];

  latest(): Receipt | null {
    return this.receipts.at(-1) ?? null;
  }

  append(receipt: Receipt): void {
    this.receipts.push(parseReceipt(receipt));
  }

  read(id: string): Receipt | null {
    return this.receipts.find((receipt) => receipt.id === id) ?? null;
  }

  all(): Receipt[] {
    return [...this.receipts];
  }
}

/**
 * SQLite-backed implementation of a receipt store.
 */
export class SQLiteReceiptStore {
  constructor(private db: Database.Database) {}

  latest(): Receipt | null {
    const row = this.db.prepare('SELECT data FROM gall_receipts ORDER BY rowid DESC LIMIT 1').get() as { data: string } | undefined;
    return row ? parseReceipt(JSON.parse(row.data)) : null;
  }

  append(receipt: Receipt): void {
    const parsed = parseReceipt(receipt);
    this.db.prepare('INSERT OR REPLACE INTO gall_receipts (id, status, previousReceiptHash, receiptHash, data) VALUES (?, ?, ?, ?, ?)')
      .run(parsed.id, parsed.status, parsed.previousReceiptHash, parsed.receiptHash, JSON.stringify(parsed));
  }

  read(id: string): Receipt | null {
    const row = this.db.prepare('SELECT data FROM gall_receipts WHERE id = ?').get(id) as { data: string } | undefined;
    return row ? parseReceipt(JSON.parse(row.data)) : null;
  }

  all(): Receipt[] {
    const rows = this.db.prepare('SELECT data FROM gall_receipts ORDER BY rowid ASC').all() as { data: string }[];
    return rows.map((r) => parseReceipt(JSON.parse(r.data)));
  }
}

/**
 * Pure in-memory execution engine.
 */
export class GallTruexPureEngine {
  private readonly hooks: HookDefinition[];

  constructor(
    hooks: HookDefinition[],
    private readonly receiptStore: MemoryReceiptStore,
  ) {
    this.hooks = hooks.map(parseHookDefinition);
  }

  evaluate(ctx: TruexContext, deltaInput: unknown): EvaluationResult {
    const delta = parseGraphDelta(deltaInput);
    const inputHash = hash(delta);

    const previousReceiptHash = this.receiptStore.latest()?.receiptHash ?? null;
    const stepSeedHash = hash({
      deltaInput: delta,
      previousReceiptHash,
      parentSeed: ctx.seed
    });
    const stepSeed = Number.parseInt(stepSeedHash.slice(0, 8), 16) >>> 0;
    const stepCtx = createDeterministicContext(stepSeed);

    const matchedHooks = this.hooks.filter((hook) =>
      conditionMatches(hook.condition, delta)
    );

    const emittedEvents: HookEvent[] = [];
    const emittedQuads: Quad[] = [];

    for (const hook of matchedHooks) {
      for (const effect of hook.effects) {
        if (effect.kind === "emit-event") {
          emittedEvents.push({
            id: stepCtx.uuid(),
            hookId: hook.id,
            type: effect.type,
            deltaId: delta.id,
          });
        } else if (effect.kind === "add-quad") {
          emittedQuads.push(effect.quad);
        } else {
          throw new Error(`Unknown effect kind: ${(effect as any).kind}`);
        }
      }
    }

    const output = {
      deltaId: delta.id,
      matchedHookIds: matchedHooks.map((hook) => hook.id).sort(),
      emittedEvents: emittedEvents.map(({ hookId, type, deltaId }) => ({
        hookId,
        type,
        deltaId,
      })),
      emittedQuads,
    };

    const outputHash = hash(output);
    const eventId = emittedEvents[0]?.id ?? `no-event:${delta.id}`;

    const receipt = createReceipt(
      stepCtx,
      eventId,
      delta.id,
      inputHash,
      outputHash,
      previousReceiptHash,
      "confirmed"
    );

    this.receiptStore.append(receipt);

    return {
      deltaId: delta.id,
      matchedHookIds: matchedHooks.map((hook) => hook.id),
      emittedEvents,
      emittedQuads,
      receipt,
    };
  }

  replay(deltaInput: unknown, expectedReceiptInput: unknown): boolean {
    const delta = parseGraphDelta(deltaInput);
    const expectedReceipt = parseReceipt(expectedReceiptInput);

    // Remediation: Cryptographic signature verification check
    if (!verifyReceipt(expectedReceipt)) {
      return false;
    }

    const inputHash = hash(delta);

    const matchedHooks = this.hooks.filter((hook) =>
      conditionMatches(hook.condition, delta)
    );

    const replayOutput = {
      deltaId: delta.id,
      matchedHookIds: matchedHooks.map((hook) => hook.id).sort(),
      emittedEvents: matchedHooks.flatMap((hook) =>
        hook.effects.flatMap((effect) => {
          if (effect.kind === "emit-event") {
            return [{
              hookId: hook.id,
              type: effect.type,
              deltaId: delta.id,
            }];
          }
          if (effect.kind === "add-quad") {
            return [];
          }
          throw new Error(`Unknown effect kind: ${(effect as any).kind}`);
        })
      ),
      emittedQuads: matchedHooks.flatMap((hook) =>
        hook.effects.flatMap((effect) => {
          if (effect.kind === "add-quad") {
            return [effect.quad];
          }
          if (effect.kind === "emit-event") {
            return [];
          }
          throw new Error(`Unknown effect kind: ${(effect as any).kind}`);
        })
      ),
    };

    return (
      inputHash === expectedReceipt.inputHash &&
      hash(replayOutput) === expectedReceipt.outputHash
    );
  }
}

/**
 * SQLite-backed execution engine.
 */
export class GallTruexSqliteEngine {
  private receiptStore: SQLiteReceiptStore;
  private readonly hooks: HookDefinition[];

  constructor(
    private readonly db: Database.Database,
    hooks: HookDefinition[],
  ) {
    this.receiptStore = new SQLiteReceiptStore(db);
    this.hooks = hooks.map(parseHookDefinition);
    this.initSchema();
  }

  private initSchema() {
    // Migration: Added status, previousReceiptHash, and receiptHash indexed metadata columns
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS gall_quads (
        id TEXT PRIMARY KEY NOT NULL,
        subject TEXT NOT NULL,
        predicate TEXT NOT NULL,
        object TEXT NOT NULL,
        graph TEXT
      );
      CREATE TABLE IF NOT EXISTS gall_events (
        id TEXT PRIMARY KEY NOT NULL,
        hookId TEXT NOT NULL,
        type TEXT NOT NULL,
        deltaId TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS gall_receipts (
        id TEXT PRIMARY KEY NOT NULL,
        status TEXT NOT NULL,
        previousReceiptHash TEXT,
        receiptHash TEXT NOT NULL,
        data TEXT NOT NULL
      );
    `);
  }

  evaluate(ctx: TruexContext, deltaInput: unknown): EvaluationResult {
    const delta = parseGraphDelta(deltaInput);
    const inputHash = hash(delta);

    const previousReceiptHash = this.receiptStore.latest()?.receiptHash ?? null;
    const stepSeedHash = hash({
      deltaInput: delta,
      previousReceiptHash,
      parentSeed: ctx.seed
    });
    const stepSeed = Number.parseInt(stepSeedHash.slice(0, 8), 16) >>> 0;
    const stepCtx = createDeterministicContext(stepSeed);

    const matchedHooks = this.hooks.filter((hook) =>
      conditionMatches(hook.condition, delta)
    );

    const emittedEvents: HookEvent[] = [];
    const emittedQuads: Quad[] = [];

    for (const hook of matchedHooks) {
      for (const effect of hook.effects) {
        if (effect.kind === "emit-event") {
          emittedEvents.push({
            id: stepCtx.uuid(),
            hookId: hook.id,
            type: effect.type,
            deltaId: delta.id,
          });
        } else if (effect.kind === "add-quad") {
          emittedQuads.push(effect.quad);
        } else {
          throw new Error(`Unknown effect kind: ${(effect as any).kind}`);
        }
      }
    }

    const output = {
      deltaId: delta.id,
      matchedHookIds: matchedHooks.map((hook) => hook.id).sort(),
      emittedEvents: emittedEvents.map(({ hookId, type, deltaId }) => ({
        hookId,
        type,
        deltaId,
      })),
      emittedQuads,
    };

    const outputHash = hash(output);
    const eventId = emittedEvents[0]?.id ?? `no-event:${delta.id}`;

    const receipt = createReceipt(
      stepCtx,
      eventId,
      delta.id,
      inputHash,
      outputHash,
      previousReceiptHash,
      "confirmed"
    );

    // Execute effects and store receipt in a transaction
    const transaction = this.db.transaction(() => {
      const insertQuad = this.db.prepare('INSERT INTO gall_quads (id, subject, predicate, object, graph) VALUES (?, ?, ?, ?, ?)');
      for (const q of emittedQuads) {
        insertQuad.run(stepCtx.uuid(), q.subject, q.predicate, q.object, q.graph ?? null);
      }

      const insertEvent = this.db.prepare('INSERT INTO gall_events (id, hookId, type, deltaId) VALUES (?, ?, ?, ?)');
      for (const e of emittedEvents) {
        insertEvent.run(e.id, e.hookId, e.type, e.deltaId);
      }

      this.receiptStore.append(receipt);
    });

    transaction();

    return {
      deltaId: delta.id,
      matchedHookIds: matchedHooks.map((hook) => hook.id),
      emittedEvents,
      emittedQuads,
      receipt,
    };
  }

  replay(deltaInput: unknown, expectedReceiptInput: unknown): boolean {
    const delta = parseGraphDelta(deltaInput);
    const expectedReceipt = parseReceipt(expectedReceiptInput);

    // Remediation: Cryptographic signature verification check
    if (!verifyReceipt(expectedReceipt)) {
      return false;
    }

    const inputHash = hash(delta);

    const matchedHooks = this.hooks.filter((hook) =>
      conditionMatches(hook.condition, delta)
    );

    const replayOutput = {
      deltaId: delta.id,
      matchedHookIds: matchedHooks.map((hook) => hook.id).sort(),
      emittedEvents: matchedHooks.flatMap((hook) =>
        hook.effects.flatMap((effect) => {
          if (effect.kind === "emit-event") {
            return [{
              hookId: hook.id,
              type: effect.type,
              deltaId: delta.id,
            }];
          }
          if (effect.kind === "add-quad") {
            return [];
          }
          throw new Error(`Unknown effect kind: ${(effect as any).kind}`);
        })
      ),
      emittedQuads: matchedHooks.flatMap((hook) =>
        hook.effects.flatMap((effect) => {
          if (effect.kind === "add-quad") {
            return [effect.quad];
          }
          if (effect.kind === "emit-event") {
            return [];
          }
          throw new Error(`Unknown effect kind: ${(effect as any).kind}`);
        })
      ),
    };

    return (
      inputHash === expectedReceipt.inputHash &&
      hash(replayOutput) === expectedReceipt.outputHash
    );
  }

  getStore() {
    return this.receiptStore;
  }
}
