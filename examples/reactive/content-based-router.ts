import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/membrane/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/membrane/src/runtime-law.js';

function createOrderDelta(id: string, orderType: string, content: string): GraphDelta {
  return {
    id,
    adds: [
      { subject: "order", predicate: "type", object: orderType, graph: null },
      { subject: "order", predicate: "content", object: content, graph: null }
    ],
    deletes: []
  };
}

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const inventorySystemABehavior = (state: any, msg: any) => {
    console.log(`[InventorySystemA] handling ${msg.delta?.adds?.[1]?.object}`);
    return { effects: [], nextState: state };
  };
  runtime.processes.set("inv-A", createHookProcess("inv-A", inventorySystemABehavior, {}));

  const inventorySystemXBehavior = (state: any, msg: any) => {
    console.log(`[InventorySystemX] handling ${msg.delta?.adds?.[1]?.object}`);
    return { effects: [], nextState: state };
  };
  runtime.processes.set("inv-X", createHookProcess("inv-X", inventorySystemXBehavior, {}));

  const orderRouterBehavior = (state: any, msg: any) => {
    const orderType = msg.delta?.adds?.[0]?.object || '';
    
    if (orderType === "TypeABC") {
      console.log(`[OrderRouter] routing to A`);
      dispatchMessage(runtime, { ...msg, id: `msg-${ctx.uuid()}`, targetProcessId: "inv-A" });
    } else if (orderType === "TypeXYZ") {
      console.log(`[OrderRouter] routing to X`);
      dispatchMessage(runtime, { ...msg, id: `msg-${ctx.uuid()}`, targetProcessId: "inv-X" });
    } else {
      console.log(`[OrderRouter] unknown type`);
    }
    return { effects: [], nextState: state };
  };
  runtime.processes.set("order-router", createHookProcess("order-router", orderRouterBehavior, {}));

  dispatchMessage(runtime, {
    id: "msg-1",
    targetProcessId: "order-router",
    delta: createOrderDelta("delta-1", "TypeABC", "Order Items for A")
  });

  dispatchMessage(runtime, {
    id: "msg-2",
    targetProcessId: "order-router",
    delta: createOrderDelta("delta-2", "TypeXYZ", "Order Items for X")
  });

  console.log("ContentBasedRouter: is conserved.");
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
