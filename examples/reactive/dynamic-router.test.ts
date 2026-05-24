import { describe, it, expect, vi } from 'vitest';
import { run } from './dynamic-router.js';

describe('Dynamic Router Pattern', () => {
  it('should process messages and produce expected console outputs', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy.mock.calls).toEqual([
      ['[Router] Routing message msg-1 to destA'],
      ['[DestA] Received message: routed-msg-1'],
      ['[Router] Routing message msg-2 to destB'],
      ['[DestB] Received message: routed-msg-2'],
    ]);

    consoleSpy.mockRestore();
  });
});
