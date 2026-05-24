import { describe, it, expect, vi } from 'vitest';
import { run } from '../../examples/reactive/claim-check.js';

describe('Reactive Messaging Pattern: Claim Check', () => {
  it('should store data and send claim check, then receiver retrieves it', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    const expectedOutputs = [
      '[Sender] Sending claim check message',
      '[Receiver] Retrieved data using claim check claim-123: LARGE PAYLOAD DATA'
    ];

    expect(logSpy).toHaveBeenCalledTimes(expectedOutputs.length);
    expectedOutputs.forEach((output, index) => {
      expect(logSpy.mock.calls[index][0]).toBe(output);
    });

    logSpy.mockRestore();
  });
});
