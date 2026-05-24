import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

function createRequestDelta(id: string, what: string): GraphDelta {
  return {
    id,
    adds: [{ subject: "attempt", predicate: "what", object: what, graph: null }],
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

  const serverBehavior = (state: any, msg: any) => {
    const what = msg.delta?.adds?.[0]?.object || 'unknown';
    console.log(`[Server] received attempt: ${what}`);
    
    if (msg.senderId && msg.senderId !== 'system') {
      dispatchMessage(runtime, {
        id: `reply-${ctx.uuid()}`,
        senderId: msg.targetProcessId,
        targetProcessId: msg.senderId,
        delta: createReplyDelta(`delta-${ctx.uuid()}`, `RESP-1 for ${what}`)
      });
    }
    return { effects: [], nextState: state };
  };
  runtime.processes.set("server", createHookProcess("server", serverBehavior, {}));

  const clientBehavior = (state: any, msg: any) => {
    const isReply = msg.delta?.adds?.[0]?.subject === "reply";
    
    if (!isReply) {
      console.log(`[Client] starting... sending attempt`);
      const targetServerId = msg.delta?.adds?.[0]?.object as string;
      dispatchMessage(runtime, {
        id: `req-${ctx.uuid()}`,
        senderId: msg.targetProcessId, // Client is sender
        targetProcessId: targetServerId,
        delta: createRequestDelta(`delta-${ctx.uuid()}`, "REQ-1")
      });
    } else {
      const response = msg.delta?.adds?.[0]?.object || '';
      console.log(`[Client] received response: ${response}`);
    }
    return { effects: [], nextState: state };
  };
  runtime.processes.set("client", createHookProcess("client", clientBehavior, {}));

  dispatchMessage(runtime, {
    id: "trigger-1",
    targetProcessId: "client",
    delta: {
      id: "delta-trigger",
      adds: [{ subject: "command", predicate: "start", object: "server", graph: null }],
      deletes: []
    }
  });

  console.log("RequestReply: is conserved.");
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
