import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { execSync } from 'node:child_process';
import { ProjectCell } from '../../src/project-wizard.gall.js';

describe('Wizard CLI + Verb Contract Domain (Agent 1)', () => {
  it('should resolve paths within the project boundary and refuse path traversal', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-cli-test-'));
    const cell = new ProjectCell(tempDir);

    expect(cell.resolvePath('docs/report.md')).toBe(path.resolve(tempDir, 'docs/report.md'));
    expect(() => {
      cell.resolvePath('../outside.md');
    }).toThrow(/Path traversal refused/);
    expect(() => {
      cell.resolvePath(`../${path.basename(tempDir)}-other/file.ts`);
    }).toThrow(/Path traversal refused/);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should emit correct command receipt on init', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-cli-receipt-'));
    const cell = new ProjectCell(tempDir);

    const receipt = cell.init({
      path: tempDir,
      mission: 'Test CLI Receipt',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    expect(receipt.verb).toBe('init');
    expect(receipt.status).toBe('succeeded');
    expect(receipt.receiptHash).toBeDefined();
    expect(receipt.projectPath).toBe(tempDir);

    const receiptFiles = fs.readdirSync(path.join(tempDir, '.truex', 'receipts'));
    expect(receiptFiles.length).toBeGreaterThan(0);

    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should run all 8 CLI subcommands in sequence and emit receipts', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-cli-routing-'));
    const cliPath = path.resolve(process.cwd(), 'scripts/truex.ts');

    const execCmd = (args: string) => {
      const cmd = `node --import tsx/esm "${cliPath}" wizard ${args}`;
      const output = execSync(cmd, {
        encoding: 'utf8',
        env: {
          PATH: process.env.PATH,
          HOME: process.env.HOME,
          USER: process.env.USER,
          LANG: process.env.LANG,
          VITEST: 'true'
        }
      });
      return JSON.parse(output);
    };

    // 1. init
    const initReceipt = execCmd(`init "${tempDir}" --mission "CLI Routing Test" --duration-hours 12 --agents 5`);
    expect(initReceipt.verb).toBe('init');
    expect(initReceipt.status).toBe('succeeded');
    expect(initReceipt.receiptHash).toBeDefined();

    // 2. map
    const mapReceipt = execCmd(`map "${tempDir}"`);
    expect(mapReceipt.verb).toBe('map');
    expect(mapReceipt.status).toBe('succeeded');

    // 3. plan
    const planReceipt = execCmd(`plan "${tempDir}"`);
    expect(planReceipt.verb).toBe('plan');
    expect(planReceipt.status).toBe('succeeded');

    // 4. forge
    const forgeReceipt = execCmd(`forge "${tempDir}" --checkpoint cp-cli-contract`);
    expect(forgeReceipt.verb).toBe('forge');
    expect(forgeReceipt.status).toBe('succeeded');

    // 5. bind
    const bindReceipt = execCmd(`bind "${tempDir}" --checkpoint cp-cli-contract`);
    expect(bindReceipt.verb).toBe('bind');
    expect(bindReceipt.status).toBe('succeeded');

    // 6. prove
    const proveReceipt = execCmd(`prove "${tempDir}" --checkpoint cp-cli-contract`);
    expect(proveReceipt.verb).toBe('prove');
    expect(proveReceipt.status).toBe('succeeded');

    // 7. harden
    const hardenReceipt = execCmd(`harden "${tempDir}" --checkpoint cp-cli-contract`);
    expect(hardenReceipt.verb).toBe('harden');
    expect(hardenReceipt.status).toBe('succeeded');

    // 8. handoff
    const handoffReceipt = execCmd(`handoff "${tempDir}" --require-agent-reports 0`);
    expect(handoffReceipt.verb).toBe('handoff');
    expect(handoffReceipt.status).toBe('succeeded');

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
