/**
 * @module kaizen
 * @description Gall S₂: Engine primitives.
 * Implements RefiningEngine and GembaInspector for continuous improvement.
 */
import type { HookDefinition, Receipt, GraphDelta, HookCondition } from "../runtime-law.js";

/**
 * Suggestion for optimizing a hook based on its execution history.
 */
export interface OptimizationSuggestion {
  hookId: string;
  originalCondition: HookCondition;
  suggestedCondition: HookCondition;
  reason: string;
  confidence: number; // 0 to 1
}

/**
 * RefiningEngine (Kaizen) analyzes execution receipts to suggest optimizations.
 * Inspired by the Toyota Production System principle of continuous improvement.
 */
export class RefiningEngine {
  private executionHistory: Map<string, { delta: GraphDelta; receipt: Receipt }[]> = new Map();

  /**
   * Records an execution for later analysis.
   */
  recordExecution(hookId: string, delta: GraphDelta, receipt: Receipt): void {
    if (!this.executionHistory.has(hookId)) {
      this.executionHistory.set(hookId, []);
    }
    this.executionHistory.get(hookId)!.push({ delta, receipt });
  }

  /**
   * Analyzes the history of a hook to suggest optimizations, such as tightening predicates.
   */
  analyze(hookId: string, definition: HookDefinition): OptimizationSuggestion[] {
    const history = this.executionHistory.get(hookId) || [];
    if (history.length < 5) return []; // Need some data to be confident

    const suggestions: OptimizationSuggestion[] = [];

    // Optimization 1: Tighten 'always' condition to 'delta-match'
    if (definition.condition.kind === "always") {
      const commonPredicates = this.findCommonPredicates(history.map((h) => h.delta));
      if (commonPredicates.length > 0) {
        suggestions.push({
          hookId,
          originalCondition: definition.condition,
          suggestedCondition: { kind: "delta-match", predicate: commonPredicates[0] },
          reason: `Hook has 'always' condition but is only observed triggering on deltas containing '${commonPredicates[0]}'.`,
          confidence: Math.min(0.9, history.length / 20),
        });
      }
    }

    // Optimization 2: Identify redundant hooks (hooks that trigger but don't change state effectively)
    // (This would require deeper analysis of effects vs delta)

    return suggestions;
  }

  private findCommonPredicates(deltas: GraphDelta[]): string[] {
    if (deltas.length === 0) return [];

    const predicateCounts = new Map<string, number>();
    for (const delta of deltas) {
      const seenInDelta = new Set<string>();
      for (const q of [...delta.adds, ...delta.deletes]) seenInDelta.add(q.predicate);
      for (const p of seenInDelta) {
        predicateCounts.set(p, (predicateCounts.get(p) || 0) + 1);
      }
    }

    // If a predicate appears in EVERY delta, it's a candidate for tightening
    return [...predicateCounts.entries()]
      .filter(([_, count]) => count === deltas.length)
      .map(([p]) => p);
  }
}

/**
 * Current state of a hook in the Gemba.
 */
export interface HookState {
  hookId: string;
  name: string;
  status: "idle" | "executing" | "error";
  executionCount: number;
  lastExecutionTime?: number;
  averageExecutionDurationMs?: number;
}

/**
 * Gemba Inspector provides real-time visibility into the "real place" where hooks execute.
 * In TPS, Gemba is where value is created.
 */
export class GembaInspector {
  private states: Map<string, HookState> = new Map();
  private startTimes: Map<string, number> = new Map();

  /**
   * Returns the current state of a hook.
   */
  getHookState(hookId: string, name: string): HookState {
    if (!this.states.has(hookId)) {
      this.states.set(hookId, {
        hookId,
        name,
        status: "idle",
        executionCount: 0,
      });
    }
    return this.states.get(hookId)!;
  }

  /**
   * Signals the beginning of hook execution.
   */
  onBeginExecute(hookId: string, name: string): void {
    const state = this.getHookState(hookId, name);
    state.status = "executing";
    this.startTimes.set(hookId, Date.now());
  }

  /**
   * Signals the completion of hook execution.
   */
  onEndExecute(hookId: string, name: string, success: boolean): void {
    const state = this.getHookState(hookId, name);
    const startTime = this.startTimes.get(hookId);
    
    state.status = success ? "idle" : "error";
    state.executionCount++;
    state.lastExecutionTime = Date.now();

    if (startTime) {
      const duration = Date.now() - startTime;
      if (state.averageExecutionDurationMs === undefined) {
        state.averageExecutionDurationMs = duration;
      } else {
        // Simple moving average
        state.averageExecutionDurationMs = (state.averageExecutionDurationMs * 0.9) + (duration * 0.1);
      }
    }
  }

  /**
   * Provides a snapshot of all hook states in the Gemba.
   */
  snapshot(): HookState[] {
    return [...this.states.values()];
  }
}
