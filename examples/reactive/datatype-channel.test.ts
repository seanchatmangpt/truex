import { describe, it, expect, vi } from 'vitest';
import { run } from './datatype-channel.js';

describe('Datatype Channel Pattern', () => {
  it('should process messages and produce expected console outputs', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy.mock.calls).toEqual([
      ['Order Channel processing order:', { type: 'order', id: '123', amount: 100 }],
      ['Invoice Channel processing invoice:', { type: 'invoice', id: 'inv-456', total: 100 }],
    ]);

    consoleSpy.mockRestore();
  });
});
