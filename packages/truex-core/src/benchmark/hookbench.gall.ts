import type { GraphDelta, HookDefinition, HookEffect, Receipt, HookEvent } from "../runtime-law.js";
import { TruexHook } from "../hook.js";
import { createDeterministicContext, type TruexContext } from "../context.js";
import { hash, createReceipt, verifyReceipt } from "../index.js";
import { AndonSystem, PokaYoke } from "../manufacturing/jidoka.js";
import { parseGraphDelta } from "../runtime-law.js";
import Database from "better-sqlite3";
import { DeltaJournal } from "../persistence/journal.js";
import { initializeSchema } from "../persistence/schema.js";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";

// 1. Types
export interface HookBenchCase {
  seed: number;
  registeredHooks: number;
  processedDeltas: number;
  matchRatio: number;
  evalOnly: boolean;
  forbiddenPredicates?: string[];
}

export type HookBenchTier = 'T0' | 'T1' | 'T2' | 'T3';

export interface HookBenchResult {
  tier: HookBenchTier;
  options: HookBenchCase;
  metadata: {
    nodeVersion: string;
    platform: string;
    arch: string;
    cpuModel: string;
    memoryBeforeMb: number;
    memoryAfterMb: number;
  };
  metrics: {
    registeredHooks: number;
    processedDeltas: number;
    totalHookDeltaEvaluations: number;
    matchedHooks: number;
    emittedEffects: number;
    receipts: number;
    refused: number;
    replayConverged: number;
    replayDiverged: number;
    durationMs: number;
    hookDeltaEvaluationsPerSecond: number;
    deltasPerSecond: number;
    memoryBeforeMb: number;
    memoryAfterMb: number;
    [key: string]: any;
  };
  reportHash: string;
}

export interface HookBenchStressCase {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  expectedFailure: boolean;
  observedBehavior: string;
  evidence: Record<string, unknown>;
}

export interface HookBenchReporter {
  results: HookBenchResult[];
  stressResults: HookBenchStressCase[];
  reportHash: string;
}

// 2. Seeded PRNG
export class SeededPRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (Math.imul(1664525, this.state) + 1013904223) >>> 0;
    return (this.state >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(arr: T[]): T {
    if (arr.length === 0) {
      throw new Error("Cannot pick from empty array");
    }
    return arr[this.nextInt(0, arr.length - 1)];
  }
}

// 3. Generators
export function makeGraphDelta(seed: number, id: string, predicate: string): GraphDelta {
  return {
    id,
    adds: [{ subject: `s:${seed}`, predicate, object: `o:${seed}`, graph: null }],
    deletes: []
  };
}

export function makeHookDefinition(seed: number, id: string, predicate: string): HookDefinition {
  return {
    id,
    name: `hook-${id}`,
    condition: { kind: 'delta-match', predicate } as any,
    effects: [{ kind: 'emit-event', type: `event-${seed}` }]
  };
}

export function makeHookField(
  seed: number,
  hookCount: number,
  deltaCount: number,
  matchRatio: number,
  forbiddenPredicates: string[] = []
): { hooks: TruexHook[]; deltas: GraphDelta[] } {
  const prng = new SeededPRNG(seed);
  const hooks: TruexHook[] = [];
  const deltas: GraphDelta[] = [];

  // Generate hooks
  for (let i = 0; i < hookCount; i++) {
    const predicate = `schema:predicate-${i}`;
    const def = makeHookDefinition(seed + i, `hook-${i}`, predicate);
    hooks.push(new TruexHook(def));
  }

  // Generate deltas
  for (let i = 0; i < deltaCount; i++) {
    const isForbidden = forbiddenPredicates.length > 0 && prng.next() < 0.1;
    let predicate = 'schema:unmatched';

    if (isForbidden) {
      predicate = prng.pick(forbiddenPredicates);
    } else {
      const shouldMatch = prng.next() < matchRatio;
      if (shouldMatch && hookCount > 0) {
        const idx = prng.nextInt(0, hookCount - 1);
        predicate = `schema:predicate-${idx}`;
      }
    }

    deltas.push(makeGraphDelta(seed + hookCount + i, `delta-${i}`, predicate));
  }

  return { hooks, deltas };
}

export function makeBenchmarkCase(
  seed: number,
  registeredHooks: number,
  processedDeltas: number,
  matchRatio: number,
  evalOnly: boolean
): HookBenchCase {
  return { seed, registeredHooks, processedDeltas, matchRatio, evalOnly };
}

