/**
 * @module index
 * @description
 * Gall Classification: Observatory Entrypoint
 * Purpose: Runs a series of fact emitters to extract architectural state,
 * detect drift, and generate artifacts in deterministic priority order.
 */
import { getSortedEmitters } from './lib/registry.js';

/**
 * Main execution function for the Truex Observatory.
 * Orchestrates all registered emitters and handles top-level execution results.
 */
async function main() {
  process.stderr.write('🔭 Starting Truex Observatory...\n');

  try {
    const emitters = getSortedEmitters();
    const results = [];
    
    for (const emitter of emitters) {
      process.stderr.write(`🚀 [${emitter.name}] Running...\n`);
      try {
        const result = await emitter.run();
        results.push({ name: emitter.name, status: 'success' });
      } catch (error_: any) {
        process.stderr.write(`❌ [${emitter.name}] Failed: ${error_.message}\n`);
        results.push({ name: emitter.name, status: 'failed', error: error_.message });
      }
    }
    
    process.stderr.write('\n✅ Observatory run complete!\n');
    console.log(JSON.stringify({ 
      status: 'complete', 
      summary: results,
      timestamp: new Date().toISOString()
    }, null, 2));
  } catch (error: any) {
    process.stderr.write(`❌ Observatory fatal error: ${error.message}\n`);
    process.exit(1);
  }
}

main();
