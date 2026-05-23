import { createProxy, createTransactionContext, registerTransactionInterceptors } from "../../skills/membrane/mutations.js";
import { createInvariantContext, registerInvariantInterceptors, rangeInvariant } from "../../skills/membrane/invariant.js";

export type SimulationStepResult = {
  step: string;
  success: boolean;
  value: any;
  journal?: any[];
  error?: string;
};

export class WizardAgent {
  /**
   * Specs a counterfactual transaction on a mutable state, running validations.
   */
  simulateTransaction(initialState: { score: number }, val: number): SimulationStepResult[] {
    const trace: SimulationStepResult[] = [];
    const proxyInterface = createProxy(initialState);
    
    // Setup invariants
    const invCtx = createInvariantContext(initialState);
    invCtx.addInvariant("score_range", rangeInvariant("score", 0, 100));
    registerInvariantInterceptors(proxyInterface, invCtx);

    // Setup transactions
    const txCtx = createTransactionContext(initialState);
    registerTransactionInterceptors(proxyInterface, txCtx);

    trace.push({
      step: "Initial State Setup",
      success: true,
      value: { ...initialState }
    });

    try {
      txCtx.call(() => {
        proxyInterface.proxy.score = val;
      });
      
      trace.push({
        step: "Speculative Write",
        success: true,
        value: { ...initialState },
        journal: txCtx.getJournal()
      });

      txCtx.commit();
      trace.push({
        step: "Transaction Commit",
        success: true,
        value: { ...initialState }
      });
    } catch (error_: any) {
      trace.push({
        step: "Speculative Write Failure",
        success: false,
        value: { ...initialState },
        error: error_.message
      });

      txCtx.rollback();
      trace.push({
        step: "Transaction Rollback",
        success: true,
        value: { ...initialState }
      });
    }

    return trace;
  }
}
