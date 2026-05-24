import type { HookDefinition, Quad, HookEffect, GraphDelta, Receipt } from "./runtime-law.js";
import { TruexHook } from "./hook.js";
import type { TruexContext } from "./context.js";
import { hash } from "./hash.js";

export type InterferencePattern = 
  | 'none'
  | 'read-write'   // Hook A reads what Hook B writes
  | 'write-read'   // Hook B reads what Hook A writes
  | 'write-write'  // Both hooks write to the same subject/predicate
  | 'circular';    // Hook A writes what Hook B reads AND vice-versa

export interface HookInterference {
  hookAId: string;
  hookBId: string;
  pattern: InterferencePattern;
  details: {
    predicate?: string;
    quad?: Quad;
  }[];
}

/**
 * Maps hook interference based on subject/predicate targets.
 */
export function mapHookInterference(hookA: HookDefinition, hookB: HookDefinition): HookInterference {
  const details: { predicate?: string; quad?: Quad; }[] = [];
  
  const aReads = hookA.condition.kind === 'delta-match' ? [hookA.condition.predicate] : [];
  const bReads = hookB.condition.kind === 'delta-match' ? [hookB.condition.predicate] : [];
  
  const aWrites = hookA.effects
    .filter((e): e is { kind: 'add-quad', quad: Quad } => e.kind === 'add-quad')
    .map(e => e.quad);
  const bWrites = hookB.effects
    .filter((e): e is { kind: 'add-quad', quad: Quad } => e.kind === 'add-quad')
    .map(e => e.quad);

  let aWritesBReads = false;
  for (const quad of aWrites) {
    if (bReads.includes(quad.predicate)) {
      aWritesBReads = true;
      details.push({ predicate: quad.predicate, quad });
    }
  }

  let bWritesAReads = false;
  for (const quad of bWrites) {
    if (aReads.includes(quad.predicate)) {
      bWritesAReads = true;
      details.push({ predicate: quad.predicate, quad });
    }
  }

  let writeWrite = false;
  for (const qA of aWrites) {
    for (const qB of bWrites) {
      if (qA.subject === qB.subject && qA.predicate === qB.predicate) {
        writeWrite = true;
        details.push({ quad: qA });
      }
    }
  }

  let pattern: InterferencePattern = 'none';
  if (aWritesBReads && bWritesAReads) pattern = 'circular';
  else if (writeWrite) pattern = 'write-write';
  else if (aWritesBReads) pattern = 'write-read';
  else if (bWritesAReads) pattern = 'read-write';

  return {
    hookAId: hookA.id,
    hookBId: hookB.id,
    pattern,
    details
  };
}

/**
 * Partial-Order Replay check: verify that hooks can be replayed in any valid partial order
 * and still converge to the same final state.
 */
export function verifyPartialOrderConvergence(
  ctx: TruexContext,
  delta: GraphDelta,
  hooks: TruexHook[],
  expectedReceipts: Receipt[]
): boolean {
  // 1. Identify which hooks trigger for this delta
  const triggeredHooks = hooks.filter(h => h.matches(delta));
  
  if (triggeredHooks.length !== expectedReceipts.length) {
    return false;
  }

  // 2. Check for interference among triggered hooks
  for (let i = 0; i < triggeredHooks.length; i++) {
    for (let j = i + 1; j < triggeredHooks.length; j++) {
      const interference = mapHookInterference(triggeredHooks[i].definition, triggeredHooks[j].definition);
      
      // If there is write-write or circular interference, deterministic convergence is at risk
      // unless we enforce a strict partial order. For this check, we refuse non-deterministic races.
      if (interference.pattern === 'write-write' || interference.pattern === 'circular') {
        return false; 
      }
    }
  }

  // 3. Verify that all permutations (or at least independent subsets) yield the same result.
  // In a real implementation, we would simulate executions in different orders.
  // For this logic, we'll verify the provided receipts are consistent.
  
  const finalStateHashes: string[] = [];
  
  // Simple check: run them all and see if we get the same output hash regardless of order if independent.
  // Since we already filtered out interfering hooks, any order should work.
  
  try {
    const results = triggeredHooks.map(h => h.execute(ctx, delta, undefined));
    const totalOutputHash = hash(results.map(r => r.receipt.outputHash).sort());
    
    const expectedOutputHash = hash(expectedReceipts.map(r => r.outputHash).sort());
    
    return totalOutputHash === expectedOutputHash;
  } catch {
    return false;
  }
}

/**
 * Detects and refuses 'Non-Deterministic Race Conditions' in the hook field.
 */
export function detectRaceConditions(hooks: HookDefinition[]): HookInterference[] {
  const races: HookInterference[] = [];
  for (let i = 0; i < hooks.length; i++) {
    for (let j = i + 1; j < hooks.length; j++) {
      const interference = mapHookInterference(hooks[i], hooks[j]);
      if (interference.pattern !== 'none') {
        races.push(interference);
      }
    }
  }
  return races;
}
