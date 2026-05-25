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
          VITEST: 'true',
          TSX_DISABLE_CACHE: '1'
        }
      });
      const jsonBlocks: any[] = [];
      let braceCount = 0;
      let startIdx = -1;
      for (let i = 0; i < output.length; i++) {
        if (output[i] === '{') {
          if (braceCount === 0) startIdx = i;
          braceCount++;
        } else if (output[i] === '}') {
          braceCount--;
          if (braceCount === 0 && startIdx !== -1) {
            const blockStr = output.slice(startIdx, i + 1);
            try {
              jsonBlocks.push(JSON.parse(blockStr));
            } catch {}
          }
        }
      }
      if (jsonBlocks.length > 0) {
        return jsonBlocks.at(-1);
      }
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

  it('should reject invalid option combinations and boundary checks for the 8 verbs', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-cli-adversarial-'));
    const cliPath = path.resolve(process.cwd(), 'scripts/truex.ts');

    const execCmdFailure = (args: string) => {
      const cmd = `node --import tsx/esm "${cliPath}" wizard ${args}`;
      try {
        execSync(cmd, {
          encoding: 'utf8',
          stdio: 'pipe',
          env: {
            PATH: process.env.PATH,
            HOME: process.env.HOME,
            USER: process.env.USER,
            LANG: process.env.LANG,
            VITEST: 'true',
            TSX_DISABLE_CACHE: '1'
          }
        });
        throw new Error(`Expected command wizard ${args} to fail but it succeeded.`);
      } catch (error: any) {
        if (error.message.startsWith('Expected command')) {
          throw error;
        }
        const stdout = error.stdout?.toString() || '';
        try {
          const jsonBlocks: any[] = [];
          let braceCount = 0;
          let startIdx = -1;
          for (let i = 0; i < stdout.length; i++) {
            if (stdout[i] === '{') {
              if (braceCount === 0) startIdx = i;
              braceCount++;
            } else if (stdout[i] === '}') {
              braceCount--;
              if (braceCount === 0 && startIdx !== -1) {
                const blockStr = stdout.slice(startIdx, i + 1);
                try {
                  jsonBlocks.push(JSON.parse(blockStr));
                } catch {}
              }
            }
          }
          if (jsonBlocks.length > 0) {
            return jsonBlocks.at(-1);
          }
          return JSON.parse(stdout);
        } catch {
          throw new Error(`Command wizard ${args} failed but output was not JSON: ${stdout}`);
        }
      }
    };

    // 1. Missing project path check
    const initMissingPath = execCmdFailure(`init`);
    expect(initMissingPath.verb).toBe('init');
    expect(initMissingPath.status).toBe('refused');
    expect(initMissingPath.details).toContain('Missing project path');

    // 2. Uninitialized cell checks:
    // map on uninitialized cell
    const mapUninit = execCmdFailure(`map "${tempDir}"`);
    expect(mapUninit.verb).toBe('map');
    expect(mapUninit.status).toBe('refused');
    expect(mapUninit.details).toContain('Project cell not initialized');

    // plan on uninitialized cell
    const planUninit = execCmdFailure(`plan "${tempDir}"`);
    expect(planUninit.verb).toBe('plan');
    expect(planUninit.status).toBe('refused');
    expect(planUninit.details).toContain('Project cell not initialized');

    // forge on uninitialized cell
    const forgeUninit = execCmdFailure(`forge "${tempDir}" --checkpoint cp-cli-contract`);
    expect(forgeUninit.verb).toBe('forge');
    expect(forgeUninit.status).toBe('refused');

    // bind on uninitialized cell
    const bindUninit = execCmdFailure(`bind "${tempDir}" --checkpoint cp-cli-contract`);
    expect(bindUninit.verb).toBe('bind');
    expect(bindUninit.status).toBe('refused');

    // prove on uninitialized cell
    const proveUninit = execCmdFailure(`prove "${tempDir}" --checkpoint cp-cli-contract`);
    expect(proveUninit.verb).toBe('prove');
    expect(proveUninit.status).toBe('refused');

    // harden on uninitialized cell
    const hardenUninit = execCmdFailure(`harden "${tempDir}" --checkpoint cp-cli-contract`);
    expect(hardenUninit.verb).toBe('harden');
    expect(hardenUninit.status).toBe('refused');

    // handoff on uninitialized cell
    const handoffUninit = execCmdFailure(`handoff "${tempDir}"`);
    expect(handoffUninit.verb).toBe('handoff');
    expect(handoffUninit.status).toBe('refused');

    // 3. Option validation and boundary checks:
    // init with duration less than 12
    const initBadDuration = execCmdFailure(`init "${tempDir}" --duration-hours 5`);
    expect(initBadDuration.verb).toBe('init');
    expect(initBadDuration.status).toBe('refused');
    expect(initBadDuration.details).toContain('durationHours');

    // init with invalid agents
    const initBadAgents = execCmdFailure(`init "${tempDir}" --agents -3`);
    expect(initBadAgents.verb).toBe('init');
    expect(initBadAgents.status).toBe('refused');
    expect(initBadAgents.details).toContain('agents');

    // Initialize cleanly for the subsequent checks
    const initCmd = `node --import tsx/esm "${cliPath}" wizard init "${tempDir}" --mission "Adversarial Tests" --duration-hours 12 --agents 5`;
    execSync(initCmd, { stdio: 'ignore', env: process.env });

    // Now initialized. Let's check plan with invalid mode
    // We need a topology map first
    const mapCmd = `node --import tsx/esm "${cliPath}" wizard map "${tempDir}"`;
    execSync(mapCmd, { stdio: 'ignore', env: process.env });

    const planBadMode = execCmdFailure(`plan "${tempDir}" --checkpoint-mode invalid`);
    expect(planBadMode.verb).toBe('plan');
    expect(planBadMode.status).toBe('refused');
    expect(planBadMode.details).toContain('checkpoint-mode');

    // forge with missing checkpoint ID
    const forgeMissingCp = execCmdFailure(`forge "${tempDir}"`);
    expect(forgeMissingCp.verb).toBe('forge');
    expect(forgeMissingCp.status).toBe('refused');
    expect(forgeMissingCp.details).toContain('checkpoint ID option is required');

    // bind with missing checkpoint ID
    const bindMissingCp = execCmdFailure(`bind "${tempDir}"`);
    expect(bindMissingCp.verb).toBe('bind');
    expect(bindMissingCp.status).toBe('refused');
    expect(bindMissingCp.details).toContain('checkpoint ID option is required');

    // prove with missing checkpoint ID
    const proveMissingCp = execCmdFailure(`prove "${tempDir}"`);
    expect(proveMissingCp.verb).toBe('prove');
    expect(proveMissingCp.status).toBe('refused');
    expect(proveMissingCp.details).toContain('checkpoint ID option is required');

    // harden with missing checkpoint ID
    const hardenMissingCp = execCmdFailure(`harden "${tempDir}"`);
    expect(hardenMissingCp.verb).toBe('harden');
    expect(hardenMissingCp.status).toBe('refused');
    expect(hardenMissingCp.details).toContain('checkpoint ID option is required');

    // handoff with negative require-agent-reports
    const handoffBadReports = execCmdFailure(`handoff "${tempDir}" --require-agent-reports -1`);
    expect(handoffBadReports.verb).toBe('handoff');
    expect(handoffBadReports.status).toBe('refused');
    expect(handoffBadReports.details).toContain('require-agent-reports');

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});

