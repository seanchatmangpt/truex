/**
 * @module proxy-overhead
 * @description Benchmarking utilities for measuring proxy trap overhead.
 * Gall Classification: S-2 (test utils / benchmark primitives).
 */
import { createProxy } from "../membrane.js";

export interface BenchmarkResult {
  name: string;
  duration: number; // average duration in ms
  opsPerSecond: number;
}

export interface PerformanceReport {
  timestamp: string;
  results: BenchmarkResult[];
}

/**
 * Measures the time it takes to create a proxy.
 */
export function measureProxyCreationTime(iterations: number = 10_000): BenchmarkResult {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    createProxy({});
  }
  const end = performance.now();
  const totalDuration = end - start;
  const avgDuration = totalDuration / iterations;
  return {
    name: "Proxy Creation",
    duration: avgDuration,
    opsPerSecond: 1000 / avgDuration
  };
}

/**
 * Measures the overhead of proxy traps (get/set).
 */
export function measureTrapOverhead(iterations: number = 1_000_000): { get: BenchmarkResult; set: BenchmarkResult } {
  const target: Record<string, any> = { a: 1 };
  const { proxy } = createProxy(target);

  // GET Baseline
  const startBaselineGet = performance.now();
  for (let i = 0; i < iterations; i++) {
     
    const _ = target.a;
  }
  const endBaselineGet = performance.now();
  const baselineGetDuration = (endBaselineGet - startBaselineGet) / iterations;

  // GET Proxy
  const startProxyGet = performance.now();
  for (let i = 0; i < iterations; i++) {
     
    const _ = proxy.a;
  }
  const endProxyGet = performance.now();
  const proxyGetDuration = (endProxyGet - startProxyGet) / iterations;

  // SET Baseline
  const startBaselineSet = performance.now();
  for (let i = 0; i < iterations; i++) {
    target.a = i;
  }
  const endBaselineSet = performance.now();
  const baselineSetDuration = (endBaselineSet - startBaselineSet) / iterations;

  // SET Proxy
  const startProxySet = performance.now();
  for (let i = 0; i < iterations; i++) {
    proxy.a = i;
  }
  const endProxySet = performance.now();
  const proxySetDuration = (endProxySet - startProxySet) / iterations;

  return {
    get: {
      name: "Trap Overhead (GET)",
      duration: proxyGetDuration - baselineGetDuration,
      opsPerSecond: 1000 / proxyGetDuration
    },
    set: {
      name: "Trap Overhead (SET)",
      duration: proxySetDuration - baselineSetDuration,
      opsPerSecond: 1000 / proxySetDuration
    }
  };
}

/**
 * Compares the performance of different trap implementations.
 */
export function compareTrapImplementations(
  traps: Record<string, (t: any, p: any, v: any) => any>,
  iterations: number = 100_000
): BenchmarkResult[] {
  const target = { a: 1 };
  const results: BenchmarkResult[] = [];

  for (const [name, trap] of Object.entries(traps)) {
    const { proxy, defineSetInterceptor } = createProxy(target);
    defineSetInterceptor(trap);

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      proxy.a = i;
    }
    const end = performance.now();
    const avgDuration = (end - start) / iterations;
    results.push({
      name: `Trap Implementation: ${name}`,
      duration: avgDuration,
      opsPerSecond: 1000 / avgDuration
    });
  }

  return results;
}

/**
 * Identifies performance bottlenecks in interceptors by measuring execution time of each.
 */
export function identifyBottlenecks(
  target: any,
  interceptors: Array<{ name: string; fn: (...args: any[]) => any }>,
  iterations: number = 100_000
): Record<string, number> {
  const results: Record<string, number> = {};

  // Baseline with no interceptors
  const { proxy: baseProxy } = createProxy(target);
  const startBase = performance.now();
  for (let i = 0; i < iterations; i++) {
     
    const _ = baseProxy.a;
  }
  const endBase = performance.now();
  const baseAvg = (endBase - startBase) / iterations;

  for (const { name, fn } of interceptors) {
    const { proxy, defineGetInterceptor } = createProxy(target);
    defineGetInterceptor(fn);

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
       
      const _ = proxy.a;
    }
    const end = performance.now();
    const avg = (end - start) / iterations;
    results[name] = avg - baseAvg;
  }

  return results;
}

/**
 * Runs a suite of benchmarks.
 */
export async function runBenchmarks(): Promise<PerformanceReport> {
  const results: BenchmarkResult[] = [];
  
  results.push(measureProxyCreationTime());
  
  const overhead = measureTrapOverhead();
  results.push(overhead.get);
  results.push(overhead.set);

  // Example trap implementations comparison
  const trapResults = compareTrapImplementations({
    noop: () => undefined,
    validation: (t, p, v) => {
      if (typeof v !== 'number') throw new Error('Value must be a number');
      return undefined;
    }
  }, 100_000);
  results.push(...trapResults);

  return {
    timestamp: new Date().toISOString(),
    results
  };
}

/**
 * Generates a human-readable report from benchmark results.
 */
export function generateReport(report: PerformanceReport): string {
  let output = `Performance Report - ${report.timestamp}\n`;
  output += "=".repeat(70) + "\n";
  output += `${"Benchmark".padEnd(35)} | ${"Avg Duration (ms)".padEnd(20)} | ${"Ops/sec"}\n`;
  output += "-".repeat(70) + "\n";

  for (const result of report.results) {
    output += `${result.name.padEnd(35)} | ${result.duration.toFixed(8).padEnd(20)} | ${result.opsPerSecond.toFixed(2)}\n`;
  }

  return output;
}
