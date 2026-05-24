import fs from 'node:fs';
import path from 'node:path';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

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
