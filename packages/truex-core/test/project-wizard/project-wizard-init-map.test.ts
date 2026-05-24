import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ProjectCell, ProjectMapper } from '../../src/project-wizard.gall.js';

describe('Project Cell + Topology Mapper Domain (Agent 2)', () => {
  it('should initialize folders and project files idempotently', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-init-map-'));
    const cell = new ProjectCell(tempDir);

    cell.init({
      path: tempDir,
      mission: 'Test Init & Map',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    const expectedDirs = [
      '.truex',
      '.truex/receipts',
      '.truex/reports',
      '.truex/checkpoints',
      '.truex/mission',
      'docs',
      'docs/reports',
      'docs/benchmarks',
      'tests'
    ];

    for (const dir of expectedDirs) {
      expect(fs.existsSync(path.join(tempDir, dir))).toBe(true);
    }

    expect(fs.existsSync(path.join(tempDir, '.truex', 'project.json'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.truex', 'mission', 'start.json'))).toBe(true);

    // Call init again to verify idempotency
    const prevStart = JSON.parse(fs.readFileSync(path.join(tempDir, '.truex', 'mission', 'start.json'), 'utf8'));
    cell.init({
      path: tempDir,
      mission: 'Test Init & Map Refreshed',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    const nextStart = JSON.parse(fs.readFileSync(path.join(tempDir, '.truex', 'mission', 'start.json'), 'utf8'));
    expect(prevStart.startTime).toBe(nextStart.startTime); // Start time preserved

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should build project topology facts and generate C4 maps', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-map-test-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Test Mapping',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    // Create a dummy file in a mock src dir
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'src', 'app.ts'), '// hello', 'utf8');

    const mapper = new ProjectMapper(cell);
    const { topology, hash: topoHash } = mapper.map();

    expect(topoHash).toBeDefined();
    expect(topology.inventory.source.includes('src/app.ts')).toBe(true);
    expect(fs.existsSync(path.join(tempDir, '.truex', 'reports', 'project-topology.json'))).toBe(true);
    expect(fs.existsSync(path.join(tempDir, 'docs', 'project-c4-context.mmd'))).toBe(true);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
