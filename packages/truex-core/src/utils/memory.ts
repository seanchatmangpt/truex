/**
 * @module memory
 * @description Memory profiling and leak detection utilities.
 * Gall Classification: S-2 (test utils / basic primitives).
 */

/**
 * Estimates the memory usage of a JavaScript object in bytes.
 * This is a heuristic estimation and not exact.
 */
export function estimateMemoryUsage(obj: any, seen = new WeakSet()): number {
  if (obj === null || obj === undefined) {
    return 0;
  }

  const type = typeof obj;
  if (type === 'number') {
    return 8;
  }
  if (type === 'string') {
    return obj.length * 2;
  }
  if (type === 'boolean') {
    return 4;
  }
  if (type === 'symbol') {
    return (obj.description || '').length * 2;
  }
  if (type === 'bigint') {
    return 8; // Approximation
  }

  if (type === 'object') {
    if (seen.has(obj)) {
      return 0;
    }
    seen.add(obj);

    let bytes = 0;
    
    // Add overhead for the object itself
    bytes += 16;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        bytes += estimateMemoryUsage(item, seen);
      }
    } else if (obj instanceof Map) {
      for (const [key, value] of obj.entries()) {
        bytes += estimateMemoryUsage(key, seen);
        bytes += estimateMemoryUsage(value, seen);
      }
    } else if (obj instanceof Set) {
      for (const value of obj.values()) {
        bytes += estimateMemoryUsage(value, seen);
      }
    } else if (ArrayBuffer.isView(obj)) {
      bytes += obj.byteLength;
    } else {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          bytes += key.length * 2;
          bytes += estimateMemoryUsage(obj[key], seen);
        }
      }
    }
    return bytes;
  }

  return 0;
}

/**
 * Tracks objects to detect potential memory leaks using FinalizationRegistry.
 */
export class MemoryLeakDetector {
  private registry: FinalizationRegistry<string>;
  private activeObjects = new Map<string, WeakRef<any>>();
  private leaks = new Set<string>();

  constructor(private onLeak?: (id: string) => void) {
    this.registry = new FinalizationRegistry((id) => {
      this.activeObjects.delete(id);
    });
  }

  /**
   * Tracks an object and associates it with a unique ID.
   */
  track(obj: any, id: string): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }
    this.activeObjects.set(id, new WeakRef(obj));
    this.registry.register(obj, id);
  }

  /**
   * Checks the registry for potential leaks (objects still active).
   * @returns An array of IDs of potentially leaked objects.
   */
  checkLeaks(): string[] {
    const currentLeaks: string[] = [];
    for (const [id, ref] of this.activeObjects.entries()) {
      if (ref.deref() !== undefined) {
        // If the object is still alive, we can't be sure it's a leak yet
        // but we can report it if it was expected to be gone.
        currentLeaks.push(id);
      }
    }
    return currentLeaks;
  }
}

/**
 * Monitors memory growth over time.
 */
export class MemoryMonitor {
  private snapshots: { timestamp: number; memory: NodeJS.MemoryUsage }[] = [];

  /**
   * Takes a snapshot of current memory usage.
   */
  snapshot(): void {
    this.snapshots.push({
      timestamp: Date.now(),
      memory: process.memoryUsage(),
    });
  }

  /**
   * Generates a report of memory growth over time.
   */
  getGrowthReport() {
    if (this.snapshots.length < 2) {
      return {
        totalHeapGrowth: 0,
        averageGrowthPerSecond: 0,
        snapshots: this.snapshots.length,
      };
    }

    const first = this.snapshots[0]!;
    const last = this.snapshots.at(-1)!;
    
    const timeDiffSec = (last.timestamp - first.timestamp) / 1000;
    const heapDiff = last.memory.heapUsed - first.memory.heapUsed;

    return {
      totalHeapGrowth: heapDiff,
      averageGrowthPerSecond: timeDiffSec > 0 ? heapDiff / timeDiffSec : 0,
      snapshots: this.snapshots.length,
    };
  }

  /**
   * Resets the monitor state.
   */
  reset(): void {
    this.snapshots = [];
  }
}
