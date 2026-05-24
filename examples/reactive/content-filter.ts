import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';

// Content Filter Pattern: Removing unnecessary data before passing along
async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const downstreamBehavior = (state: any, msg: any) => {
    console.log("Downstream received clean message:", msg.payload);
    return { effects: [], nextState: state };
  };
  
  const filterBehavior = (state: any, msg: any) => {
    console.log("Filter received raw message:", msg.payload);
    // Remove sensitive or unnecessary fields
    const { sensitiveData, extraStuff, ...cleanPayload } = msg.payload;
    
    // Forward the clean payload
    dispatchMessage(runtime, {
        id: `fwd-${msg.id}`,
        targetProcessId: "downstream",
        payload: cleanPayload,
        delta: { id: "d2", adds: [], deletes: [] }
    });
    
    return { effects: [], nextState: state };
  };

  runtime.processes.set("downstream", createHookProcess("downstream", downstreamBehavior, {}));
  runtime.processes.set("filter", createHookProcess("filter", filterBehavior, {}));

  const rawMessage = {
    id: "raw-1",
    targetProcessId: "filter",
    payload: { publicData: "ok", sensitiveData: "secret", extraStuff: "junk" },
    delta: { id: "d1", adds: [], deletes: [] }
  };

  dispatchMessage(runtime, rawMessage);
}
run();
