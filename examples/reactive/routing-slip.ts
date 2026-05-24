import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

/**
 * Reactive Messaging Pattern: Routing Slip
 * 
 * A Routing Slip attaches the sequence of processing steps to the message itself.
 * Each processor completes its work and forwards the message to the next step
 * defined in the slip.
 */

function createRegistrationDelta(id: string, customerName: string, route: string[]): GraphDelta {
  return {
    id,
    adds: [
      { subject: "customer", predicate: "name", object: customerName, graph: null },
      { subject: "routing", predicate: "slip", object: JSON.stringify({ steps: route, currentStep: 0 }), graph: null }
    ],
    deletes: []
  };
}

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  // Generic Step Processor
  const stepBehavior = (stepName: string) => (state: any, msg: any) => {
    const customer = msg.delta?.adds?.[0]?.object || '';
    const routingStr = msg.delta?.adds?.[1]?.object || '{}';
    const routing = JSON.parse(routingStr);
    
    console.log(`[${stepName}] Processing registration for ${customer}`);
    
    // Advance routing slip
    routing.currentStep += 1;
    
    if (routing.currentStep < routing.steps.length) {
      const nextStep = routing.steps[routing.currentStep];
      console.log(`[${stepName}] Forwarding to next step: ${nextStep}`);
      
      const newDelta: GraphDelta = {
        id: `delta-${ctx.uuid()}`,
        adds: [
          msg.delta.adds[0], // Keep customer data
          { subject: "routing", predicate: "slip", object: JSON.stringify(routing), graph: null }
        ],
        deletes: []
      };
      
      dispatchMessage(runtime, {
        id: `msg-${ctx.uuid()}`,
        targetProcessId: nextStep,
        delta: newDelta
      });
    } else {
      console.log(`[${stepName}] Routing Slip completed for ${customer}`);
    }
    
    return { effects: [], nextState: state };
  };

  runtime.processes.set("create_customer", createHookProcess("create_customer", stepBehavior("create_customer"), {}));
  runtime.processes.set("set_up_contact_info", createHookProcess("set_up_contact_info", stepBehavior("set_up_contact_info"), {}));
  runtime.processes.set("select_service_plan", createHookProcess("select_service_plan", stepBehavior("select_service_plan"), {}));
  runtime.processes.set("check_credit", createHookProcess("check_credit", stepBehavior("check_credit"), {}));

  // Create the routing slip
  const route = ["create_customer", "set_up_contact_info", "select_service_plan", "check_credit"];
  
  dispatchMessage(runtime, {
    id: "msg-start",
    targetProcessId: route[0],
    delta: createRegistrationDelta("reg-1", "ABC, Inc.", route)
  });

  console.log("RoutingSlip: is completed.");
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
