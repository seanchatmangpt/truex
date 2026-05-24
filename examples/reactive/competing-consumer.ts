import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

/**
 * Reactive Messaging Pattern: Competing Consumer
 * 
 * Multiple consumers pull from the same channel, but each message is processed
 * by exactly one consumer. We model this as a RoundRobin Router in OTP since
 * each hook process has its own mailbox.
 */

function createWorkDelta(id: string, name: string): GraphDelta {
  return {
    id,
    adds: [{ subject: "work", predicate: "name", object: name, graph: null }],
    deletes: []
  };
}

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const workerBehavior = (id: number) => (state: any, msg: any) => {
    const workName = msg.delta?.adds?.[0]?.object || '';
    console.log(`[Worker-${id}] processed ${workName}`);
    return { effects: [], nextState: state };
  };

  const numWorkers = 5;
  const workerIds: string[] = [];
  for (let i = 1; i <= numWorkers; i++) {
    const wId = `worker-${i}`;
    runtime.processes.set(wId, createHookProcess(wId, workerBehavior(i), {}));
    workerIds.push(wId);
  }

  // The Dispatcher acts as the shared queue allocator
  const dispatcherBehavior = (state: any, msg: any) => {
    const nextWorker = workerIds[state.roundRobinIndex % workerIds.length];
    state.roundRobinIndex++;

    dispatchMessage(runtime, {
      ...msg,
      id: `fwd-${ctx.uuid()}`,
      targetProcessId: nextWorker
    });

    return { effects: [], nextState: state };
  };
  runtime.processes.set("dispatcher", createHookProcess("dispatcher", dispatcherBehavior, { roundRobinIndex: 0 }));

  // Dispatch 15 work items
  for (let i = 1; i <= 15; i++) {
    dispatchMessage(runtime, {
      id: `work-msg-${i}`,
      targetProcessId: "dispatcher",
      delta: createWorkDelta(`delta-${i}`, `WorkItem-${i}`)
    });
  }

  console.log("CompetingConsumer: is conserved.");
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
