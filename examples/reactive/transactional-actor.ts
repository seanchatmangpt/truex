import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/membrane/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/membrane/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const transactionalBehavior = (state: any, msg: any) => {
    console.log(`[TransactionalActor] Processing message: ${msg.id}`);
    
    // Pattern: Event Sourcing / Transactional state mutation
    const newEvent = { msgId: msg.id, action: msg.delta.adds[0].object, timestamp: Date.now() };
    const newHistory = [...state.history, newEvent];
    
    console.log(`[TransactionalActor] Persisting event... New history length: ${newHistory.length}`);
    return { effects: [], nextState: { ...state, history: newHistory } };
  };

  runtime.processes.set("tx-actor", createHookProcess("tx-actor", transactionalBehavior, { history: [] }));

  dispatchMessage(runtime, { 
    id: "msg-tx-1", 
    targetProcessId: "tx-actor", 
    delta: { id: "d1", adds: [{ subject: "tx", predicate: "action", object: "deposit_100" }], deletes: [] } 
  });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
