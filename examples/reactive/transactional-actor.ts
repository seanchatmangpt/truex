import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const transactionalBehavior = (state: any, msg: any) => {
    console.log(`[TransactionalActor] Processing message: ${msg.id}`);
    
    // Pattern: Event Sourcing / Transactional state mutation
    const newEvent = { msgId: msg.id, action: msg.delta.adds[0], timestamp: Date.now() };
    const newHistory = [...state.history, newEvent];
    
    console.log(`[TransactionalActor] Persisting event... New history length: ${newHistory.length}`);
    return { effects: [], nextState: { ...state, history: newHistory } };
  };

  runtime.processes.set("tx-actor", createHookProcess("tx-actor", transactionalBehavior, { history: [] }));

  dispatchMessage(runtime, { 
    id: "msg-tx-1", 
    targetProcessId: "tx-actor", 
    delta: { id: "d1", adds: ["deposit_100"], deletes: [] } 
  });
}
run();