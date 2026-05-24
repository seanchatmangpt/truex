/**
 * @module lean
 * @description Gall S₂: Engine primitives.
 * Implements WasteDetector (Muri/Mura/Muda Elimination) for execution metrics.
 */
import { TruexHook } from "../hook.js";

/**
 * Mura (Inconsistency) report for a specific hook.
 */
export interface MuraReport {
  hookId: string;
  meanDuration: number;
  variance: number;
  isUneven: boolean; // Flagged if variance is too high
  sampleCount: number;
}

/**
 * Muda (Waste) report for membrane operations.
 */
export interface MudaReport {
  targetType: string;
  redundantWraps: number;
  isWasteful: boolean;
  cycleDetected: boolean;
}

/**
 * WasteDetector (Muri/Mura/Muda Elimination).
 * 
 * Reference: Toyota Production System (TPS).
 * 
 * This engine detects 'Mura' (unevenness) in hook execution times and
 * identifies 'Muda' (wasteful) cycles in the proxy membrane.
 */
export class WasteDetector {
  private hookMetrics = new Map<string, number[]>();
  private wrapCounts = new WeakMap<any, number>();
  private activeOperations = new WeakSet<any>();

  /**
   * Detects Mura (inconsistency) in hook execution.
   * Uneven process times lead to 'Muri' (overburden) and 'Muda' (waste).
   * 
   * @param hook The hook being measured.
   * @param duration The duration of the current execution.
   */
  detectMura(hook: TruexHook, duration: number): MuraReport {
    const hookId = hook.definition.id;
    if (!this.hookMetrics.has(hookId)) {
      this.hookMetrics.set(hookId, []);
    }
    const durations = this.hookMetrics.get(hookId)!;
    durations.push(duration);

    const count = durations.length;
    const mean = durations.reduce((a, b) => a + b, 0) / count;
    const variance = durations.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    // Flag as uneven if standard deviation > 50% of mean (after enough samples)
    const isUneven = count >= 5 && stdDev > mean * 0.5;

    return {
      hookId,
      meanDuration: mean,
      variance,
      isUneven,
      sampleCount: count
    };
  }

  /**
   * Identifies Muda (wasteful) cycles in the proxy membrane.
   * Redundant wrapping of the same object is a form of waste.
   * 
   * @param target The object entering the membrane.
   */
  identifyMuda(target: any): MudaReport {
    if (target === null || typeof target !== 'object') {
      return { targetType: typeof target, redundantWraps: 0, isWasteful: false, cycleDetected: false };
    }

    const wraps = (this.wrapCounts.get(target) || 0) + 1;
    this.wrapCounts.set(target, wraps);

    const cycleDetected = this.activeOperations.has(target);
    const isWasteful = wraps > 1 || cycleDetected;

    return {
      targetType: target.constructor?.name || 'Object',
      redundantWraps: wraps,
      isWasteful,
      cycleDetected
    };
  }

  /**
   * Track the start of a membrane operation to detect cycles.
   */
  startOperation(target: any): void {
    if (target !== null && typeof target === 'object') {
      this.activeOperations.add(target);
    }
  }

  /**
   * Track the end of a membrane operation.
   */
  endOperation(target: any): void {
    if (target !== null && typeof target === 'object') {
      this.activeOperations.delete(target);
    }
  }

  /**
   * Resets the metrics for a hook.
   */
  resetHook(hookId: string): void {
    this.hookMetrics.delete(hookId);
  }
}
