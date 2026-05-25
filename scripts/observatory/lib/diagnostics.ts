/**
 * @module diagnostics
 * @description
 * Gall Classification: Observatory Diagnostics
 * Purpose: Generates a diagnostic report for the Truex architecture, validating system health, 
 * Gall layer maturity, test coverage, and lean manufacturing waste metrics.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../../../');
const SRC_INDEX_JS = path.join(ROOT_DIR, 'src/index.js');
const COVERAGE_SUMMARY = path.join(ROOT_DIR, 'coverage/coverage-summary.json');
const OUTPUT_FILE = 'docs/v1/latest/facts/diagnostics.json';

const CORE_PRIMITIVES = [
  'createInvariantContext',
  'createAuditContext',
  'createContractContext',
  'createSimulationContext',
  'OcelCollector',
  'createProxy',
  'useContext'
];

const GALL_LAYERS = [
  {
    id: 'S0',
    name: 'Deterministic Entropy',
    primitives: ['createDeterministicContext', 'TruexContext'],
    description: 'Seeded clock and PRNG foundations'
  },
  {
    id: 'S1',
    name: 'Canonicalization & Hash',
    primitives: ['stableJson', 'hash'],
    description: 'BLAKE3 identity layer'
  },
  {
    id: 'S2',
    name: 'Structural Trust',
    primitives: ['createReceipt', 'verifyReceipt', 'signReceiptHash'],
    description: 'ML-DSA signed receipts'
  },
  {
    id: 'S3',
    name: 'Persistent State',
    primitives: ['S3PersistenceMembrane', 'SQLiteReceiptStore', 'GallTruexSqliteEngine'],
    description: 'SQLite persistence membrane'
  },
  {
    id: 'S4',
    name: 'Autonomic Behavior',
    primitives: ['TruexHook', 'interceptAgyExecution'],
    description: 'Hook loop and AGY integration'
  }
];

/**
 * Detects the current Gall Layer based on the presence and stability of primitives.
 */
function detectGallLayer(rootDir: string) {
  const coreIndex = path.join(rootDir, 'packages/membrane/src/index.ts');
  const coreSrcDir = path.join(rootDir, 'packages/membrane/src');
  const skillsDir = path.join(rootDir, 'skills');
  const testDir = path.join(rootDir, 'packages/membrane/test');
  
  let currentLayer = 'None';
  const layerDetails = [];
  let previousLayerComplete = true;

  const coreIndexContent = fs.existsSync(coreIndex) ? fs.readFileSync(coreIndex, 'utf8') : '';

  // Get all source files for symbol detection (including skills)
  const srcDirs = [coreSrcDir, skillsDir];
  const allSrcFiles = [];
  for (const dir of srcDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true })
        .filter(f => typeof f === 'string' && (f.endsWith('.ts') || f.endsWith('.js')))
        .map(f => path.join(dir, f as string));
      allSrcFiles.push(...files);
    }
  }

  // Get all test files for stability detection
  const allTestFiles = fs.existsSync(testDir)
    ? fs.readdirSync(testDir, { recursive: true })
        .filter(f => typeof f === 'string' && f.includes('.test.'))
        .map(f => path.join(testDir, f as string))
    : [];

  for (const layer of GALL_LAYERS) {
    const foundPrimitives = [];
    const stablePrimitives = [];

    for (const primitive of layer.primitives) {
      // 1. Check for presence (definition in src or skills)
      let found = false;
      for (const filePath of allSrcFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        // More flexible regex-like check
        const pattern = new RegExp(`export\\s+(function|class|interface|type|const)\\s+${primitive}\\b`);
        if (pattern.test(content)) {
          found = true;
          break;
        }
      }

      if (found) {
        foundPrimitives.push(primitive);
        
        // 2. Check for stability (exported from index AND tested)
        // Heuristic: Is it explicitly mentioned in core index, or is it a common export?
        const isExported = coreIndexContent.includes(primitive) || 
                          coreIndexContent.includes('export * from'); // Generic check

        let isTested = false;
        for (const filePath of allTestFiles) {
          const testContent = fs.readFileSync(filePath, 'utf8');
          if (testContent.includes(primitive)) {
            isTested = true;
            break;
          }
        }

        if (isExported && isTested) {
          stablePrimitives.push(primitive);
        }
      }
    }

    const isLayerComplete = foundPrimitives.length === layer.primitives.length;
    const isLayerStable = stablePrimitives.length === layer.primitives.length;

    layerDetails.push({
      id: layer.id,
      name: layer.name,
      status: isLayerStable ? 'stable' : (isLayerComplete ? 'unstable' : 'incomplete'),
      found: foundPrimitives,
      stable: stablePrimitives,
      expected: layer.primitives
    });

    if (isLayerComplete && previousLayerComplete) {
      currentLayer = layer.id;
    } else {
      previousLayerComplete = false;
    }
  }

  return {
    current: currentLayer,
    layers: layerDetails
  };
}

