import { describe, it, expect, vi } from 'vitest';
import { run } from './smart-proxy.js';

describe('Smart Membrane Pattern', () => {
  it('should hook messages and delegate them', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenNthCalledWith(1, '[SmartProxy] Hooked message: msg-membrane-1. Total handled: 1');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, '[SmartProxy] Metrics updated. Delegating to substrate process: actual-service');

    consoleSpy.mockRestore();
  });
});
