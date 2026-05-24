import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  // Idempotent Receiver: Safely handles duplicate messages.
  const idempotentBehavior = (state: any, msg: any) => {
    if (state.processedMessageIds.has(msg.id)) {
      console.log(`Receiver: Ignoring duplicate message ${msg.id}`);
      return { effects: [], nextState: state };
    }
    
    console.log(`Receiver: Processing new message ${msg.id}`);
    const nextProcessed = new Set(state.processedMessageIds);
    nextProcessed.add(msg.id);
    
    return { effects: [], nextState: { ...state, processedMessageIds: nextProcessed, count: state.count + 1 } };
  };

  runtime.processes.set("receiver", createHookProcess("receiver", idempotentBehavior, { processedMessageIds: new Set(), count: 0 }));

  const msg1 = { id: "msg-1", targetProcessId: "receiver", delta: { id: "d1", adds: [], deletes: [] }, payload: 'X' };
  
  dispatchMessage(runtime, msg1 as any);
  // Duplicate delivery
  dispatchMessage(runtime, msg1 as any);
}
run();
