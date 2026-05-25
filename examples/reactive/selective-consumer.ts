import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/membrane/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/membrane/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const selectiveConsumerBehavior = (state: any, msg: any) => {
    const priority = msg.delta.payload?.priority;
    
    // Selectively process based on message content
    if (priority === 'high') {
      console.log(`[SelectiveConsumer] Processing high priority message: ${msg.id}`);
    } else {
      console.log(`[SelectiveConsumer] Ignoring message: ${msg.id} (priority: ${priority})`);
    }
    
    return { effects: [], nextState: state };
  };
  runtime.processes.set("consumer", createHookProcess("consumer", selectiveConsumerBehavior, {}));

  // Dispatch multiple messages with different priorities
  dispatchMessage(runtime, { 
    id: "msg-low", 
    targetProcessId: "consumer", 
    delta: { id: "d1", adds: [], deletes: [], payload: { priority: 'low' } } as any 
  });
  
  dispatchMessage(runtime, { 
    id: "msg-high", 
    targetProcessId: "consumer", 
    delta: { id: "d2", adds: [], deletes: [], payload: { priority: 'high' } } as any 
  });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
