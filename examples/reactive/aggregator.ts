import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  // Aggregator: Combines multiple messages into a single message.
  const aggregatorBehavior = (state: any, msg: any) => {
    if (msg.type === 'PART') {
      const newParts = [...state.parts, msg.payload];
      console.log('Aggregator: Received part', msg.payload);
      if (newParts.length === state.expectedCount) {
        console.log('Aggregator: All parts received, assembling:', newParts);
        return { 
          effects: [{ type: 'send', targetProcessId: state.replyTo, delta: { id: 'agg-done', adds: [], deletes: [] }, messageId: 'agg-1', payload: newParts }], 
          nextState: { ...state, parts: [], complete: true } 
        };
      }
      return { effects: [], nextState: { ...state, parts: newParts } };
    }
    return { effects: [], nextState: state };
  };

  runtime.processes.set("aggregator", createHookProcess("aggregator", aggregatorBehavior, { parts: [], expectedCount: 3, replyTo: 'consumer' }));

  dispatchMessage(runtime, { id: "msg-1", targetProcessId: "aggregator", delta: { id: "d1", adds: [], deletes: [] }, type: 'PART', payload: 'A' } as any);
  dispatchMessage(runtime, { id: "msg-2", targetProcessId: "aggregator", delta: { id: "d2", adds: [], deletes: [] }, type: 'PART', payload: 'B' } as any);
  dispatchMessage(runtime, { id: "msg-3", targetProcessId: "aggregator", delta: { id: "d3", adds: [], deletes: [] }, type: 'PART', payload: 'C' } as any);
}
run();