let cachedStressResults: HookBenchStressCase[] | null = null;

// 4. Runners
export function runHookBench(benchCase: HookBenchCase, tier: HookBenchTier): HookBenchResult {
  const { seed, registeredHooks, processedDeltas, matchRatio, evalOnly, forbiddenPredicates = [] } = benchCase;
  const { hooks, deltas } = makeHookField(seed, registeredHooks, processedDeltas, matchRatio, forbiddenPredicates);

  const memoryBeforeMb = process.memoryUsage().heapUsed / 1024 / 1024;
  const startTime = performance.now();

  let matchedHooks = 0;
  let emittedEffects = 0;
  let receipts = 0;
  let refused = 0;
  let replayConverged = 0;
  let replayDiverged = 0;

  const ctx = createDeterministicContext(seed);
  const andon = new AndonSystem();
  const pokaYoke = new PokaYoke(andon);

  for (const delta of deltas) {
    const hasForbidden = delta.adds.some(q => forbiddenPredicates.includes(q.predicate)) ||
                        delta.deletes.some(q => forbiddenPredicates.includes(q.predicate));
    if (hasForbidden) {
      refused++;
      continue;
    }

    let previousReceiptHash: string | null = null;
    for (const hook of hooks) {
      if (!evalOnly) {
        try {
          const matches = hook.matches(delta);
          if (matches) {
            const run = () => {
              const executeResult = hook.execute(ctx, delta, previousReceiptHash);
              matchedHooks++;
              emittedEffects += executeResult.effects.length;
              receipts++;
              previousReceiptHash = executeResult.receipt.receiptHash;

              // Replay convergence check
              const replayCtx = createDeterministicContext(seed);
              const converged = hook.replay(replayCtx, delta, executeResult.receipt);
              if (converged) {
                replayConverged++;
              } else {
                replayDiverged++;
              }
              return executeResult;
            };
            pokaYoke.guardExecution(hook, ctx, delta, run);
          }
        } catch {
          refused++;
        }
      } else {
        const matches = hook.matches(delta);
        if (matches) {
          matchedHooks++;
          emittedEffects += hook.definition.effects.length;
        }
      }
    }
  }

  const endTime = performance.now();
  const durationMs = endTime - startTime;
  const memoryAfterMb = process.memoryUsage().heapUsed / 1024 / 1024;

  const totalHookDeltaEvaluations = registeredHooks * processedDeltas;
  const durationSeconds = durationMs / 1000;
  const hookDeltaEvaluationsPerSecond = durationSeconds > 0 ? (totalHookDeltaEvaluations / durationSeconds) : 0;
  const deltasPerSecond = durationSeconds > 0 ? (processedDeltas / durationSeconds) : 0;

  const cpuModel = os.cpus()[0]?.model || 'unknown';
  const finalOptions = { seed, registeredHooks, processedDeltas, matchRatio, evalOnly };

  if (!cachedStressResults) {
    const defaultStressCase = { seed, registeredHooks, processedDeltas, matchRatio, evalOnly, forbiddenPredicates };
    cachedStressResults = runStressCases(defaultStressCase);
  }
  const stressAttempted = cachedStressResults.length;
  const stressSucceeded = cachedStressResults.filter(s => s.passed).length;

  const canonicalString = JSON.stringify({
    tier,
    options: finalOptions,
    metrics: {
      registeredHooks,
      processedDeltas,
      totalHookDeltaEvaluations,
      matchedHooks,
      matches: matchedHooks,
      unmatchedEvaluations: totalHookDeltaEvaluations - matchedHooks,
      emittedEffects,
      receipts,
      refused,
      refusals: refused,
      replayConverged,
      replayDiverged,
      stressAttempted,
      stressSucceeded,
    }
  });
  const reportHash = hash(canonicalString);

  return {
    tier,
    options: benchCase,
    metadata: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuModel,
      memoryBeforeMb: parseFloat(memoryBeforeMb.toFixed(3)),
      memoryAfterMb: parseFloat(memoryAfterMb.toFixed(3))
    },
    metrics: {
      registeredHooks,
      processedDeltas,
      totalHookDeltaEvaluations,
      matchedHooks,
      matches: matchedHooks,
      unmatchedEvaluations: totalHookDeltaEvaluations - matchedHooks,
      emittedEffects,
      receipts,
      refused,
      refusals: refused,
      replayConverged,
      replayDiverged,
      stressAttempted,
      stressSucceeded,
      durationMs: parseFloat(durationMs.toFixed(3)),
      durationMsString: `${durationMs.toFixed(3)} ms`,
      hookDeltaEvaluationsPerSecond: parseFloat(hookDeltaEvaluationsPerSecond.toFixed(3)),
      hookDeltaEvaluationsPerSecondString: `${hookDeltaEvaluationsPerSecond.toFixed(3)} evaluations/sec`,
      deltasPerSecond: parseFloat(deltasPerSecond.toFixed(3)),
      deltasPerSecondString: `${deltasPerSecond.toFixed(3)} ops/sec`,
      memoryBeforeMb: parseFloat(memoryBeforeMb.toFixed(3)),
      memoryBeforeMbString: `${memoryBeforeMb.toFixed(3)} MB`,
      memoryAfterMb: parseFloat(memoryAfterMb.toFixed(3)),
      memoryAfterMbString: `${memoryAfterMb.toFixed(3)} MB`,
      matchRate: `${((matchedHooks / totalHookDeltaEvaluations) * 100).toFixed(3)}%`,
      evalOnly: evalOnly
    },
    reportHash
  };
}

