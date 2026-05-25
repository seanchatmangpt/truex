import { fileURLToPath } from 'node:url';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { 
  createHookOtpRuntime, 
  dispatchMessage, 
  createHookProcess
} from '../../packages/membrane/src/hook-otp.gall.js';
import type { GraphDelta } from '../../packages/membrane/src/runtime-law.js';

/**
 * Reactive Messaging Pattern: Process Manager
 * 
 * A central coordinator (LoanBroker) orchestrates a complex workflow involving
 * multiple steps (CreditBureau, Banks), maintaining state across the entire 
 * lifecycle of a business process.
 */

function createLoanRequestDelta(id: string, taxId: string, amount: number): GraphDelta {
  return {
    id,
    adds: [
      { subject: "loan", predicate: "taxId", object: taxId, graph: null },
      { subject: "loan", predicate: "amount", object: amount.toString(), graph: null }
    ],
    deletes: []
  };
}

export async function run() {
  const runtime = createHookOtpRuntime();
  const ctx = createDeterministicContext(42);

  const creditBureauBehavior = (state: any, msg: any) => {
    const taxId = msg.delta?.adds?.[0]?.object;
    console.log(`[CreditBureau] Checking credit for ${taxId}`);
    
    // Simulate score
    const score = 650;
    
    dispatchMessage(runtime, {
      id: `reply-${ctx.uuid()}`,
      senderId: "credit-bureau",
      targetProcessId: msg.senderId,
      delta: {
        id: `delta-${ctx.uuid()}`,
        adds: [
          { subject: "creditResult", predicate: "taxId", object: taxId, graph: null },
          { subject: "creditResult", predicate: "score", object: score.toString(), graph: null }
        ],
        deletes: []
      }
    });
    return { effects: [], nextState: state };
  };
  runtime.processes.set("credit-bureau", createHookProcess("credit-bureau", creditBureauBehavior, {}));

  const bankBehavior = (bankId: string, rate: number) => (state: any, msg: any) => {
    const amount = msg.delta?.adds?.[0]?.object;
    console.log(`[Bank-${bankId}] Quoting loan for amount: ${amount}`);
    
    dispatchMessage(runtime, {
      id: `reply-${ctx.uuid()}`,
      senderId: `bank-${bankId}`,
      targetProcessId: msg.senderId,
      delta: {
        id: `delta-${ctx.uuid()}`,
        adds: [
          { subject: "bankQuote", predicate: "bankId", object: bankId, graph: null },
          { subject: "bankQuote", predicate: "rate", object: rate.toString(), graph: null }
        ],
        deletes: []
      }
    });
    return { effects: [], nextState: state };
  };
  runtime.processes.set("bank-1", createHookProcess("bank-1", bankBehavior("1", 2.75), {}));
  runtime.processes.set("bank-2", createHookProcess("bank-2", bankBehavior("2", 2.73), {}));

  const loanBrokerBehavior = (state: any, msg: any) => {
    const isNewLoan = msg.delta?.adds?.[0]?.subject === "loan";
    const isCreditResult = msg.delta?.adds?.[0]?.subject === "creditResult";
    const isBankQuote = msg.delta?.adds?.[0]?.subject === "bankQuote";

    if (isNewLoan) {
      const taxId = msg.delta.adds[0].object;
      const amount = msg.delta.adds[1].object;
      state.loanState = { taxId, amount, quotes: [] };
      
      console.log(`[LoanBroker] Started loan process for ${taxId}. Requesting credit check.`);
      dispatchMessage(runtime, {
        id: `req-${ctx.uuid()}`,
        senderId: "loan-broker",
        targetProcessId: "credit-bureau",
        delta: msg.delta
      });
    } else if (isCreditResult) {
      const score = Number.parseInt(msg.delta.adds[1].object);
      console.log(`[LoanBroker] Received credit score: ${score}. Requesting quotes from banks.`);
      
      const banks = ["bank-1", "bank-2"];
      state.expectedQuotes = banks.length;
      
      for (const bank of banks) {
        dispatchMessage(runtime, {
          id: `req-${ctx.uuid()}`,
          senderId: "loan-broker",
          targetProcessId: bank,
          delta: {
            id: `delta-${ctx.uuid()}`,
            adds: [{ subject: "loanAmount", predicate: "amount", object: state.loanState.amount, graph: null }],
            deletes: []
          }
        });
      }
    } else if (isBankQuote) {
      const bankId = msg.delta.adds[0].object;
      const rate = Number.parseFloat(msg.delta.adds[1].object);
      
      console.log(`[LoanBroker] Received quote from Bank ${bankId}: ${rate}%`);
      state.loanState.quotes.push({ bankId, rate });
      
      if (state.loanState.quotes.length === state.expectedQuotes) {
        const best = state.loanState.quotes.reduce((prev: any, curr: any) => prev.rate < curr.rate ? prev : curr);
        console.log(`[LoanBroker] Process Conserved! Best Rate: ${best.rate}% from Bank ${best.bankId}`);
      }
    }

    return { effects: [], nextState: state };
  };
  runtime.processes.set("loan-broker", createHookProcess("loan-broker", loanBrokerBehavior, {}));

  // Start the process
  dispatchMessage(runtime, {
    id: "start",
    targetProcessId: "loan-broker",
    delta: createLoanRequestDelta("loan-req", "111-11-1111", 100_000)
  });

  console.log("ProcessManager: is conserved.");
}

const isMain = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch(console.error);
}
