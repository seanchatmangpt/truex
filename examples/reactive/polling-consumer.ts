import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  // Polling Consumer: Periodically checks for messages.
  const queueBehavior = (state: any, msg: any) => {
    if (msg.type === 'POLL') {
      const nextMsg = state.messages.length > 0 ? state.messages[0] : null;
      const nextMessages = nextMsg ? state.messages.slice(1) : state.messages;
      return { 
        effects: [{ type: 'send', targetProcessId: msg.replyTo, delta: { id: 'poll-reply', adds: [], deletes: [] }, messageId: 'reply-1', payload: nextMsg }], 
        nextState: { messages: nextMessages } 
      };
    }
    return { effects: [], nextState: state };
  };

  const consumerBehavior = (state: any, msg: any) => {
    if (msg.type === 'START_POLLING') {
      return { effects: [{ type: 'send', targetProcessId: 'queue', delta: { id: 'poll-req', adds: [], deletes: [] }, messageId: 'poll-1', type: 'POLL', replyTo: 'consumer' }], nextState: state };
    }
    if (msg.payload) {
      console.log('Consumer: Processed message:', msg.payload);
      return { effects: [], nextState: state };
    }
    return { effects: [], nextState: state };
  };

  runtime.processes.set("queue", createHookProcess("queue", queueBehavior, { messages: ['item1', 'item2'] }));
  runtime.processes.set("consumer", createHookProcess("consumer", consumerBehavior, {}));

  dispatchMessage(runtime, { id: "start-1", targetProcessId: "consumer", delta: { id: "d1", adds: [], deletes: [] }, type: 'START_POLLING' } as any);
}
run();
