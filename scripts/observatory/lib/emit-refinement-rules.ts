/**
 * @module emit-refinement-rules
 * @description
 * Gall Classification: S4 Observatory Strategy
 * Purpose: Uses the 'internalLogicPaths' from CoreFactsEmitter to generate 'Refinement Rules' for the bridge.
 * These rules help the bridge auto-correct agent tool calls to use internal, deterministic paths.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';
import { CoreFactsEmitter } from './emit-core-facts.js';

const BASE_DIR = process.cwd();
const CORE_FACTS_FILE = path.join(BASE_DIR, 'docs/v1/latest/facts/core-primitives.json');
const OUTPUT_FILE = 'docs/v1/latest/facts/refinement-rules.json';

/**
 * Emitter for defining agent interaction rules and heuristics for the Truex bridge.
 */
export class RefinementRulesEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Refinement Rules Emitter',
      description: 'Generates refinement rules for the bridge based on internal logic paths',
      outputPath: OUTPUT_FILE
    };
  }

  protected async collectFacts() {
    // 1. Load Core Facts
    let coreFacts: any;
    if (fs.existsSync(CORE_FACTS_FILE)) {
      try {
        coreFacts = JSON.parse(fs.readFileSync(CORE_FACTS_FILE, 'utf8'));
      } catch {
        console.warn('⚠️ Could not parse existing core-primitives.json, re-emitting...');
        const emitter = new CoreFactsEmitter();
        coreFacts = await emitter.emit();
      }
    } else {
      console.log('🔍 Core facts missing, emitting now...');
      const emitter = new CoreFactsEmitter();
      coreFacts = await emitter.emit();
    }

    // 2. Extract internal logic paths
    const internalSymbols: Array<{ symbol: string, filePath: string }> = [];
    
    if (coreFacts && coreFacts.files) {
      for (const file of coreFacts.files) {
        if (file.internalLogicPaths && Array.isArray(file.internalLogicPaths)) {
          for (const symbol of file.internalLogicPaths) {
            internalSymbols.push({
              symbol,
              filePath: file.path
            });
          }
        }
      }
    }

    // 3. Generate Refinement Rules
    // We map internal symbols to rules that the bridge can use to "auto-correct"
    const rules = internalSymbols.map(item => {
      return {
        id: `refine_${item.symbol}`,
        targetSymbol: item.symbol,
        sourceFile: item.filePath,
        action: 'REPLACE_AMBIENT',
        description: `Deterministic implementation found for ${item.symbol}. Prioritize internal path in ${item.filePath}.`,
        deterministic: true
      };
    });

    // 4. Heuristic-based rules for the bridge
    const heuristics = [
      {
        ambientTool: 'run_shell_command',
        pattern: 'hash|sha256|md5',
        correction: 'use internal hash() from truex-core',
        severity: 'blocking'
      },
      {
        ambientTool: 'write_file',
        pattern: '.*',
        correction: 'evaluate against ProductionLine laws in bridge',
        severity: 'enforced'
      },
      {
        ambientTool: 'read_file',
        pattern: '.*',
        correction: 'bind to TruexContext for replayability',
        severity: 'warning'
      }
    ];

    return {
      version: "1.0.0",
      rules,
      heuristics,
      stats: {
        internalSymbolsCount: internalSymbols.length,
        rulesGenerated: rules.length,
        heuristicsCount: heuristics.length
      }
    };
  }
}

/**
 * Instantiates the RefinementRulesEmitter and executes the fact extraction process.
 * @returns A promise resolving to the emitted facts object.
 */
export async function emitRefinementRules() {
  const emitter = new RefinementRulesEmitter();
  return emitter.emit();
}

// Self-execute if run as a script
const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-refinement-rules.ts') || 
  process.argv[1].endsWith('emit-refinement-rules.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitRefinementRules();
}
