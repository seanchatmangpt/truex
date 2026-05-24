import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const proxyBehavior = (state: any, msg: any) => {
    const nextCount = state.messagesIntercepted + 1;
    console.log(`[SmartProxy] Hooked message: ${msg.id}. Total handled: ${nextCount}`);
    
    // Potential cross-cutting concerns like logging, auth, metric tracking
    console.log(`[SmartProxy] Metrics updated. Delegating to substrate process: ${state.targetId}`);
    
    return { effects: [], nextState: { ...state, messagesIntercepted: nextCount } };
  };

  const actualServiceBehavior = (state: any, msg: any) => {
    console.log(`[ActualService] Executing core business logic.`);
    return { effects: [], nextState: state };
  };

  runtime.processes.set("actual-service", createHookProcess("actual-service", actualServiceBehavior, {}));
  runtime.processes.set("smart-membrane", createHookProcess("smart-membrane", proxyBehavior, { 
    targetId: "actual-service", 
    messagesIntercepted: 0 
  }));

  dispatchMessage(runtime, { 
    id: "msg-membrane-1", 
    targetProcessId: "smart-membrane", 
    delta: { id: "d1", adds: [], deletes: [] } 
  });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
