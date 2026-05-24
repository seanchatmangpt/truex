import type { GraphDelta, HookDefinition, HookEffect, Receipt, HookEvent } from "./runtime-law.js";
import { hash, createReceipt, verifyReceipt } from "./index.js";
import type { TruexContext } from "./context.js";

/**
 * The Hook is the fundamental Truex atom.
 * It encapsulates:
 * - condition: when the hook triggers
 * - transition: the logic of transformation
 * - effect: what the hook produces
 * - receipt: unforgeable proof of the operation
 * - replay: deterministic reconstruction
 */
export class TruexHook {
  constructor(public readonly definition: HookDefinition) {}

  /**
   * Evaluates if the hook matches a given delta.
   */
  matches(delta: GraphDelta): boolean {
    if (this.definition.condition.kind === 'always') return true;
    if (this.definition.condition.kind === 'delta-match') {
      const predicate = this.definition.condition.predicate;
      return delta.adds.some(q => q.predicate === predicate) || 
             delta.deletes.some(q => q.predicate === predicate);
    }
    return false;
  }

  /**
   * Executes the hook effects and generates a receipt.
   */
  execute(ctx: TruexContext, delta: GraphDelta, previousReceiptHash: string | null | undefined): { 
    effects: HookEffect[]; 
    receipt: Receipt;
    events: HookEvent[];
  } {
    if (!this.matches(delta)) {
      throw new Error(`Hook ${this.definition.id} does not match delta ${delta.id}`);
    }

    // Extract the declarative effects registered in the hook definition.
    const effects = this.definition.effects;
    
    const events: HookEvent[] = effects
      .filter(e => e.kind === 'emit-event')
      .map(e => ({
        id: ctx.uuid(),
        hookId: this.definition.id,
        type: (e as { type: string }).type,
        deltaId: delta.id
      }));

    const inputHash = hash(delta);
    const outputHash = hash({ effects, events });

    // Every execution produces a unique eventId for the receipt.
    const eventId = events[0]?.id || ctx.uuid();

    const receipt = createReceipt(
      ctx,
      eventId,
      delta.id,
      inputHash,
      outputHash,
      previousReceiptHash,
      "confirmed"
    );

    return { effects, receipt, events };
  }

  /**
   * Replays the hook to verify deterministic convergence.
   */
  replay(ctx: TruexContext, delta: GraphDelta, expectedReceipt: Receipt): boolean {
    // 1. Verify internal integrity of the expected receipt
    if (!verifyReceipt(expectedReceipt)) return false;

    // 2. Verify that the provided delta matches the receipt's claimed input
    if (hash(delta) !== expectedReceipt.inputHash) return false;

    // 3. Re-execute and verify convergence of the full receipt hash
    try {
      const { receipt } = this.execute(ctx, delta, expectedReceipt.previousReceiptHash);
      return receipt.receiptHash === expectedReceipt.receiptHash;
    } catch {
      return false;
    }
  }
}
