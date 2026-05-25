import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/membrane/src/hook-otp.gall.js';

// Envelope Wrapper Pattern: Wrapping payload inside an envelope structure
export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const receiverBehavior = (state: any, msg: any) => {
    // msg is the envelope
    console.log("Received Envelope Header:", msg.header);
    console.log("Extracted Payload:", msg.payload);
    return { effects: [], nextState: state };
  };
  
  runtime.processes.set("receiver", createHookProcess("receiver", receiverBehavior, {}));

  const envelope = {
    id: "env-1",
    targetProcessId: "receiver",
    header: { timestamp: Date.now(), priority: "high" },
    payload: { action: "DO_WORK", data: { foo: "bar" } },
    delta: { id: "d1", adds: [], deletes: [] }
  };

  dispatchMessage(runtime, envelope);
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
