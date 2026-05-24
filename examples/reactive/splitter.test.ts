import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { run } from './splitter.js';

describe('Reactive Pattern: Splitter', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should split messages and process them according to the pattern', async () => {
    await run();

    const logs = vi.mocked(console.log).mock.calls.map(c => c[0]);
    expect(logs).toEqual([
      '[Splitter] splitting order with 3 items',
      '[Processor TypeA] handling Item A',
      '[Processor TypeB] handling Item B',
      '[Processor TypeC] handling Item C',
      'Splitter: is completed.'
    ]);
  });
});
