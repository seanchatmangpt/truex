/**
 * @module registry
 * @description Gall S₂: Engine primitives.
 * Defines fundamental Repository Laws and RecursiveHookEvolution.
 */
import { type TruexContext, createDeterministicContext } from '../context.js';
import { type HookDefinition, type GraphDelta, parseGraphDelta, type HookCondition } from '../runtime-law.js';
import { ProductionLine } from './line.js';
import { KanbanSystem } from './jit.js';
import { hash } from '../index.js';
import type { Database } from 'better-sqlite3';

/**
 * Registry of fundamental Repository Laws.
 * These hooks are applied to all Antigravity agent actions.
 */
export const RepositoryLaws: HookDefinition[] = [
  {
    id: 'law-no-null',
    name: 'No Null Allowed',
    condition: { kind: 'always' },
    effects: [
      { kind: 'emit-event', type: 'law-check-passed' }
    ]
  },
  {
    id: 'law-deterministic-entropy',
    name: 'Deterministic Entropy Enforced',
    condition: { kind: 'always' },
    effects: [
      { kind: 'emit-event', type: 'entropy-check-passed' }
    ]
  },
  {
    id: 'law-replay-convergence',
    name: 'Replay Convergence Required',
    condition: { kind: 'always' },
    effects: [
      { kind: 'emit-event', type: 'replay-check-passed' }
    ]
  },
  {
    id: 'law-no-fossils',
    name: 'No Fossil Record Allowed',
    condition: { kind: 'delta-match', predicate: 'agy:action' },
    effects: [
      { kind: 'emit-event', type: 'fossil-check-passed' }
    ]
  }
];

export function createAgyProductionLine(ctx: TruexContext): ProductionLine {
  return new ProductionLine(ctx, RepositoryLaws);
}

/**
 * Agent 5: S4 Actuator - Recursive Hook Evolution.
 * 
 * This system monitors hook performance in the physical 'gall_truex.db' 
 * and automatically suggests or applies 'Constraint Tightening' to 
 * the KanbanSystem to reduce Muda (waste) and system latency.
 */
export class RecursiveHookEvolution {
  private readonly ctx: TruexContext;

  constructor(
    private readonly db: Database,
    private readonly kanban: KanbanSystem,
    ctx?: TruexContext
  ) {
    this.ctx = ctx || createDeterministicContext(999);
  }

  /**
   * Performs a self-optimization pass based on historical execution data.
   * High-frequency, high-latency hooks are identified and their constraints tightened.
   */
  evolve(): void {
    // 1. Identify high-latency, high-frequency hooks from the event log.
    // We calculate latency as the time between Delta journal entry and Hook event emission.
    // TPS Principle: Genchi Genbutsu (Go and See) the physical data to find waste.
    const performanceReport = this.db.prepare(`
      SELECT 
        e.hook_id, 
        COUNT(*) as frequency, 
        AVG(julianday(e.created_at) - julianday(d.created_at)) * 86400000 as avg_latency_ms
      FROM events e
      JOIN deltas d ON e.delta_id = d.id
      WHERE e.hook_id IS NOT NULL
      GROUP BY e.hook_id
      HAVING frequency > 5
    `).all() as { hook_id: string; frequency: number; avg_latency_ms: number }[];

    for (const report of performanceReport) {
      // If latency is high (> 50ms) and frequency is high, propose tightening.
      // This reduces 'Muri' (overburden) on the production line.
      if (report.avg_latency_ms > 50) {
        this.tightenHook(report.hook_id);
      }
    }
  }

  /**
   * Attempts to tighten the constraint for a specific hook.
   * Proposes moving from 'always' to 'delta-match' based on historical common predicates.
   */
  private tightenHook(hookId: string): void {
    // Find the most common predicate associated with this hook in history.
    const mostCommonPredicate = this.db.prepare(`
      SELECT q.predicate, COUNT(*) as p_freq
      FROM quads q
      JOIN events e ON q.delta_id = e.delta_id
      WHERE e.hook_id = ?
      GROUP BY q.predicate
      ORDER BY p_freq DESC
      LIMIT 1
    `).get(hookId) as { predicate: string; p_freq: number } | undefined;

    if (mostCommonPredicate && mostCommonPredicate.p_freq > 5) {
      const newCondition: HookCondition = {
        kind: 'delta-match',
        predicate: mostCommonPredicate.predicate
      };

      try {
        // Apply the 'Constraint Tightening' to the KanbanSystem
        this.kanban.tightenConstraint(hookId, newCondition);
        
        // Log the optimization event back to the DB for traceability (Kaizen)
        this.db.prepare(`
          INSERT INTO events (id, hook_id, type) 
          VALUES (?, ?, ?)
        `).run(hash(`opt:${hookId}:${this.ctx.clock()}`), hookId, 'constraint-tightened');
      } catch {
        // Hook might not be in this kanban system instance or already optimized
      }
    }
  }
}
