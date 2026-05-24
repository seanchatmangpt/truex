import { describe, it, expect, vi } from 'vitest';
import { run } from './content-filter.js';

describe('Content Filter Pattern', () => {
  it('should process messages and produce expected console outputs', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy.mock.calls).toEqual([
      ['Filter received raw message:', { publicData: 'ok', sensitiveData: 'secret', extraStuff: 'junk' }],
      ['Downstream received clean message:', { publicData: 'ok' }],
    ]);

    consoleSpy.mockRestore();
  });
});
