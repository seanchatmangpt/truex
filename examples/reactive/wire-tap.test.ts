import { describe, it, expect, vi } from 'vitest';
import { run } from './wire-tap.js';

describe('Reactive Pattern: Wire Tap', () => {
  it('should hook the message and forward it', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await run();

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[LOG] WireTap hooked message: msg-1 carrying delta: delta-1'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[OrderProcessor] received order: 123'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('WireTap: is conserved.'));

    logSpy.mockRestore();
  });
});
