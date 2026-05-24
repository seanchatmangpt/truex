import { describe, it, expect, vi } from 'vitest';
import { run } from './selective-consumer.js';

describe('Selective Consumer Pattern', () => {
  it('should process only specific messages and ignore others', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenCalledWith('[SelectiveConsumer] Ignoring message: msg-low (priority: low)');
    expect(consoleSpy).toHaveBeenCalledWith('[SelectiveConsumer] Processing high priority message: msg-high');

    consoleSpy.mockRestore();
  });
});
