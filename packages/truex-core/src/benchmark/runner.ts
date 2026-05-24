import { runGallHookBench, type HookBenchReporter } from "./hookbench.gall.js";
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface BenchmarkOptions {
  seed?: number;
  registeredHooks?: number;
  processedDeltas?: number;
  matchRatio?: number;
  evalOnly?: boolean;
}

/**
 * Runs the full Gall Hookbench suite (T0-T3 + Stress Cases).
 */
export async function runBenchmark(options: BenchmarkOptions = {}): Promise<HookBenchReporter> {
  return runGallHookBench(options);
}

/**
 * Persists the Hookbench report to the required locations.
 */
export function persistReport(reporter: HookBenchReporter): void {
  const dirPath = path.resolve(process.cwd(), "docs/benchmarks");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // 1. docs/benchmarks/hookbench.full-report.json
  fs.writeFileSync(
    path.join(dirPath, "hookbench.full-report.json"),
    JSON.stringify(reporter, null, 2),
    "utf8"
  );

  // 2. docs/benchmarks/hookbench.80-20-stress.json
  fs.writeFileSync(
    path.join(dirPath, "hookbench.80-20-stress.json"),
    JSON.stringify(reporter.stressResults, null, 2),
    "utf8"
  );

  console.log(`📊 Hookbench reports persisted to ${dirPath}`);
}
