import { describe, it, expect, vi } from 'vitest';
import { run } from './aggregator.js';

describe('Aggregator Pattern', () => {
  it('should process messages and produce expected console outputs', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy.mock.calls).toEqual([
      ['Aggregator: Received part', 'A'],
      ['Aggregator: Received part', 'B'],
      ['Aggregator: Received part', 'C'],
      ['Aggregator: All parts received, assembling:', ['A', 'B', 'C']],
    ]);

    consoleSpy.mockRestore();
  });
});
