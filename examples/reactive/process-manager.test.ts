import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { run } from './process-manager.js';

describe('Reactive Pattern: Process Manager', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should manage complex process according to the pattern', async () => {
    await run();

    const logs = vi.mocked(console.log).mock.calls.map(c => c[0]);
    expect(logs).toEqual([
      '[LoanBroker] Started loan process for 111-11-1111. Requesting credit check.',
      '[CreditBureau] Checking credit for 111-11-1111',
      '[LoanBroker] Received credit score: 650. Requesting quotes from banks.',
      'ProcessManager: is completed.'
    ]);
  });
});
