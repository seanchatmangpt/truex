import { describe, expect, it } from 'vitest';
import { AndonSystem, createDeterministicContext } from '@truex/membrane';
import { StorehouseManager } from '../src/storehouse.js';

const field = { id: 'field-alpha', name: 'Alpha Field', owner: 'Foundry' };
const receiver = { id: 'receiver-mercy', name: 'Mercy Logistics' };
const increase = { amount: 1000, currency: 'USD', timestamp: 1_716_480_000_001 };

function manager(seed: number) {
  const andon = new AndonSystem();
  const storehouse = new StorehouseManager(andon, createDeterministicContext(seed));
  storehouse.registerField(field.id);
  return { andon, storehouse };
}

describe('StorehouseManager receipts', () => {
  it('replays to the same receipt for the same admitted context', () => {
    const first = manager(42).storehouse.stewardIncrease(increase, field, receiver);
    const second = manager(42).storehouse.stewardIncrease(increase, field, receiver);
    expect(first).toEqual(second);
    expect(first.id).toMatch(/^receipt-[0-9a-f]{64}$/);
  });

  it('issues distinct but replayable receipts for sequential consequences', () => {
    const firstRun = manager(42).storehouse;
    const first = firstRun.stewardIncrease(increase, field, receiver);
    const second = firstRun.stewardIncrease(increase, field, receiver);

    const replay = manager(42).storehouse;
    expect(first.id).not.toBe(second.id);
    expect(replay.stewardIncrease(increase, field, receiver).id).toBe(first.id);
    expect(replay.stewardIncrease(increase, field, receiver).id).toBe(second.id);
  });

  it('changes the receipt when admitted consequence changes', () => {
    const baseline = manager(42).storehouse.stewardIncrease(increase, field, receiver);
    const changed = manager(42).storehouse.stewardIncrease(increase, field, {
      id: 'receiver-two',
      name: 'Second Receiver',
    });
    expect(changed.id).not.toBe(baseline.id);
  });

  it('pulls Andon for an unmapped field', () => {
    const andon = new AndonSystem();
    const storehouse = new StorehouseManager(andon, createDeterministicContext(42));
    expect(() => storehouse.stewardIncrease(increase, field, receiver)).toThrow(
      'JIDOKA STOP',
    );
    expect(andon.isStopped()).toBe(true);
  });
});
