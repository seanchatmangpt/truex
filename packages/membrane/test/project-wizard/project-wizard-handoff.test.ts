import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ProjectCell, CheckpointPlanner, MissionController } from '../../src/project-wizard.gall.js';

describe('Mission Controller + Handoff Domain (Agent 5)', () => {
  it('should refuse handoff before 12h and accept after elapsed gate is simulated/proven', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-handoff-test-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Test Handoff',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    const planner = new CheckpointPlanner(cell);
    planner.plan({});

    const controller = new MissionController(cell);

    // 1. Refuse before 12h
    expect(() => {
      controller.verifyHandoff({ requireElapsed: true, requireGallCheckpoints: true });
    }).toThrow(/Handoff Refused: Monotonic mission gate has not opened yet/);

    // 2. Mock time to be 13 hours in the past
    const startPath = path.join(tempDir, '.truex', 'mission', 'start.json');
    const startData = JSON.parse(fs.readFileSync(startPath, 'utf8'));
    const pastTime = new Date(Date.now() - 13 * 3600 * 1000).toISOString();
    startData.startTime = pastTime;
    fs.writeFileSync(startPath, JSON.stringify(startData, null, 2));

    // Create the expected agent report files to prevent missing reports failure
    const reportsDir = path.join(tempDir, 'docs', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });
    for (let i = 1; i <= 5; i++) {
      const names = [
        `12h-agent-${i}-wizard-cli.md`,
        `12h-agent-${i}-project-cell-topology.md`,
        `12h-agent-${i}-gall-checkpoint-planner.md`,
        `12h-agent-${i}-forge-bind-prove-harden.md`,
        `12h-agent-${i}-mission-handoff.md`
      ];
      fs.writeFileSync(path.join(reportsDir, names[i - 1]), '# Mock report', 'utf8');
    }

    // Now it should pass the elapsed and agent reports check
    controller.verifyHandoff({ requireElapsed: true, requireGallCheckpoints: true, requireAgentReports: 5 });

    // Finalize
    controller.finalize({
      W1: '100%',
      W2: '100%',
      W3: '100%',
      W4: '100%',
      W5: '100%'
    });

    expect(fs.existsSync(path.join(tempDir, '.truex', 'mission', 'finalization.json'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'docs', 'reports', 'PROJECT-WIZARD-S11-SYNTHESIS.md'))).toBe(true);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
