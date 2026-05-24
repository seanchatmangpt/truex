/**
 * @module TruexAgyBridge
 * @description
 * Gall Classification: Gall S2/S3 (Membrane Interceptor & Hook Evaluation)
 * Purpose: Acts as the Antigravity bridge (Hook Interceptor) that converts agent tool 
 * actions into verifiable Truex GraphDeltas. It evaluates these deltas against the 
 * Repository Laws, journals them, and enforces the "no-fossil" semantic invariant.
 */

import Database from 'better-sqlite3';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createDeterministicContext } from '../packages/truex-core/src/context.js';
import { createAgyProductionLine } from '../packages/truex-core/src/manufacturing/registry.js';
import { type GraphDelta, type Quad } from '../packages/truex-core/src/runtime-law.js';
import { 
  hash,
  initializeSchema,
  createReceipt,
  stableJson
} from '../packages/truex-core/src/index.js';
import { DeltaJournal } from '../packages/truex-core/src/persistence/journal.js';
import { SQLiteReceiptStore } from '../packages/truex-core/src/persistence/receipt-store.js';
import { OntologyRegistry } from '../packages/truex-core/src/persistence/ontology.js';

/**
 * Truex Antigravity Bridge (The Hook Interceptor)
 * 
 * Usage:
 * tsx scripts/truex-agy-bridge.ts <tool_name> <json_arguments>
 * 
 * Purpose:
 * Converts Antigravity agent actions into Truex GraphDeltas and
 * evaluates them against Repository Laws.
 */

/**
 * Refinement Stage: Refine(Mutation) -> Mutation*
 * 
 * Instead of binary Admit/Refuse, we attempt to auto-correct minor alignment issues
 * before evaluation (e.g. mapping "soft-fossil" to "dynamic-variant").
 * 
 * @param delta - The original graph delta mutation.
 * @param args - The arguments corresponding to the delta.
 * @returns An object containing the refined delta and arguments.
 */
function refineMutation(delta: GraphDelta, args: any): { delta: GraphDelta, args: any } {
  let modified = false;
  const refinedArgs = { ...args };

  // 1. Content Refinement: soft-fossil -> dynamic-variant
  const contentKeys = ['content', 'new_string', 'CodeContent', 'ReplacementContent'];
  for (const key of contentKeys) {
    if (typeof refinedArgs[key] === 'string' && refinedArgs[key].includes('soft-fossil')) {
      process.stderr.write(`✨ Truex Refinement: Auto-correcting 'soft-fossil' to 'dynamic-variant' in ${key}\n`);
      refinedArgs[key] = refinedArgs[key].replace(/soft-fossil/g, 'dynamic-variant');
      modified = true;
    }
  }

  // 2. Structural Refinement: Ensure all quads have a non-null graph (auto-correcting 'off-pattern' nulls)
  const defaultGraph = 'agy:graph:main';
  const refineQuad = (q: Quad): Quad => {
    if (q.graph === null || q.graph === undefined) {
      return { ...q, graph: defaultGraph };
    }
    return q;
  };

  const refinedDelta: GraphDelta = {
    ...delta,
    adds: delta.adds.map(refineQuad),
    deletes: delta.deletes.map(refineQuad)
  };

  // If args were modified, we must re-hash them in the delta
  if (modified) {
    refinedDelta.adds = refinedDelta.adds.map(q => {
      if (q.predicate === 'agy:arguments') {
        return { ...q, object: hash(refinedArgs) };
      }
      return q;
    });
  }

  return { delta: refinedDelta, args: refinedArgs };
}

/**
 * The main hook interceptor execution flow.
 * Parses CLI arguments, constructs deterministic contexts, builds graph deltas,
 * refines them, and applies them to the production line while checking rules.
 */
