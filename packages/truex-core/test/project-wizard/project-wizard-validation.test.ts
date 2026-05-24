import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ProjectCell, CheckpointPlanner, MissionController } from '../../src/project-wizard.gall.js';
import type { GallCheckpoint } from '../../src/project-wizard.gall.js';

describe('Project Wizard Security, Validation, and Exception Bubbles', () => {
  describe('Path Traversal & Boundary Protections', () => {
    it('should refuse project paths with null bytes', () => {
      expect(() => new ProjectCell('/some/path\0')).toThrow(/Project path contains null bytes/);
    });

    it('should refuse empty or non-string project paths', () => {
      expect(() => new ProjectCell('')).toThrow(/Project path must be a non-empty string/);
    });

    it('should resolve safe paths and throw on traversal attempts', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-traversal-'));
      const cell = new ProjectCell(tempDir);

      // Safe resolutions
      expect(cell.resolvePath('docs/report.md')).toBe(path.resolve(tempDir, 'docs/report.md'));
      expect(cell.resolvePath('.')).toBe(path.resolve(tempDir));
      expect(cell.resolvePath('../' + path.basename(tempDir))).toBe(path.resolve(tempDir));

      // Traversal rejections
      expect(() => cell.resolvePath('../outside.md')).toThrow(/Path traversal refused/);
      expect(() => cell.resolvePath(`../${path.basename(tempDir)}-other/file.ts`)).toThrow(/Path traversal refused/);
      expect(() => cell.resolvePath('/etc/passwd')).toThrow(/Path traversal refused/);
      expect(() => cell.resolvePath('docs/report.md\0')).toThrow(/Path traversal refused: path contains null bytes/);

      fs.rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('Config Schema & Format Failures', () => {
    it('should reject invalid project config parameters during init', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-config-v-'));
      const cell = new ProjectCell(tempDir);

      // 1. Mismatched path
      expect(() => {
        cell.init({
          path: '/different/path',
          mission: 'Validate CLI schema requirements',
          durationHours: 12,
          agents: 5,
          status: 'initialized'
        });
      }).toThrow(/Config format failure: 'path'/);

      // 2. Short/Vague mission
      expect(() => {
        cell.init({
          path: tempDir,
          mission: 'Short',
          durationHours: 12,
          agents: 5,
          status: 'initialized'
        });
      }).toThrow(/Config format failure: 'mission'/);

      // 3. Invalid durationHours (< 12)
      expect(() => {
        cell.init({
          path: tempDir,
          mission: 'Validate CLI schema requirements',
          durationHours: 11,
          agents: 5,
          status: 'initialized'
        });
      }).toThrow(/Config format failure: 'durationHours'/);

      // 4. Invalid agents count
      expect(() => {
        cell.init({
          path: tempDir,
          mission: 'Validate CLI schema requirements',
          durationHours: 12,
          agents: 0,
          status: 'initialized'
        });
      }).toThrow(/Config format failure: 'agents'/);

      // 5. Invalid status
      expect(() => {
        cell.init({
          path: tempDir,
          mission: 'Validate CLI schema requirements',
          durationHours: 12,
          agents: 5,
          status: 'invalid' as any
        });
      }).toThrow(/Config format failure: 'status'/);

      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should throw format failure if existing project.json is corrupted', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-config-corrupt-'));
      
      // Initialize properly first
      const cell = new ProjectCell(tempDir);
      cell.init({
        path: tempDir,
        mission: 'Initialize correct project first',
        durationHours: 12,
        agents: 5,
        status: 'initialized'
      });

      // Tamper with project.json by writing corrupted JSON content
      const configPath = path.join(tempDir, '.truex', 'project.json');
      fs.writeFileSync(configPath, '{invalid: json', 'utf8');

      // Subsequent init call should succeed by recovering and overwriting corrupted config
      const receipt = cell.init({
        path: tempDir,
        mission: 'Try to initialize on top of corrupted JSON',
        durationHours: 12,
        agents: 5,
        status: 'initialized'
      });
      expect(receipt.status).toBe('succeeded');

      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should throw validation failure if existing project.json schema is invalid', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-config-schema-'));
      
      // Initialize properly first
      const cell = new ProjectCell(tempDir);
      cell.init({
        path: tempDir,
        mission: 'Initialize correct project first',
        durationHours: 12,
        agents: 5,
        status: 'initialized'
      });

      // Write invalid schema JSON to project.json
      const configPath = path.join(tempDir, '.truex', 'project.json');
      fs.writeFileSync(configPath, JSON.stringify({
        path: tempDir,
        mission: 'Short', // Invalid: < 10 characters
        durationHours: 12,
        agents: 5,
        status: 'initialized'
      }), 'utf8');

      expect(() => {
        cell.init({
          path: tempDir,
          mission: 'Try to initialize on top of invalid schema',
          durationHours: 12,
          agents: 5,
          status: 'initialized'
        });
      }).toThrow(/Config format failure: 'mission'/);

      fs.rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('Illegal Names & Metadata Checks', () => {
    it('should reject checkpoint with illegal characters in ID', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-cp-id-'));
      const cell = new ProjectCell(tempDir);
      const planner = new CheckpointPlanner(cell);

      const badCheckpoint: GallCheckpoint = {
        id: 'cp/../bad',
        name: 'Bad Checkpoint ID',
        domain: 'Security',
        purpose: 'Attempt to escape via ID path traversal',
        proofCommand: 'vitest packages/truex-core/test/project-wizard/project-wizard-cli.test.ts',
        accountingDomain: 'Domain W1',
        successMetric: 'Checks pass',
        refusalCondition: 'Never fails',
        filesExpected: [],
        reportsExpected: []
      };

      expect(() => planner.validateCheckpoint(badCheckpoint)).toThrow(
        /Checkpoint planner validation failed: Checkpoint ID ".*" is invalid or contains illegal characters/
      );

      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should reject checkpoint with path traversal in filesExpected or reportsExpected', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-cp-traversal-'));
      const cell = new ProjectCell(tempDir);
      const planner = new CheckpointPlanner(cell);

      const badFilesCheckpoint: GallCheckpoint = {
        id: 'cp-bad-files',
        name: 'Bad Checkpoint Files',
        domain: 'Security',
        purpose: 'Attempt path traversal inside filesExpected array',
        proofCommand: 'vitest packages/truex-core/test/project-wizard/project-wizard-cli.test.ts',
        accountingDomain: 'Domain W1',
        successMetric: 'Checks pass',
        refusalCondition: 'Never fails',
        filesExpected: ['../../etc/passwd'],
        reportsExpected: []
      };

      expect(() => planner.validateCheckpoint(badFilesCheckpoint)).toThrow(/Path traversal refused/);

      const badReportsCheckpoint: GallCheckpoint = {
        id: 'cp-bad-reports',
        name: 'Bad Checkpoint Reports',
        domain: 'Security',
        purpose: 'Attempt path traversal inside reportsExpected array',
        proofCommand: 'vitest packages/truex-core/test/project-wizard/project-wizard-cli.test.ts',
        accountingDomain: 'Domain W1',
        successMetric: 'Checks pass',
        refusalCondition: 'Never fails',
        filesExpected: [],
        reportsExpected: ['../../etc/shadow']
      };

      expect(() => planner.validateCheckpoint(badReportsCheckpoint)).toThrow(/Path traversal refused/);

      fs.rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('Ledger Corruption Checks', () => {
    it('should fail with ledger corruption if accounting.json is missing or corrupted during handoff', () => {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-ledger-corrupt-'));
      const cell = new ProjectCell(tempDir);
      cell.init({
        path: tempDir,
        mission: 'Initialize project for handoff test',
        durationHours: 12,
        agents: 5,
        status: 'initialized'
      });

      const controller = new MissionController(cell);

      // Write corrupted JSON to accounting.json
      const accPath = path.join(tempDir, '.truex', 'reports', 'accounting.json');
      fs.writeFileSync(accPath, '{corrupted-data', 'utf8');

      expect(() => {
        controller.verifyHandoff({ requireElapsed: false, requireGallCheckpoints: false });
      }).toThrow(/Ledger corruption: accounting.json failed to parse/);

      fs.rmSync(tempDir, { recursive: true, force: true });
    });
  });
});
