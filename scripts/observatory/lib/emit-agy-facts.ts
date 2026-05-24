import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

/**
 * @module emit-agy-facts
 * @description
 * Gall Classification: Observatory Interceptor Analysis
 * Purpose: Extracts facts about the Antigravity bridge and configured hooks.
 * Validates integration paths and ensures Hook interception logic is documented.
 */
export class AgyFactsEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'AGY Integration Facts',
      description: 'Extracts facts about the Antigravity bridge and configured hooks',
      outputPath: 'docs/v1/latest/facts/agy-integration.json'
    };
  }

  protected async collectFacts() {
    const rootDir = process.cwd();
    const bridgePath = path.join(rootDir, 'scripts/truex-agy-bridge.ts');
    const hooksPath = path.join(rootDir, '.agents/hooks.json');

    const bridgeFacts = this.extractBridgeFacts(bridgePath);
    const hooks = this.extractHookFacts(hooksPath);

    return {
      bridge: bridgeFacts,
      hooks: hooks,
      integrationType: "Antigravity Hook Interceptor",
      logicPaths: this.resolveInternalLogicPaths(bridgePath)
    };
  }

  private extractBridgeFacts(bridgePath: string) {
    if (!fs.existsSync(bridgePath)) {
      return { status: 'missing', path: bridgePath };
    }
    const content = fs.readFileSync(bridgePath, 'utf8');
    
    const facts: any = {
      name: "Truex Antigravity Bridge",
      file: "scripts/truex-agy-bridge.ts",
      purpose: "Converts Antigravity agent actions into Truex GraphDeltas and evaluates them against Repository Laws.",
      database: "gall_truex.db",
      enforcedLaws: [] as string[]
    };

    // Simple extraction of enforced laws/checks
    if (content.includes('FOSSIL')) {
      facts.enforcedLaws.push("Fossil record detection (anti-static ontology)");
    }
    
    if (content.includes('createAgyProductionLine')) {
      facts.enforcedLaws.push("Antigravity Production Line evaluation");
    }

    return facts;
  }

  private extractHookFacts(hooksPath: string) {
    if (!fs.existsSync(hooksPath)) {
      return [];
    }
    try {
      const content = JSON.parse(fs.readFileSync(hooksPath, 'utf8'));
      return content.hooks || {};
    } catch {
      return [];
    }
  }

  private resolveInternalLogicPaths(filePath: string) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    
    const paths: string[] = [];
    
    // Look for common internal logic markers in the bridge
    const markers = [
      'processDelta',
      'evaluateLaw',
      'emitReceipt',
      'persistDelta',
      'rollbackTransition'
    ];

    for (const marker of markers) {
      if (content.includes(marker)) {
        paths.push(marker);
      }
    }

    // Granular symbol resolution for internal logic
    const internalSymbols = content.matchAll(/function\s+([a-zA-Z0-9_]+)/g);
    for (const match of internalSymbols) {
      if (!paths.includes(match[1])) {
        paths.push(match[1]);
      }
    }

    return paths;
  }
}

/**
 * Instantiates the AgyFactsEmitter and executes the fact extraction process.
 * @returns A promise that resolves to the emitted facts object representing AGY integration.
 */
export async function emitAgyFacts() {
  const emitter = new AgyFactsEmitter();
  return emitter.emit();
}

// Self-execute if run as a script
const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-agy-facts.ts') || 
  process.argv[1].endsWith('emit-agy-facts.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitAgyFacts();
}
