import { parentPort } from 'node:worker_threads';
// Import the WASM module directly via relative path
import * as wasm from '../../../../packages/kernel-wasm/pkg/wasm4pm.js';

interface Step {
  fn: string;
  args: any[];
  resultKey?: string;
}

if (parentPort) {
  parentPort.on('message', async (task: { tenantId: string; algorithm: string; payload: any }) => {
    const { tenantId, algorithm, payload } = task;
    const handlesToCleanup: Set<string> = new Set();

    try {
      let finalResult: any;

      if (algorithm === 'workflow') {
        const { steps, returnKey } = payload;
        const context: Record<string, any> = {};

        for (const step of (steps as Step[])) {
          const wasmFunc = (wasm as any)[step.fn];
          if (typeof wasmFunc !== 'function') {
            throw new Error(`Unsupported WASM function: ${step.fn}`);
          }

          // Resolve variables in arguments
          const resolvedArgs = step.args.map(arg => {
            if (typeof arg === 'string' && arg.startsWith('${') && arg.endsWith('}')) {
              const key = arg.slice(2, -1);
              return context[key];
            }
            return arg;
          });

          const res = await wasmFunc(...resolvedArgs);

          // If the function returns a handle string (usually starts with "obj_" or "session_")
          if (typeof res === 'string' && (res.startsWith('obj_') || res.startsWith('sess_'))) {
            handlesToCleanup.add(res);
          }

          if (step.resultKey) {
            context[step.resultKey] = res;
          }
          finalResult = res;
        }

        if (returnKey && returnKey in context) {
          finalResult = context[returnKey];
        }
      } else {
        // Direct function invocation
        const wasmFunc = (wasm as any)[algorithm];
        if (typeof wasmFunc !== 'function') {
          throw new Error(`Unsupported WASM function: ${algorithm}`);
        }

        const args = Array.isArray(payload) ? payload : [payload];
        // Resolve handles in arguments
        const resolvedArgs = args.map(arg => {
          if (typeof arg === 'string' && (arg.startsWith('obj_') || arg.startsWith('sess_'))) {
            handlesToCleanup.add(arg);
          }
          return arg;
        });

        finalResult = await wasmFunc(...resolvedArgs);
      }

      parentPort?.postMessage({ success: true, result: finalResult });
    } catch (error: any) {
      parentPort?.postMessage({ success: false, error: error.message });
    } finally {
      // Automatic memory reclamation safety net
      for (const handle of handlesToCleanup) {
        try {
          wasm.delete_object(handle);
        } catch {
          // Ignore errors during cleanup
        }
      }
    }
  });
}
