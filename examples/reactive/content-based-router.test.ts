import { describe, it, expect, vi } from 'vitest';
import { run } from './content-based-router.js';

describe('Reactive Pattern: Content-Based Router', () => {
  it('should route messages based on their content', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await run();

    // Route TypeABC to inv-A
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[OrderRouter] routing to A'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[InventorySystemA] handling Order Items for A'));

    // Route TypeXYZ to inv-X
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[OrderRouter] routing to X'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[InventorySystemX] handling Order Items for X'));

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ContentBasedRouter: is conserved.'));

    logSpy.mockRestore();
  });
});
