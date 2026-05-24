import { describe, it, expect, vi } from 'vitest';
import { run } from './point-to-point-channel.js';

describe('Reactive Pattern: Point-to-Point Channel', () => {
  it('should deliver messages precisely to the targeted hook process and mutate state', async () => {
    // We spy on console.log to verify the exact operational flow
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    // Verify the exact dispatch and processing order
    expect(logSpy).toHaveBeenCalledWith('[Actor B] Received: Goodbye, from actor C!');
    expect(logSpy).toHaveBeenCalledWith('[Actor B] Received: Hello, from actor A!');
    expect(logSpy).toHaveBeenCalledWith('PointToPointChannel: completed.');
    
    // Verify the final internal state of the OTP Hook
    // We expect 1 hello and 1 goodbye based on the payload parsing logic
    expect(logSpy).toHaveBeenCalledWith('[Actor B] Final state:', { hello: 1, goodbye: 1 });

    logSpy.mockRestore();
  });
});
