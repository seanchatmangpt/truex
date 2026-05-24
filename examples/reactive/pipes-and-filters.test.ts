import { describe, it, expect, vi } from 'vitest';
import { run } from './pipes-and-filters.js';

describe('Reactive Pattern: Pipes and Filters', () => {
  it('should process a message through a sequence of filters', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await run();

    // First message processing
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[Acceptance] Processing: (encryption)(certificate)<order id='123'>...</order>"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[Decrypter] Processing: (encryption)(certificate)<order id='123'>...</order>"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[Authenticator] Processing: (certificate)<order id='123'>...</order>"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[Deduplicator] Processing: <order id='123'>...</order>"));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[OMS] Processing unique order: <order id='123'>...</order>"));

    // Second message (duplicate) processing
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("[Deduplicator] Found duplicate order: 123"));

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("PipesAndFilters: conserved."));

    logSpy.mockRestore();
  });
});
