import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { run } from './return-address.js';

describe('Reactive Pattern: Return Address', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should route messages using return address according to the pattern', async () => {
    await run();

    const logs = vi.mocked(console.log).mock.calls.map(c => c[0]);
    expect(logs).toEqual([
      '[Client] starting... sending complex request',
      '[Server] received complex request, forwarding to worker...',
      '[Worker] received complex request: REQ-20',
      '[Client] received reply: RESP-COMPLEX for REQ-20',
      'ReturnAddress: is completed.'
    ]);
  });
});
