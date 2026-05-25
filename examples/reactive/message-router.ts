import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/membrane/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/membrane/src/runtime-law.js';

function createMessageDelta(id: string, text: string): GraphDelta {
  return {
    id,
    adds: [{ subject: "message", predicate: "content", object: text, graph: null }],
    deletes: []
  };
}

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const processorBehavior = (name: string) => (state: any, msg: any) => {
    const text = msg.delta?.adds?.[0]?.object || '';
    console.log(`[Processor ${name}] received: ${text}`);
    return { effects: [], nextState: state };
  };

  runtime.processes.set("proc-1", createHookProcess("proc-1", processorBehavior("1"), {}));
  runtime.processes.set("proc-2", createHookProcess("proc-2", processorBehavior("2"), {}));

  const alternatingRouterBehavior = (state: any, msg: any) => {
    const text = msg.delta?.adds?.[0]?.object || '';
    
    let targetId: string;
    if (state.alternate === 1) {
      targetId = "proc-1";
      state.alternate = 2;
    } else {
      targetId = "proc-2";
      state.alternate = 1;
    }

    console.log(`[AlternatingRouter] routing "${text}" to ${targetId}`);
    
    dispatchMessage(runtime, {
      id: `msg-${ctx.uuid()}`,
      targetProcessId: targetId,
      delta: msg.delta
    });
    
    return { effects: [], nextState: state };
  };

  runtime.processes.set("router", createHookProcess("router", alternatingRouterBehavior, { alternate: 1 }));

  for (let i = 1; i <= 4; i++) {
    dispatchMessage(runtime, {
      id: `msg-input-${i}`,
      targetProcessId: "router",
      delta: createMessageDelta(`delta-${i}`, `Message #${i}`)
    });
  }

  console.log("MessageRouter: is conserved.");
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
