import { createDeterministicContext } from '../../packages/truex-core/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

function createRfqDelta(id: string, rfqId: string, itemsCount: number): GraphDelta {
  return {
    id,
    adds: [{ subject: `rfq:${rfqId}`, predicate: "itemsCount", object: itemsCount.toString(), graph: null }],
    deletes: []
  };
}

function createQuoteDelta(id: string, rfqId: string, quoterId: string, price: number): GraphDelta {
  return {
    id,
    adds: [{ subject: `rfq:${rfqId}`, predicate: `quoteFrom:${quoterId}`, object: price.toString(), graph: null }],
    deletes: []
  };
}

async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  // The Aggregator collects quotes until all are received for an RFQ
  const aggregatorBehavior = (state: any, msg: any) => {
    // Initialize state for tracking RFQs
    if (!state.quotes) state.quotes = {};
    if (!state.expected) state.expected = {};

    const isRfqStart = msg.delta?.adds?.[0]?.predicate === "itemsCount";
    if (isRfqStart) {
      const rfqId = msg.delta.adds[0]?.subject.replace("rfq:", "") || "unknown";
      const expectedCount = parseInt(msg.delta.adds[0]?.object as string || "0");
      state.expected[rfqId] = expectedCount;
      state.quotes[rfqId] = [];
      console.log(`[Aggregator] initialized RFQ ${rfqId}, expecting ${expectedCount} quotes`);
    } else {
      const subject = msg.delta?.adds?.[0]?.subject || "";
      const rfqId = subject.replace("rfq:", "");
      const price = parseFloat(msg.delta?.adds?.[0]?.object as string || "0");
      const quoter = msg.delta?.adds?.[0]?.predicate.replace("quoteFrom:", "") || "unknown";
      
      if (state.quotes[rfqId]) {
        state.quotes[rfqId].push({ quoter, price });
        console.log(`[Aggregator] received quote for RFQ ${rfqId} from ${quoter}: $${price}`);

        if (state.quotes[rfqId].length >= state.expected[rfqId]) {
          console.log(`[Aggregator] FULFILLED RFQ ${rfqId}. Quotes:`, state.quotes[rfqId]);
        }
      }
    }
    
    return { effects: [], nextState: state };
  };
  runtime.processes.set("aggregator", createHookProcess("aggregator", aggregatorBehavior, {}));

  // The Order Processor Scatters the requests
  const orderProcessorBehavior = (aggregatorId: string, quoters: string[]) => (state: any, msg: any) => {
    const rfqId = msg.delta?.adds?.[0]?.subject.replace("rfq:", "") || "unknown";
    const itemsCount = parseInt(msg.delta?.adds?.[0]?.object as string || "0");
    
    console.log(`[OrderProcessor] Scattering RFQ ${rfqId} for ${itemsCount} items to ${quoters.length} quoters`);
    
    // Notify aggregator of expected count
    dispatchMessage(runtime, {
      id: `notify-agg-${ctx.uuid()}`,
      targetProcessId: aggregatorId,
      delta: msg.delta // Just pass the RFQ init delta
    });

    // Scatter to all quoters
    for (const quoter of quoters) {
      for (let i = 0; i < itemsCount; i++) {
        dispatchMessage(runtime, {
          id: `req-quote-${ctx.uuid()}`,
          senderId: msg.targetProcessId,
          targetProcessId: quoter,
          delta: {
            id: `req-${ctx.uuid()}`,
            adds: [{ subject: `rfq:${rfqId}`, predicate: "requestItem", object: `item-${i}`, graph: null }],
            deletes: []
          }
        });
      }
    }

    return { effects: [], nextState: state };
  };

  const quoterBehavior = (name: string, discount: number) => (state: any, msg: any) => {
    const rfqId = msg.delta?.adds?.[0]?.subject.replace("rfq:", "") || "unknown";
    const basePrice = 100;
    const price = basePrice * (1 - discount);
    
    dispatchMessage(runtime, {
      id: `reply-${ctx.uuid()}`,
      targetProcessId: "aggregator",
      delta: createQuoteDelta(`quote-${ctx.uuid()}`, rfqId, name, price)
    });

    return { effects: [], nextState: state };
  };

  runtime.processes.set("quoter-budget", createHookProcess("quoter-budget", quoterBehavior("BudgetHikers", 0.05), {}));
  runtime.processes.set("quoter-sierra", createHookProcess("quoter-sierra", quoterBehavior("HighSierra", 0.02), {}));

  runtime.processes.set("order-processor", createHookProcess("order-processor", orderProcessorBehavior("aggregator", ["quoter-budget", "quoter-sierra"]), {}));

  // Trigger a request for quotation
  dispatchMessage(runtime, {
    id: "trigger",
    targetProcessId: "order-processor",
    delta: createRfqDelta("initial-rfq", "123", 2) // RFQ 123 for 2 items
  });

  console.log("ScatterGather: is completed.");
}

run();