import { describe, it, expect, vi } from 'vitest';
import { run } from './transactional-actor.js';

describe('Transactional Actor Pattern', () => {
  it('should persist events when processing messages', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenNthCalledWith(1, '[TransactionalActor] Processing message: msg-tx-1');
    expect(consoleSpy).toHaveBeenNthCalledWith(2, '[TransactionalActor] Persisting event... New history length: 1');

    consoleSpy.mockRestore();
  });
});