async function main() {
  const [,, toolName, argsJson] = process.argv;

  if (!toolName || !argsJson) {
    console.error('Usage: tsx scripts/truex-agy-bridge.ts <tool_name> <json_arguments>');
    process.exit(1);
  }

  // 0. S1 Actuator - Context Injection (Behavioral Pressure)
  const diagnosticsPath = path.resolve(process.cwd(), 'docs/v1/latest/facts/diagnostics.json');
  if (fs.existsSync(diagnosticsPath)) {
    try {
      const diagnostics = JSON.parse(fs.readFileSync(diagnosticsPath, 'utf8'));
      if (diagnostics.waste_metrics?.decomposition_drift) {
        process.stderr.write('⚠️  WARNING: Module sprawl detected. Consolidate logic before new module creation.\n');
      }
      if (diagnostics.waste_metrics?.muri) {
        process.stderr.write('⚠️  WARNING: Muri (overburden) detected. Simplify existing primitives before adding complexity.\n');
      }
    } catch {
      // Fail silently for diagnostics read
    }
  }

  const args = JSON.parse(argsJson);
  const seedString = `${toolName}:${stableJson(args)}`;
  const hashHex = hash(seedString);
  const seed = parseInt(hashHex.substring(0, 8), 16) || 42;
  const ctx = createDeterministicContext(seed);
  const line = createAgyProductionLine(ctx);

  // 1. Convert Tool Action -> GraphDelta
  let delta: GraphDelta = {
    id: `agy_${ctx.uuid()}`,
    adds: [
      { 
        subject: `agy:tool:${toolName}`, 
        predicate: 'agy:action', 
        object: toolName,
        graph: null
      },
      {
        subject: `agy:tool:${toolName}`,
        predicate: 'agy:arguments',
        object: hash(args),
        graph: null
      }
    ],
    deletes: []
  };

  // For file modifications, add more specific quads
  if (args.file_path || args.path || args.TargetFile) {
    delta.adds.push({
      subject: `file:${args.file_path || args.path || args.TargetFile}`,
      predicate: 'agy:modified_by',
      object: `agy:tool:${toolName}`,
      graph: null
    });
  }

  // --- REFINEMENT STAGE ---
  const refinement = refineMutation(delta, args);
  delta = refinement.delta;
  const refinedArgs = refinement.args;

  // 1. Initialize SQLite Delta Journal
  const dbPath = path.resolve(process.cwd(), 'gall_truex.db');
  const db = new Database(dbPath);
  initializeSchema(db);
  const journal = new DeltaJournal(db);
  const receiptStore = new SQLiteReceiptStore(db);
  const ontologyRegistry = new OntologyRegistry(db);

  // Journal the delta (BEFORE evaluation to ensure zero-loss cold-load of all attempts)
  const journalIdx = journal.append(delta);

  try {
    // Autonomic Topology Enforcement
    let filePath = args.file_path || args.path || args.TargetFile;
    if (filePath) {
      if (path.isAbsolute(filePath)) {
        filePath = path.relative(process.cwd(), filePath);
      } else {
        filePath = path.normalize(filePath).replace(/\\/g, '/');
      }
      if (filePath !== 'dummy.ts' && !filePath.includes('dummy') && ontologyRegistry.isOrphaned(filePath)) {
        process.stderr.write(`⚠️  WARNING: Genesis Mutation (${filePath}). File is unmapped in the operational ontology. Ensure a test is written to satisfy the Documentation Law (prove ontology).\n`);
      }
    }

    // 2. Custom Law Enforcement (Poka-yoke)
    if (
      toolName === 'write_file' ||
      toolName === 'replace' ||
      toolName === 'write_to_file' ||
      toolName === 'replace_file_content'
    ) {
      const content = refinedArgs.content || refinedArgs.new_string || refinedArgs.CodeContent || refinedArgs.ReplacementContent || '';
      if (content.includes('FOSSIL')) {
        throw new Error('Semantic Law Violation: Fossil record detected in code mutation. Agents must use dynamic ontologies, not static fossils.');
      }
    }

    // 3. Execute Production Line (The Hook Loop)
    process.stderr.write(`\n🌀 Truex Hook Intercept: Evaluating ${toolName}...\n`);
    const results = line.manufacture(delta);

    // Persist receipts and mark applied
    for (const res of results) {
      receiptStore.append(res.receipt);
    }
    journal.markApplied(journalIdx);

    // 3. Output Convergence Report (for Antigravity Context)
    process.stderr.write('✅ Truex Admission: Operation matches Repository Law.\n');
    process.stderr.write('--- RECEIPT ---\n');
    for (const res of results) {
      console.log(JSON.stringify(res.receipt, null, 2));
    }
    process.stderr.write('---------------\n');

    db.close();
    process.exit(0);
  } catch (error: any) {
    // Handle refusal receipt insertion
    try {
      // Create and append Refused receipt
      const receipt = createReceipt(
        ctx,
        `evt_refused_${ctx.uuid()}`,
        delta.id,
        hash(delta),
        hash({ error: error.message }),
        receiptStore.latest()?.receiptHash ?? null,
        "refused"
      );
      receiptStore.append(receipt);
    } catch {
      // Ignore DB errors in exception block
    }

    // Jidoka: Line Stop
    console.error(`\n❌ Truex REFUSAL: ${error.message}`);
    console.error('🛑 Operation blocked to prevent drift.');
    db.close();
    process.exit(1);
  }
}

const isMain = process.argv.some(arg => 
  arg.includes('truex-agy-bridge.ts') || 
  arg.includes('truex-agy-bridge.js')
);

if (isMain) {
  main().catch(error_ => {
    console.error(error_);
    process.exit(1);
  });
}
