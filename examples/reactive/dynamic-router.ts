import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  // Setup multiple destinations
  runtime.processes.set("destA", createHookProcess("destA", (state, msg) => {
    console.log(`[DestA] Received message: ${msg.id}`);
    return { effects: [], nextState: state };
  }, {}));
  
  runtime.processes.set("destB", createHookProcess("destB", (state, msg) => {
    console.log(`[DestB] Received message: ${msg.id}`);
    return { effects: [], nextState: state };
  }, {}));

  // Dynamic Routing Logic
  const routingRules = (msg: any) => {
    return msg.delta.payload?.routeTo === 'A' ? 'destA' : 'destB';
  };

  const routerBehavior = (state: any, msg: any) => {
    if (msg.delta.payload) {
      const substrate = routingRules(msg);
      console.log(`[Router] Routing message ${msg.id} to ${substrate}`);
      
      // Route message dynamically to the chosen substrate
      dispatchMessage(runtime, { 
        id: `routed-${msg.id}`, 
        targetProcessId: substrate, 
        delta: msg.delta 
      });
    }
    return { effects: [], nextState: state };
  };
  runtime.processes.set("router", createHookProcess("router", routerBehavior, {}));

  // Dispatch initial messages to the router
  dispatchMessage(runtime, { 
    id: "msg-1", 
    targetProcessId: "router", 
    delta: { id: "d1", adds: [], deletes: [], payload: { routeTo: 'A' } } as any 
  });
  
  dispatchMessage(runtime, { 
    id: "msg-2", 
    targetProcessId: "router", 
    delta: { id: "d2", adds: [], deletes: [], payload: { routeTo: 'B' } } as any 
  });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
