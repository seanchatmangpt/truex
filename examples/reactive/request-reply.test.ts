import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { run } from './request-reply.js';

describe('Reactive Pattern: Attempt-Reply', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should process attempt and reply according to the pattern', async () => {
    await run();

    const logs = vi.mocked(console.log).mock.calls.map(c => c[0]);
    expect(logs).toEqual([
      '[Client] starting... sending attempt',
      '[Server] received attempt: REQ-1',
      '[Client] received response: RESP-1 for REQ-1',
      'RequestReply: is conserved.'
    ]);
  });
});
