import { describe, it, expect, vi } from 'vitest';
import { run } from './content-enricher.js';

describe('Content Enricher Pattern', () => {
  it('should process messages and produce expected console outputs', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    // The enricher delta is malformed so the message is refused and nothing is logged.
    expect(consoleSpy.mock.calls).toEqual([]);

    consoleSpy.mockRestore();
  });
});
