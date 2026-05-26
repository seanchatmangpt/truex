/**
 * @module vow
 * @description
 * Gall Classification: S∞ - Absolute Closure
 * Purpose: Implements the 8 Vow (Insa RepLaw). 
 * Eight is the number of perfection. No human approval gate exists in this type system.
 */

import { createProxy, useContext } from '@truex/membrane';

export type VowState = 'Source' | 'Pattern' | 'Field' | 'Motion' | 'Receiver' | 'Fruit' | 'Receipt' | 'Rest';

export interface VowRecord {
  source_id: string;
  pattern_hash: string;
  field_id: string;
  motion_route: string;
  receiver_id: string;
  fruit_quantity: number;
  receipt_digest: string;
  replay_seq: number;
}

export class VowMembrane {
  private currentState: VowState = 'Source';
  private record: Partial<VowRecord> = {};

  constructor(sourceId: string) {
    if (!sourceId) throw new Error("source_id must be named");
    this.record.source_id = sourceId;
  }

  getState(): VowState {
    return this.currentState;
  }

  getRecord(): Readonly<Partial<VowRecord>> {
    return this.record;
  }

  advance(input: any): void {
    switch (this.currentState) {
      case 'Source':
        if (!input || input.length !== 64) throw new Error("pattern_hash must be 32 bytes hex");
        this.record.pattern_hash = input;
        this.currentState = 'Pattern';
        break;
      case 'Pattern':
        if (!input) throw new Error("field_id is empty");
        this.record.field_id = input;
        this.currentState = 'Field';
        break;
      case 'Field':
        if (!input) throw new Error("motion_route is empty");
        this.record.motion_route = input;
        this.currentState = 'Motion';
        break;
      case 'Motion':
        if (!input) throw new Error("receiver_id is empty");
        this.record.receiver_id = input;
        this.currentState = 'Receiver';
        break;
      case 'Receiver':
        if (input <= 0) throw new Error("fruit_quantity is zero or negative");
        this.record.fruit_quantity = input;
        this.currentState = 'Fruit';
        break;
      case 'Fruit':
        if (!input || input.length !== 64) throw new Error("receipt_digest must be 32 bytes hex");
        this.record.receipt_digest = input;
        this.currentState = 'Receipt';
        break;
      case 'Receipt':
        if (input <= 0) throw new Error("replay_seq is zero or negative");
        this.record.replay_seq = input;
        this.currentState = 'Rest';
        break;
      case 'Rest':
        throw new Error("Vow already reached Rest (Perfection)");
    }
  }

  reset(sourceId: string): void {
    this.currentState = 'Source';
    this.record = { source_id: sourceId };
  }
}

export function createVowContext(sourceId: string) {
  const vow = new VowMembrane(sourceId);
  const context = useContext<VowMembrane>('truex-vow');
  
  return {
    vow,
    call: (fn: () => any) => context.call(vow, fn),
    use: () => context.use()
  };
}
