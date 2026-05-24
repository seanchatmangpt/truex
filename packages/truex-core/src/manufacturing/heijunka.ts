/**
 * @module heijunka
 * @description Gall S₂: Engine primitives.
 * Implements ProductionScheduler (Heijunka) to level execution load.
 */
import type { GraphDelta, Receipt, HookEvent, HookEffect } from '../runtime-law.js';
import { TruexHook } from '../hook.js';
import type { TruexContext } from '../context.js';
import { KanbanSystem } from './jit.js';

export interface ExecutionResult {
  deltaId: string;
  hookId: string;
  receipt: Receipt;
  effects: HookEffect[];
  events: HookEvent[];
}

/**
 * ProductionScheduler (Heijunka): Levels the execution load of concurrent deltas.
 *
 * Heijunka (Leveling) is the Toyota Production System principle of smoothing out
 * production over a period of time. It eliminates 'Mura' (unevenness) and
 * prevents 'Muri' (overburden) on the single-threaded Node.js event loop.
 */
export class ProductionScheduler {
  constructor(
    private readonly context: TruexContext,
    private readonly kanban: KanbanSystem,
    private readonly options: {
      batchSize: number; // Number of executions to process before yielding
      intervalMs: number; // Optional delay between batches to further reduce Muri
    } = { batchSize: 5, intervalMs: 0 }
  ) {}

  /**
   * Processes multiple deltas in a leveled manner.
   *
   * It groups deltas by the hooks they trigger (Batching) and processes them
   * in small batches, yielding to the event loop between batches (Leveling).
   * 
   * @param deltas The list of concurrent deltas to process.
   * @returns A promise that resolves to an array of execution results.
   */
  async schedule(deltas: GraphDelta[]): Promise<ExecutionResult[]> {
    // 1. Grouping similar hook types to optimize execution (Mix Leveling)
    // We group deltas by the hooks they trigger so we can process them efficiently.
    const hookGroups = this.groupDeltasByHooks(deltas);

    const results: ExecutionResult[] = [];
    let processedCount = 0;

    // 2. Volume Leveling
    // Process the groups in a way that respects the batch size and yields to the event loop.
    for (const [hook, groupDeltas] of hookGroups.entries()) {
      for (const delta of groupDeltas) {
        // Execute the hook for this delta.
        // For concurrent leveling, we treat each execution as an independent 'station' 
        // on the production line.
        const { effects, receipt, events } = hook.execute(this.context, delta, null as unknown as string);

        results.push({
          deltaId: delta.id,
          hookId: hook.definition.id,
          receipt,
          effects,
          events,
        });

        processedCount++;

        // 3. Prevent 'Muri' (Overburden)
        // If we reach the batch size, yield to the event loop to allow other tasks 
        // (like I/O or other deltas) to be processed.
        if (processedCount % this.options.batchSize === 0) {
          await this.yieldToEventLoop();
        }
      }
    }

    return results;
  }

  /**
   * Groups deltas by the hook IDs they trigger.
   * This implements 'Batching similar hook types' to optimize processing.
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
   * Yields control back to the Node.js event loop.
   */
  private async yieldToEventLoop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.options.intervalMs > 0) {
        setTimeout(resolve, this.options.intervalMs);
      } else {
        setImmediate(resolve);
      }
    });
  }
}
