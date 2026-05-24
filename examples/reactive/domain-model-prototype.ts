import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  // Domain Model Prototype: Core domain objects as isolated processes encapsulating business rules.
  const orderBehavior = (state: any, msg: any) => {
    if (msg.type === 'ADD_ITEM') {
      const newTotal = state.total + msg.price;
      console.log(`Order ${state.id}: Added item ${msg.item}. New total: ${newTotal}`);
      return { effects: [], nextState: { ...state, items: [...state.items, msg.item], total: newTotal } };
    }
    if (msg.type === 'CHECKOUT') {
      console.log(`Order ${state.id}: Checking out with total ${state.total}`);
      return { effects: [], nextState: { ...state, status: 'CHECKED_OUT' } };
    }
    return { effects: [], nextState: state };
  };

  runtime.processes.set("order-123", createHookProcess("order-123", orderBehavior, { id: '123', items: [], total: 0, status: 'OPEN' }));

  dispatchMessage(runtime, { id: "msg-1", targetProcessId: "order-123", delta: { id: "d1", adds: [], deletes: [] }, type: 'ADD_ITEM', item: 'Book', price: 15 } as any);
  dispatchMessage(runtime, { id: "msg-2", targetProcessId: "order-123", delta: { id: "d2", adds: [], deletes: [] }, type: 'CHECKOUT' } as any);
}
const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
