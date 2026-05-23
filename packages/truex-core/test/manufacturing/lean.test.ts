import { describe, it, expect } from 'vitest';
import { WasteDetector } from '../../src/manufacturing/lean.js';
import { TruexHook } from '../../src/hook.js';

describe('WasteDetector (TPS)', () => {
  it('should detect Mura (inconsistency) in hook execution times', () => {
    const detector = new WasteDetector();
    const mockHook = { definition: { id: 'hook-1' } } as TruexHook;

    // Stable executions
    detector.detectMura(mockHook, 10);
    detector.detectMura(mockHook, 11);
    detector.detectMura(mockHook, 10);
    detector.detectMura(mockHook, 9);
    const report1 = detector.detectMura(mockHook, 10);
    
    expect(report1.isUneven).toBe(false);
    expect(report1.meanDuration).toBeCloseTo(10);

    // Highly variable executions (Mura)
    detector.detectMura(mockHook, 50);
    detector.detectMura(mockHook, 2);
    detector.detectMura(mockHook, 100);
    const report2 = detector.detectMura(mockHook, 5);

    expect(report2.isUneven).toBe(true);
    expect(report2.sampleCount).toBe(9);
  });

  it('should identify Muda (waste) in the proxy membrane', () => {
    const detector = new WasteDetector();
    const target = { name: 'Truex Atom' };

    // First access is fine
    const report1 = detector.identifyMuda(target);
    expect(report1.redundantWraps).toBe(1);
    expect(report1.isWasteful).toBe(false);

    // Second access is redundant (Muda)
    const report2 = detector.identifyMuda(target);
    expect(report2.redundantWraps).toBe(2);
    expect(report2.isWasteful).toBe(true);
  });

  it('should detect cycles (Muda) in membrane operations', () => {
    const detector = new WasteDetector();
    const target = { name: 'Cyclic Atom' };

    detector.startOperation(target);
    
    const report = detector.identifyMuda(target);
    expect(report.cycleDetected).toBe(true);
    expect(report.isWasteful).toBe(true);

    detector.endOperation(target);
  });
});
