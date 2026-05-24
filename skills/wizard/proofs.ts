import { WizardAgent } from "../../agents/wizard/agent.js";

export type WizardProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
};

export function proveWizard(): WizardProofReport {
  const failures: string[] = [];
  const invariants: string[] = [];
  const wizard = new WizardAgent();

  try {
    // 1. Run a valid simulation (within range)
    const stateValid = { score: 50 };
    const traceValid = wizard.simulateTransaction(stateValid, 75);
    
    // Check trace steps
    const commitStep = traceValid.find(t => t.step === "Transaction Commit");
    if (commitStep && commitStep.success && stateValid.score === 75) {
      invariants.push("valid range mutation successfully commits state change");
    } else {
      failures.push("valid mutation simulation did not commit state change correctly");
    }

    // 2. Run an invalid simulation (out of range, should reject and rollback)
    const stateInvalid = { score: 50 };
    const traceInvalid = wizard.simulateTransaction(stateInvalid, 150); // range is 0 to 100
    
    const failStep = traceInvalid.find(t => t.step === "Speculative Write Failure");
    const rollbackStep = traceInvalid.find(t => t.step === "Transaction Rollback");
    
    if (failStep && !failStep.success && rollbackStep && rollbackStep.success && stateInvalid.score === 50) {
      invariants.push("invalid range mutation correctly rejected and state rolled back");
    } else {
      failures.push("invalid mutation was not properly rejected or rollback failed to restore state");
    }

  } catch (error: any) {
    failures.push(`Unexpected error during wizard proof: ${error.message}`);
  }

  return {
    passed: failures.length === 0,
    invariants,
    failures
  };
}
