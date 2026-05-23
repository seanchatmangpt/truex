import { KanbanSystem } from './jit.js';
import { AndonSystem, PokaYoke } from './jidoka.js';
import { ProductionScheduler, type ExecutionResult } from './heijunka.js';
import { RefiningEngine, GembaInspector, type HookState, type OptimizationSuggestion } from './kaizen.js';
import type { TruexContext } from '../context.js';
import type { GraphDelta, HookDefinition } from '../runtime-law.js';
import { TruexHook } from '../hook.js';

/**
 * ProductionLine: The primary orchestrator for Software Manufacturing in TrueX.
 *
 * It integrates the four pillars of the Toyota Production System (TPS):
 * 1. JIT (Just-In-Time): Only pulling hooks that match incoming deltas (Kanban).
 * 2. Jidoka (Autonomation): Error-proofing (Poka-yoke) and line-stop (Andon) capabilities.
 * 3. Heijunka (Leveling): Smoothing out execution load to prevent 'Muri' (overburden).
 * 4. Kaizen (Continuous Improvement): Analyzing history to suggest optimizations and 
 *    providing visibility (Gemba).
 */
export class ProductionLine {
  private readonly kanban: KanbanSystem;
  private readonly andon: AndonSystem;
  private readonly pokaYoke: PokaYoke;
  private readonly kaizen: RefiningEngine;
  private readonly gemba: GembaInspector;
  private readonly scheduler: ProductionScheduler;

  constructor(
    private readonly context: TruexContext,
    hooks: HookDefinition[],
    options: { batchSize?: number; intervalMs?: number } = {}
  ) {
    this.kanban = new KanbanSystem(hooks);
    this.andon = new AndonSystem();
    this.pokaYoke = new PokaYoke(this.andon);
    this.kaizen = new RefiningEngine();
    this.gemba = new GembaInspector();
    
    // We initialize the scheduler with the kanban system.
    // Note: The scheduler in heijunka.ts currently does direct execution.
    // In this orchestrator, we will provide a leveled manufacturing path.
    this.scheduler = new ProductionScheduler(context, this.kanban, {
      batchSize: options.batchSize ?? 5,
      intervalMs: options.intervalMs ?? 0,
    });
  }

  /**
   * Executes a single 'station' on the production line (a Hook).
   * Applies Jidoka (Poka-yoke) and records Kaizen/Gemba data.
   */
  private executeStation(hook: TruexHook, delta: GraphDelta): ExecutionResult {
    const hookId = hook.definition.id;
    const hookName = hook.definition.id; // Or a more descriptive name if available

    this.gemba.onBeginExecute(hookId, hookName);

    try {
      const result = this.pokaYoke.guardExecution(
        hook,
        this.context,
        delta,
        () => hook.execute(this.context, delta, delta.id),
        delta.id // Use delta ID as a transaction correlation ID for Andon
      );

      this.kaizen.recordExecution(hookId, delta, result.receipt);
      this.gemba.onEndExecute(hookId, hookName, true);

      return {
        deltaId: delta.id,
        hookId: hookId,
        receipt: result.receipt,
        effects: result.effects,
        events: result.events,
      };
    } catch (error_) {
      this.gemba.onEndExecute(hookId, hookName, false);
      throw error_;
    }
  }

  /**
   * Manufactures a single GraphDelta.
   * JIT pulls the required hooks, then each is executed through the Jidoka-guarded station.
   *
   * @param delta The delta to process.
   * @returns The results of all triggered hooks.
   */
  manufacture(delta: GraphDelta): ExecutionResult[] {
    const hooks = this.kanban.pull(delta);
    return hooks.map((hook) => this.executeStation(hook, delta));
  }

  /**
   * Manufactures multiple deltas in a leveled manner (Heijunka).
   * This prevents 'Muri' (overburdening the event loop) when processing large bursts of deltas.
   *
   * @param deltas The batch of deltas to process.
   * @returns A promise resolving to all execution results.
   */
  async manufactureLeveled(deltas: GraphDelta[]): Promise<ExecutionResult[]> {
    // We leverage the scheduler for grouping and batching (Mura reduction).
    // However, we want to ensure each execution goes through our executeStation logic.
    
    // For now, we'll use a simplified leveling loop that uses executeStation.
    // In a more advanced version, we'd integrate executeStation into ProductionScheduler.
    
    const results: ExecutionResult[] = [];
    const hookGroups = this.groupDeltasByHooks(deltas);

    let processedCount = 0;
    const batchSize = (this.scheduler as any).options.batchSize;
    const intervalMs = (this.scheduler as any).options.intervalMs;

    for (const [hook, groupDeltas] of hookGroups.entries()) {
      for (const delta of groupDeltas) {
        results.push(this.executeStation(hook, delta));
        processedCount++;

        if (processedCount % batchSize === 0) {
          await new Promise((resolve) => {
            if (intervalMs > 0) setTimeout(resolve, intervalMs);
            else setImmediate(resolve);
          });
        }
      }
    }

    return results;
  }

  /**
   * Groups deltas by the hook IDs they trigger (Mix Leveling).
   */
  private groupDeltasByHooks(deltas: GraphDelta[]): Map<TruexHook, GraphDelta[]> {
    const groups = new Map<TruexHook, GraphDelta[]>();
    for (const delta of deltas) {
      const pulledHooks = this.kanban.pull(delta);
      for (const hook of pulledHooks) {
        if (!groups.has(hook)) {
          groups.set(hook, []);
        }
        groups.get(hook)!.push(delta);
      }
    }
    return groups;
  }

  /**
   * Returns suggestions for improving the production line based on Kaizen analysis.
   */
  getKaizenSuggestions(hookId: string, definition: HookDefinition): OptimizationSuggestion[] {
    return this.kaizen.analyze(hookId, definition);
  }

  /**
   * Returns a snapshot of the current state of the production line (Gemba).
   */
  getGembaSnapshot(): HookState[] {
    return this.gemba.snapshot();
  }

  /**
   * Resets the Andon system, clearing any line stops.
   */
  resetAndon(): void {
    this.andon.reset();
  }
}

/**
 * Primary entry point for Software Manufacturing.
 * 
 * @param context The TrueX execution context.
 * @param hooks The set of hook definitions (The 'Blueprint').
 * @param options Manufacturing options.
 */
export function truexManufacture(
  context: TruexContext,
  hooks: HookDefinition[],
  options?: { batchSize?: number; intervalMs?: number }
): ProductionLine {
  return new ProductionLine(context, hooks, options);
}
