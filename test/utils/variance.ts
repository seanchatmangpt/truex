import { performance } from 'node:perf_hooks';

/**
 * Results of a variance measurement.
 */
export interface VarianceResult {
  mean: number;
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  jitter: number;
  iterations: number;
}

/**
 * Measures execution timing jitter across multiple iterations of a function.
 * 
 * @param fn - The function to measure.
 * @param iterations - Number of iterations to run (default: 10,000).
 * @returns An object containing statistical timing data.
 */
export function measureVariance(fn: () => void, iterations: number = 10000): VarianceResult {
  const timings: number[] = new Array(iterations);
  
  // Warm up the JIT
  for (let i = 0; i < 100; i++) {
    fn();
  }
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    timings[i] = end - start;
  }
  
  const sum = timings.reduce((a, b) => a + b, 0);
  const mean = sum / iterations;
  
  const squareDiffs = timings.map(t => {
    const diff = t - mean;
    return diff * diff;
  });
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / iterations;
  
  const stdDev = Math.sqrt(avgSquareDiff);
  
  let min = timings[0]!;
  let max = timings[0]!;
  for (let i = 1; i < iterations; i++) {
    if (timings[i]! < min) min = timings[i]!;
    if (timings[i]! > max) max = timings[i]!;
  }
  
  return {
    mean,
    variance: avgSquareDiff,
    stdDev,
    min,
    max,
    jitter: max - min,
    iterations
  };
}

/**
 * Formats a VarianceResult for logging.
 */
export function formatVarianceReport(result: VarianceResult): string {
  return [
    `--- Variance Report (${result.iterations} iterations) ---`,
    `Mean:     ${result.mean.toFixed(6)} ms`,
    `StdDev:   ${result.stdDev.toFixed(6)} ms`,
    `Variance: ${result.variance.toFixed(9)}`,
    `Min:      ${result.min.toFixed(6)} ms`,
    `Max:      ${result.max.toFixed(6)} ms`,
    `Jitter:   ${result.jitter.toFixed(6)} ms`,
    `------------------------------------------`
  ].join('\n');
}
