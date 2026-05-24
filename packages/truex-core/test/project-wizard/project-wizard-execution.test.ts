import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ProjectCell, CheckpointPlanner, ExecutionEngine } from '../../src/project-wizard.gall.js';
import type { AccountingData } from '../../src/project-wizard.gall.js';

describe('Forge / Bind / Prove / Harden Domain (Agent 4)', () => {
  it('should forge placeholder files, bind maps, run proof, and harden envelope', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-execution-test-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Test Execution',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    const planner = new CheckpointPlanner(cell);
    planner.plan({});

    const engine = new ExecutionEngine(cell);
    
    // Forge
    engine.forge('cp-cli-contract');
    expect(fs.existsSync(path.join(tempDir, 'scripts', 'truex.ts'))).toBe(true);

    // Bind
    engine.bind('cp-cli-contract');
    expect(fs.existsSync(path.join(tempDir, '.truex', 'reports', 'integration-map.json'))).toBe(true);

    // Prove
    const proveRes = engine.prove('cp-cli-contract');
    console.log("PROVE OUTPUT:", proveRes.output);
    expect(proveRes.exitCode).toBe(0);
    expect(fs.existsSync(path.join(tempDir, '.truex', 'reports', 'proof-cp-cli-contract.json'))).toBe(true);

    // Harden
    const hardenRes = engine.harden('cp-cli-contract');
    expect(hardenRes.failureEnvelope.classifications.refused.length).toBeGreaterThan(0);
    expect(fs.existsSync(path.join(tempDir, '.truex', 'reports', 'harden-cp-cli-contract.json'))).toBe(true);

    // Verify accounting conservation
    const acc = JSON.parse(fs.readFileSync(path.join(tempDir, '.truex', 'reports', 'accounting.json'), 'utf8')) as AccountingData;
    expect(acc.W2.attempted).toBeGreaterThan(0);
    expect(acc.W4.attempted).toBeGreaterThan(0);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should verify checkpoint execution, file change materialization, rollback fixture writing, and execution rollback correctness', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-rollback-test-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Rollback and Forge verification',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    const planner = new CheckpointPlanner(cell);
    planner.plan({});

    const engine = new ExecutionEngine(cell);

    const cpId = 'cp-cli-contract';
    const testFile = 'scripts/truex.ts';
    const otherFile = 'packages/truex-core/test/project-wizard/project-wizard-cli.test.ts';

    // 1. Initial State: create testFile with some pre-existing content.
    const originalContent = '// Original Script Content';
    const fullTestFilePath = path.join(tempDir, testFile);
    fs.mkdirSync(path.dirname(fullTestFilePath), { recursive: true });
    fs.writeFileSync(fullTestFilePath, originalContent, 'utf8');

    // Verify error: attempting to self-complete when mock proof report has verified: true
    const mockReportPath = path.join(tempDir, '.truex', 'reports', `proof-${cpId}.json`);
    fs.mkdirSync(path.dirname(mockReportPath), { recursive: true });
    fs.writeFileSync(mockReportPath, JSON.stringify({ verified: true }), 'utf8');
    expect(() => engine.forge(cpId)).toThrow(/Self-completion claim restricted/);
    fs.unlinkSync(mockReportPath);

    // Verify error: write set boundary violation (passing file outside expected)
    expect(() => {
      engine.forge(cpId, ['invalid/file/path.ts']);
    }).toThrow(/Checkpoint write set boundary violation/);

    // Verify error: custom deltaContent attempt to write outside active write set
    expect(() => {
      engine.forge(cpId, undefined, { 'invalid/file/path.ts': '// bad' });
    }).toThrow(/Checkpoint write set boundary violation/);

    // 2. Execute Forge: modify existing testFile and create otherFile.
    const newContent = '// New Modified Script Content';
    const otherContent = '// New Cli Test Content';
    
    engine.forge(cpId, undefined, {
      [testFile]: newContent,
      [otherFile]: otherContent
    });

    // Check file change materialization
    expect(fs.readFileSync(fullTestFilePath, 'utf8')).toBe(newContent);
    expect(fs.readFileSync(path.join(tempDir, otherFile), 'utf8')).toBe(otherContent);

    // 3. Verify rollback fixture writing
    const rollbackBaseDir = path.join(tempDir, '.truex', 'rollback');
    expect(fs.existsSync(rollbackBaseDir)).toBe(true);

    const directories = fs.readdirSync(rollbackBaseDir)
      .filter(f => f.startsWith(`rollback-${cpId}-`))
      .sort();
    console.log('DEBUG DIRECTORIES:', directories);
    expect(directories.length).toBeGreaterThanOrEqual(1);

    const latestFixture = directories[directories.length - 1];
    const fixtureDir = path.join(rollbackBaseDir, latestFixture);
    const logPath = path.join(fixtureDir, 'rollback-log.json');
    expect(fs.existsSync(logPath)).toBe(true);

    const logData = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    expect(logData.checkpointId).toBe(cpId);
    expect(logData.log[testFile]).toEqual({
      type: 'modified',
      originalContent: originalContent
    });
    expect(logData.log[otherFile]).toEqual({
      type: 'created'
    });

    // Check backup file existence for modified files
    const backupFileName = testFile.replace(/[\/\\]/g, '_') + '.bak';
    expect(fs.existsSync(path.join(fixtureDir, backupFileName))).toBe(true);
    expect(fs.readFileSync(path.join(fixtureDir, backupFileName), 'utf8')).toBe(originalContent);

    // 4. Verify execution rollback correctness
    engine.rollback(cpId);

    // Reverted modified file content
    expect(fs.readFileSync(fullTestFilePath, 'utf8')).toBe(originalContent);
    // Deleted created file
    expect(fs.existsSync(path.join(tempDir, otherFile))).toBe(false);

    // Rollback receipt exists in receipts dir
    const receiptsDir = path.join(tempDir, '.truex', 'receipts');
    const receipts = fs.readdirSync(receiptsDir).filter(f => f.startsWith('receipt-rollback-'));
    expect(receipts.length).toBe(1);

    const receipt = JSON.parse(fs.readFileSync(path.join(receiptsDir, receipts[0]), 'utf8'));
    expect(receipt.verb).toBe('rollback');
    expect(receipt.status).toBe('succeeded');
    expect(directories.some(d => receipt.details.includes(d))).toBe(true);

    // Ledger has rollback record
    const ledger = JSON.parse(fs.readFileSync(path.join(tempDir, '.truex', 'reports', 'execution-ledger.json'), 'utf8'));
    const rollbackRecord = ledger.find((r: any) => r.verb === 'rollback');
    expect(rollbackRecord).toBeDefined();
    expect(rollbackRecord.status).toBe('succeeded');

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should throw correct error when rolling back with missing fixtures', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-rollback-err-test-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Rollback Error Verification',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });
    const engine = new ExecutionEngine(cell);

    // Rollback fail: No rollback base dir
    expect(() => engine.rollback('cp-cli-contract')).toThrow(/No rollback fixtures found/);

    // Rollback fail: Base dir exists but no fixtures for this checkpoint
    const rollbackBaseDir = path.join(tempDir, '.truex', 'rollback');
    fs.mkdirSync(rollbackBaseDir, { recursive: true });
    expect(() => engine.rollback('cp-cli-contract')).toThrow(/No rollback fixtures found for checkpoint/);

    // Rollback fail: Fixture folder exists but rollback-log.json is missing
    const dummyFixtureDir = path.join(rollbackBaseDir, 'rollback-cp-cli-contract-12345');
    fs.mkdirSync(dummyFixtureDir, { recursive: true });
    expect(() => engine.rollback('cp-cli-contract')).toThrow(/Rollback log missing in fixture/);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

