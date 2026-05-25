/**
 * @module timing
 * @description Timing and performance measurement utilities.
 * Gall Classification: S-2 (test utils / basic primitives).
 */

/**
 * Result of a timing measurement.
 */
export interface TimingResult<T> {
  /** The result of the function execution. */
  result: T;
  /** The duration of the execution in milliseconds. */
  duration: number;
}

/**
 * Measures the execution time of a synchronous function.
 * 
 * @param fn - The function to measure.
 * @returns An object containing the result and the duration in milliseconds.
 */
export function measureTime<T>(fn: () => T): TimingResult<T> {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Measures the execution time of an asynchronous function.
 * 
 * @param fn - The asynchronous function to measure.
 * @returns A promise that resolves to an object containing the result and the duration in milliseconds.
 */
export async function measureTimeAsync<T>(fn: () => Promise<T>): Promise<TimingResult<T>> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  return { result, duration };
}

/**
 * Tracks cumulative operation duration and calculates statistics.
 */
export class OperationTracker {
  private totalDuration: number = 0;
  private count: number = 0;

  /**
   * Tracks an operation duration.
   * 
   * @param duration - The duration of the operation in milliseconds.
   */
  track(duration: number): void {
    if (duration < 0) {
      throw new Error('Duration cannot be negative');
    }
    this.totalDuration += duration;
    this.count++;
  }

  /**
   * Returns the average operation time in milliseconds.
   */
  get average(): number {
    return this.count === 0 ? 0 : this.totalDuration / this.count;
  }

  /**
   * Returns the total duration of all tracked operations in milliseconds.
   */
  get total(): number {
    return this.totalDuration;
  }

  /**
   * Returns the number of tracked operations.
   */
  get operationCount(): number {
    return this.count;
  }

  /**
   * Resets the tracker statistics.
   */
  reset(): void {
    this.totalDuration = 0;
    this.count = 0;
  }
}
