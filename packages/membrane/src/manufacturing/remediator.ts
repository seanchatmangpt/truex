/**
 * @module manufacturing/remediator
 * @description Gall S₂: Autonomic Self-Healing Generator.
 * Closes the loop from Refusal to Self-Remediation by proposing GraphDelta corrections.
 */
import type { GraphDelta, Receipt, Quad } from '../runtime-law.js';
import type { TruexContext } from '../context.js';
import { hash } from '../hash.js';

/**
 * CorrectionProposal represents a suggested GraphDelta to fix a refusal.
 */
export interface CorrectionProposal {
  id: string;
  originalDeltaId: string;
  reason: string;
  suggestedDelta: GraphDelta;
  confidence: number;
}

/**
 * Remediator (Autonomic Self-Healing).
 * 
 * In Lean manufacturing, when a defect is detected (Jidoka), the system
 * shouldn't just stop; it should ideally suggest a way to recover.
 * The Remediator analyzes Refused receipts (specifically POWL violations)
 * and generates Correction Proposals.
 */
export class Remediator {
  constructor(private readonly context: TruexContext) {}

  /**
   * Analyzes a refused receipt and its associated delta to suggest a correction.
   * 
   * @param receipt The refused receipt.
   * @param delta The delta that was refused.
   * @returns A CorrectionProposal if remediation is possible, otherwise null.
   */
  remediate(receipt: Receipt, delta: GraphDelta): CorrectionProposal | null {
    if (receipt.status !== 'refused') return null;

    const reason = receipt.reason || '';
    
    // 1. Detect POWL Sequence Violation (Out-of-order)
    if (reason.includes('POWL') || reason.includes('sequence') || reason.includes('out-of-order')) {
      return this.proposeSequenceFix(receipt, delta);
    }

    // 2. Detect Deadlock
    if (reason.includes('deadlock')) {
      return this.proposeDeadlockFix(receipt, delta);
    }

    return null;
  }

  /**
   * Proposes a fix for a sequence violation.
   * For example, if 'B' was expected but 'C' was attempted, it might suggest 'B'.
   */
  private proposeSequenceFix(receipt: Receipt, delta: GraphDelta): CorrectionProposal {
    // Heuristic: Extract the expected activity from the reason if possible.
    // E.g., "POWL Violation: Expected activity 'act_plan' but got 'act_forge'"
    const expectedMatch = receipt.reason?.match(/Expected activity '([^']+)'/);
    const expectedActivity = expectedMatch ? expectedMatch[1] : 'unknown';

    // Create a suggested delta that performs the expected activity instead.
    const suggestedDelta: GraphDelta = {
      id: `remediation-${this.context.uuid().slice(0, 8)}`,
      adds: delta.adds.map(q => {
        if (q.predicate === 'agy:action' || q.predicate === 'activity') {
          return { ...q, object: expectedActivity };
        }
        return q;
      }),
      deletes: delta.deletes
    };

    return {
      id: this.context.uuid(),
      originalDeltaId: delta.id,
      reason: `Sequence violation: ${receipt.reason}. Proposing mandatory intermediate step: ${expectedActivity}.`,
      suggestedDelta,
      confidence: 0.9
    };
  }

  /**
   * Proposes a fix for a deadlock.
   */
  private proposeDeadlockFix(receipt: Receipt, delta: GraphDelta): CorrectionProposal {
    // For deadlock, we might suggest a "reset" or "noop" to break the cycle
    // or satisfy a missing dependency.
    const suggestedDelta: GraphDelta = {
      id: `remediation-deadlock-${this.context.uuid().slice(0, 8)}`,
      adds: [
        { subject: 'system', predicate: 'state', object: 'recovered' }
      ],
      deletes: []
    };

    return {
      id: this.context.uuid(),
      originalDeltaId: delta.id,
      reason: `Deadlock detected: ${receipt.reason}. Proposing state recovery transition.`,
      suggestedDelta,
      confidence: 0.7
    };
  }
}
