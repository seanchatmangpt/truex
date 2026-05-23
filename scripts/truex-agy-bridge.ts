#!/usr/bin/env npx tsx
import { createDeterministicContext } from '../packages/truex-core/src/context.js';
import { createAgyProductionLine } from '../packages/truex-core/src/manufacturing/registry.js';
import { type GraphDelta, type Quad } from '../packages/truex-core/src/runtime-law.js';
import { hash } from '../packages/truex-core/src/index.js';

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

async function main() {
  const [,, toolName, argsJson] = process.argv;

  if (!toolName || !argsJson) {
    console.error('Usage: tsx scripts/truex-agy-bridge.ts <tool_name> <json_arguments>');
    process.exit(1);
  }

  const args = JSON.parse(argsJson);
  const ctx = createDeterministicContext(42);
  const line = createAgyProductionLine(ctx);

  // 1. Convert Tool Action -> GraphDelta
  const delta: GraphDelta = {
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
  if (args.file_path || args.path) {
    delta.adds.push({
      subject: `file:${args.file_path || args.path}`,
      predicate: 'agy:modified_by',
      object: `agy:tool:${toolName}`,
      graph: null
    });
  }

  try {
    // 2. Custom Law Enforcement (Poka-yoke)
    if (toolName === 'write_file' || toolName === 'replace') {
      const content = args.content || args.new_string || '';
      if (content.includes('FOSSIL')) {
        throw new Error('Semantic Law Violation: Fossil record detected in code mutation. Agents must use dynamic ontologies, not static fossils.');
      }
    }

    // 3. Execute Production Line (The Hook Loop)
    console.log(`\n🌀 Truex Hook Intercept: Evaluating ${toolName}...`);
    const results = line.manufacture(delta);

    // 3. Output Convergence Report (for Antigravity Context)
    console.log('✅ Truex Admission: Operation matches Repository Law.');
    console.log('--- RECEIPT ---');
    results.forEach(res => {
      console.log(JSON.stringify(res.receipt, null, 2));
    });
    console.log('---------------');

    process.exit(0);
  } catch (error: any) {
    // Jidoka: Line Stop
    console.error(`\n❌ Truex REFUSAL: ${error.message}`);
    console.error('🛑 Operation blocked to prevent drift.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
