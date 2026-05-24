import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

/**
 * Reactive Messaging Pattern: Resequencer
 * 
 * Collects out-of-sequence messages and publishes them in the correct sequence.
 */

function createSequenceDelta(id: string, correlationId: string, index: number, total: number): GraphDelta {
  return {
    id,
    adds: [
      { subject: `seq:${correlationId}`, predicate: "index", object: index.toString(), graph: null },
      { subject: `seq:${correlationId}`, predicate: "total", object: total.toString(), graph: null }
    ],
    deletes: []
  };
}

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const consumerBehavior = (state: any, msg: any) => {
    const index = msg.delta?.adds?.[0]?.object;
    const correlationId = msg.delta?.adds?.[0]?.subject?.replace("seq:", "");
    console.log(`[SequencedConsumer] Received perfectly ordered message: ${correlationId} #${index}`);
    return { effects: [], nextState: state };
  };
  runtime.processes.set("consumer", createHookProcess("consumer", consumerBehavior, {}));

  const resequencerBehavior = (state: any, msg: any) => {
    const index = Number.parseInt(msg.delta?.adds?.[0]?.object || "0");
    const correlationId = msg.delta?.adds?.[0]?.subject?.replace("seq:", "") || "unknown";
    const total = Number.parseInt(msg.delta?.adds?.[1]?.object || "0");

    console.log(`[Resequencer] Received out-of-order message: ${correlationId} #${index}`);

    if (!state.buffer) state.buffer = {};
    if (!state.expectedIndex) state.expectedIndex = {};

    if (!state.buffer[correlationId]) {
      state.buffer[correlationId] = [];
      state.expectedIndex[correlationId] = 1;
    }

    // Buffer the message
    state.buffer[correlationId].push({ index, delta: msg.delta });
    
    // Sort just to be safe, or just pull expected
    state.buffer[correlationId].sort((a: any, b: any) => a.index - b.index);

    // Drain buffer if we have the expected index
    while (state.buffer[correlationId].length > 0 && state.buffer[correlationId][0].index === state.expectedIndex[correlationId]) {
      const dispatchable = state.buffer[correlationId].shift();
      
      dispatchMessage(runtime, {
        id: `fwd-${ctx.uuid()}`,
        targetProcessId: "consumer",
        delta: dispatchable.delta
      });
      
      state.expectedIndex[correlationId]++;
    }

    if (state.expectedIndex[correlationId] > total) {
      console.log(`[Resequencer] Conserved sequence for ${correlationId}`);
      delete state.buffer[correlationId];
    }

    return { effects: [], nextState: state };
  };
  runtime.processes.set("resequencer", createHookProcess("resequencer", resequencerBehavior, {}));

  // Send messages out of order
  const messages = [
    { idx: 3, id: "ABC" },
    { idx: 1, id: "ABC" },
    { idx: 4, id: "ABC" },
    { idx: 2, id: "ABC" },
    { idx: 5, id: "ABC" }
  ];

  for (const m of messages) {
    dispatchMessage(runtime, {
      id: `msg-${m.idx}`,
      targetProcessId: "resequencer",
      delta: createSequenceDelta(`delta-${m.idx}`, m.id, m.idx, 5)
    });
  }

  console.log("Resequencer: is conserved.");
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
