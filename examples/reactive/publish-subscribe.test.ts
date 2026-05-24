import { describe, it, expect, vi } from 'vitest';
import { run } from './publish-subscribe.js';

describe('Reactive Pattern: Publish/Subscribe', () => {
  it('should route messages to multiple subscribers based on topic', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await run();

    // NYSE Quote
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[AllMarketsSubscriber] received: ORCL @ 37.84'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[NYSESubscriber] received: ORCL @ 37.84'));

    // NASDAQ Quote
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[AllMarketsSubscriber] received: MSFT @ 37.16'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[NASDAQSubscriber] received: MSFT @ 37.16'));

    // DAX Quote
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[AllMarketsSubscriber] received: SAP:GR @ 61.95'));

    // NKY Quote
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[AllMarketsSubscriber] received: 6701:JP @ 237'));

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('SubClassification: is conserved.'));

    logSpy.mockRestore();
  });
});
