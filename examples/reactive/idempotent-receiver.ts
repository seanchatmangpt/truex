import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/membrane/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/membrane/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  // Idempotent Receiver: Safely handles duplicate messages.
  const idempotentBehavior = (state: any, msg: any) => {
    if (state.processedMessageIds.includes(msg.id)) {
      console.log(`Receiver: Ignoring duplicate message ${msg.id}`);
      return { effects: [], nextState: state };
    }
    
    console.log(`Receiver: Processing new message ${msg.id}`);
    const nextProcessed = [...state.processedMessageIds, msg.id];
    
    return { effects: [], nextState: { ...state, processedMessageIds: nextProcessed, count: state.count + 1 } };
  };

  runtime.processes.set("receiver", createHookProcess("receiver", idempotentBehavior, { processedMessageIds: [], count: 0 }));

  const msg1 = { id: "msg-1", targetProcessId: "receiver", delta: { id: "d1", adds: [], deletes: [] }, payload: 'X' };
  
  dispatchMessage(runtime, msg1 as any);
  // Duplicate delivery
  dispatchMessage(runtime, msg1 as any);
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