/**
 * Emitter for generating system-wide diagnostics, identifying the system's compliance
 * to expected Gall Layers and TPS principles (Jidoka/Muri).
 */
export class DiagnosticsEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Diagnostics Emitter',
      description: 'Generates a diagnostic report for the Truex architecture',
      outputPath: OUTPUT_FILE
    };
  }

  protected async collectFacts() {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      health_check: {
        status: 'unknown',
        checks: []
      },
      gall_layer: detectGallLayer(ROOT_DIR),
      coverage: null,
      waste_metrics: {
        decomposition_drift: false,
        muri: false
      }
    };

    // 1. Health check: Symbol counts (minimum 5 core primitives)
    if (fs.existsSync(SRC_INDEX_JS)) {
      const content = fs.readFileSync(SRC_INDEX_JS, 'utf8');
      const foundPrimitives = CORE_PRIMITIVES.filter(p => content.includes(p));
      const count = foundPrimitives.length;
      const passed = count >= 5;
      
      diagnostics.health_check.checks.push({
        name: 'core_symbols',
        description: 'Verifies presence of at least 5 core Truex primitives',
        expected_min: 5,
        actual: count,
        symbols: foundPrimitives,
        status: passed ? 'pass' : 'fail'
      });

      diagnostics.health_check.status = passed ? 'healthy' : 'unhealthy';
    } else {
      diagnostics.health_check.status = 'error';
      diagnostics.health_check.checks.push({
        name: 'core_symbols',
        error: 'src/index.js not found',
        status: 'error'
      });
    }

    // 2. Coverage check: Verify test coverage counts from latest vitest run
    if (fs.existsSync(COVERAGE_SUMMARY)) {
      try {
        const coverageData = JSON.parse(fs.readFileSync(COVERAGE_SUMMARY, 'utf8'));
        diagnostics.coverage = coverageData.total || coverageData;
      } catch (error_) {
        diagnostics.coverage = { 
          status: 'error',
          message: 'Failed to parse coverage-summary.json',
          error: error_ instanceof Error ? error_.message : String(error_)
        };
      }
    } else {
      const coverageDir = path.join(ROOT_DIR, 'coverage');
      diagnostics.coverage = fs.existsSync(coverageDir) ? { 
          status: 'partially_available',
          message: 'Coverage directory exists but coverage-summary.json not found. Ensure vitest is configured with "json-summary" reporter.'
        } : { 
          status: 'missing',
          message: 'No coverage data found. Run tests with coverage to generate report.' 
        };
    }

    // 3. Waste Metrics (Muri, Muda, Mura)
    const coreSrcDir = path.join(ROOT_DIR, 'packages/membrane/src');
    if (fs.existsSync(coreSrcDir)) {
      const srcFiles = fs.readdirSync(coreSrcDir, { recursive: true })
        .filter(f => typeof f === 'string' && (f.endsWith('.ts') || f.endsWith('.js')));
      
      // Decomposition Drift: More than 30 files in core source
      diagnostics.waste_metrics.decomposition_drift = srcFiles.length > 30;
      
      // Muri (Overburden): Any unstable Gall layers indicate system overburden
      diagnostics.waste_metrics.muri = diagnostics.gall_layer.layers.some((l: any) => l.status === 'unstable');
      
      diagnostics.waste_metrics.details = {
        file_count: srcFiles.length,
        unstable_layers: diagnostics.gall_layer.layers.filter((l: any) => l.status === 'unstable').map((l: any) => l.id)
      };
    }

    return diagnostics;
  }
}

/**
 * Instantiates the DiagnosticsEmitter and executes the diagnostic extraction process.
 * @returns A promise resolving to the diagnostics object.
 */
export async function generateDiagnostics() {
  const emitter = new DiagnosticsEmitter();
  return emitter.emit();
}

// Self-execute if run as a script
const isMain = process.argv[1] && (
  process.argv[1].endsWith('diagnostics.ts') || 
  process.argv[1].endsWith('diagnostics.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  generateDiagnostics().then((d) => {
    const metadata = new DiagnosticsEmitter().getMetadata();
    console.log(`✅ [${metadata.name}] Health Status: ${d.health_check.status}`);
    const symbolCheck = d.health_check.checks.find((c: any) => c.name === 'core_symbols');
    if (symbolCheck) {
      console.log(`   Core Symbols: ${symbolCheck.actual} / ${symbolCheck.expected_min}`);
    }
    console.log(`   Coverage Status: ${d.coverage?.status || 'Calculated'}`);
  }).catch(error_ => {
    console.error('❌ Failed to generate diagnostics:', error_);
    process.exit(1);
  });
}
