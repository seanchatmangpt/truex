import { describe, it, expect, vi } from 'vitest';
import { run } from './messaging-bridge.js';

describe('Messaging Bridge Pattern', () => {
  it('should translate and forward messages', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenNthCalledWith(1, '[MessagingBridge] Received message from Domain A: msg-domain-a-1');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, '[MessagingBridge] Translating message format for Domain B...');
    expect(consoleSpy).toHaveBeenNthCalledWith(3, '[MessagingBridge] Forwarding translated message to target: domain-b-service');

    consoleSpy.mockRestore();
  });
});
