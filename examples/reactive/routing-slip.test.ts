import { describe, it, expect, vi } from 'vitest';
import { run } from '../../examples/reactive/routing-slip.js';

describe('Reactive Messaging Pattern: Routing Slip', () => {
  it('should process steps defined in the routing slip sequentially', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await run();

    const expectedOutputs = [
      '[create_customer] Processing registration for ABC, Inc.',
      '[create_customer] Forwarding to next step: set_up_contact_info',
      '[set_up_contact_info] Processing registration for ABC, Inc.',
      '[set_up_contact_info] Forwarding to next step: select_service_plan',
      '[select_service_plan] Processing registration for ABC, Inc.',
      '[select_service_plan] Forwarding to next step: check_credit',
      '[check_credit] Processing registration for ABC, Inc.',
      '[check_credit] Routing Slip completed for ABC, Inc.',
      'RoutingSlip: is completed.'
    ];

    expect(logSpy).toHaveBeenCalledTimes(expectedOutputs.length);
    expectedOutputs.forEach((output, index) => {
      expect(logSpy.mock.calls[index][0]).toBe(output);
    });

    logSpy.mockRestore();
  });
});
