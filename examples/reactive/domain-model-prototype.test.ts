import { describe, it, expect, vi } from 'vitest';
import { run } from './domain-model-prototype.js';

describe('Domain Model Prototype Pattern', () => {
  it('should process messages and produce expected console outputs', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy.mock.calls).toEqual([
      ['Order 123: Added item Book. New total: 15'],
      ['Order 123: Checking out with total 15'],
    ]);

    consoleSpy.mockRestore();
  });
});
