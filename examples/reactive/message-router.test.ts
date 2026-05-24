import { describe, it, expect, vi } from 'vitest';
import { run } from './message-router.js';

describe('Reactive Pattern: Message Router', () => {
  it('should route messages alternatingly between processors', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await run();

    // Message 1
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[AlternatingRouter] routing "Message #1" to proc-1'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[Processor 1] received: Message #1'));

    // Message 2
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[AlternatingRouter] routing "Message #2" to proc-2'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[Processor 2] received: Message #2'));

    // Message 3
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[AlternatingRouter] routing "Message #3" to proc-1'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[Processor 1] received: Message #3'));

    // Message 4
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[AlternatingRouter] routing "Message #4" to proc-2'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[Processor 2] received: Message #4'));

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('MessageRouter: is conserved.'));

    logSpy.mockRestore();
  });
});
