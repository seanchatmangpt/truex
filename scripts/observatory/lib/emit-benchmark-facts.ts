/**
 * @module emit-benchmark-facts
 * @description
 * Gall Classification: S4 Benchmark Fact Emitter
 * Purpose: Extracts performance metrics and benchmark results from the hook evaluation benchmark.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

/**
 * Emitter for extracting facts about system performance.
 * Parses benchmark reports to generate documented metrics.
 */
export class BenchmarkFactsEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Benchmark Facts',
      description: 'Extracts performance metrics and benchmark results.',
      outputPath: 'scripts/observatory/facts/benchmark_facts.json'
    };
  }

  protected async collectFacts(): Promise<any> {
    const benchmarkPath = path.resolve(process.cwd(), 'docs/benchmarks/million-hook-church.report.json');
    
    if (!fs.existsSync(benchmarkPath)) {
      return {
        benchmarks: [],
        summary: "No benchmark reports found."
      };
    }

    const content = fs.readFileSync(benchmarkPath, 'utf8');
    const report = JSON.parse(content);

    return {
      benchmarks: [
        {
          id: 'million-hook-church',
          name: 'Million Hook Church',
          ...report
        }
      ],
      aggregated: {
        total_evaluations: report.metrics.totalHookDeltaEvaluations || report.iterations,
        avg_eval_per_sec: report.metrics.hookDeltaEvaluationsPerSecond || report.metrics.opsPerSecond,
        peak_memory_mb: report.metadata.memoryAfterMb
      }
    };
  }
}

/**
 * Instantiates the BenchmarkFactsEmitter and executes the fact extraction process.
 * @returns A promise resolving to the facts object.
 */
export async function emitBenchmarkFacts() {
  const emitter = new BenchmarkFactsEmitter();
  return emitter.emit();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-benchmark-facts.ts') || 
  process.argv[1].endsWith('emit-benchmark-facts.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitBenchmarkFacts();
}
