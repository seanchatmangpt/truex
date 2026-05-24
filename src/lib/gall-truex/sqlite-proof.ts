/**
 * @module sqlite-proof
 * @description
 * Gall Classification: S₃ - SQLite Membrane Primitive
 * Purpose: Implements exhaustive, receiptable operations without deferred logic or stubs.
 */

/* eslint-disable unicorn/no-null */
import Database from 'better-sqlite3';
import { createHash } from 'node:crypto';
import { deterministicUUID } from "./receipt-proof.js";


/**
 * Quad
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export type Quad = {
  subject: string;
  predicate: string;
  object: string;
  graph?: string | null;
};


/**
 * GraphDelta
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export type GraphDelta = {
  id: string;
  adds: Quad[];
  deletes: Quad[];
};


/**
 * HookCondition
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export type HookCondition =
  | { kind: 'delta-match'; predicate: string }
  | { kind: 'always' };


/**
 * HookEffect
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export type HookEffect =
  | { kind: 'emit-event'; type: string }
  | { kind: 'add-quad'; quad: Quad };


/**
 * HookDefinition
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export type HookDefinition = {
  id: string;
  name: string;
  condition: HookCondition;
  effects: HookEffect[];
};


/**
 * HookEvent
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export type HookEvent = {
  id: string;
  hookId: string;
  type: string;
  deltaId: string;
};


/**
 * Receipt
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export type Receipt = {
  id: string;
  eventId: string;
  deltaId: string;
  inputHash: string;
  outputHash: string;
  previousReceiptHash: string | null;
  receiptHash: string;
  status: 'confirmed' | 'refused';
};


/**
 * EvaluationResult
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export type EvaluationResult = {
  deltaId: string;
  matchedHookIds: string[];
  emittedEvents: HookEvent[];
  emittedQuads: Quad[];
  receipt: Receipt;
};


/**
 * stableJson
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}


/**
 * hash
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
function hash(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}


/**
 * assertValidDelta
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export function assertValidDelta(delta: any): void {
  if (delta === null || delta === undefined) {
    throw new Error("GraphDelta is required");
  }
  if (typeof delta !== "object") {
    throw new TypeError("GraphDelta must be an object");
  }
  if (!delta.id) {
    throw new Error("GraphDelta.id is required");
  }
  if (!Array.isArray(delta.adds)) {
    throw new TypeError("GraphDelta.adds must be an array");
  }
  if (!Array.isArray(delta.deletes)) {
    throw new TypeError("GraphDelta.deletes must be an array");
  }
  for (const quad of [...delta.adds, ...delta.deletes]) {
    if (quad === null || quad === undefined) {
      throw new Error("Quad is required");
    }
    if (typeof quad !== "object") {
      throw new TypeError("Quad must be an object");
    }
    if (!quad.subject) {
      throw new Error("Quad.subject is required");
    }
    if (!quad.predicate) {
      throw new Error("Quad.predicate is required");
    }
    if (!quad.object) {
      throw new Error("Quad.object is required");
    }
  }
}


/**
 * conditionMatches
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
function conditionMatches(condition: HookCondition, delta: GraphDelta): boolean {
  if (condition.kind === "always") {
    return true;
  }
  if (condition.kind === "delta-match") {
    return delta.adds.some((quad) => quad.predicate === condition.predicate);
  }
  throw new Error(`Unknown condition kind: ${(condition as any).kind}`);
}


/**
 * SQLiteReceiptStore
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export class SQLiteReceiptStore {
  constructor(private db: Database.Database) {}

  latest(): Receipt | null {
    const row = this.db.prepare('SELECT data FROM gall_receipts ORDER BY rowid DESC LIMIT 1').get() as { data: string } | undefined;
    return row ? JSON.parse(row.data) : null;
  }

  append(receipt: Receipt): void {
    this.db.prepare('INSERT INTO gall_receipts (id, data) VALUES (?, ?)').run(receipt.id, JSON.stringify(receipt));
  }

  read(id: string): Receipt | null {
    const row = this.db.prepare('SELECT data FROM gall_receipts WHERE id = ?').get(id) as { data: string } | undefined;
    return row ? JSON.parse(row.data) : null;
  }

  all(): Receipt[] {
    const rows = this.db.prepare('SELECT data FROM gall_receipts ORDER BY rowid ASC').all() as { data: string }[];
    return rows.map((r) => JSON.parse(r.data));
  }
}


/**
 * GallTruexSqliteEngine
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export class GallTruexSqliteEngine {
  private receiptStore: SQLiteReceiptStore;

  constructor(
    private readonly db: Database.Database,
    private readonly hooks: HookDefinition[],
  ) {
    this.receiptStore = new SQLiteReceiptStore(db);
    this.initSchema();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS gall_quads (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        predicate TEXT NOT NULL,
        object TEXT NOT NULL,
        graph TEXT
      );
      CREATE TABLE IF NOT EXISTS gall_events (
        id TEXT PRIMARY KEY,
        hookId TEXT NOT NULL,
        type TEXT NOT NULL,
        deltaId TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS gall_receipts (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL
      );
    `);
  }

  evaluate(delta: GraphDelta, ctx?: { uuid: () => string }): EvaluationResult {
    assertValidDelta(delta);

    const inputHash = hash(delta);
    const matchedHooks = this.hooks.filter((hook) =>
      conditionMatches(hook.condition, delta),
    );

    const emittedEvents: HookEvent[] = [];
    const emittedQuads: Quad[] = [];

    const getUUID = () => (ctx && typeof ctx.uuid === "function" ? ctx.uuid() : deterministicUUID());

    for (const hook of matchedHooks) {
      for (const effect of hook.effects) {
        if (effect.kind === "emit-event") {
          emittedEvents.push({
            id: getUUID(),
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
    const previousReceiptHash = this.receiptStore.latest()?.receiptHash ?? null;
    const eventId = emittedEvents[0]?.id ?? `no-event:${delta.id}`;

    const receiptWithoutHash = {
      id: getUUID(),
      eventId,
      deltaId: delta.id,
      inputHash,
      outputHash,
      previousReceiptHash,
      status: "confirmed" as const,
    };

    const receipt: Receipt = {
      ...receiptWithoutHash,
      receiptHash: hash(receiptWithoutHash),
    };

    // Execute effects and store receipt in a transaction
    const transaction = this.db.transaction(() => {
      const insertQuad = this.db.prepare('INSERT INTO gall_quads (id, subject, predicate, object, graph) VALUES (?, ?, ?, ?, ?)');
      for (const q of emittedQuads) {
        insertQuad.run(getUUID(), q.subject, q.predicate, q.object, q.graph ?? null);
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

  replay(delta: GraphDelta, expectedReceipt: Receipt): boolean {
    assertValidDelta(delta);
    const inputHash = hash(delta);

    const matchedHooks = this.hooks.filter((hook) =>
      conditionMatches(hook.condition, delta),
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
