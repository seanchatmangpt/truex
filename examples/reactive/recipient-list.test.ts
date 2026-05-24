import { describe, it, expect, vi } from 'vitest';
import { run } from './recipient-list.js';

describe('Recipient List Pattern', () => {
  it('should dynamically route messages to specific recipients', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenCalledWith('[RecipientList] Routing message msg-alert to R1, R2');
    expect(consoleSpy).toHaveBeenCalledWith('[R1] Received message: routed-msg-alert-0');
    expect(consoleSpy).toHaveBeenCalledWith('[R2] Received message: routed-msg-alert-1');
    expect(consoleSpy).toHaveBeenCalledWith('[RecipientList] Routing message msg-info to R3');
    expect(consoleSpy).toHaveBeenCalledWith('[R3] Received message: routed-msg-info-0');

    consoleSpy.mockRestore();
  });
});
