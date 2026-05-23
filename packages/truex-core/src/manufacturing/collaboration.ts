import { hash } from "../hash.js";
import type { HookDefinition, Receipt } from "../runtime-law.js";
import { verifyReceipt } from "../receipt.js";

/**
 * PeerReview Gate for Hook Admission.
 * Ensures new hook definitions are 'vetted' by a quorum of established receipts
 * before being promoted to the production line.
 * 
 * Reference: Toyota Production System - Respect for People (Collaboration).
 */
export class PeerReview {
  constructor(public readonly quorum: number) {
    if (quorum <= 0) {
      throw new Error("Quorum must be greater than zero");
    }
  }

  /**
   * Evaluates if a hook definition has reached the required quorum of vetting receipts.
   * 
   * A vetting receipt is one where:
   * 1. The receipt itself is cryptographically valid.
   * 2. The receipt status is 'confirmed'.
   * 3. The outputHash matches the hash of the HookDefinition being vetted.
   * 
   * @param hook The HookDefinition to vet.
   * @param vettingReceipts An array of receipts representing vetting votes.
   * @returns true if the quorum is met, false otherwise.
   */
  isPromotable(hook: HookDefinition, vettingReceipts: Receipt[]): boolean {
    const hookHash = hash(hook);
    
    const validVets = vettingReceipts.filter(receipt => {
      // 1. Verify receipt integrity (self-hash check)
      if (!verifyReceipt(receipt)) return false;
      
      // 2. Verify status is confirmed
      if (receipt.status !== 'confirmed') return false;

      // 3. Verify it vets this specific hook
      // In this collaboration model, a vetting receipt's output is the approved hook.
      return receipt.outputHash === hookHash;
    });

    return validVets.length >= this.quorum;
  }
}
