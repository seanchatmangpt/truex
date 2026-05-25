import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/membrane/src/hook-otp.gall.js';

// Datatype Channel Pattern: Specific channels for specific datatypes
export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const orderChannel = (state: any, msg: any) => {
    console.log("Order Channel processing order:", msg.payload);
    return { effects: [], nextState: state };
  };
  
  const invoiceChannel = (state: any, msg: any) => {
    console.log("Invoice Channel processing invoice:", msg.payload);
    return { effects: [], nextState: state };
  };

  runtime.processes.set("channel:orders", createHookProcess("channel:orders", orderChannel, {}));
  runtime.processes.set("channel:invoices", createHookProcess("channel:invoices", invoiceChannel, {}));

  // Sender routes messages to specific channels based on data type
  const sendDocument = (doc: any) => {
      const targetChannel = `channel:${doc.type}s`; // type: 'order' -> 'channel:orders'
      dispatchMessage(runtime, {
          id: `msg-${Math.random()}`,
          targetProcessId: targetChannel,
          payload: doc,
          delta: { id: "d-doc", adds: [], deletes: [] }
      });
  };

  sendDocument({ type: "order", id: "123", amount: 100 });
  sendDocument({ type: "invoice", id: "inv-456", total: 100 });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
