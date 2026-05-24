import { describe, it, expect, vi } from 'vitest';
import { run } from './message-expiration.js';

describe('Message Expiration Pattern', () => {
  it('should drop expired messages and process valid ones', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleWarnSpy).toHaveBeenCalledWith('Message msg-expired expired! Dropping.');
    expect(consoleLogSpy).toHaveBeenCalledWith('Processing valid message msg-valid:', { data: 'on time' });

    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
});
