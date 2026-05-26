/**
 * @module storehouse
 * @description Logic for the Storehouse Stewardship Infrastructure.
 */
import { AndonSystem, PokaYoke } from '@truex/membrane';
import type { Field, Increase, FirstPortion, Provision, Receiver, StorehouseReceipt, StorehouseContext } from './types.js';

export class StorehouseManager {
  private andon: AndonSystem;
  private pokaYoke: PokaYoke;
  private mappedFields: Set<string> = new Set();

  constructor(andon: AndonSystem) {
    this.andon = andon;
    this.pokaYoke = new PokaYoke(andon);
  }

  /**
   * Registers a field in the storehouse registry.
   */
  registerField(fieldId: string): void {
    this.mappedFields.add(fieldId);
  }

  /**
   * Calculates the First Portion (exactly 10%) of an increase.
   */
  calculateFirstPortion(increase: Increase, id: string): FirstPortion {
    const amount = increase.amount * 0.1;
    // We use a very strict check to ensure it's EXACTLY 10%
    if (Math.abs(amount - increase.amount / 10) > 0.000001) {
      this.andon.stopLine(`First Portion Mismatch: ${amount} is not 10% of ${increase.amount}`);
      throw new Error("JIDOKA STOP: First Portion requirement violated.");
    }

    return {
      amount,
      currency: increase.currency,
      increaseId: id
    };
  }

  /**
   * Routes a first portion to an appointed receiver, creating a provision.
   * Checks if the field is mapped.
   */
  routeProvision(portion: FirstPortion, receiver: Receiver, fieldId: string): Provision {
    if (!this.mappedFields.has(fieldId)) {
      this.andon.stopLine(`Unmapped Field detected: ${fieldId}. Register in topology before modification.`);
      throw new Error(`JIDOKA STOP: Unmapped Field detected (${fieldId}).`);
    }

    if (!receiver || !receiver.id) {
      this.andon.stopLine("Malformed Provision: No appointed receiver.");
      throw new Error("JIDOKA STOP: Provision requires an appointed receiver.");
    }

    return {
      amount: portion.amount,
      receiver,
      fieldId
    };
  }

  /**
   * Finalizes stewardship by issuing a receipt.
   */
  issueReceipt(provision: Provision): StorehouseReceipt {
    // Runtime Poka-yoke: ensure provision is not malformed
    if (!provision || !provision.receiver || !provision.fieldId || provision.amount === undefined) {
      this.andon.stopLine("Malformed Provision: Integrity check failed.");
      throw new Error("JIDOKA STOP: Provision integrity violation.");
    }

    // Structural check: a receipt cannot be created without a provision, 
    // and a provision requires a receiver.
    return {
      id: `receipt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      provision,
      stewardshipConfirmed: true
    };
  }

  /**
   * A function that represents the whole loop.
   */
  stewardIncrease(
    increase: Increase,
    field: Field,
    receiver: Receiver,
    context?: StorehouseContext
  ): StorehouseReceipt {
    if (context) {
      console.log(`[Storehouse] Processing increase for Run: ${context.runId}, Trace: ${context.traceId}`);
    }
    const portion = this.calculateFirstPortion(increase, `inc-${field.id}`);
    const provision = this.routeProvision(portion, receiver, field.id);
    return this.issueReceipt(provision);
  }
}
