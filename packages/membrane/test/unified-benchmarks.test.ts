import { describe, it, expect } from 'vitest';
import { DoctorAgent } from '../../../agents/doctor/agent.js';

describe('Unified Benchmarks Integration Test (S13/S11/S3)', () => {
  it('should run unified benchmarks and verify all invariants pass', async () => {
    const doctor = new DoctorAgent();
    const report = await doctor.prove('unified-benchmarks');
    expect(report.passed).toBe(true);
    expect(report.failures).toHaveLength(0);
    expect(report.invariants.length).toBeGreaterThanOrEqual(4);
  });
});
