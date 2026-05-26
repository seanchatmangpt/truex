import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/membrane/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/membrane/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const enricherBehavior = (state: any, msg: any) => {
    console.log(`[ContentEnricher] Received sparse message: ${msg.id}`);
    
    const baseData = msg.delta.adds[0];
    const enrichedData = `${baseData.subject}:${baseData.predicate}:${baseData.object} + ENRICHED_WITH_(${state.enrichmentData})`;
    
    console.log(`[ContentEnricher] Hydrated payload: ${enrichedData}`);
    console.log(`[ContentEnricher] Forwarding enriched payload to: ${state.targetId}`);
    
    return { effects: [], nextState: state };
  };

  const targetBehavior = (state: any, msg: any) => {
    console.log(`[EnrichedTarget] Processing comprehensive message.`);
    return { effects: [], nextState: state };
  };

  runtime.processes.set("enriched-substrate", createHookProcess("enriched-substrate", targetBehavior, {}));
  runtime.processes.set("content-enricher", createHookProcess("content-enricher", enricherBehavior, { 
    targetId: "enriched-substrate", 
    enrichmentData: "DATABASE_USER_RECORD" 
  }));

  dispatchMessage(runtime, { 
    id: "msg-sparse-1", 
    targetProcessId: "content-enricher", 
    delta: { 
      id: "d1", 
      adds: [{ subject: "user", predicate: "id", object: "12345", graph: null }], 
      deletes: [] 
    } 
  });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
