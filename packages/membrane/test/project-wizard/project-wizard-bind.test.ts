import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ProjectCell, CheckpointPlanner, ExecutionEngine } from '../../src/project-wizard.gall.js';

describe('Project Wizard Verb 5 - bind (v0.1 Spec Validation)', () => {
  it('should structurally bind forged artifacts, tests, docs, and doctor targets for a checkpoint', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-bind-spec-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Test Bind Spec Compliance',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    const planner = new CheckpointPlanner(cell);
    planner.plan({});

    const engine = new ExecutionEngine(cell);

    // Bind cp-cli-contract
    engine.bind('cp-cli-contract');

    const integrationMapPath = path.join(tempDir, '.truex', 'reports', 'integration-map.json');
    expect(fs.existsSync(integrationMapPath)).toBe(true);

    const mapData = JSON.parse(fs.readFileSync(integrationMapPath, 'utf8'));
    const connection = mapData['cp-cli-contract'];
    expect(connection).toBeDefined();
    expect(connection.checkpointId).toBe('cp-cli-contract');

    // Asserts forged artifacts connection (non-test files)
    expect(connection.forgedArtifacts).toContain('scripts/truex.ts');
    expect(connection.forgedArtifacts).not.toContain('packages/membrane/test/project-wizard/project-wizard-cli.test.ts');

    // Asserts tests connection (test files)
    expect(connection.tests).toContain('packages/membrane/test/project-wizard/project-wizard-cli.test.ts');

    // Asserts docs connection (reports expected)
    expect(connection.docs).toContain('docs/reports/12h-agent-1-wizard-cli.md');

    // Asserts doctor targets connection
    expect(connection.doctorTargets).toContain('wizard');

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should dynamically link additional documents like C4 diagrams on cp-project-cell checkpoint', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-bind-c4-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Test C4 Linkage',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    const planner = new CheckpointPlanner(cell);
    planner.plan({});

    const engine = new ExecutionEngine(cell);
    engine.bind('cp-project-cell');

    const integrationMapPath = path.join(tempDir, '.truex', 'reports', 'integration-map.json');
    const mapData = JSON.parse(fs.readFileSync(integrationMapPath, 'utf8'));
    const connection = mapData['cp-project-cell'];

    expect(connection.docs).toContain('docs/project-c4-context.mmd');
    expect(connection.docs).toContain('docs/project-c4-container.mmd');
    expect(connection.doctorTargets).toContain('topology');
    expect(connection.doctorTargets).toContain('wizard');

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should detect unbound files in the project workspace to prevent orphan work', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-bind-orphans-'));
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Test Orphan Work Detection',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    const planner = new CheckpointPlanner(cell);
    planner.plan({});

    const engine = new ExecutionEngine(cell);

    // Create a dummy file that is not part of filesExpected or reportsExpected of any checkpoint
    const orphanFileRel = 'src/orphan-module.ts';
    const orphanFilePath = path.join(tempDir, orphanFileRel);
    fs.mkdirSync(path.dirname(orphanFilePath), { recursive: true });
    fs.writeFileSync(orphanFilePath, 'console.log("orphan");');

    // Bind a checkpoint
    engine.bind('cp-cli-contract');

    const integrationMapPath = path.join(tempDir, '.truex', 'reports', 'integration-map.json');
    let mapData = JSON.parse(fs.readFileSync(integrationMapPath, 'utf8'));

    // Assert the orphan file is detected and recorded under _unboundFiles
    expect(mapData._unboundFiles).toContain(orphanFileRel);

    // Now delete the orphan file and check if it gets removed from _unboundFiles on next bind
    fs.unlinkSync(orphanFilePath);
    engine.bind('cp-cli-contract');

    mapData = JSON.parse(fs.readFileSync(integrationMapPath, 'utf8'));
    expect(mapData._unboundFiles).not.toContain(orphanFileRel);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
