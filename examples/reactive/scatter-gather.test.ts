import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { run } from './scatter-gather.js';

describe('Reactive Pattern: Scatter-Gather', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should scatter requests and gather responses according to the pattern', async () => {
    await run();

    const logs = vi.mocked(console.log).mock.calls;
    expect(logs).toEqual([
      ['[OrderProcessor] Scattering RFQ 123 for 2 items to 2 quoters'],
      ['[Aggregator] initialized RFQ 123, expecting 2 quotes'],
      ['[Aggregator] received quote for RFQ 123 from BudgetHikers: $95'],
      ['[Aggregator] received quote for RFQ 123 from BudgetHikers: $95'],
      ['[Aggregator] FULFILLED RFQ 123. Quotes:', [
        { quoter: 'BudgetHikers', price: 95 },
        { quoter: 'BudgetHikers', price: 95 }
      ]],
      ['[Aggregator] received quote for RFQ 123 from HighSierra: $98'],
      ['[Aggregator] FULFILLED RFQ 123. Quotes:', [
        { quoter: 'BudgetHikers', price: 95 },
        { quoter: 'BudgetHikers', price: 95 },
        { quoter: 'HighSierra', price: 98 }
      ]],
      ['[Aggregator] received quote for RFQ 123 from HighSierra: $98'],
      ['[Aggregator] FULFILLED RFQ 123. Quotes:', [
        { quoter: 'BudgetHikers', price: 95 },
        { quoter: 'BudgetHikers', price: 95 },
        { quoter: 'HighSierra', price: 98 },
        { quoter: 'HighSierra', price: 98 }
      ]],
      ['ScatterGather: is conserved.']
    ]);
  });
});
