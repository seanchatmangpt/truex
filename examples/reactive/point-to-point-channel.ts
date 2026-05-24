import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess,
} from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

function createStringDelta(id: string, text: string): GraphDelta {
  return {
    id,
    adds: [{ subject: "message", predicate: "contains", object: text, graph: null }],
    deletes: []
  };
}

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const actorBBehavior = (state: any, msg: any) => {
    const text = msg.delta?.adds?.[0]?.object || '';
    console.log(`[Actor B] Received: ${text}`);

    if (typeof text === 'string' && text.includes("Hello")) {
      state.hello += 1;
    }
    if (typeof text === 'string' && text.includes("Goodbye")) {
      state.goodbye += 1;
    }
    
    return { effects: [], nextState: state };
  };

  const actorB = createHookProcess("actor-b", actorBBehavior, { hello: 0, goodbye: 0 });
  runtime.processes.set("actor-b", actorB);

  dispatchMessage(runtime, {
    id: "msg-1",
    targetProcessId: "actor-b",
    delta: createStringDelta("delta-1", "Goodbye, from actor C!")
  });

  dispatchMessage(runtime, {
    id: "msg-2",
    targetProcessId: "actor-b",
    delta: createStringDelta("delta-2", "Hello, from actor A!")
  });

  console.log(`PointToPointChannel: completed.`);
  const ref = runtime.processes.get("actor-b");
  console.log(`[Actor B] Final state:`, ref?.state);
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
