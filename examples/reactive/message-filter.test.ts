import { describe, it, expect, vi } from 'vitest';
import { run } from '../../examples/reactive/message-filter.js';

describe('Reactive Messaging Pattern: Message Filter', () => {
  it('should admit valid messages and drop invalid messages', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    const expectedOutputs = [
      '[Filter] Passing valid message: msg-valid',
      '[FinalConsumer] Received filtered message: filtered-msg-valid',
      '[Filter] Dropping invalid message: msg-invalid'
    ];

    expect(logSpy).toHaveBeenCalledTimes(expectedOutputs.length);
    expectedOutputs.forEach((output, index) => {
      expect(logSpy.mock.calls[index][0]).toBe(output);
    });

    logSpy.mockRestore();
  });
});
