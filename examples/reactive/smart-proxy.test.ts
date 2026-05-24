import { describe, it, expect, vi } from 'vitest';
import { run } from './smart-proxy.js';

describe('Smart Proxy Pattern', () => {
  it('should intercept messages and delegate them', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenNthCalledWith(1, '[SmartProxy] Intercepted message: msg-proxy-1. Total handled: 1');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, '[SmartProxy] Metrics updated. Delegating to target process: actual-service');

    consoleSpy.mockRestore();
  });
});
