import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

async function run() {
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
run();
