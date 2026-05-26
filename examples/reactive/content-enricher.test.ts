import { describe, it, expect, vi } from 'vitest';
import { run } from './content-enricher.js';

describe('Content Enricher Pattern', () => {
  it('should process messages and produce expected console outputs', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    // The enricher processes the message and logs its progress.
    expect(consoleSpy.mock.calls).toEqual([
      ["[ContentEnricher] Received sparse message: msg-sparse-1"],
      ["[ContentEnricher] Hydrated payload: user:id:12345 + ENRICHED_WITH_(DATABASE_USER_RECORD)"],
      ["[ContentEnricher] Forwarding enriched payload to: enriched-substrate"]
    ]);

    consoleSpy.mockRestore();
  });
});
