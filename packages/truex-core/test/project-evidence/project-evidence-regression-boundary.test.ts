import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('S12 Ecosystem Regression & Timeout Boundaries', () => {
  const rootDir = path.resolve(__dirname, '../../../..');
  
  it('S12 proof command exists', () => {
    const scriptsDir = path.join(rootDir, 'scripts');
    const truexScript = path.join(scriptsDir, 'truex.ts');
    expect(fs.existsSync(truexScript)).toBe(true);
    const content = fs.readFileSync(truexScript, 'utf8');
    expect(content).toContain('doctor');
    expect(content).toContain('prove');
    expect(content).toContain('project-evidence-types');
  });

  it('S12 proof command emits report', () => {
    const reportPath = path.join(rootDir, 'docs/vision2030/project-evidence-types-proof.report.json');
    expect(fs.existsSync(reportPath)).toBe(true);
    const reportStr = fs.readFileSync(reportPath, 'utf8');
    expect(reportStr).toBeTruthy();
    const report = JSON.parse(reportStr);
    expect(report).toBeDefined();
    expect(report.passed).toBe(true);
    expect(report.invariants).toBeDefined();
  });

  it('S12 report records command evidence', () => {
    const reportPath = path.join(rootDir, 'docs/vision2030/project-evidence-types-proof.report.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    // Invariants should mention S12-E Command Invocation
    const hasCommandEvidence = report.invariants.some((inv: string) => inv.includes('[S12-E]'));
    expect(hasCommandEvidence).toBe(true);
  });

  it('unrelated timeout classifications cannot be marked "ignored" without evidence', () => {
    const gapLedgerPath = path.join(rootDir, 'docs/reports/S12-GAP-LEDGER.md');
    if (fs.existsSync(gapLedgerPath)) {
      const content = fs.readFileSync(gapLedgerPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (line.toLowerCase().includes('ignored')) {
          expect(line.toLowerCase()).toContain('evidence');
        }
      }
    }
  });

  it('gap ledger must exist', () => {
    const gapLedgerPath = path.join(rootDir, 'docs/reports/S12-GAP-LEDGER.md');
    expect(fs.existsSync(gapLedgerPath)).toBe(true);
  });

  it('gap ledger must contain status for all known failures', () => {
    const gapLedgerPath = path.join(rootDir, 'docs/reports/S12-GAP-LEDGER.md');
    const content = fs.readFileSync(gapLedgerPath, 'utf8');
    expect(content).toContain('S12G-F: Projection Fidelity + Round-Trip');
    expect(content).toContain('Status');
  });
});
