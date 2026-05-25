import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/membrane/src/hook-otp.gall.js';

// Message Metadata Pattern: Attaching context separate from payload
export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const auditorBehavior = (state: any, msg: any) => {
    console.log("Audit receipt - msg metadata:", msg.metadata);
    return { effects: [], nextState: state };
  };

  const businessBehavior = (state: any, msg: any) => {
    console.log("Business logic processing payload:", msg.payload);
    // Might also inspect metadata
    if (msg.metadata?.traceId) {
        console.log("Tracing context active:", msg.metadata.traceId);
    }
    return { effects: [], nextState: state };
  };

  runtime.processes.set("auditor", createHookProcess("auditor", auditorBehavior, {}));
  runtime.processes.set("processor", createHookProcess("processor", businessBehavior, {}));

  const message = {
    id: "msg-meta-1",
    targetProcessId: "processor", // Main substrate
    metadata: {
        traceId: "trace-9876",
        sourceSystem: "CRM",
        createdAt: new Date().toISOString()
    },
    payload: { customerId: "CUST-1", action: "UPDATE" },
    delta: { id: "d1", adds: [], deletes: [] }
  };

  // Dispatch to processor
  dispatchMessage(runtime, message);
  
  // Wiretap / Dispatch to auditor
  dispatchMessage(runtime, {
      ...message,
      targetProcessId: "auditor"
  });
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
