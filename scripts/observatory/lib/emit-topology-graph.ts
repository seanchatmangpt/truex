import { Project, SourceFile } from 'ts-morph';
import * as fs from 'node:fs';
import * as path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export interface OntologyNode {
  id: string; 
  type: string;
  layer: string; 
  dependencies: string[]; 
  provedBy: string[];
  documentedBy: string[];
}

const BASE_DIR = process.cwd();
const OUTPUT_FILE = path.join(BASE_DIR, 'docs/v1/latest/facts/topology.graph.json');

// AST-based classification
function classifyFile(sourceFile: SourceFile, relativePath: string): { type: string, layer: string } {
  // 1. Tests
  if (relativePath.includes('.test.') || sourceFile.getImportDeclaration(imp => imp.getModuleSpecifierValue() === 'vitest')) {
    return { type: 'Test', layer: 'Verification' };
  }

  // 2. Observatory Emitters
  if (sourceFile.getClass(c => c.getBaseClass()?.getName() === 'FactEmitter') || relativePath.includes('scripts/observatory/')) {
    return { type: 'Governance', layer: 'S4' };
  }

  // 3. CLI
  if (sourceFile.getImportDeclaration(imp => imp.getModuleSpecifierValue() === 'citty') || relativePath.includes('scripts/truex.ts')) {
    return { type: 'CLI', layer: 'Governance' };
  }

  // 4. Persistence
  if (sourceFile.getImportDeclaration(imp => imp.getModuleSpecifierValue() === 'better-sqlite3') || relativePath.includes('persistence/')) {
    return { type: 'Persistence', layer: 'S3' };
  }

  // 5. Manufacturing
  if (sourceFile.getClass('ProductionLine') || sourceFile.getFunction('truexManufacture') || relativePath.includes('manufacturing/')) {
    return { type: 'Manufacturing', layer: 'S2' };
  }

  // 6. Membrane
  if (sourceFile.getFunction('createProxy') || relativePath.includes('membrane')) {
    return { type: 'Integration', layer: 'S2' };
  }

  // 7. Primitives
  if (sourceFile.getClass('TruexHook') || sourceFile.getInterface('GraphDelta') || relativePath.includes('hook.ts') || relativePath.includes('runtime-law') || relativePath.includes('receipt') || relativePath.includes('replay') || relativePath.includes('hash')) {
    return { type: 'Primitive', layer: 'S0-S1' };
  }

  // 8. Topology (OTP)
  if (relativePath.includes('hook-otp.gall.ts') || relativePath.includes('topology') || relativePath.includes('concurrency')) {
    return { type: 'Topology', layer: 'S5' };
  }

  // 9. AGY Bridge
  if (relativePath.includes('truex-agy-bridge')) {
    return { type: 'Integration', layer: 'AGY' };
  }

  return { type: 'Source', layer: 'Unmapped' };
}

function calculateHash(content: string): string {
  const hashSum = crypto.createHash('sha256');
  hashSum.update(content);
  return hashSum.digest('hex');
}

export function emitTopologyGraph() {
  console.log('🔍 [Topology Graph Emitter] Extracting live ontology graph via AST...');
  
  const project = new Project({
    tsConfigFilePath: path.join(BASE_DIR, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });

  project.addSourceFilesAtPaths([
    path.join(BASE_DIR, 'packages/truex-core/src/**/*.ts'),
    path.join(BASE_DIR, 'scripts/**/*.ts'),
    path.join(BASE_DIR, 'skills/**/*.ts')
  ]);

  const nodesMap = new Map<string, OntologyNode>();
  let combinedContent = '';

  const sourceFiles = project.getSourceFiles();

  // First pass: create nodes
  for (const sourceFile of sourceFiles) {
    const absolutePath = sourceFile.getFilePath();
    const relativePath = path.relative(BASE_DIR, absolutePath);
    
    const dependencies: string[] = [];
    for (const imp of sourceFile.getImportDeclarations()) {
      const moduleSpecifier = imp.getModuleSpecifierValue();
      if (moduleSpecifier.startsWith('.')) {
        const resolvedPath = path.resolve(path.dirname(absolutePath), moduleSpecifier);
        const baseName = resolvedPath.replace(/\.js$/, '');
        let depRelPath = path.relative(BASE_DIR, baseName + '.ts');
        if (!fs.existsSync(path.join(BASE_DIR, depRelPath))) {
            depRelPath = path.relative(BASE_DIR, baseName + '/index.ts');
        }
        dependencies.push(depRelPath);
      }
    }

    const { type, layer } = classifyFile(sourceFile, relativePath);
    
    nodesMap.set(relativePath, {
      id: relativePath,
      type,
      layer,
      dependencies,
      provedBy: [],
      documentedBy: []
    });

    combinedContent += sourceFile.getFullText();
  }

  // Second pass: Link provedBy and documentedBy
  for (const [id, node] of nodesMap.entries()) {
    if (node.type === 'Test' || node.layer === 'Verification') {
      for (const dep of node.dependencies) {
        if (nodesMap.has(dep)) {
          nodesMap.get(dep)!.provedBy.push(id);
        }
      }
    }
    
    if (node.type === 'Governance' && id.includes('scripts/observatory/lib/emit-')) {
      // Emitters usually document the things they import, or their names correspond to the files they document
      for (const dep of node.dependencies) {
        if (nodesMap.has(dep) && nodesMap.get(dep)!.type !== 'Governance') {
          nodesMap.get(dep)!.documentedBy.push(id);
        }
      }
    }
  }

  const graphHash = calculateHash(combinedContent);

  const output = {
    version: "2.0.0", // Upgraded to v2 for AST Dynamic Support
    graphHash,
    nodes: Array.from(nodesMap.values()),
    _metadata: {
      emitter: "Topology Graph Emitter",
      description: "Live AST-grounded graph of the Truex operational ontology",
      timestamp: new Date().toISOString()
    }
  };

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`✅ [Topology Graph Emitter] Facts emitted to ${path.relative(BASE_DIR, OUTPUT_FILE)}`);
  return output;
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  emitTopologyGraph();
}
