/**
 * gall-truex-min.ts
 *
 * Minimal Gall Truex proof.
 *
 * Run:
 *   npx tsx gall-truex-min.ts
 *
 * This file proves:
 *   GraphDelta → Hook → Effect → Receipt → Readback → Replay
 *
 * No mocks.
 * No framework.
 * No database.
 * No Expo.
 * No Supabase.
 */

import { createHash, randomUUID } from "node:crypto";

type Quad = {
  subject: string;
  predicate: string;
  object: string;
  graph?: string;
};

type GraphDelta = {
  id: string;
  adds: Quad[];
  deletes: Quad[];
};

type HookCondition =
  | {
      kind: "delta-match";
      predicate: string;
    }
  | {
      kind: "always";
    };

type HookEffect =
  | {
      kind: "emit-event";
      type: string;
    }
  | {
      kind: "add-quad";
      quad: Quad;
    };

type HookDefinition = {
  id: string;
  name: string;
  condition: HookCondition;
  effects: HookEffect[];
};

type HookEvent = {
  id: string;
  hookId: string;
  type: string;
  deltaId: string;
};

type Receipt = {
  id: string;
  eventId: string;
  deltaId: string;
  inputHash: string;
  outputHash: string;
  previousReceiptHash: string | null;
  receiptHash: string;
  status: "confirmed" | "refused";
};

type EvaluationResult = {
  deltaId: string;
  matchedHookIds: string[];
  emittedEvents: HookEvent[];
  emittedQuads: Quad[];
  receipt: Receipt;
};

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
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

function hash(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function assertValidDelta(delta: GraphDelta): void {
  if (!delta.id) throw new Error("GraphDelta.id is required");

  for (const quad of [...delta.adds, ...delta.deletes]) {
    if (!quad.subject) throw new Error("Quad.subject is required");
    if (!quad.predicate) throw new Error("Quad.predicate is required");
    if (!quad.object) throw new Error("Quad.object is required");
  }
}

function conditionMatches(condition: HookCondition, delta: GraphDelta): boolean {
  if (condition.kind === "always") return true;

  return delta.adds.some((quad) => quad.predicate === condition.predicate);
}

class ReceiptStore {
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

class GallTruexEngine {
  constructor(
    private readonly hooks: HookDefinition[],
    private readonly receiptStore: ReceiptStore,
  ) {}

  evaluate(delta: GraphDelta): EvaluationResult {
    assertValidDelta(delta);

    const inputHash = hash(delta);
    const matchedHooks = this.hooks.filter((hook) =>
      conditionMatches(hook.condition, delta),
    );

    const emittedEvents: HookEvent[] = [];
    const emittedQuads: Quad[] = [];

    for (const hook of matchedHooks) {
      for (const effect of hook.effects) {
        if (effect.kind === "emit-event") {
          emittedEvents.push({
            id: randomUUID(),
            hookId: hook.id,
            type: effect.type,
            deltaId: delta.id,
          });
        }

        if (effect.kind === "add-quad") {
          emittedQuads.push(effect.quad);
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
    const previousReceiptHash =
      this.receiptStore.latest()?.receiptHash ?? null;

    const eventId = emittedEvents[0]?.id ?? `no-event:${delta.id}`;

    const receiptWithoutHash = {
      id: randomUUID(),
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
        hook.effects
          .filter((effect) => effect.kind === "emit-event")
          .map((effect) => ({
            hookId: hook.id,
            type: effect.type,
            deltaId: delta.id,
          })),
      ),
      emittedQuads: matchedHooks.flatMap((hook) =>
        hook.effects
          .filter((effect) => effect.kind === "add-quad")
          .map((effect) => effect.quad),
      ),
    };

    return (
      inputHash === expectedReceipt.inputHash &&
      hash(replayOutput) === expectedReceipt.outputHash
    );
  }
}

function prove(label: string, condition: boolean): void {
  if (!condition) throw new Error(`FAILED: ${label}`);
  console.log(`✅ ${label}`);
}

function main(): void {
  const receiptStore = new ReceiptStore();

  const hooks: HookDefinition[] = [
    {
      id: "status.changed",
      name: "Status Changed",
      condition: {
        kind: "delta-match",
        predicate: "schema:status",
      },
      effects: [
        {
          kind: "emit-event",
          type: "status_changed",
        },
        {
          kind: "add-quad",
          quad: {
            subject: "urn:truex:system",
            predicate: "prov:generated",
            object: "urn:truex:event:status_changed",
          },
        },
      ],
    },
  ];

  const engine = new GallTruexEngine(hooks, receiptStore);

  const delta: GraphDelta = {
    id: "delta-001",
    adds: [
      {
        subject: "urn:item:1",
        predicate: "schema:status",
        object: "confirmed",
      },
    ],
    deletes: [],
  };

  const first = engine.evaluate(delta);
  const readback = receiptStore.read(first.receipt.id);

  prove("delta enters engine", first.deltaId === "delta-001");
  prove("hook matches", first.matchedHookIds.includes("status.changed"));
  prove("effect emits event", first.emittedEvents.length === 1);
  prove("effect emits quad", first.emittedQuads.length === 1);
  prove("receipt emitted", Boolean(first.receipt.receiptHash));
  prove("receipt readback works", readback?.id === first.receipt.id);
  prove("replay matches receipt", engine.replay(delta, first.receipt));

  const second = engine.evaluate({
    ...delta,
    id: "delta-002",
  });

  prove(
    "second receipt chains previous receipt",
    second.receipt.previousReceiptHash === first.receipt.receiptHash,
  );

  let badInputFailed = false;

  try {
    engine.evaluate({
      id: "bad-delta",
      adds: [
        {
          subject: "",
          predicate: "schema:status",
          object: "confirmed",
        },
      ],
      deletes: [],
    });
  } catch {
    badInputFailed = true;
  }

  prove("bad input fails", badInputFailed);

  console.log("\nGall Truex minimum proof passed.");
  console.log(
    JSON.stringify(
      {
        status: "passed",
        proof:
          "GraphDelta → Hook → Effect → Receipt → Readback → Replay → Chain",
        receipts: receiptStore.all(),
      },
      null,
      2,
    ),
  );
}

main();
