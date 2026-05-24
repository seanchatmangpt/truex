import { describe, it, expect, vi } from 'vitest';
import { run } from '../../examples/reactive/resequencer.js';

describe('Reactive Messaging Pattern: Resequencer', () => {
  it('should collect out-of-sequence messages and publish them in correct sequence', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    const expectedOutputs = [
      '[Resequencer] Received out-of-order message: ABC #3',
      '[Resequencer] Received out-of-order message: ABC #1',
      '[SequencedConsumer] Received perfectly ordered message: ABC #1',
      '[Resequencer] Received out-of-order message: ABC #4',
      '[Resequencer] Received out-of-order message: ABC #2',
      '[SequencedConsumer] Received perfectly ordered message: ABC #2',
      '[SequencedConsumer] Received perfectly ordered message: ABC #3',
      '[SequencedConsumer] Received perfectly ordered message: ABC #4',
      '[Resequencer] Received out-of-order message: ABC #5',
      '[SequencedConsumer] Received perfectly ordered message: ABC #5',
      '[Resequencer] Conserved sequence for ABC',
      'Resequencer: is conserved.'
    ];

    expect(logSpy).toHaveBeenCalledTimes(expectedOutputs.length);
    expectedOutputs.forEach((output, index) => {
      expect(logSpy.mock.calls[index][0]).toBe(output);
    });

    logSpy.mockRestore();
  });
});
