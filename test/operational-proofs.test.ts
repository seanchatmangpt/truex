import { describe, expect, it } from 'vitest';
import {
  proveOperationalCapabilityBreakpoints,
  proveOperationalDoctorWizardTelcoUnified,
  proveOperationalTelemetryIntegration,
  proveOperationalUnifiedIntegration,
} from '../skills/integration/operational-proofs.js';

describe('operational crown proofs', () => {
  it('proves the live Doctor-Wizard-Telco flow', () => {
    const report = proveOperationalDoctorWizardTelcoUnified();
    expect(report.passed, report.failures.join('\n')).toBe(true);
    expect(report.receiptHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('replays telemetry deterministically', () => {
    const first = proveOperationalTelemetryIntegration();
    const replay = proveOperationalTelemetryIntegration();
    expect(first.passed, first.failures.join('\n')).toBe(true);
    expect(first.receiptHash).toBe(replay.receiptHash);
  });

  it('composes unified integration from live receipts', () => {
    const report = proveOperationalUnifiedIntegration();
    expect(report.passed, report.failures.join('\n')).toBe(true);
  });

  it('proves every refusal breakpoint without stale artifacts', () => {
    const report = proveOperationalCapabilityBreakpoints();
    expect(report.passed, report.failures.join('\n')).toBe(true);
  });
});
