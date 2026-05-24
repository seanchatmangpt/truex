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
});
