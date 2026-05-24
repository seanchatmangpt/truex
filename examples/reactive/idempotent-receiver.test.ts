import { describe, it, expect, vi } from 'vitest';
import { run } from './idempotent-receiver.js';

describe('Idempotent Receiver Pattern', () => {
  it('should process new messages and ignore duplicates', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Receiver: Processing new message msg-1');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Receiver: Ignoring duplicate message msg-1');

    consoleSpy.mockRestore();
  });
});
