import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';

// Message Expiration Pattern: Dropping messages that exceed a time-to-live
export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const expiringReceiverBehavior = (state: any, msg: any) => {
    const now = Date.now();
    if (msg.expiration && now > msg.expiration) {
        console.warn(`Message ${msg.id} expired! Dropping.`);
        return { effects: [], nextState: state };
    }
    console.log(`Processing valid message ${msg.id}:`, msg.payload);
    return { effects: [], nextState: state };
  };

  runtime.processes.set("receiver", createHookProcess("receiver", expiringReceiverBehavior, {}));

  // Send an expired message
  dispatchMessage(runtime, {
      id: "msg-expired",
      targetProcessId: "receiver",
      expiration: Date.now() - 1000, // Expired 1 second ago
      payload: { data: "too late" },
      delta: { id: "d1", adds: [], deletes: [] }
  });

  // Send a valid message
  dispatchMessage(runtime, {
      id: "msg-valid",
      targetProcessId: "receiver",
      expiration: Date.now() + 5000, // Expires in 5 seconds
      payload: { data: "on time" },
      delta: { id: "d2", adds: [], deletes: [] }
  });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
