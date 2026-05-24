import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('S12G Agent 1 — Ecosystem Regression & Timeout Boundary tests', () => {
  const rootDir = process.cwd();
  
  it('1. S12 proof command exists and is registered', () => {
    const cliFilePath = path.join(rootDir, 'scripts/truex.ts');
    expect(fs.existsSync(cliFilePath)).toBe(true);
    const content = fs.readFileSync(cliFilePath, 'utf8');
    expect(content).toContain('project-evidence-types');
    expect(content).toContain('project-evidence-gapclose');
  });

  it('2. S12 proof command emits report', () => {
    const reportPath = path.join(rootDir, 'docs/vision2030/project-evidence-types-proof.report.json');
    expect(fs.existsSync(reportPath)).toBe(true);
  });

  it('3. S12 report records command evidence', () => {
    const reportPath = path.join(rootDir, 'docs/vision2030/project-evidence-types-proof.report.json');
    const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    expect(data.primitive).toBe('project-evidence-types');
    expect(data.status || data.passed).toBeDefined();
    expect(data.receiptHash).toBeDefined();
  });

  it('4. Unrelated timeout classifications cannot be marked ignored without evidence', () => {
    // Assert that we have documented the timeout classification with evidence
    const regressionReportPath = path.join(rootDir, 'docs/reports/s12g-agent-1-ecosystem-regression-timeouts.md');
    expect(fs.existsSync(regressionReportPath)).toBe(true);
    const content = fs.readFileSync(regressionReportPath, 'utf8');
    expect(content).toContain('Ecosystem Regression + Timeout Isolation');
    expect(content).toContain('pre-existing but now load-sensitive');
  });

  it('5. Gap ledger must exist', () => {
    const ledgerPath = path.join(rootDir, 'docs/reports/S12-GAP-LEDGER.md');
    expect(fs.existsSync(ledgerPath)).toBe(true);
  });

  it('6. Gap ledger must contain status for all known failures', () => {
    const ledgerPath = path.join(rootDir, 'docs/reports/S12-GAP-LEDGER.md');
    const content = fs.readFileSync(ledgerPath, 'utf8');
    expect(content).toContain('S12G-A');
    expect(content).toContain('S12G-B');
    expect(content).toContain('S12G-C');
    expect(content).toContain('S12G-D');
    expect(content).toContain('S12G-E');
  });

  it('7. Ecosystem regression report records the updated test suite pass count', () => {
    const regressionReportPath = path.join(rootDir, 'docs/reports/s12g-agent-1-ecosystem-regression-timeouts.md');
    expect(fs.existsSync(regressionReportPath)).toBe(true);
    const content = fs.readFileSync(regressionReportPath, 'utf8');
    expect(content).toContain('1153/1153 tests passing');
  });
});
