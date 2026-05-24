import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import Database from 'better-sqlite3';
import { AutonomicGallLoop, RefusalError } from '../../src/integration/autonomic-loop.js';
import { type HookDefinition } from '../../src/runtime-law.js';
import { verifyReceipt } from '../../src/receipt.js';

describe('AutonomicGallLoop Integration Tests', () => {
  const dbPath = path.resolve(process.cwd(), 'gall_truex_test.db');
  const tempFilePath = path.resolve(process.cwd(), 'temp_test_file.ts');
  let loop: AutonomicGallLoop;

  // Set up standard hooks for tests
  const testHooks: HookDefinition[] = [
    {
      id: 'block-sudo',
      name: 'Block Sudo Commands',
      condition: { kind: 'delta-match', predicate: 'run_command' },
      effects: [{ kind: 'emit-event', type: 'deny-prefix:sudo' }]
    },
    {
      id: 'prevent-rm-rf',
      name: 'Block Dangerous Commands',
      condition: { kind: 'always' },
      effects: [{ kind: 'emit-event', type: 'deny-prefix:rm -rf' }]
    }
  ];

  beforeEach(() => {
    // Cleanup files if left over
    if (fs.existsSync(dbPath)) {
      try { fs.unlinkSync(dbPath); } catch {}
    }
    if (fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch {}
    }

    loop = new AutonomicGallLoop({
      dbPath,
      hooks: testHooks,
      seed: 42
    });
  });

  afterEach(() => {
    // Clean up DB
    try {
      const db = loop.getDb();
      db.close();
    } catch {}
    if (fs.existsSync(dbPath)) {
      try { fs.unlinkSync(dbPath); } catch {}
    }
    if (fs.existsSync(tempFilePath)) {
      try { fs.unlinkSync(tempFilePath); } catch {}
    }
  });

  it('proves S0-S3 lawful execution and fact extraction works', async () => {
    const fileContent = `export function calculateSum(a: number, b: number): number {
  return a + b;
}
export class CalculatorService {}
`;

    // Step 5 executor: actually write the file
    const executor = async () => {
      fs.writeFileSync(tempFilePath, fileContent);
      return true;
    };

    const result = await loop.run(
      {
        name: 'write_file',
        target: tempFilePath,
        value: fileContent
      },
      executor
    );

    // Verify S0-S3 output
    expect(result.status).toBe('confirmed');
    expect(result.receipt).toBeDefined();
    expect(verifyReceipt(result.receipt)).toBe(true);

    // Check file was actually written to disk
    expect(fs.existsSync(tempFilePath)).toBe(true);
    expect(fs.readFileSync(tempFilePath, 'utf8')).toBe(fileContent);

    // Verify DB states: WAL delta marked as applied
    const db = loop.getDb();
    const walRow = db.prepare('SELECT * FROM wal_deltas WHERE delta_id = ?').get(result.delta.id) as any;
    expect(walRow).toBeDefined();
    expect(walRow.applied).toBe(1);

    // Verify receipt was stored and matches
    const storedReceipt = loop.getReceiptStore().read(result.receipt.id);
    expect(storedReceipt).toBeDefined();
    expect(storedReceipt?.status).toBe('confirmed');

    // Verify extracted facts quads in DB
    const quads = db.prepare('SELECT * FROM quads WHERE delta_id = ?').all(result.delta.id) as any[];
    
    // Exports functions
    const funcQuad = quads.find(q => q.predicate === 'file:exportsFunction');
    expect(funcQuad).toBeDefined();
    expect(funcQuad.object).toBe('calculateSum');

    // Exports classes
    const classQuad = quads.find(q => q.predicate === 'file:exportsClass');
    expect(classQuad).toBeDefined();
    expect(classQuad.object).toBe('CalculatorService');

    // Line count
    const lineQuad = quads.find(q => q.predicate === 'file:lineCount');
    expect(lineQuad).toBeDefined();
    expect(lineQuad.object).toBe('5');
  });

  it('proves Jidoka Line Stop on proposed invariant violations (FOSSIL content)', async () => {
    const invalidContent = `const FOSSIL_ONTOLOGY = "static";`;
    const executor = async () => {
      fs.writeFileSync(tempFilePath, invalidContent);
      return true;
    };

    await expect(
      loop.run(
        {
          name: 'write_file',
          target: tempFilePath,
          value: invalidContent
        },
        executor
      )
    ).rejects.toThrow(RefusalError);

    // Verify the file was NOT written to disk
    expect(fs.existsSync(tempFilePath)).toBe(false);

    // Verify database record has the refused receipt
    const db = loop.getDb();
    const storedReceipts = loop.getReceiptStore().all();
    expect(storedReceipts.length).toBe(1);
    expect(storedReceipts[0].status).toBe('refused');

    const walDeltas = db.prepare('SELECT * FROM wal_deltas').all() as any[];
    // WAL contains the proposed delta even if refused (Zero-loss Cold-load)
    expect(walDeltas.length).toBe(1);
    expect(walDeltas[0].applied).toBe(0);
  });

  it('proves file rollback works when modification fails post-execution', async () => {
    // Pre-create the file with valid content
    const originalContent = 'export const initial = 123;';
    fs.writeFileSync(tempFilePath, originalContent);

    // The execution attempt writes something that violates post-execution check (e.g. contains FOSSIL)
    const executor = async () => {
      fs.writeFileSync(tempFilePath, 'export const FOSSIL_ONTOLOGY = "static";');
      return true;
    };

    await expect(
      loop.run(
        {
          name: 'write_file',
          target: tempFilePath,
          value: 'export const FOSSIL_ONTOLOGY = "static";'
        },
        executor
      )
    ).rejects.toThrow(RefusalError);

    // Verify file content is rolled back to originalContent
    expect(fs.existsSync(tempFilePath)).toBe(true);
    expect(fs.readFileSync(tempFilePath, 'utf8')).toBe(originalContent);

    // Verify refused receipt was written
    const latest = loop.getReceiptStore().latest();
    expect(latest?.status).toBe('refused');
  });

  it('proves Jidoka Line Stop on command prefix hooks (sudo block)', async () => {
    const executor = async () => {
      return 'command executed';
    };

    await expect(
      loop.run(
        {
          name: 'run_command',
          target: 'sudo apt install git'
        },
        executor
      )
    ).rejects.toThrow(RefusalError);

    const latest = loop.getReceiptStore().latest();
    expect(latest?.status).toBe('refused');
    expect(latest?.eventId).toContain('evt_refused');
  });

  it('proves post-execution invariant check on line count limits', async () => {
    // Create a file with 805 lines (above 800-line decomposition law)
    const longContent = Array.from({ length: 805 }, (_, i) => `// Line ${i}`).join('\n');

    const executor = async () => {
      fs.writeFileSync(tempFilePath, longContent);
      return true;
    };

    await expect(
      loop.run(
        {
          name: 'write_file',
          target: tempFilePath,
          value: longContent
        },
        executor
      )
    ).rejects.toThrow(RefusalError);

    // Verify the file does not exist on disk (rolled back because it didn't exist before)
    expect(fs.existsSync(tempFilePath)).toBe(false);

    // Verify receipt was refused
    const latest = loop.getReceiptStore().latest();
    expect(latest?.status).toBe('refused');
    expect(latest?.outputHash).toBeDefined();
  });
});
