/**
 * @module WizardAgent
 * @description
 * Gall Classification: Gall S2 (Membrane Interception and Transaction Logic)
 * Purpose: The Wizard Agent handles counterfactual transactions, speculative states,
 * and rollbacks. It builds upon the S2 persistence membrane to prove that invariant
 * violations result in clean transaction rollbacks without state corruption.
 */

import { createProxy, createTransactionContext, registerTransactionInterceptors } from "../../skills/membrane/mutations.js";
import { createInvariantContext, registerInvariantInterceptors, rangeInvariant } from "../../skills/membrane/invariant.js";

/**
 * Result of a single speculative simulation step.
 */
export type SimulationStepResult = {
  step: string;
  success: boolean;
  value: any;
  journal?: any[];
  error?: string;
};

/**
 * The Wizard Agent acts as the counterfactual simulator, utilizing the transaction
 * and invariant membranes to safely test speculative state transitions.
 */
export class WizardAgent {
  /**
   * Specs a counterfactual transaction on a mutable state, running validations.
   * 
   * @param initialState - The initial state to simulate the transaction against.
   * @param val - The value to speculatively apply to the state.
   * @returns An array of simulation step results documenting the trace of operations.
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
        invCtx.call(() => {
          proxyInterface.proxy.score = val;
        });
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

      try {
        if (txCtx.isActive()) {
          txCtx.rollback();
        }
      } catch {
        // Safe fallback in case Jidoka already executed rollback
      }
      trace.push({
        step: "Transaction Rollback",
        success: true,
        value: { ...initialState }
      });
    }

    return trace;
  }

  /**
   * Conducts sequential simulations over a list of values, propagating states.
   * 
   * @param initialState - The starting state before applying steps.
   * @param steps - An array of numerical values to speculatively apply in sequence.
   * @returns An array of concatenated simulation step results across all walkthroughs.
   */
  walkthrough(initialState: { score: number }, steps: number[]): SimulationStepResult[] {
    const trace: SimulationStepResult[] = [];
    let currentState = { ...initialState };
    for (const val of steps) {
      const stepTrace = this.simulateTransaction(currentState, val);
      trace.push(...stepTrace);
      // propagate successfully committed state forward
      const commitStep = stepTrace.find(r => r.step === "Transaction Commit");
      if (commitStep) {
        currentState = { ...commitStep.value };
      }
    }
    return trace;
  }
}
