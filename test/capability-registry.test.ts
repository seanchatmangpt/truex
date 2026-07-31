import { describe, expect, it } from 'vitest';
import {
  TRUEX_CAPABILITIES,
  findDuplicateJsonKeys,
  resolveCapabilityClosure,
  validateCapabilityRegistry,
} from '../src/capabilities.js';

describe('Truex capability registry', () => {
  it('maps every admitted package, crate, proof and verb', () => {
    const report = validateCapabilityRegistry();
    expect(report.valid).toBe(true);
    expect(report.errors).toEqual([]);
    expect(TRUEX_CAPABILITIES).toHaveLength(86);
    expect(report.counts).toEqual({
      'typescript-package': 17,
      'rust-crate': 11,
      'doctor-proof': 42,
      'wizard-verb': 10,
      'telco-verb': 2,
      'process-mining-verb': 2,
      integration: 2,
    });
  });

  it('resolves dependency-first closure without duplication', () => {
    const closure = resolveCapabilityClosure('doctor:finalization');
    expect(closure.at(-1)?.id).toBe('doctor:finalization');
    expect(new Set(closure.map((item) => item.id)).size).toBe(closure.length);
    expect(closure.map((item) => item.id)).toContain('doctor:hash');
  });

  it('detects duplicate JSON keys in their object scope', () => {
    expect(findDuplicateJsonKeys('{"exports":{"./errors":1,"./errors":2}}')).toEqual(['exports../errors']);
    expect(findDuplicateJsonKeys('{"left":{"x":1},"right":{"x":2}}')).toEqual([]);
  });
});
