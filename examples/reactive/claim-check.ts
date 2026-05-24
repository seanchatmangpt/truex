import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  // A simulated external data store to hold large payloads
  const dataStore = new Map<string, string>();
  dataStore.set("claim-123", "LARGE PAYLOAD DATA");

  // The receiver retrieves the payload using the claim check reference
  const receiverBehavior = (state: any, msg: any) => {
    if (msg.delta.payload?.type === 'claim_check') {
      const claimId = msg.delta.payload.claimId;
      const data = dataStore.get(claimId);
      console.log(`[Receiver] Retrieved data using claim check ${claimId}: ${data}`);
    }
    return { effects: [], nextState: state };
  };
  
  runtime.processes.set("receiver", createHookProcess("receiver", receiverBehavior, {}));

  // The sender stores the payload and sends a claim check message
  const senderBehavior = (state: any, msg: any) => {
    console.log(`[Sender] Sending claim check message`);
    dispatchMessage(runtime, { 
      id: "msg-1", 
      targetProcessId: "receiver", 
      delta: { 
        id: "d1", 
        adds: [], 
        deletes: [], 
        payload: { type: 'claim_check', claimId: 'claim-123' } 
      } as any
    });
    return { effects: [], nextState: state };
  };

  runtime.processes.set("sender", createHookProcess("sender", senderBehavior, {}));

  // Trigger the simulation
  dispatchMessage(runtime, { id: "start", targetProcessId: "sender", delta: { id: "s1", adds: [], deletes: [] } });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
