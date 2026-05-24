import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const bridgeBehavior = (state: any, msg: any) => {
    console.log(`[MessagingBridge] Received message from Domain A: ${msg.id}`);
    console.log(`[MessagingBridge] Translating message format for Domain B...`);
    console.log(`[MessagingBridge] Forwarding translated message to target: ${state.targetId}`);
    return { effects: [], nextState: state };
  };

  const domainBBehavior = (state: any, msg: any) => {
    console.log(`[DomainBService] Processing translated message.`);
    return { effects: [], nextState: state };
  };

  runtime.processes.set("domain-b-service", createHookProcess("domain-b-service", domainBBehavior, {}));
  runtime.processes.set("bridge-actor", createHookProcess("bridge-actor", bridgeBehavior, { targetId: "domain-b-service" }));

  dispatchMessage(runtime, { 
    id: "msg-domain-a-1", 
    targetProcessId: "bridge-actor", 
    delta: { id: "d1", adds: ["foreign_domain_event"], deletes: [] } 
  });
}
run();