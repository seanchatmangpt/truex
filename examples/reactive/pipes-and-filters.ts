import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

function createOrderDelta(id: string, text: string): GraphDelta {
  return {
    id,
    adds: [{ subject: "order", predicate: "content", object: text, graph: null }],
    deletes: []
  };
}

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const omsBehavior = (state: any, msg: any) => {
    const text = msg.delta?.adds?.[0]?.object || '';
    console.log(`[OMS] Processing unique order: ${text}`);
    return { effects: [], nextState: state };
  };
  runtime.processes.set("filter-5", createHookProcess("filter-5", omsBehavior, {}));

  const deduplicatorBehavior = (state: any, msg: any) => {
    const text = msg.delta?.adds?.[0]?.object || '';
    console.log(`[Deduplicator] Processing: ${text}`);
    
    const orderIdMatch = (typeof text === 'string') ? text.match(/id='([^']+)'/) : null;
    const orderId = orderIdMatch ? orderIdMatch[1] : 'unknown';

    if (!state.processed.includes(orderId)) {
      state.processed.push(orderId);
      dispatchMessage(runtime, { ...msg, targetProcessId: "filter-5", id: `msg-${ctx.uuid()}` });
    } else {
      console.log(`[Deduplicator] Found duplicate order: ${orderId}`);
    }
    return { effects: [], nextState: state };
  };
  runtime.processes.set("filter-4", createHookProcess("filter-4", deduplicatorBehavior, { processed: [] }));

  const authenticatorBehavior = (state: any, msg: any) => {
    const text = msg.delta?.adds?.[0]?.object as string || '';
    console.log(`[Authenticator] Processing: ${text}`);
    const newText = text.replace("(certificate)", "");
    dispatchMessage(runtime, {
      id: `msg-${ctx.uuid()}`,
      targetProcessId: "filter-4",
      delta: createOrderDelta(`delta-${ctx.uuid()}`, newText)
    });
    return { effects: [], nextState: state };
  };
  runtime.processes.set("filter-3", createHookProcess("filter-3", authenticatorBehavior, {}));

  const decrypterBehavior = (state: any, msg: any) => {
    const text = msg.delta?.adds?.[0]?.object as string || '';
    console.log(`[Decrypter] Processing: ${text}`);
    const newText = text.replace("(encryption)", "");
    dispatchMessage(runtime, {
      id: `msg-${ctx.uuid()}`,
      targetProcessId: "filter-3",
      delta: createOrderDelta(`delta-${ctx.uuid()}`, newText)
    });
    return { effects: [], nextState: state };
  };
  runtime.processes.set("filter-2", createHookProcess("filter-2", decrypterBehavior, {}));

  const acceptanceBehavior = (state: any, msg: any) => {
    const text = msg.delta?.adds?.[0]?.object as string || '';
    console.log(`[Acceptance] Processing: ${text}`);
    dispatchMessage(runtime, { ...msg, targetProcessId: "filter-2", id: `msg-${ctx.uuid()}` });
    return { effects: [], nextState: state };
  };
  runtime.processes.set("filter-1", createHookProcess("filter-1", acceptanceBehavior, {}));

  const orderText = "(encryption)(certificate)<order id='123'>...</order>";
  const payload = createOrderDelta("initial-delta", orderText);

  dispatchMessage(runtime, { id: "msg-start-1", targetProcessId: "filter-1", delta: payload });
  dispatchMessage(runtime, { id: "msg-start-2", targetProcessId: "filter-1", delta: payload });

  console.log("PipesAndFilters: completed.");
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
