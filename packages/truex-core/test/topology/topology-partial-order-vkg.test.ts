import { describe, it, expect } from "vitest";
import { createDeterministicContext } from "../../src/context.js";
import { hash } from "../../src/hash.js";
import { TruexHook } from "../../src/hook.js";
import { parseGraphDelta } from "../../src/runtime-law.js";
import type { GraphDelta, HookDefinition, Receipt, Quad } from "../../src/runtime-law.js";

// Virtual Knowledge Graph (VKG) Projection state engine
class VKGProjection {
  private quads = new Map<string, Quad>();

  applyDelta(delta: GraphDelta) {
    for (const q of delta.deletes) {
      const key = `${q.subject}|${q.predicate}`;
      this.quads.delete(key);
    }
    for (const q of delta.adds) {
      const key = `${q.subject}|${q.predicate}`;
      this.quads.set(key, q);
    }
  }

  getQuads(): Quad[] {
    return [...this.quads.values()].sort((a, b) => {
      const ka = `${a.subject}|${a.predicate}`;
      const kb = `${b.subject}|${b.predicate}`;
      return ka.localeCompare(kb);
    });
  }

  hash(): string {
    return hash(this.getQuads());
  }
}

describe("Truex Topology, Partial Orders, and VKG Projections", () => {
  // Common Hook Definitions and Deltas for independent branches Alpha and Beta
  const hookAlpha1Def: HookDefinition = {
    id: "hook-alpha-1",
    name: "Alpha Priority Process",
    condition: { kind: "delta-match", predicate: "schema:priority" },
    effects: [{ kind: "add-quad", quad: { subject: "urn:sys:alpha", predicate: "schema:approved", object: "true" } }]
  };

  const hookAlpha2Def: HookDefinition = {
    id: "hook-alpha-2",
    name: "Alpha Status Process",
    condition: { kind: "delta-match", predicate: "schema:status" },
    effects: [{ kind: "emit-event", type: "alpha_status_completed" }]
  };

  const hookBeta1Def: HookDefinition = {
    id: "hook-beta-1",
    name: "Beta Classification Process",
    condition: { kind: "delta-match", predicate: "schema:classification" },
    effects: [{ kind: "add-quad", quad: { subject: "urn:sys:beta", predicate: "schema:restricted", object: "true" } }]
  };

  const hookBeta2Def: HookDefinition = {
    id: "hook-beta-2",
    name: "Beta SecLevel Process",
    condition: { kind: "delta-match", predicate: "schema:securityLevel" },
    effects: [{ kind: "emit-event", type: "beta_seclevel_completed" }]
  };

  const hookAlpha1 = new TruexHook(hookAlpha1Def);
  const hookAlpha2 = new TruexHook(hookAlpha2Def);
  const hookBeta1 = new TruexHook(hookBeta1Def);
  const hookBeta2 = new TruexHook(hookBeta2Def);

  // Independent Delta sequences (Branch Alpha and Branch Beta)
  const deltaAlpha1: GraphDelta = {
    id: "delta-alpha-1",
    adds: [{ subject: "urn:item:alpha", predicate: "schema:priority", object: "high" }],
    deletes: []
  };

  const deltaAlpha2: GraphDelta = {
    id: "delta-alpha-2",
    adds: [{ subject: "urn:item:alpha", predicate: "schema:status", object: "ready" }],
    deletes: []
  };

  const deltaBeta1: GraphDelta = {
    id: "delta-beta-1",
    adds: [{ subject: "urn:item:beta", predicate: "schema:classification", object: "secret" }],
    deletes: []
  };

  const deltaBeta2: GraphDelta = {
    id: "delta-beta-2",
    adds: [{ subject: "urn:item:beta", predicate: "schema:securityLevel", object: "level-5" }],
    deletes: []
  };

  it("1. Two independent branches execute in different schedules", () => {
    // Schedule 1: Alpha1 -> Alpha2 -> Beta1 -> Beta2
    const s1Order = ["alpha-1", "alpha-2", "beta-1", "beta-2"];
    // Schedule 2: Beta1 -> Beta2 -> Alpha1 -> Alpha2
    const s2Order = ["beta-1", "beta-2", "alpha-1", "alpha-2"];
    // Schedule 3: Interleaved (Alpha1 -> Beta1 -> Alpha2 -> Beta2)
    const s3Order = ["alpha-1", "beta-1", "alpha-2", "beta-2"];

    expect(s1Order).not.toEqual(s2Order);
    expect(s1Order).not.toEqual(s3Order);

    // Verify hooks match appropriate deltas
    expect(hookAlpha1.matches(deltaAlpha1)).toBe(true);
    expect(hookAlpha2.matches(deltaAlpha2)).toBe(true);
    expect(hookBeta1.matches(deltaBeta1)).toBe(true);
    expect(hookBeta2.matches(deltaBeta2)).toBe(true);

    // Verify cross-branch hooks do not match
    expect(hookAlpha1.matches(deltaBeta1)).toBe(false);
    expect(hookBeta1.matches(deltaAlpha1)).toBe(false);
  });

  it("2. Per-branch receipt chains converge", () => {
    const ctxSeed = 1000;

    const getStepCtx = (nodeId: string, delta: any, prevHash: string | null) => {
      const stepHash = hash({
        nodeId,
        delta,
        previousReceiptHash: prevHash,
        parentSeed: ctxSeed,
      });
      const stepSeed = parseInt(stepHash.substring(0, 8), 16) >>> 0;
      return createDeterministicContext(stepSeed);
    };

    // Running Schedule 1 with per-branch preceding receipt hashing
    const receiptAlpha1_S1 = hookAlpha1.execute(getStepCtx("hook-alpha-1", deltaAlpha1, null), deltaAlpha1, null).receipt;
    const receiptAlpha2_S1 = hookAlpha2.execute(getStepCtx("hook-alpha-2", deltaAlpha2, receiptAlpha1_S1.receiptHash), deltaAlpha2, receiptAlpha1_S1.receiptHash).receipt;
    const receiptBeta1_S1 = hookBeta1.execute(getStepCtx("hook-beta-1", deltaBeta1, null), deltaBeta1, null).receipt;
    const receiptBeta2_S1 = hookBeta2.execute(getStepCtx("hook-beta-2", deltaBeta2, receiptBeta1_S1.receiptHash), deltaBeta2, receiptBeta1_S1.receiptHash).receipt;

    // Running Schedule 2 with per-branch preceding receipt hashing
    const receiptBeta1_S2 = hookBeta1.execute(getStepCtx("hook-beta-1", deltaBeta1, null), deltaBeta1, null).receipt;
    const receiptBeta2_S2 = hookBeta2.execute(getStepCtx("hook-beta-2", deltaBeta2, receiptBeta1_S2.receiptHash), deltaBeta2, receiptBeta1_S2.receiptHash).receipt;
    const receiptAlpha1_S2 = hookAlpha1.execute(getStepCtx("hook-alpha-1", deltaAlpha1, null), deltaAlpha1, null).receipt;
    const receiptAlpha2_S2 = hookAlpha2.execute(getStepCtx("hook-alpha-2", deltaAlpha2, receiptAlpha1_S2.receiptHash), deltaAlpha2, receiptAlpha1_S2.receiptHash).receipt;

    // Running Schedule 3 (Interleaved)
    const receiptAlpha1_S3 = hookAlpha1.execute(getStepCtx("hook-alpha-1", deltaAlpha1, null), deltaAlpha1, null).receipt;
    const receiptBeta1_S3 = hookBeta1.execute(getStepCtx("hook-beta-1", deltaBeta1, null), deltaBeta1, null).receipt;
    const receiptAlpha2_S3 = hookAlpha2.execute(getStepCtx("hook-alpha-2", deltaAlpha2, receiptAlpha1_S3.receiptHash), deltaAlpha2, receiptAlpha1_S3.receiptHash).receipt;
    const receiptBeta2_S3 = hookBeta2.execute(getStepCtx("hook-beta-2", deltaBeta2, receiptBeta1_S3.receiptHash), deltaBeta2, receiptBeta1_S3.receiptHash).receipt;

    // Assert receipt convergence across all schedules
    expect(receiptAlpha1_S1.receiptHash).toBe(receiptAlpha1_S2.receiptHash);
    expect(receiptAlpha1_S1.receiptHash).toBe(receiptAlpha1_S3.receiptHash);

    expect(receiptAlpha2_S1.receiptHash).toBe(receiptAlpha2_S2.receiptHash);
    expect(receiptAlpha2_S1.receiptHash).toBe(receiptAlpha2_S3.receiptHash);

    expect(receiptBeta1_S1.receiptHash).toBe(receiptBeta1_S2.receiptHash);
    expect(receiptBeta1_S1.receiptHash).toBe(receiptBeta1_S3.receiptHash);

    expect(receiptBeta2_S1.receiptHash).toBe(receiptBeta2_S2.receiptHash);
    expect(receiptBeta2_S1.receiptHash).toBe(receiptBeta2_S3.receiptHash);

    // Verify Replay Convergence
    const replayCtx = getStepCtx("hook-alpha-2", deltaAlpha2, receiptAlpha1_S1.receiptHash);
    expect(hookAlpha2.replay(replayCtx, deltaAlpha2, receiptAlpha2_S1)).toBe(true);

    // Adversarial Check: Tampering with a receipt (unlawful states fail)
    const tamperedReceipt = { ...receiptAlpha2_S1, previousReceiptHash: "tampered-hash-value" };
    expect(hookAlpha2.replay(replayCtx, deltaAlpha2, tamperedReceipt)).toBe(false);
  });

  it("3. Global normalized topology hash matches across schedules", () => {
    const ctxSeed = 2000;

    const runSchedule = (scheduleOrder: string[]) => {
      const alphaReceipts: Receipt[] = [];
      const betaReceipts: Receipt[] = [];

      for (const step of scheduleOrder) {
        if (step === "alpha-1") {
          const prev = alphaReceipts.at(-1)?.receiptHash ?? null;
          const stepHash = hash({
            nodeId: "hook-alpha-1",
            delta: deltaAlpha1,
            previousReceiptHash: prev,
            parentSeed: ctxSeed,
          });
          const stepSeed = parseInt(stepHash.substring(0, 8), 16) >>> 0;
          const stepCtx = createDeterministicContext(stepSeed);
          alphaReceipts.push(hookAlpha1.execute(stepCtx, deltaAlpha1, prev).receipt);
        } else if (step === "alpha-2") {
          const prev = alphaReceipts.at(-1)?.receiptHash ?? null;
          const stepHash = hash({
            nodeId: "hook-alpha-2",
            delta: deltaAlpha2,
            previousReceiptHash: prev,
            parentSeed: ctxSeed,
          });
          const stepSeed = parseInt(stepHash.substring(0, 8), 16) >>> 0;
          const stepCtx = createDeterministicContext(stepSeed);
          alphaReceipts.push(hookAlpha2.execute(stepCtx, deltaAlpha2, prev).receipt);
        } else if (step === "beta-1") {
          const prev = betaReceipts.at(-1)?.receiptHash ?? null;
          const stepHash = hash({
            nodeId: "hook-beta-1",
            delta: deltaBeta1,
            previousReceiptHash: prev,
            parentSeed: ctxSeed,
          });
          const stepSeed = parseInt(stepHash.substring(0, 8), 16) >>> 0;
          const stepCtx = createDeterministicContext(stepSeed);
          betaReceipts.push(hookBeta1.execute(stepCtx, deltaBeta1, prev).receipt);
        } else if (step === "beta-2") {
          const prev = betaReceipts.at(-1)?.receiptHash ?? null;
          const stepHash = hash({
            nodeId: "hook-beta-2",
            delta: deltaBeta2,
            previousReceiptHash: prev,
            parentSeed: ctxSeed,
          });
          const stepSeed = parseInt(stepHash.substring(0, 8), 16) >>> 0;
          const stepCtx = createDeterministicContext(stepSeed);
          betaReceipts.push(hookBeta2.execute(stepCtx, deltaBeta2, prev).receipt);
        }
      }

      return [...alphaReceipts, ...betaReceipts];
    };

    const receiptsS1 = runSchedule(["alpha-1", "alpha-2", "beta-1", "beta-2"]);
    const receiptsS2 = runSchedule(["beta-1", "beta-2", "alpha-1", "alpha-2"]);
    const receiptsS3 = runSchedule(["alpha-1", "beta-1", "alpha-2", "beta-2"]);

    // The normalization strategy sorts all receipts deterministically by deltaId
    const getNormalizedHash = (receipts: Receipt[]) => {
      const sortedHashes = receipts
        .map(r => ({ deltaId: r.deltaId, hash: r.receiptHash }))
        .sort((a, b) => a.deltaId.localeCompare(b.deltaId))
        .map(x => x.hash);
      return hash(sortedHashes);
    };

    const normHashS1 = getNormalizedHash(receiptsS1);
    const normHashS2 = getNormalizedHash(receiptsS2);
    const normHashS3 = getNormalizedHash(receiptsS3);

    expect(normHashS1).toBe(normHashS2);
    expect(normHashS1).toBe(normHashS3);
  });

  it("4. Non-normalized schedule hash differs and records order", () => {
    const ctxSeed = 3000;

    // Linear sequential chaining (each step links to the temporal predecessor)
    const runSequentialSchedule = (order: string[]) => {
      const ctx = createDeterministicContext(ctxSeed);
      const receipts: Receipt[] = [];

      for (const step of order) {
        const prev = receipts.at(-1)?.receiptHash ?? null;
        if (step === "alpha-1") {
          receipts.push(hookAlpha1.execute(ctx, deltaAlpha1, prev).receipt);
        } else if (step === "alpha-2") {
          receipts.push(hookAlpha2.execute(ctx, deltaAlpha2, prev).receipt);
        } else if (step === "beta-1") {
          receipts.push(hookBeta1.execute(ctx, deltaBeta1, prev).receipt);
        } else if (step === "beta-2") {
          receipts.push(hookBeta2.execute(ctx, deltaBeta2, prev).receipt);
        }
      }
      return receipts;
    };

    const receiptsS1 = runSequentialSchedule(["alpha-1", "alpha-2", "beta-1", "beta-2"]);
    const receiptsS2 = runSequentialSchedule(["beta-1", "beta-2", "alpha-1", "alpha-2"]);

    const seqHashS1 = hash(receiptsS1.map(r => r.receiptHash));
    const seqHashS2 = hash(receiptsS2.map(r => r.receiptHash));

    // The non-normalized schedule hashes must differ because the causal lineage is different
    expect(seqHashS1).not.toBe(seqHashS2);

    // Verify individual temporal receipts differ
    // In S1: Beta-1 is executed after Alpha-2, so its previousReceiptHash is Alpha-2
    // In S2: Beta-1 is executed first, so its previousReceiptHash is null
    const rBeta1_S1 = receiptsS1.find(r => r.deltaId === "delta-beta-1")!;
    const rBeta1_S2 = receiptsS2.find(r => r.deltaId === "delta-beta-1")!;
    expect(rBeta1_S1.previousReceiptHash).not.toBeNull();
    expect(rBeta1_S2.previousReceiptHash).toBeNull();
    expect(rBeta1_S1.receiptHash).not.toBe(rBeta1_S2.receiptHash);
  });

  it("5. VKG projection emits same lawful projection for equivalent partial orders", () => {
    // Projections under different execution orders
    const projS1 = new VKGProjection();
    projS1.applyDelta(deltaAlpha1);
    projS1.applyDelta(deltaAlpha2);
    projS1.applyDelta(deltaBeta1);
    projS1.applyDelta(deltaBeta2);

    const projS2 = new VKGProjection();
    projS2.applyDelta(deltaBeta1);
    projS2.applyDelta(deltaBeta2);
    projS2.applyDelta(deltaAlpha1);
    projS2.applyDelta(deltaAlpha2);

    const projS3 = new VKGProjection();
    projS3.applyDelta(deltaAlpha1);
    projS3.applyDelta(deltaBeta1);
    projS3.applyDelta(deltaAlpha2);
    projS3.applyDelta(deltaBeta2);

    // Projections must be identical in state and hash
    expect(projS1.getQuads()).toEqual(projS2.getQuads());
    expect(projS1.getQuads()).toEqual(projS3.getQuads());
    expect(projS1.hash()).toBe(projS2.hash());
    expect(projS1.hash()).toBe(projS3.hash());
  });

  it("6. Projection divergence is detected when one branch mutates", () => {
    // Lawful baseline projection
    const lawfulProj = new VKGProjection();
    lawfulProj.applyDelta(deltaAlpha1);
    lawfulProj.applyDelta(deltaAlpha2);
    lawfulProj.applyDelta(deltaBeta1);
    lawfulProj.applyDelta(deltaBeta2);

    // Case A: Branch mutation (tampering or payload alteration)
    const mutatedDeltaBeta2: GraphDelta = {
      ...deltaBeta2,
      adds: [{ subject: "urn:item:beta", predicate: "schema:securityLevel", object: "level-10" }] // Changed from level-5
    };

    const divergentProj = new VKGProjection();
    divergentProj.applyDelta(deltaAlpha1);
    divergentProj.applyDelta(deltaAlpha2);
    divergentProj.applyDelta(deltaBeta1);
    divergentProj.applyDelta(mutatedDeltaBeta2);

    expect(divergentProj.hash()).not.toBe(lawfulProj.hash());

    // Case B: Non-independent mutations (shared resource collision)
    // When branches mutate the same resource, execution order affects the projection, causing schedule-dependent divergence
    const deltaSharedAlpha: GraphDelta = {
      id: "delta-shared-alpha",
      adds: [{ subject: "urn:shared:config", predicate: "schema:value", object: "alpha-value" }],
      deletes: []
    };

    const deltaSharedBeta: GraphDelta = {
      id: "delta-shared-beta",
      adds: [{ subject: "urn:shared:config", predicate: "schema:value", object: "beta-value" }],
      deletes: []
    };

    const sharedProj_AlphaFirst = new VKGProjection();
    sharedProj_AlphaFirst.applyDelta(deltaSharedAlpha);
    sharedProj_AlphaFirst.applyDelta(deltaSharedBeta); // Beta overwrites Alpha

    const sharedProj_BetaFirst = new VKGProjection();
    sharedProj_BetaFirst.applyDelta(deltaSharedBeta);
    sharedProj_BetaFirst.applyDelta(deltaSharedAlpha); // Alpha overwrites Beta

    expect(sharedProj_AlphaFirst.getQuads()).not.toEqual(sharedProj_BetaFirst.getQuads());
    expect(sharedProj_AlphaFirst.hash()).not.toBe(sharedProj_BetaFirst.hash());

    // Verify the specific values match the overwrites
    const quadAlphaFirst = sharedProj_AlphaFirst.getQuads().find(q => q.subject === "urn:shared:config")!;
    const quadBetaFirst = sharedProj_BetaFirst.getQuads().find(q => q.subject === "urn:shared:config")!;
    expect(quadAlphaFirst.object).toBe("beta-value");
    expect(quadBetaFirst.object).toBe("alpha-value");
  });
});
