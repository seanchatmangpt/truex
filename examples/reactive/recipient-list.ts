import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/membrane/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/membrane/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  // Setup Recipients
  for (const name of ['R1', 'R2', 'R3']) {
    runtime.processes.set(name, createHookProcess(name, (state, msg) => {
      console.log(`[${name}] Received message: ${msg.id}`);
      return { effects: [], nextState: state };
    }, {}));
  }

  // Determine recipients dynamically based on message contents
  const getRecipientsFor = (msg: any) => {
    return msg.delta.payload?.type === 'alert' ? ['R1', 'R2'] : ['R3'];
  };

  const recipientListBehavior = (state: any, msg: any) => {
    if (msg.delta.payload) {
      const recipients = getRecipientsFor(msg);
      console.log(`[RecipientList] Routing message ${msg.id} to ${recipients.join(', ')}`);
      
      // Dispatch to each recipient in the list
      for (const [idx, rec] of recipients.entries()) {
        dispatchMessage(runtime, { 
          id: `routed-${msg.id}-${idx}`, 
          targetProcessId: rec, 
          delta: msg.delta 
        });
      }
    }
    return { effects: [], nextState: state };
  };
  runtime.processes.set("recipient-list", createHookProcess("recipient-list", recipientListBehavior, {}));

  // Trigger messages through the Recipient List
  dispatchMessage(runtime, { 
    id: "msg-alert", 
    targetProcessId: "recipient-list", 
    delta: { id: "d1", adds: [], deletes: [], payload: { type: 'alert' } } as any 
  });
  
  dispatchMessage(runtime, { 
    id: "msg-info", 
    targetProcessId: "recipient-list", 
    delta: { id: "d2", adds: [], deletes: [], payload: { type: 'info' } } as any 
  });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
