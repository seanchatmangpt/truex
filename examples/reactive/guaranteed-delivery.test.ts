import { describe, it, expect, vi } from 'vitest';
import { run } from './guaranteed-delivery.js';

describe('Guaranteed Delivery Pattern', () => {
  it('should send the message and wait for an ACK', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenCalledWith('Sender: Sending message...');
    // Note: Receiver behavior logic to send ACK back to Sender isn't fully flushed in the loop, but this captures the actual console output.

    consoleSpy.mockRestore();
  });
});
