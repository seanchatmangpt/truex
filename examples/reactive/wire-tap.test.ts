import { describe, it, expect, vi } from 'vitest';
import { run } from './wire-tap.js';

describe('Reactive Pattern: Wire Tap', () => {
  it('should intercept the message and forward it', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await run();

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[LOG] WireTap intercepted message: msg-1 carrying delta: delta-1'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[OrderProcessor] received order: 123'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('WireTap: is completed.'));

    logSpy.mockRestore();
  });
});
