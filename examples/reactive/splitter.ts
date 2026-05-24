import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta, Quad } from '../../packages/truex-core/src/runtime-law.js';

function createCompositeOrderDelta(id: string, items: Array<{type: string, desc: string}>): GraphDelta {
  const adds: Quad[] = items.map((item, index) => ({
    subject: `item:${index}`,
    predicate: `type:${item.type}`,
    object: item.desc,
    graph: null
  }));
  return { id, adds, deletes: [] };
}

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const itemProcessorBehavior = (type: string) => (state: any, msg: any) => {
    console.log(`[Processor ${type}] handling ${msg.delta?.adds?.[0]?.object}`);
    return { effects: [], nextState: state };
  };

  runtime.processes.set("proc-A", createHookProcess("proc-A", itemProcessorBehavior("TypeA"), {}));
  runtime.processes.set("proc-B", createHookProcess("proc-B", itemProcessorBehavior("TypeB"), {}));
  runtime.processes.set("proc-C", createHookProcess("proc-C", itemProcessorBehavior("TypeC"), {}));

  const splitterBehavior = (state: any, msg: any) => {
    console.log(`[Splitter] splitting order with ${msg.delta?.adds?.length} items`);
    
    for (const quad of msg.delta?.adds || []) {
      const itemType = quad.predicate.replace("type:", "");
      
      let targetId: string | null = null;
      if (itemType === "TypeA") targetId = "proc-A";
      if (itemType === "TypeB") targetId = "proc-B";
      if (itemType === "TypeC") targetId = "proc-C";

      if (targetId) {
        const splitDelta: GraphDelta = {
          id: `split-${ctx.uuid()}`,
          adds: [quad],
          deletes: []
        };
        dispatchMessage(runtime, {
          id: `msg-${ctx.uuid()}`,
          targetProcessId: targetId,
          delta: splitDelta
        });
      }
    }
    return { effects: [], nextState: state };
  };

  runtime.processes.set("splitter", createHookProcess("splitter", splitterBehavior, {}));

  const orderDelta = createCompositeOrderDelta("order-1", [
    { type: "TypeA", desc: "Item A" },
    { type: "TypeB", desc: "Item B" },
    { type: "TypeC", desc: "Item C" }
  ]);

  dispatchMessage(runtime, {
    id: "msg-1",
    targetProcessId: "splitter",
    delta: orderDelta
  });

  console.log("Splitter: is completed.");
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
