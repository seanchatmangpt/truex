import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

function createOrderDelta(id: string, orderId: string): GraphDelta {
  return {
    id,
    adds: [{ subject: `order:${orderId}`, predicate: "status", object: "processing", graph: null }],
    deletes: []
  };
}

async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const orderProcessorBehavior = (state: any, msg: any) => {
    const orderId = msg.delta?.adds?.[0]?.subject?.replace("order:", "") || "unknown";
    console.log(`[OrderProcessor] received order: ${orderId}`);
    return { effects: [], nextState: state };
  };
  runtime.processes.set("order-processor", createHookProcess("order-processor", orderProcessorBehavior, {}));

  const messageLoggerBehavior = (state: any, msg: any) => {
    console.log(`[LOG] WireTap intercepted message: ${msg.id} carrying delta: ${msg.delta?.id}`);
    dispatchMessage(runtime, {
      ...msg,
      id: `msg-fwd-${ctx.uuid()}`,
      targetProcessId: "order-processor",
    });
    return { effects: [], nextState: state };
  };
  runtime.processes.set("wire-tap", createHookProcess("wire-tap", messageLoggerBehavior, {}));

  dispatchMessage(runtime, {
    id: "msg-1",
    targetProcessId: "wire-tap",
    delta: createOrderDelta("delta-1", "123")
  });

  console.log("WireTap: is completed.");
}

run();