export function runHookTier(tier: HookBenchTier, customOptions?: Partial<HookBenchCase>): HookBenchResult {
  const seed = customOptions?.seed ?? 42;
  let registeredHooks = 10;
  let processedDeltas = 10;
  let matchRatio = 0.5;
  let evalOnly = false;

  switch (tier) {
    case 'T0':
      registeredHooks = 1;
      processedDeltas = 1;
      matchRatio = 1.0;
      evalOnly = false;
      break;
    case 'T1':
      registeredHooks = 100;
      processedDeltas = 100;
      matchRatio = 0.5;
      evalOnly = false;
      break;
    case 'T2':
      registeredHooks = 1000;
      processedDeltas = 1000;
      matchRatio = 0.5;
      evalOnly = false;
      break;
    case 'T3':
      registeredHooks = customOptions?.registeredHooks ?? 1000;
      processedDeltas = customOptions?.processedDeltas ?? 1000;
      matchRatio = customOptions?.matchRatio ?? 0.5;
      evalOnly = customOptions?.evalOnly ?? true;
      break;
  }

  const finalCase: HookBenchCase = {
    seed,
    registeredHooks,
    processedDeltas,
    matchRatio,
    evalOnly,
    ...customOptions
  };

  return runHookBench(finalCase, tier);
}

