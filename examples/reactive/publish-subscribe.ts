import { fileURLToPath } from 'node:url';
import { createDeterministicContext, type TruexContext } from '../../packages/truex-core/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess,
  type HookMessage,
  type HookOtpRuntime
} from '../../packages/truex-core/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/truex-core/src/runtime-law.js';

function createQuoteDelta(id: string, market: string, symbol: string, price: string): GraphDelta {
  return {
    id,
    adds: [{ subject: `quote:${symbol}`, predicate: `market:${market}`, object: price, graph: null }],
    deletes: []
  };
}

class EventBus {
  private subscribers: Array<{ filter: string, actor: string }> = [];
  constructor(private runtime: HookOtpRuntime) {}
  subscribe(actor: string, filter: string) {
    this.subscribers.push({ filter, actor });
  }
  publish(ctx: TruexContext, msg: HookMessage) {
    const market = msg.delta?.adds?.[0]?.predicate?.replace("market:", "") || "";
    for (const sub of this.subscribers) {
      if (market.startsWith(sub.filter)) {
        dispatchMessage(this.runtime, {
          ...msg,
          id: `msg-${ctx.uuid()}`,
          targetProcessId: sub.actor
        });
      }
    }
  }
}

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);
  const bus = new EventBus(runtime);

  const subscriberBehavior = (name: string) => (state: any, msg: any) => {
    const price = msg.delta?.adds?.[0]?.object || 0;
    const symbol = msg.delta?.adds?.[0]?.subject?.replace("quote:", "");
    console.log(`[${name}] received: ${symbol} @ ${price}`);
    return { effects: [], nextState: state };
  };

  runtime.processes.set("all-sub", createHookProcess("all-sub", subscriberBehavior("AllMarketsSubscriber"), {}));
  runtime.processes.set("nasdaq-sub", createHookProcess("nasdaq-sub", subscriberBehavior("NASDAQSubscriber"), {}));
  runtime.processes.set("nyse-sub", createHookProcess("nyse-sub", subscriberBehavior("NYSESubscriber"), {}));

  bus.subscribe("all-sub", "quotes");
  bus.subscribe("nasdaq-sub", "quotes/NASDAQ");
  bus.subscribe("nyse-sub", "quotes/NYSE");

  const quotes = [
    { mkt: "quotes/NYSE", sym: "ORCL", p: "37.84" },
    { mkt: "quotes/NASDAQ", sym: "MSFT", p: "37.16" },
    { mkt: "quotes/DAX", sym: "SAP:GR", p: "61.95" },
    { mkt: "quotes/NKY", sym: "6701:JP", p: "237" }
  ];

  for (const q of quotes) {
    const delta = createQuoteDelta(`delta-${ctx.uuid()}`, q.mkt, q.sym, q.p);
    bus.publish(ctx, {
      id: `orig-${ctx.uuid()}`,
      targetProcessId: 'bus',
      delta: delta
    });
  }

  console.log("SubClassification: is conserved.");
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
