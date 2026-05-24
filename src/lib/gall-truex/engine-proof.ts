/**
 * @module engine-proof
 * @description
 * Gall Classification: S₂ - Engine Primitive
 * Purpose: Implements exhaustive, receiptable operations without deferred logic or stubs.
 */

/* eslint-disable unicorn/no-null */
import { hash } from "./hash-proof.js";
import { deterministicUUID } from "./receipt-proof.js";
import type {
  Quad,
  GraphDelta,
  HookCondition,
  HookDefinition,
  HookEvent,
  Receipt,
  EvaluationResult,
} from "./sqlite-proof.js";


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
export function conditionMatches(condition: HookCondition, delta: GraphDelta): boolean {
  if (condition.kind === "always") {
    return true;
  }
  if (condition.kind === "delta-match") {
    return delta.adds.some((quad) => quad.predicate === condition.predicate);
  }
  throw new Error(`Unknown condition kind: ${(condition as any).kind}`);
}

// Pure in-memory store for the Engine proof

/**
 * MemoryReceiptStore
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export class MemoryReceiptStore {
  private receipts: Receipt[] = [];

  latest(): Receipt | null {
    return this.receipts.at(-1) ?? null;
  }

  append(receipt: Receipt): void {
    this.receipts.push(receipt);
  }

  read(id: string): Receipt | null {
    return this.receipts.find((receipt) => receipt.id === id) ?? null;
  }

  all(): Receipt[] {
    return [...this.receipts];
  }
}

// Pure Operational Law Engine - No Persistence Layer Assumptions

/**
 * GallTruexPureEngine
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export class GallTruexPureEngine {
  constructor(
    private readonly hooks: HookDefinition[],
    private readonly receiptStore: MemoryReceiptStore,
  ) {}

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

    // Store purely in memory
    this.receiptStore.append(receipt);

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
}

export {type HookEffect, type Quad, type GraphDelta, type HookCondition, type HookDefinition, type HookEvent, type Receipt, type EvaluationResult} from "./sqlite-proof.js";