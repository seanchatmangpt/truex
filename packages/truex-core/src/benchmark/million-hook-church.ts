/**
 * @module million-hook-church
 * @description Benchmark for testing hook matching at scale (Church Case Study).
 * Gall Classification: S-2 (benchmark primitives).
 */
import type { 
  GraphDelta, 
  HookDefinition, 
  HookEffect,
  Receipt,
  HookEvent
} from "../runtime-law.js";
import { TruexHook } from "../hook.js";
import { createDeterministicContext } from "../context.js";
import os from 'node:os';

/**
 * Options for the Million Hook Church benchmark.
 */
export interface BenchmarkOptions {
  /** Deterministic seed for PRNG. */
  seed: number;
  /** Number of hooks to generate in the system. */
  registeredHooks: number;
  /** Number of deltas (events) to process. */
  processedDeltas: number;
  /** Target probability (0-1) that a delta will match at least one hook. */
  matchRatio: number;
  /** If true, skip receipt creation and signing for speed. */
  evalOnly?: boolean;
}

/**
 * Results of the benchmark execution.
 */
export interface BenchmarkResult {
  options: {
    seed: number;
    registeredHooks: number;
    processedDeltas: number;
    matchRatio: number;
    evalOnly: boolean;
  };
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
    hookDeltaEvaluationsPerSecond: number;
    deltasPerSecond: number;
    matchedHooksCount: number;
    matchRateObserved: number;
    effectsCount: number;
    receiptsCount: number;
    receiptBacked: boolean;
    evalOnly: boolean;
    totalDurationMs: number;
    replayConvergenceCount: number;
    refusedCount: number;
    opsPerSecond: number;
  };

}

/**
 * Simple Linear Congruential Generator for deterministic benchmark data.
 */
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

/**
 * Generates church-like operational deltas.
 * If matchRatio is specified, we deterministically select matching or non-matching predicates.
 */
