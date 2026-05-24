import { describe, it, expect, vi } from 'vitest';
import { run } from './message-metadata.js';

describe('Message Metadata Pattern', () => {
  it('should separate business processing from metadata processing', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    expect(consoleSpy).toHaveBeenCalledWith('Business logic processing payload:', { customerId: 'CUST-1', action: 'UPDATE' });
    expect(consoleSpy).toHaveBeenCalledWith('Tracing context active:', 'trace-9876');
    expect(consoleSpy).toHaveBeenCalledWith('Audit receipt - msg metadata:', expect.objectContaining({ traceId: 'trace-9876', sourceSystem: 'CRM' }));

    consoleSpy.mockRestore();
  });
});
