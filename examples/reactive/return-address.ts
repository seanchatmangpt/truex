import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

function createComplexRequestDelta(id: string, what: string): GraphDelta {
  return {
    id,
    adds: [{ subject: "requestComplex", predicate: "what", object: what, graph: null }],
    deletes: []
  };
}

function createReplyDelta(id: string, response: string): GraphDelta {
  return {
    id,
    adds: [{ subject: "reply", predicate: "response", object: response, graph: null }],
    deletes: []
  };
}

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const workerBehavior = (state: any, msg: any) => {
    const what = msg.delta?.adds?.[0]?.object || 'unknown';
    console.log(`[Worker] received complex request: ${what}`);
    
    // Reply directly to the original sender (Return Address)
    if (msg.senderId && msg.senderId !== 'system') {
      dispatchMessage(runtime, {
        id: `reply-${ctx.uuid()}`,
        senderId: msg.targetProcessId,
        targetProcessId: msg.senderId,
        delta: createReplyDelta(`delta-${ctx.uuid()}`, `RESP-COMPLEX for ${what}`)
      });
    }
    return { effects: [], nextState: state };
  };
  runtime.processes.set("worker", createHookProcess("worker", workerBehavior, {}));

  const serverBehavior = (state: any, msg: any) => {
    const what = msg.delta?.adds?.[0]?.object || 'unknown';
    console.log(`[Server] received complex request, forwarding to worker...`);
    
    // Forward to worker, PRESERVING the original senderId (the return address)
    dispatchMessage(runtime, {
      id: `fwd-${ctx.uuid()}`,
      senderId: msg.senderId, // Keep original sender
      targetProcessId: "worker",
      delta: msg.delta
    });
    
    return { effects: [], nextState: state };
  };
  runtime.processes.set("server", createHookProcess("server", serverBehavior, {}));

  const clientBehavior = (state: any, msg: any) => {
    const isReply = msg.delta?.adds?.[0]?.subject === "reply";
    
    if (!isReply) {
      console.log(`[Client] starting... sending complex request`);
      dispatchMessage(runtime, {
        id: `req-${ctx.uuid()}`,
        senderId: msg.targetProcessId,
        targetProcessId: "server",
        delta: createComplexRequestDelta(`delta-${ctx.uuid()}`, "REQ-20")
      });
    } else {
      const response = msg.delta?.adds?.[0]?.object || '';
      console.log(`[Client] received reply: ${response}`);
    }
    return { effects: [], nextState: state };
  };
  runtime.processes.set("client", createHookProcess("client", clientBehavior, {}));

  dispatchMessage(runtime, {
    id: "trigger",
    targetProcessId: "client",
    delta: { id: "start", adds: [], deletes: [] }
  });

  console.log("ReturnAddress: is completed.");
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