export function generateChurchDeltas(
  seed: number, 
  count: number, 
  matchRatio: number = 0.5, 
  targetedPredicates: string[] = []
): GraphDelta[] {
  const prng = new SeededPRNG(seed);
  const deltas: GraphDelta[] = [];
  
  const entityTypes = [
    'member',
    'volunteer',
    'room',
    'event',
    'care_request',
    'notification',
    'follow_up'
  ];

  const firstNames = ['John', 'Mary', 'David', 'Sarah', 'James', 'Emily', 'Michael', 'Jessica'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson'];
  const roomNames = ['Sanctuary', 'Chapel', 'Fellowship Hall', 'Room 101', 'Room 102', 'Youth Room'];
  const nonMatchingPredicates = ['schema:description', 'schema:dateCreated', 'schema:url', 'schema:alternateName'];

  // Use targeted predicates if provided; otherwise fallback to all possible matchable predicates
  const pool = targetedPredicates.length > 0 ? targetedPredicates : [
    'rdf:type',
    'schema:name',
    'schema:role',
    'schema:capacity',
    'schema:room',
    'schema:status',
    'schema:assignedTo',
    'schema:recipient'
  ];

  for (let i = 0; i < count; i++) {
    const type = prng.pick(entityTypes);
    const deltaId = `delta-church-${type}-${i}`;
    const adds: { subject: string; predicate: string; object: string }[] = [];
    
    // Deterministic match control
    const shouldMatch = prng.next() < matchRatio;
    
    const getPredicate = (isMatchingField: boolean): string => {
      if (isMatchingField) {
        return prng.pick(pool);
      }
      return prng.pick(nonMatchingPredicates);
    };

    switch (type) {
      case 'member': {
        const id = `member:${i}`;
        adds.push(
          { subject: id, predicate: getPredicate(shouldMatch), object: 'class:Member' },
          { subject: id, predicate: getPredicate(false), object: `${prng.pick(firstNames)} ${prng.pick(lastNames)}` }
        );
        break;
      }
      case 'volunteer': {
        const id = `volunteer:${i}`;
        adds.push(
          { subject: id, predicate: getPredicate(shouldMatch), object: 'class:Volunteer' },
          { subject: id, predicate: getPredicate(false), object: `${prng.pick(firstNames)} ${prng.pick(lastNames)}` }
        );
        break;
      }
      case 'room': {
        const id = `room:${i}`;
        adds.push(
          { subject: id, predicate: getPredicate(shouldMatch), object: 'class:Room' },
          { subject: id, predicate: getPredicate(false), object: prng.pick(roomNames) }
        );
        break;
      }
      case 'event': {
        const id = `event:${i}`;
        adds.push(
          { subject: id, predicate: getPredicate(shouldMatch), object: 'class:Event' },
          { subject: id, predicate: getPredicate(false), object: `room:${prng.nextInt(0, Math.max(1, i))}` }
        );
        break;
      }
      case 'care_request': {
        const id = `care:${i}`;
        adds.push(
          { subject: id, predicate: getPredicate(shouldMatch), object: 'class:CareRequest' },
          { subject: id, predicate: getPredicate(false), object: prng.pick(['status:pending', 'status:resolved', 'status:in-progress']) }
        );
        break;
      }
      case 'notification': {
        const id = `notification:${i}`;
        adds.push(
          { subject: id, predicate: getPredicate(shouldMatch), object: 'class:Notification' },
          { subject: id, predicate: getPredicate(false), object: `member:${prng.nextInt(0, Math.max(1, i))}` }
        );
        break;
      }
      case 'follow_up': {
        const id = `followup:${i}`;
        adds.push(
          { subject: id, predicate: getPredicate(shouldMatch), object: 'class:FollowUp' },
          { subject: id, predicate: getPredicate(false), object: `volunteer:${prng.nextInt(0, Math.max(1, i))}` }
        );
        break;
      }
    }

    deltas.push({
      id: deltaId,
      adds,
      deletes: []
    });
  }

  return deltas;
}

/**
 * Generates hook definitions.
 */
export function generateChurchHooks(seed: number, count: number): HookDefinition[] {
  const prng = new SeededPRNG(seed + 54321);
  const hooks: HookDefinition[] = [];

  const predicates = [
    'rdf:type',
    'schema:name',
    'schema:role',
    'schema:capacity',
    'schema:room',
    'schema:status',
    'schema:assignedTo',
    'schema:recipient'
  ];

  for (let i = 0; i < count; i++) {
    const id = `hook-church-${i}`;
    const name = `Church Hook ${i}`;
    const predicate = prng.pick(predicates);

    hooks.push({
      id,
      name,
      condition: { kind: 'delta-match', predicate },
      effects: [{ kind: 'emit-event', type: `processed-${predicate}` }]
    });
  }

  return hooks;
}

/**
 * Runs the church-scale hook pressure benchmark.
 */
export function runMillionHookBenchmark(options: BenchmarkOptions): BenchmarkResult {
  const memoryBeforeMb = process.memoryUsage().heapUsed / 1024 / 1024;
  const evalOnly = !!options.evalOnly;

  // 1. Generate Hooks
  const hookDefs = generateChurchHooks(options.seed, options.registeredHooks);
  const hooks = hookDefs.map(def => new TruexHook(def));

  // Extract targeted predicates to drive deterministic match ratio
  const targetedPredicates = [...new Set(hookDefs.map(h => (h.condition as any).predicate))];

  // 2. Generate Deltas with matchRatio control
  const deltas = generateChurchDeltas(options.seed, options.processedDeltas, options.matchRatio, targetedPredicates);

  let matchedHooksCount = 0;
  let deltasMatchedCount = 0;
  let effectsCount = 0;
  let receiptsCount = 0;
  let refusedCount = 0;
  let replayConvergenceCount = 0;
  let previousReceiptHash: string | null = null;

  const start = performance.now();

  for (let i = 0; i < deltas.length; i++) {
    const delta = deltas[i];

    // Evaluate hook matches
    const matched = hooks.filter(h => h.matches(delta));
    matchedHooksCount += matched.length;
    if (matched.length > 0) {
      deltasMatchedCount++;
    }

    for (const hook of matched) {
      if (evalOnly) {
        effectsCount += hook.definition.effects.length;
      } else {
        try {
          const localCtx = createDeterministicContext(options.seed + i);
          const result = hook.execute(localCtx, delta, previousReceiptHash);
          effectsCount += result.effects.length;
          receiptsCount++;
          previousReceiptHash = result.receipt.receiptHash;

          // Perform sample replay convergence checks (up to 5 checks)
          if (replayConvergenceCount < 5) {
            const replayCtx = createDeterministicContext(options.seed + i);
            const converged = hook.replay(replayCtx, delta, result.receipt);
            if (converged) {
              replayConvergenceCount++;
            }
          }
        } catch (error) {
          refusedCount++;
        }
      }
    }
  }

  const end = performance.now();
  const totalDurationMs = end - start;
  const memoryAfterMb = process.memoryUsage().heapUsed / 1024 / 1024;
  
  const totalHookDeltaEvaluations = options.registeredHooks * options.processedDeltas;
  const hookDeltaEvaluationsPerSecond = totalDurationMs > 0 ? (totalHookDeltaEvaluations / totalDurationMs) * 1000 : 0;
  const deltasPerSecond = totalDurationMs > 0 ? (options.processedDeltas / totalDurationMs) * 1000 : 0;
  const matchRateObserved = deltas.length > 0 ? deltasMatchedCount / deltas.length : 0;

  return {
    options: {
      seed: options.seed,
      registeredHooks: options.registeredHooks,
      processedDeltas: options.processedDeltas,
      matchRatio: options.matchRatio,
      evalOnly
    },
    metadata: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuModel: os.cpus()[0]?.model || 'unknown',
      memoryBeforeMb,
      memoryAfterMb
    },
    metrics: {
      registeredHooks: options.registeredHooks,
      processedDeltas: options.processedDeltas,
      totalHookDeltaEvaluations,
      hookDeltaEvaluationsPerSecond,
      deltasPerSecond,
      matchedHooksCount,
      matchRateObserved,
      effectsCount,
      receiptsCount,
      receiptBacked: !evalOnly,
      evalOnly,
      totalDurationMs,
      replayConvergenceCount,
      refusedCount,
      opsPerSecond: hookDeltaEvaluationsPerSecond
    }
  };
}
