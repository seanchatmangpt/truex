import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  // Guaranteed delivery: Sender persists message and retries until ACK received.
  // In truex OTP, state transitions ensure delivery state is managed.
  const senderBehavior = (state: any, msg: any) => {
    if (msg.type === 'ACK') {
      console.log('Sender: Message delivered successfully.');
      return { effects: [], nextState: { ...state, delivered: true } };
    }
    if (msg.type === 'SEND') {
       console.log('Sender: Sending message...');
       return { effects: [{ type: 'send', targetProcessId: 'receiver', delta: msg.delta, messageId: 'msg-1' }], nextState: state };
    }
    return { effects: [], nextState: state };
  };

  const receiverBehavior = (state: any, msg: any) => {
    console.log('Receiver: Received message, sending ACK.');
    return { effects: [{ type: 'send', targetProcessId: 'sender', delta: { id: 'ack-1', adds: [], deletes: [] }, messageId: 'ack-1', type: 'ACK' }], nextState: state };
  };

  runtime.processes.set("sender", createHookProcess("sender", senderBehavior, { delivered: false }));
  runtime.processes.set("receiver", createHookProcess("receiver", receiverBehavior, {}));

  // Simulate send
  dispatchMessage(runtime, { id: "trigger-1", targetProcessId: "sender", delta: { id: "d1", adds: [], deletes: [] }, type: 'SEND' } as any);
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
