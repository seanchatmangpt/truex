/* eslint-disable unicorn/no-null, @typescript-eslint/no-non-null-assertion */
import { describe, it, expect } from "vitest";
import { createDeterministicContext } from "../../src/context.js";
import { hash } from "../../src/hash.js";
import { verifyReceipt } from "../../src/receipt.js";
import { RecursiveHookEngine, type HookTopology } from "../../src/manufacturing/topology.js";
import { TruexHook } from "../../src/hook.js";
import type { GraphDelta, HookDefinition, Quad, Receipt } from "../../src/runtime-law.js";

describe("Topology Chain Replay", () => {
  // Define Hook A: matches trigger:A, emits add-quad for trigger:B
  const hookDefA: HookDefinition = {
    id: "hook-A",
    name: "Hook A",
    condition: { kind: "delta-match", predicate: "trigger:A" },
    effects: [
      {
        kind: "add-quad",
        quad: { subject: "urn:node:B", predicate: "trigger:B", object: "value:B" },
      },
    ],
  };

  // Define Hook B: matches trigger:B, emits add-quad for trigger:C
  const hookDefB: HookDefinition = {
    id: "hook-B",
    name: "Hook B",
    condition: { kind: "delta-match", predicate: "trigger:B" },
    effects: [
      {
        kind: "add-quad",
        quad: { subject: "urn:node:C", predicate: "trigger:C", object: "value:C" },
      },
    ],
  };

  // Define Hook C: matches trigger:C, emits a final event
  const hookDefC: HookDefinition = {
    id: "hook-C",
    name: "Hook C",
    condition: { kind: "delta-match", predicate: "trigger:C" },
    effects: [
      { kind: "emit-event", type: "chain_completed" },
    ],
  };

  const hookA = new TruexHook(hookDefA);
  const hookB = new TruexHook(hookDefB);
  const hookC = new TruexHook(hookDefC);
  const hooks = [hookA, hookB, hookC];

  const pullHooks = (delta: GraphDelta): TruexHook[] => {
    return hooks.filter((h) => h.matches(delta));
  };

  // Helper to run the topology execution cascade
  async function runCascade(seed: number, rootDelta: GraphDelta): Promise<HookTopology> {
    const context = createDeterministicContext(seed);
    const engine = new RecursiveHookEngine(context);
    return engine.process(
      rootDelta,
      pullHooks,
      (hook, delta, prevReceiptHash) => hook.execute(context, delta, prevReceiptHash)
    );
  }

  // Helper to build the root delta
  function createRootDelta(): GraphDelta {
    return {
      id: "delta-root",
      adds: [{ subject: "urn:node:A", predicate: "trigger:A", object: "value:A" }],
      deletes: [],
    };
  }

  // Helper to replay the entire topology using the TruexHook.replay primitives
  function verifyCausalChainReplay(
    seed: number,
    rootDelta: GraphDelta,
    topology: HookTopology
  ): boolean {
    const ctx = createDeterministicContext(seed);
    const deltaMap = new Map<string, GraphDelta>();
    deltaMap.set(topology.rootDeltaId, rootDelta);

    for (const activation of topology.activations) {
      const delta = deltaMap.get(activation.triggerDeltaId);
      if (!delta) {
        return false;
      }

      const hook = hooks.find((h) => h.definition.id === activation.hookId);
      if (!hook) {
        return false;
      }

      ctx.uuid(); // Consume the UUID used for activationId in execution engine

      // Replay the individual hook activation against its expected receipt
      const ok = hook.replay(ctx, delta, activation.receipt);
      if (!ok) {
        return false;
      }

      // Reconstruct produced delta for downstream activations
      if (activation.producedDeltaId) {
        ctx.uuid(); // Consume the UUID used for nextDelta.id in execution engine
        const adds = hook.definition.effects
          .filter((e): e is { kind: "add-quad"; quad: Quad } => e.kind === "add-quad")
          .map((e) => e.quad);

        const nextDelta: GraphDelta = {
          id: activation.producedDeltaId,
          adds,
          deletes: [],
        };
        deltaMap.set(activation.producedDeltaId, nextDelta);
      }
    }

    return true;
  }

  it("1. A -> B -> C chain executes in order", async () => {
    const rootDelta = createRootDelta();
    const topology = await runCascade(100, rootDelta);

    expect(topology.activations).toHaveLength(3);
    expect(topology.activations[0]!.hookId).toBe("hook-A");
    expect(topology.activations[1]!.hookId).toBe("hook-B");
    expect(topology.activations[2]!.hookId).toBe("hook-C");

    // Depth check
    expect(topology.activations[0]!.depth).toBe(0);
    expect(topology.activations[1]!.depth).toBe(1);
    expect(topology.activations[2]!.depth).toBe(2);
  });

  it("2. Each hook emits a receipt", async () => {
    const rootDelta = createRootDelta();
    const topology = await runCascade(100, rootDelta);

    for (const activation of topology.activations) {
      expect(activation.receipt).toBeDefined();
      expect(verifyReceipt(activation.receipt)).toBe(true);
    }
  });

  it("3. Each downstream delta references parent receipt", async () => {
    const rootDelta = createRootDelta();
    const topology = await runCascade(100, rootDelta);

    const actA = topology.activations[0]!;
    const actB = topology.activations[1]!;
    const actC = topology.activations[2]!;

    // Delta tracking links: B's trigger is A's output, C's trigger is B's output
    expect(actB.triggerDeltaId).toBe(actA.producedDeltaId);
    expect(actC.triggerDeltaId).toBe(actB.producedDeltaId);

    // Cryptographic parent receipt hash chaining links
    expect(actB.receipt.previousReceiptHash).toBe(actA.receipt.receiptHash);
    expect(actC.receipt.previousReceiptHash).toBe(actB.receipt.receiptHash);
    expect(actA.receipt.previousReceiptHash).toBeNull();
  });

  it("4. Full chain replay converges", async () => {
    const rootDelta = createRootDelta();
    const topology = await runCascade(100, rootDelta);

    // A: Manual verification of individual hook replay primitives
    const manualReplayResult = verifyCausalChainReplay(100, rootDelta, topology);
    expect(manualReplayResult).toBe(true);

    // B: Full end-to-end replay engine run comparison
    const replayedTopology = await runCascade(100, rootDelta);
    expect(hash(replayedTopology)).toBe(hash(topology));
  });

  it("5. Replaying with mutated middle delta fails", async () => {
    const rootDelta = createRootDelta();
    const topology = await runCascade(100, rootDelta);

    const actB = topology.activations[1]!;

    // Construct the true middle delta (from Hook A's effects)
    const middleDelta: GraphDelta = {
      id: actB.triggerDeltaId,
      adds: hookDefA.effects
        .filter((e): e is { kind: "add-quad"; quad: Quad } => e.kind === "add-quad")
        .map((e) => e.quad),
      deletes: [],
    };

    // Mutate B: change object value of its input quad
    const mutatedDeltaContent: GraphDelta = {
      ...middleDelta,
      adds: [{ ...middleDelta.adds[0]!, object: "mutated_value" }],
    };

    const ctx = createDeterministicContext(100);

    // Replay should fail because the hash of the delta does not match expected receipt's inputHash
    const contentReplayOk = hookB.replay(ctx, mutatedDeltaContent, actB.receipt);
    expect(contentReplayOk).toBe(false);

    // Mutate B: change the delta ID
    const mutatedDeltaId: GraphDelta = {
      ...middleDelta,
      id: "tampered-delta-id",
    };

    // Replay should fail because changing deltaId changes inputHash
    const idReplayOk = hookB.replay(ctx, mutatedDeltaId, actB.receipt);
    expect(idReplayOk).toBe(false);
  });

  it("6. Replaying with mutated parent receipt fails", async () => {
    const rootDelta = createRootDelta();
    const topology = await runCascade(100, rootDelta);

    const actB = topology.activations[1]!;

    const middleDelta: GraphDelta = {
      id: actB.triggerDeltaId,
      adds: hookDefA.effects
        .filter((e): e is { kind: "add-quad"; quad: Quad } => e.kind === "add-quad")
        .map((e) => e.quad),
      deletes: [],
    };

    // Mutated Case 6.1: Direct receipt field modification without updating receiptHash
    // This will cause verifyReceipt to fail immediately.
    const tamperedReceiptB = {
      ...actB.receipt,
      previousReceiptHash: "tampered_parent_hash",
    };

    const ctx = createDeterministicContext(100);
    const directTamperReplayOk = hookB.replay(ctx, middleDelta, tamperedReceiptB);
    expect(directTamperReplayOk).toBe(false);

    // Mutated Case 6.2: Mutating previousReceiptHash AND updating receiptHash to match
    // verifyReceipt will pass, but the execution convergence check will fail
    // because the step seed generated using the tampered parent receipt hash
    // yields a different execution outcome (different eventId, hence different receiptHash).
    const receiptWithoutHash = {
      id: actB.receipt.id,
      eventId: actB.receipt.eventId,
      deltaId: actB.receipt.deltaId,
      inputHash: actB.receipt.inputHash,
      outputHash: actB.receipt.outputHash,
      previousReceiptHash: "tampered_parent_hash",
      status: actB.receipt.status,
    };
    const tamperedReceiptWithValidHash: Receipt = {
      ...receiptWithoutHash,
      receiptHash: hash(receiptWithoutHash),
    };

    // Self-integrity check passes because the hash matches the modified fields
    expect(verifyReceipt(tamperedReceiptWithValidHash)).toBe(true);

    // Replay convergence check must still fail
    const executionTamperReplayOk = hookB.replay(ctx, middleDelta, tamperedReceiptWithValidHash);
    expect(executionTamperReplayOk).toBe(false);
  });

  it("7. Same seed and same chain produce same topology report hash", async () => {
    const rootDelta = createRootDelta();
    const topology1 = await runCascade(42, rootDelta);
    const topology2 = await runCascade(42, rootDelta);

    const hash1 = hash(topology1);
    const hash2 = hash(topology2);

    expect(hash1).toBe(hash2);
  });

  it("8. Different parent seed changes topology hash", async () => {
    const rootDelta = createRootDelta();
    const topologySeed100 = await runCascade(100, rootDelta);
    const topologySeed101 = await runCascade(101, rootDelta);

    const hash100 = hash(topologySeed100);
    const hash101 = hash(topologySeed101);

    expect(hash100).not.toBe(hash101);
  });
});