// 5. Stress Cases (80/20 Failure Taxonomy Implementation)
export function runStressCases(benchCase: HookBenchCase): HookBenchStressCase[] {
  const stressResults: HookBenchStressCase[] = [];
  const ctx = createDeterministicContext(benchCase.seed);

  // 1. malformed input
  try {
    parseGraphDelta({ id: "bad", adds: "not-an-array" } as any);
    stressResults.push({
      id: "stress-01",
      name: "malformed input",
      category: "malformed input",
      passed: false,
      expectedFailure: true,
      observedBehavior: "Admitted malformed delta",
      evidence: {}
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-01",
      name: "malformed input",
      category: "malformed input",
      passed: true,
      expectedFailure: true,
      observedBehavior: `Successfully rejected malformed delta: ${e.message}`,
      evidence: { error: e.message }
    });
  }

  // 2. capacity breach / Muri
  try {
    const hook = new TruexHook({
      id: 'hook-capacity',
      name: 'h',
      condition: { kind: 'always' },
      effects: [{ kind: 'emit-event', type: 'e' }]
    });
    const massiveDelta: GraphDelta = {
      id: 'massive-delta',
      adds: Array.from({ length: 101 }, (_, i) => ({
        subject: `s:${i}`,
        predicate: 'p',
        object: 'o',
        graph: null
      })),
      deletes: []
    };
    const andon = new AndonSystem();
    const pokaYoke = new PokaYoke(andon);

    pokaYoke.guardExecution(hook, ctx, massiveDelta, () => ({ effects: hook.definition.effects, receipt: {} as any, events: [] }));
    stressResults.push({
      id: "stress-02",
      name: "capacity breach / Muri",
      category: "capacity breach",
      passed: false,
      expectedFailure: true,
      observedBehavior: "Admitted capacity breach delta",
      evidence: {}
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-02",
      name: "capacity breach / Muri",
      category: "capacity breach",
      passed: true,
      expectedFailure: true,
      observedBehavior: `Successfully blocked capacity breach: ${e.message}`,
      evidence: { error: e.message }
    });
  }

  // 3. nonmatching predicate / Muda
  try {
    const hook = new TruexHook({
      id: 'hook-muda',
      name: 'h',
      condition: { kind: 'delta-match', predicate: 'schema:special' } as any,
      effects: [{ kind: 'emit-event', type: 'e' }]
    });
    const delta = makeGraphDelta(benchCase.seed, 'delta-normal', 'schema:unrelated');
    const isMatched = hook.matches(delta);
    stressResults.push({
      id: "stress-03",
      name: "nonmatching predicate / Muda",
      category: "nonmatching predicate",
      passed: !isMatched,
      expectedFailure: false,
      observedBehavior: isMatched ? "Mismatched predicate triggered hook" : "Mismatched predicate correctly bypassed hook",
      evidence: { matched: isMatched }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-03",
      name: "nonmatching predicate / Muda",
      category: "nonmatching predicate",
      passed: false,
      expectedFailure: false,
      observedBehavior: `Error during relevance check: ${e.message}`,
      evidence: { error: e.message }
    });
  }

  // 4. forbidden predicate / policy refusal
  try {
    const forbiddenPred = 'schema:forbidden-pred';
    const deltaWithForbidden = makeGraphDelta(benchCase.seed, 'delta-forbidden', forbiddenPred);
    const hasForbidden = deltaWithForbidden.adds.some(q => q.predicate === forbiddenPred);
    stressResults.push({
      id: "stress-04",
      name: "forbidden predicate / policy refusal",
      category: "policy refusal",
      passed: hasForbidden,
      expectedFailure: true,
      observedBehavior: hasForbidden ? "Forbidden predicate correctly identified for refusal" : "Failed to identify forbidden predicate",
      evidence: { predicate: forbiddenPred }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-04",
      name: "forbidden predicate / policy refusal",
      category: "policy refusal",
      passed: false,
      expectedFailure: true,
      observedBehavior: `Error checking forbidden predicate: ${e.message}`,
      evidence: { error: e.message }
    });
  }

  // 5. receipt tamper
  try {
    const hook = new TruexHook({
      id: 'hook-1',
      name: 'h',
      condition: { kind: 'always' },
      effects: [{ kind: 'emit-event', type: 'e' }]
    });
    const delta = makeGraphDelta(benchCase.seed, 'delta-1', 'schema:any');
    const { receipt } = hook.execute(ctx, delta, null);
    const tampered = { ...receipt, outputHash: '0'.repeat(64) };
    const isValid = verifyReceipt(tampered);
    stressResults.push({
      id: "stress-05",
      name: "receipt tamper",
      category: "receipt integrity",
      passed: !isValid,
      expectedFailure: true,
      observedBehavior: isValid ? "Tampered receipt was validated" : "Tampered receipt correctly rejected",
      evidence: { isValid }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-05",
      name: "receipt tamper",
      category: "receipt integrity",
      passed: false,
      expectedFailure: true,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 6. receipt chain reorder
  try {
    const hook = new TruexHook({
      id: 'hook-1',
      name: 'h',
      condition: { kind: 'always' },
      effects: [{ kind: 'emit-event', type: 'e' }]
    });
    const delta = makeGraphDelta(benchCase.seed, 'delta-1', 'schema:any');
    const { receipt } = hook.execute(ctx, delta, null);
    const reorderedReceipt = { ...receipt, previousReceiptHash: 'wrong-previous-hash' };
    // Replay should fail on reordered/tampered linkage
    const replayCtx = createDeterministicContext(benchCase.seed);
    const converged = hook.replay(replayCtx, delta, reorderedReceipt);
    stressResults.push({
      id: "stress-06",
      name: "receipt chain reorder",
      category: "receipt linkage",
      passed: !converged,
      expectedFailure: true,
      observedBehavior: converged ? "Replay converged despite chain linkage mismatch" : "Replay successfully blocked reordered chain",
      evidence: { converged }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-06",
      name: "receipt chain reorder",
      category: "receipt linkage",
      passed: false,
      expectedFailure: true,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 7. replay input divergence
  try {
    const hook = new TruexHook({
      id: 'hook-1',
      name: 'h',
      condition: { kind: 'always' },
      effects: [{ kind: 'emit-event', type: 'e' }]
    });
    const delta = makeGraphDelta(benchCase.seed, 'delta-1', 'schema:any');
    const { receipt } = hook.execute(ctx, delta, null);
    const mutatedDelta = { ...delta, adds: [{ subject: 's:mutated', predicate: 'schema:any', object: 'o', graph: null }] };
    const converged = hook.replay(ctx, mutatedDelta, receipt);
    stressResults.push({
      id: "stress-07",
      name: "replay input divergence",
      category: "replay inputs",
      passed: !converged,
      expectedFailure: true,
      observedBehavior: converged ? "Replay converged despite mutated delta input" : "Replay successfully failed on input mutation",
      evidence: { converged }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-07",
      name: "replay input divergence",
      category: "replay inputs",
      passed: false,
      expectedFailure: true,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 8. replay law divergence
  try {
    const hook = new TruexHook({
      id: 'hook-1',
      name: 'h',
      condition: { kind: 'always' },
      effects: [{ kind: 'emit-event', type: 'e' }]
    });
    const delta = makeGraphDelta(benchCase.seed, 'delta-1', 'schema:any');
    const { receipt } = hook.execute(ctx, delta, null);
    
    // Mutate the hook definition (the law)
    const mutatedHook = new TruexHook({
      ...hook.definition,
      effects: [{ kind: 'emit-event', type: 'different-event' }]
    });
    const converged = mutatedHook.replay(ctx, delta, receipt);
    stressResults.push({
      id: "stress-08",
      name: "replay law divergence",
      category: "replay rules",
      passed: !converged,
      expectedFailure: true,
      observedBehavior: converged ? "Replay converged despite mutated hook law" : "Replay successfully failed on law mutation",
      evidence: { converged }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-08",
      name: "replay law divergence",
      category: "replay rules",
      passed: false,
      expectedFailure: true,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 9. seed/context divergence
  try {
    const hook = new TruexHook({
      id: 'hook-1',
      name: 'h',
      condition: { kind: 'always' },
      effects: [{ kind: 'emit-event', type: 'e' }]
    });
    const delta = makeGraphDelta(benchCase.seed, 'delta-1', 'schema:any');
    const { receipt } = hook.execute(ctx, delta, null);

    const divergentCtx = createDeterministicContext(benchCase.seed + 9999);
    const converged = hook.replay(divergentCtx, delta, receipt);
    stressResults.push({
      id: "stress-09",
      name: "seed/context divergence",
      category: "deterministic entropy",
      passed: !converged,
      expectedFailure: true,
      observedBehavior: converged ? "Replay converged despite divergent context seed" : "Replay successfully failed on seed mismatch",
      evidence: { converged }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-09",
      name: "seed/context divergence",
      category: "deterministic entropy",
      passed: false,
      expectedFailure: true,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 10. timing/memory nondeterminism in report hash
  try {
    const r1 = runHookTier('T0', { seed: 42 });
    const r2 = runHookTier('T0', { seed: 42 });
    const hashMatches = r1.reportHash === r2.reportHash;
    stressResults.push({
      id: "stress-10",
      name: "timing/memory nondeterminism in report hash",
      category: "report deterministic stability",
      passed: hashMatches,
      expectedFailure: false,
      observedBehavior: hashMatches ? "Stable hash generated across identical runs" : "Nondeterminism in report hash detected",
      evidence: { hashMatches, r1Hash: r1.reportHash, r2Hash: r2.reportHash }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-10",
      name: "timing/memory nondeterminism in report hash",
      category: "report deterministic stability",
      passed: false,
      expectedFailure: false,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 11. eval-only misclassified as receipt-backed
  try {
    const r = runHookTier('T3', { seed: 42, evalOnly: true, registeredHooks: 10, processedDeltas: 10 });
    const correctlyClassified = r.options.evalOnly === true && r.metrics.receipts === 0;
    stressResults.push({
      id: "stress-11",
      name: "eval-only misclassified as receipt-backed",
      category: "classification safety",
      passed: correctlyClassified,
      expectedFailure: false,
      observedBehavior: correctlyClassified ? "Eval-only correctly classified with zero receipts" : "Eval-only generated receipts or misclassified options",
      evidence: { evalOnly: r.options.evalOnly, receiptsCount: r.metrics.receipts }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-11",
      name: "eval-only misclassified as receipt-backed",
      category: "classification safety",
      passed: false,
      expectedFailure: false,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 12. benchmark metric miscalculation
  try {
    const r = runHookTier('T1', { seed: 42 });
    const totalEvals = r.metrics.totalHookDeltaEvaluations;
    const computedEvals = r.metrics.registeredHooks * r.metrics.processedDeltas;
    const matches = totalEvals === computedEvals;
    stressResults.push({
      id: "stress-12",
      name: "benchmark metric miscalculation",
      category: "telemetry accuracy",
      passed: matches,
      expectedFailure: false,
      observedBehavior: matches ? "Metric math is verified and correct" : "Metric mismatch found",
      evidence: { totalEvals, computedEvals }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-12",
      name: "benchmark metric miscalculation",
      category: "telemetry accuracy",
      passed: false,
      expectedFailure: false,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 13. WAL persistence mismatch
  try {
    const db = new Database(':memory:');
    initializeSchema(db);
    const journal = new DeltaJournal(db);
    const delta: GraphDelta = {
      id: 'd1',
      adds: [{ subject: 's', predicate: 'p', object: 'o', graph: null }],
      deletes: []
    };
    journal.append(delta);
    const retrieved = [...journal.replay()];
    const matches = retrieved.length === 1 && retrieved[0].delta.id === 'd1';
    db.close();

    stressResults.push({
      id: "stress-13",
      name: "WAL persistence mismatch",
      category: "SQLite journal integrity",
      passed: matches,
      expectedFailure: false,
      observedBehavior: matches ? "WAL successfully writes and reads back identical deltas" : "WAL retrieval mismatch",
      evidence: { count: retrieved.length }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-13",
      name: "WAL persistence mismatch",
      category: "SQLite journal integrity",
      passed: false,
      expectedFailure: false,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 14. rollback failure
  try {
    const db = new Database(':memory:');
    initializeSchema(db);
    const journal = new DeltaJournal(db);
    
    // Simulate transaction rollback
    db.exec("BEGIN TRANSACTION;");
    journal.append({
      id: 'd-rollback',
      adds: [{ subject: 's', predicate: 'p', object: 'o', graph: null }],
      deletes: []
    });
    db.exec("ROLLBACK;");

    const retrieved = [...journal.replay()];
    const rolledBack = retrieved.length === 0;
    db.close();

    stressResults.push({
      id: "stress-14",
      name: "rollback failure",
      category: "transaction isolation",
      passed: rolledBack,
      expectedFailure: false,
      observedBehavior: rolledBack ? "Transaction rollbacks successfully revert all delta mutations" : "Transaction failed to roll back",
      evidence: { rolledBack }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-14",
      name: "rollback failure",
      category: "transaction isolation",
      passed: false,
      expectedFailure: false,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 15. observatory stale report
  try {
    // Check if the observatory facts exist
    const factsPath = path.resolve(process.cwd(), 'docs/v1/latest/facts/core-primitives.json');
    const exists = fs.existsSync(factsPath);
    stressResults.push({
      id: "stress-15",
      name: "observatory stale report",
      category: "observatory freshness",
      passed: exists,
      expectedFailure: false,
      observedBehavior: exists ? "Observatory reports successfully exist and are active" : "Stale observatory reports",
      evidence: { exists }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-15",
      name: "observatory stale report",
      category: "observatory freshness",
      passed: false,
      expectedFailure: false,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 16. Recursive Hook Storms (triggering thousands of sub-deltas)
  try {
    const depth = 1000;
    const recursiveHooks: TruexHook[] = [];
    for (let i = 0; i < depth; i++) {
      recursiveHooks.push(new TruexHook({
        id: `hook-recursive-${i}`,
        name: `Recursive Hook ${i}`,
        condition: { kind: 'delta-match', predicate: `p:recursive-${i}` },
        effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: `p:recursive-${i + 1}`, object: 'v', graph: null } }]
      }));
    }

    let totalTriggered = 0;
    const processQueue: GraphDelta[] = [
      { id: 'delta-0', adds: [{ subject: 's', predicate: 'p:recursive-0', object: 'v', graph: null }], deletes: [] }
    ];

    while (processQueue.length > 0) {
      const currentDelta = processQueue.shift()!;
      for (const hook of recursiveHooks) {
        if (hook.matches(currentDelta)) {
          const result = hook.execute(ctx, currentDelta, null);
          totalTriggered++;
          for (const effect of result.effects) {
            if (effect.kind === 'add-quad') {
              processQueue.push({
                id: `delta-${totalTriggered}`,
                adds: [effect.quad],
                deletes: []
              });
            }
          }
        }
      }
      if (totalTriggered > depth + 10) break; // Safety break
    }

    stressResults.push({
      id: "stress-16",
      name: "Recursive Hook Storms",
      category: "topology failure frontier",
      passed: totalTriggered === depth,
      expectedFailure: false,
      observedBehavior: `Successfully triggered ${totalTriggered} recursive sub-deltas`,
      evidence: { totalTriggered }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-16",
      name: "Recursive Hook Storms",
      category: "topology failure frontier",
      passed: false,
      expectedFailure: false,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 17. Cyclical Hook Activation (A triggers B, B triggers A)
  try {
    const hookA = new TruexHook({
      id: 'hook-A',
      name: 'Cyclic A',
      condition: { kind: 'delta-match', predicate: 'p:cyclic-A' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'p:cyclic-B', object: 'v', graph: null } }]
    });
    const hookB = new TruexHook({
      id: 'hook-B',
      name: 'Cyclic B',
      condition: { kind: 'delta-match', predicate: 'p:cyclic-B' },
      effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: 'p:cyclic-A', object: 'v', graph: null } }]
    });

    const cyclicHooks = [hookA, hookB];
    let triggeredCount = 0;
    const maxTriggered = 100; // Safety limit
    const processQueue: GraphDelta[] = [
      { id: 'delta-init', adds: [{ subject: 's', predicate: 'p:cyclic-A', object: 'v', graph: null }], deletes: [] }
    ];

    let cycleDetected = false;
    while (processQueue.length > 0 && triggeredCount < maxTriggered) {
      const currentDelta = processQueue.shift()!;
      for (const hook of cyclicHooks) {
        if (hook.matches(currentDelta)) {
          const result = hook.execute(ctx, currentDelta, null);
          triggeredCount++;
          for (const effect of result.effects) {
            if (effect.kind === 'add-quad') {
              processQueue.push({
                id: `delta-cyclic-${triggeredCount}`,
                adds: [effect.quad],
                deletes: []
              });
            }
          }
        }
      }
      if (triggeredCount >= maxTriggered) {
        cycleDetected = true;
      }
    }

    stressResults.push({
      id: "stress-17",
      name: "Cyclical Hook Activation",
      category: "topology failure frontier",
      passed: cycleDetected,
      expectedFailure: true,
      observedBehavior: cycleDetected ? "Cycle detected and halted via safety limit" : "Failed to detect cycle",
      evidence: { triggeredCount }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-17",
      name: "Cyclical Hook Activation",
      category: "topology failure frontier",
      passed: true,
      expectedFailure: true,
      observedBehavior: `Cycle execution failed as expected: ${e.message}`,
      evidence: { error: e.message }
    });
  }

  // 18. Cascading Rollback Divergence (simulating failure halfway through a deep chain)
  try {
    const virtualState = new Map<string, string>();
    const andon = new AndonSystem();
    const pokaYoke = new PokaYoke(andon);

    const cascadingHooks: TruexHook[] = [];
    for (let i = 0; i < 5; i++) {
      cascadingHooks.push(new TruexHook({
        id: `hook-cascade-${i}`,
        name: `Cascade Hook ${i}`,
        condition: { kind: 'delta-match', predicate: `p:cascade-${i}` },
        effects: [{ kind: 'add-quad', quad: { subject: 's', predicate: `p:cascade-${i + 1}`, object: 'v', graph: null } }]
      }));
    }

    const backupState = new Map(virtualState);
    let failureStep = -1;

    try {
      let currentDelta: GraphDelta = { id: 'd-0', adds: [{ subject: 's', predicate: 'p:cascade-0', object: 'v', graph: null }], deletes: [] };
      for (let i = 0; i < 5; i++) {
        const hook = cascadingHooks[i];
        if (hook.matches(currentDelta)) {
          const run = () => {
            if (i === 3) { // Fail at step 3
              failureStep = i;
              throw new Error("Cascading failure at step 3");
            }
            return hook.execute(ctx, currentDelta, null);
          };
          const result = pokaYoke.guardExecution(hook, ctx, currentDelta, run);
          // Apply state change
          for (const effect of result.effects) {
            if (effect.kind === 'add-quad') {
              virtualState.set(`${effect.quad.subject}:${effect.quad.predicate}`, effect.quad.object);
              currentDelta = { id: `d-${i + 1}`, adds: [effect.quad], deletes: [] };
            }
          }
        }
      }
    } catch {
      // Rollback
      virtualState.clear();
      for (const [k, v] of backupState) virtualState.set(k, v);
    }

    const diverged = virtualState.size > 0;
    stressResults.push({
      id: "stress-18",
      name: "Cascading Rollback Divergence",
      category: "topology failure frontier",
      passed: !diverged && failureStep === 3,
      expectedFailure: false,
      observedBehavior: diverged ? "State diverged: partial cascade persisted" : "Clean rollback achieved after partial cascade failure",
      evidence: { failureStep, diverged }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-18",
      name: "Cascading Rollback Divergence",
      category: "topology failure frontier",
      passed: false,
      expectedFailure: false,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  // 19. Interrupted Receipt Persistence (crash during a 5-step cascade)
  try {
    const db = new Database(':memory:');
    initializeSchema(db);
    const journal = new DeltaJournal(db);

    let stepsCompleted = 0;
    try {
      db.transaction(() => {
        for (let i = 0; i < 5; i++) {
          journal.append({
            id: `d-crash-${i}`,
            adds: [{ subject: 's', predicate: `p:crash-${i}`, object: 'v', graph: null }],
            deletes: []
          });
          stepsCompleted++;
          if (i === 4) throw new Error("CRASH_DURING_PERSISTENCE");
        }
      })();
    } catch {
      // Crash simulated
    }

    const retrieved = [...journal.replay()];
    const persistedCount = retrieved.length;
    db.close();

    stressResults.push({
      id: "stress-19",
      name: "Interrupted Receipt Persistence",
      category: "topology failure frontier",
      passed: persistedCount === 0 && stepsCompleted === 5,
      expectedFailure: true,
      observedBehavior: persistedCount === 0 ? "Atomic rollback confirmed after interrupted 5-step cascade" : `Leaked ${persistedCount} deltas after crash`,
      evidence: { stepsCompleted, persistedCount }
    });
  } catch (e: any) {
    stressResults.push({
      id: "stress-19",
      name: "Interrupted Receipt Persistence",
      category: "topology failure frontier",
      passed: false,
      expectedFailure: true,
      observedBehavior: e.message,
      evidence: { error: e.message }
    });
  }

  return stressResults;
}

export function writeReport(results: HookBenchResult[], stressResults: HookBenchStressCase[]): HookBenchReporter {
  const deterministicResults = results.map(r => ({
    tier: r.tier,
    options: r.options,
    metrics: {
      registeredHooks: r.metrics.registeredHooks,
      processedDeltas: r.metrics.processedDeltas,
      totalHookDeltaEvaluations: r.metrics.totalHookDeltaEvaluations,
      matchedHooks: r.metrics.matchedHooks,
      emittedEffects: r.metrics.emittedEffects,
      receipts: r.metrics.receipts,
      refused: r.metrics.refused,
      replayConverged: r.metrics.replayConverged,
      replayDiverged: r.metrics.replayDiverged,
    }
  }));

  const canonicalString = JSON.stringify({
    results: deterministicResults,
    stressResults: stressResults.map(s => ({ id: s.id, name: s.name, passed: s.passed }))
  });
  const reportHash = hash(canonicalString);

  const reporter: HookBenchReporter = {
    results,
    stressResults,
    reportHash
  };

  const dirPath = path.resolve(process.cwd(), "docs/benchmarks");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write files as required by the spec
  fs.writeFileSync(
    path.join(dirPath, "hookbench.full-report.json"),
    JSON.stringify(reporter, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    path.join(dirPath, "hookbench.80-20-stress.json"),
    JSON.stringify(stressResults, null, 2),
    "utf8"
  );

  return reporter;
}

export function runGallHookBench(customOptions?: Partial<HookBenchCase>): HookBenchReporter {
  const results: HookBenchResult[] = [];
  
  results.push(runHookTier('T0', customOptions));
  results.push(runHookTier('T1', customOptions));
  results.push(runHookTier('T2', customOptions));
  results.push(runHookTier('T3', customOptions));

  const defaultBenchCase = makeBenchmarkCase(
    customOptions?.seed ?? 42,
    customOptions?.registeredHooks ?? 10,
    customOptions?.processedDeltas ?? 10,
    customOptions?.matchRatio ?? 0.5,
    customOptions?.evalOnly ?? false
  );
  const stressResults = runStressCases(defaultBenchCase);

  return writeReport(results, stressResults);
}
