import { describe, expect, it } from 'vitest';
import { runZoeLaStewardshipExample } from '../src/index.js';

describe('ZOE LA deterministic stewardship example', () => {
  it('replays to the same receipt and reaches Rest', () => {
    const first = runZoeLaStewardshipExample(42);
    const replay = runZoeLaStewardshipExample(42);
    expect(first).toEqual(replay);
    expect(first.provisionAmount).toBe(100);
    expect(first.vowState).toBe('Rest');
    expect(first.receiptId).toMatch(/^receipt-[0-9a-f]{64}$/);
  });

  it('changes receipt identity when admitted entropy changes', () => {
    expect(runZoeLaStewardshipExample(42).receiptId).not.toBe(runZoeLaStewardshipExample(43).receiptId);
  });
});
