import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const BASE_DIR = process.cwd();
const SRC_DIR = path.join(BASE_DIR, 'packages/truex-core/src');
const OUTPUT_FILE = 'docs/v1/latest/facts/core-primitives.json';

export class CoreFactsEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Core Facts Emitter',
      description: 'Extracts core primitives and exported symbols from truex-core',
      outputPath: OUTPUT_FILE
    };
  }

  protected collectFacts() {
    const allFiles = this.getFiles(SRC_DIR);
    const fileFacts = allFiles.map(f => this.parseFile(f));

    const primitives: Record<string, { files: string[], resolvedSymbols: string[] }> = {
      hash: { files: ['packages/truex-core/src/hash.ts'], resolvedSymbols: [] },
      signature: { files: ['packages/truex-core/src/signature.ts'], resolvedSymbols: [] },
      receipt: { files: ['packages/truex-core/src/receipt.ts'], resolvedSymbols: [] },
      replay: { files: ['packages/truex-core/src/replay.ts'], resolvedSymbols: [] }
    };

    for (const key in primitives) {
      const p = primitives[key];
      const mainFile = path.join(BASE_DIR, p.files[0]);
      if (fs.existsSync(mainFile)) {
        const fact = this.parseFile(mainFile);
        p.resolvedSymbols = this.resolveReExports(mainFile, fact.reExports);
      }
    }

    const totalFunctions = fileFacts.reduce((sum, f) => sum + f.exportedFunctions.length, 0);
    const totalClasses = fileFacts.reduce((sum, f) => sum + f.exportedClasses.length, 0);
    const allExportedSymbols = [...new Set(fileFacts.flatMap(f => f.exportedSymbols))];

    return {
      version: "1.0.0",
      corePrimitives: primitives,
      stats: {
        totalFiles: allFiles.length,
        totalFunctions,
        totalClasses,
        totalExportedSymbols: allExportedSymbols.length
      },
      files: fileFacts.map(f => ({
        path: f.filePath,
        functions: f.exportedFunctions.length,
        classes: f.exportedClasses.length,
        symbols: f.exportedSymbols,
        internalLogicPaths: f.internalSymbols
      }))
    };
  }

  private getFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.getFiles(filePath));
      } else if (filePath.endsWith('.ts')) {
        results.push(filePath);
      }
    }
    return results;
  }

  private parseFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8');
    const exportedFunctions: string[] = [];
    const exportedClasses: string[] = [];
    const exportedSymbols: string[] = [];
    const internalSymbols: string[] = [];
    const reExports: string[] = [];

    // Match: export function name, export async function name
    const funcMatches = content.matchAll(/export (?:async )?function\s+([a-zA-Z0-9_]+)/g);
    for (const match of funcMatches) {
      exportedFunctions.push(match[1]);
      exportedSymbols.push(match[1]);
    }

    // Match: non-exported functions
    const internalFuncMatches = content.matchAll(/^(?:async )?function\s+([a-zA-Z0-9_]+)/gm);
    for (const match of internalFuncMatches) {
      if (!exportedSymbols.includes(match[1])) {
        internalSymbols.push(match[1]);
      }
    }

    // Match: export class name
    const classMatches = content.matchAll(/export class\s+([a-zA-Z0-9_]+)/g);
    for (const match of classMatches) {
      exportedClasses.push(match[1]);
      exportedSymbols.push(match[1]);
    }

    // Match: non-exported classes
    const internalClassMatches = content.matchAll(/^class\s+([a-zA-Z0-9_]+)/gm);
    for (const match of internalClassMatches) {
      if (!exportedSymbols.includes(match[1])) {
        internalSymbols.push(match[1]);
      }
    }

    // Match: export const name
    const constMatches = content.matchAll(/export const\s+([a-zA-Z0-9_]+)/g);
    for (const match of constMatches) {
      exportedSymbols.push(match[1]);
    }

    // Match: export type name, export interface name
    const typeMatches = content.matchAll(/export (?:type|interface|enum)\s+([a-zA-Z0-9_]+)/g);
    for (const match of typeMatches) {
      exportedSymbols.push(match[1]);
    }

    // Match: export * from "path"
    const reExportMatches = content.matchAll(/export \* from\s+['"]([^'"]+)['"]/g);
    for (const match of reExportMatches) {
      reExports.push(match[1]);
    }

    return {
      filePath: path.relative(BASE_DIR, filePath),
      exportedFunctions,
      exportedClasses,
      exportedSymbols,
      internalSymbols,
      reExports
    };
  }

  private resolveReExports(filePath: string, reExports: string[]): string[] {
    let symbols: string[] = [];
    for (const reExport of reExports) {
      let targetPath = path.resolve(path.dirname(filePath), reExport);
      if (!targetPath.endsWith('.ts')) {
        if (fs.existsSync(targetPath + '.ts')) {
          targetPath += '.ts';
        } else if (fs.existsSync(targetPath.replace(/\.js$/, '.ts'))) {
          targetPath = targetPath.replace(/\.js$/, '.ts');
        }
      }

      if (fs.existsSync(targetPath)) {
        const targetFact = this.parseFile(targetPath);
        symbols = symbols.concat(targetFact.exportedSymbols);
        // Recursively follow re-exports if any
        if (targetFact.reExports.length > 0) {
          symbols = symbols.concat(this.resolveReExports(targetPath, targetFact.reExports));
        }
      }
    }
    return [...new Set(symbols)];
  }
}

/**
 * Legacy export for backward compatibility
 */
export async function emitCoreFacts() {
  const emitter = new CoreFactsEmitter();
  return emitter.emit();
}

// Self-execute if run as a script
const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-core-facts.ts') || 
  process.argv[1].endsWith('emit-core-facts.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitCoreFacts();
}
