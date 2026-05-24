import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const finalConsumerBehavior = (state: any, msg: any) => {
    console.log(`[FinalConsumer] Received filtered message: ${msg.id}`);
    return { effects: [], nextState: state };
  };
  runtime.processes.set("consumer", createHookProcess("consumer", finalConsumerBehavior, {}));

  const filterBehavior = (state: any, msg: any) => {
    if (msg.delta.payload?.isValid) {
      console.log(`[Filter] Passing valid message: ${msg.id}`);
      dispatchMessage(runtime, { 
        id: `filtered-${msg.id}`, 
        targetProcessId: "consumer", 
        delta: msg.delta 
      });
    } else {
      console.log(`[Filter] Dropping invalid message: ${msg.id}`);
    }
    return { effects: [], nextState: state };
  };
  runtime.processes.set("filter", createHookProcess("filter", filterBehavior, {}));

  dispatchMessage(runtime, { 
    id: "msg-valid", 
    targetProcessId: "filter", 
    delta: { id: "d1", adds: [], deletes: [], payload: { isValid: true } } as any 
  });
  
  dispatchMessage(runtime, { 
    id: "msg-invalid", 
    targetProcessId: "filter", 
    delta: { id: "d2", adds: [], deletes: [], payload: { isValid: false } } as any 
  });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
