/**
 * @module jit
 * @description Gall S₂: Engine primitives.
 * Implements KanbanSystem for Just-In-Time execution signaling.
 */
import type { GraphDelta, HookDefinition, HookCondition } from '../runtime-law.js';
import { TruexHook } from '../hook.js';

/**
 * Just-In-Time (JIT) / Kanban Signaling System.
 *
 * Reference: Toyota Production System (TPS).
 *
 * In a traditional 'Push' system, every hook is evaluated for every delta,
 * creating 'Muda' (waste) in the form of redundant computation.
 *
 * In this 'Pull' system, hooks are only pulled for execution when a delta
 * matching their signaling condition enters the ProductionLine.
 */
export class KanbanSystem {
  private readonly kanbanBoard: Map<string, TruexHook[]> = new Map();
  private readonly backlog: TruexHook[] = [];

  /**
   * Initializes the KanbanSystem with a set of Hook definitions.
   * Hooks are indexed by their signaling predicates to enable JIT pulling.
   */
  constructor(hooks: HookDefinition[]) {
    for (const def of hooks) {
      const hook = new TruexHook(def);
      if (def.condition.kind === 'always') {
        this.backlog.push(hook);
      } else if (def.condition.kind === 'delta-match') {
        const predicate = def.condition.predicate;
        if (!this.kanbanBoard.has(predicate)) {
          this.kanbanBoard.set(predicate, []);
        }
        this.kanbanBoard.get(predicate)!.push(hook);
      }
    }
  }

  /**
   * Processes a GraphDelta by signaling the Kanban board.
   * Only hooks that are 'pulled' by matching predicates are returned for execution.
   *
   * @param delta The delta entering the production line.
   * @returns An array of hooks that have been pulled for execution.
   */
  pull(delta: GraphDelta): TruexHook[] {
    // Start with hooks that are always 'on the line'
    const pulledHooks = new Set<TruexHook>(this.backlog);

    // Minimize Muda: Only evaluate hooks that match predicates present in the delta.
    // This is the Kanban signal that 'pulls' the hook into the execution stage.
    const signals = this.getSignals(delta);

    for (const signal of signals) {
      const hooks = this.kanbanBoard.get(signal);
      if (hooks) {
        for (const hook of hooks) {
          pulledHooks.add(hook);
        }
      }
    }

    return [...pulledHooks];
  }

  /**
   * Extracts signaling predicates from the delta.
   */
  private getSignals(delta: GraphDelta): Set<string> {
    const signals = new Set<string>();
    for (const q of delta.adds) signals.add(q.predicate);
    for (const q of delta.deletes) signals.add(q.predicate);
    return signals;
  }

  /**
   * Returns the number of unique hooks registered in the system.
   */
  get totalHooks(): number {
    const allHooks = new Set<TruexHook>(this.backlog);
    for (const hooks of this.kanbanBoard.values()) {
      for (const h of hooks) allHooks.add(h);
    }
    return allHooks.size;
  }

  /**
   * Tightens a hook's constraint by updating its condition.
   * Proposes a change from 'always' to 'delta-match' or updates the predicate.
   */
  tightenConstraint(hookId: string, newCondition: HookCondition): void {
    // 1. Find the hook in backlog or kanbanBoard
    let hook: TruexHook | undefined;
    let originalConditionKind: string | undefined;

    // Check backlog
    const backlogIdx = this.backlog.findIndex(h => h.definition.id === hookId);
    if (backlogIdx === -1) {
      // Check kanbanBoard
      for (const [predicate, hooks] of this.kanbanBoard.entries()) {
        const idx = hooks.findIndex(h => h.definition.id === hookId);
        if (idx !== -1) {
          hook = hooks[idx];
          originalConditionKind = 'delta-match';
          // Remove from current predicate list if it's changing
          if (newCondition.kind !== 'delta-match' || newCondition.predicate !== predicate) {
            hooks.splice(idx, 1);
            if (hooks.length === 0) this.kanbanBoard.delete(predicate);
          }
          break;
        }
      }
    } else {
      hook = this.backlog[backlogIdx];
      originalConditionKind = 'always';
      // Remove from backlog if it's no longer 'always'
      if (newCondition.kind !== 'always') {
        this.backlog.splice(backlogIdx, 1);
      }
    }

    if (!hook) {
      throw new Error(`Hook ${hookId} not found in KanbanSystem`);
    }

    // 2. Update the hook definition and re-index
    hook.definition.condition = newCondition;
    
    if (newCondition.kind === 'always') {
      this.backlog.push(hook);
    } else if (newCondition.kind === 'delta-match') {
      const predicate = newCondition.predicate;
      if (!this.kanbanBoard.has(predicate)) {
        this.kanbanBoard.set(predicate, []);
      }
      this.kanbanBoard.get(predicate)!.push(hook);
    }
  }
}
