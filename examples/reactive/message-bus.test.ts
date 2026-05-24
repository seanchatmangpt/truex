import { describe, it, expect, vi } from 'vitest';
import { run } from './message-bus.js';

describe('Message Bus Pattern', () => {
  it('should route messages to subscribers', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenNthCalledWith(1, '[MessageBus] Received message: msg-bus-1');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, '[MessageBus] Routing to subscribers: sub-1, sub-2');

    consoleSpy.mockRestore();
  });
});
