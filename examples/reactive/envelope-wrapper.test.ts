import { describe, it, expect, vi } from 'vitest';
import { run } from './envelope-wrapper.js';

describe('Envelope Wrapper Pattern', () => {
  it('should unwrap the envelope and process header and payload', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenCalledWith('Received Envelope Header:', expect.objectContaining({ priority: 'high' }));
    expect(consoleSpy).toHaveBeenCalledWith('Extracted Payload:', { action: 'DO_WORK', data: { foo: 'bar' } });

    consoleSpy.mockRestore();
  });
});
