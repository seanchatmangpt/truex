import { describe, it, expect, vi } from 'vitest';
import { run } from '../../examples/reactive/competing-consumer.js';

describe('Reactive Messaging Pattern: Competing Consumer', () => {
  it('should process messages using multiple consumers round-robin', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    const expectedOutputs = [
      '[Worker-1] processed WorkItem-1',
      '[Worker-2] processed WorkItem-2',
      '[Worker-3] processed WorkItem-3',
      '[Worker-4] processed WorkItem-4',
      '[Worker-5] processed WorkItem-5',
      '[Worker-1] processed WorkItem-6',
      '[Worker-2] processed WorkItem-7',
      '[Worker-3] processed WorkItem-8',
      '[Worker-4] processed WorkItem-9',
      '[Worker-5] processed WorkItem-10',
      '[Worker-1] processed WorkItem-11',
      '[Worker-2] processed WorkItem-12',
      '[Worker-3] processed WorkItem-13',
      '[Worker-4] processed WorkItem-14',
      '[Worker-5] processed WorkItem-15',
      'CompetingConsumer: is conserved.'
    ];

    expect(logSpy).toHaveBeenCalledTimes(expectedOutputs.length);
    expectedOutputs.forEach((output, index) => {
      expect(logSpy.mock.calls[index][0]).toBe(output);
    });

    logSpy.mockRestore();
  });
});
