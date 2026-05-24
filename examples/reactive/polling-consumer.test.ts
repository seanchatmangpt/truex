import { describe, it, expect, vi } from 'vitest';
import { run } from './polling-consumer.js';

describe('Polling Consumer Pattern', () => {
  it('should start polling', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenCalledWith('Consumer: Starting polling cycle...');

    consoleSpy.mockRestore();
  });
});
