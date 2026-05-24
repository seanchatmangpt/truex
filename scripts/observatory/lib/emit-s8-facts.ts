import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const BASE_DIR = process.cwd();
const TELCO_AGENT_FILE = path.join(BASE_DIR, 'agents/telco/agent.ts');
const WIZARD_AGENT_FILE = path.join(BASE_DIR, 'agents/wizard/agent.ts');
const OUTPUT_FILE = 'docs/v1/latest/facts/s8-facts.json';

export class S8FactsEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'S8 Facts Emitter',
      description: 'Extracts architectural facts and benchmark performance for S8 (Telco and Wizard)',
      outputPath: OUTPUT_FILE
    };
  }

  protected async collectFacts() {
    const facts: any = {
      version: "1.0.0",
      layer: "Telco & Wizard (S8)",
      description: "Object-centric event log receipts and counterfactual speculative transaction simulations.",
      agents: {
        telco: {
          file: 'agents/telco/agent.ts',
          methods: [],
          benchmark: {}
        },
        wizard: {
          file: 'agents/wizard/agent.ts',
          methods: [],
          benchmark: {}
        }
      }
    };

    // 1. Analyze Telco Agent
    if (fs.existsSync(TELCO_AGENT_FILE)) {
      const content = fs.readFileSync(TELCO_AGENT_FILE, 'utf8');
      const methodMatches = content.matchAll(/([a-zA-Z0-9_]+)\s*\([^)]*\)\s*:\s*[a-zA-Z0-9_]+/g);
      for (const match of methodMatches) {
        if (match[1] !== 'constructor' && !facts.agents.telco.methods.includes(match[1])) {
          facts.agents.telco.methods.push(match[1]);
        }
      }
    }

    // 2. Analyze Wizard Agent
    if (fs.existsSync(WIZARD_AGENT_FILE)) {
      const content = fs.readFileSync(WIZARD_AGENT_FILE, 'utf8');
      const methodMatches = content.matchAll(/([a-zA-Z0-9_]+)\s*\([^)]*\)\s*:\s*[a-zA-Z0-9_]+/g);
      for (const match of methodMatches) {
        if (match[1] !== 'constructor' && !facts.agents.wizard.methods.includes(match[1])) {
          facts.agents.wizard.methods.push(match[1]);
        }
      }
    }

    // 3. Load Telco benchmarks
    const telcoBenchPath = path.join(BASE_DIR, 'docs/benchmarks/telco.report.json');
    if (fs.existsSync(telcoBenchPath)) {
      const data = JSON.parse(fs.readFileSync(telcoBenchPath, 'utf8'));
      facts.agents.telco.benchmark = {
        ingestOpsPerSecond: data.metrics.ingestOpsPerSecond,
        verifyOpsPerSecond: data.metrics.verifyOpsPerSecond,
        reportHash: data.reportHash,
        status: data.status
      };
    }

    // 4. Load Wizard benchmarks
    const wizardBenchPath = path.join(BASE_DIR, 'docs/benchmarks/wizard.report.json');
    if (fs.existsSync(wizardBenchPath)) {
      const data = JSON.parse(fs.readFileSync(wizardBenchPath, 'utf8'));
      facts.agents.wizard.benchmark = {
        simulateOpsPerSecond: data.metrics.simulateOpsPerSecond,
        reportHash: data.reportHash,
        status: data.status
      };
    }

    return facts;
  }
}

export async function emitS8Facts() {
  const emitter = new S8FactsEmitter();
  return emitter.emit();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-s8-facts.ts') || 
  process.argv[1].endsWith('emit-s8-facts.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  await emitS8Facts();
}
