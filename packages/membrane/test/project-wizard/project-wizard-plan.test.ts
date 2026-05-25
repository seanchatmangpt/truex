import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ProjectCell, CheckpointPlanner } from '../../src/project-wizard.gall.js';
import type { GallCheckpoint } from '../../src/project-wizard.gall.js';

describe('Gall Checkpoint Planner Domain (Agent 3)', () => {
  it('should plan checkpoints, output registry, and reject vague checkpoints', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-plan-test-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Test Planning',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    const planner = new CheckpointPlanner(cell);
    const { registry, hash: regHash } = planner.plan({});

    expect(registry.length).toBe(5);
    expect(regHash).toBeDefined();
    expect(fs.existsSync(path.join(tempDir, '.truex', 'checkpoints', 'checkpoint-registry.json'))).toBe(true);

    // Test vague checkpoint rejection
    const vagueCheckpoint: GallCheckpoint = {
      id: 'cp-vague',
      name: '', // Vague
      domain: 'Testing',
      purpose: 'To do something',
      proofCommand: '', // Missing
      accountingDomain: '', // Missing
      successMetric: '',
      refusalCondition: '',
      filesExpected: [],
      reportsExpected: []
    };

    expect(() => {
      planner.validateCheckpoint(vagueCheckpoint);
    }).toThrow(/validation failed/);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
