import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/membrane/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/membrane/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const busBehavior = (state: any, msg: any) => {
    console.log(`[MessageBus] Received message: ${msg.id}`);
    console.log(`[MessageBus] Routing to subscribers: ${state.subscribers.join(', ')}`);
    // In a full implementation, this would yield effects to dispatch to subscribers.
    return { effects: [], nextState: state };
  };

  const subscriberBehavior = (state: any, msg: any) => {
    console.log(`[${state.name}] Received broadcast message.`);
    return { effects: [], nextState: state };
  };

  runtime.processes.set("message-bus", createHookProcess("message-bus", busBehavior, { subscribers: ["sub-1", "sub-2"] }));
  runtime.processes.set("sub-1", createHookProcess("sub-1", subscriberBehavior, { name: "Subscriber 1" }));
  runtime.processes.set("sub-2", createHookProcess("sub-2", subscriberBehavior, { name: "Subscriber 2" }));

  dispatchMessage(runtime, { 
    id: "msg-bus-1", 
    targetProcessId: "message-bus", 
    delta: { id: "d1", adds: [], deletes: [] } 
  });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
