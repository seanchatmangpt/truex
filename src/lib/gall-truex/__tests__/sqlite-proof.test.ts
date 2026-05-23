import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { GallTruexSqliteEngine } from '../sqlite-proof.js';
import type { HookDefinition } from '../sqlite-proof.js';


describe('SQLite Membrane Primitive', () => {
  let db: Database.Database;
  let engine: GallTruexSqliteEngine;
  let dbPath: string;

  const hooks: HookDefinition[] = [
    {
      id: 'test.hook',
      name: 'Test Hook',
      condition: { kind: 'always' },
      effects: [
        { kind: 'emit-event', type: 'always_event' }
      ]
    }
  ];

  beforeEach(() => {
    dbPath = path.resolve(process.cwd(), `test_${randomUUID()}.db`);
    db = new Database(dbPath);
    engine = new GallTruexSqliteEngine(db, hooks);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  const quadArb = fc.record({
    subject: fc.string({ minLength: 1 }),
    predicate: fc.string({ minLength: 1 }),
    object: fc.string({ minLength: 1 }),
    graph: fc.option(fc.string())
  });

  const validDeltaArb = fc.record({
    id: fc.string({ minLength: 1 }),
    adds: fc.array(quadArb, { maxLength: 5 }),
    deletes: fc.array(quadArb, { maxLength: 5 })
  });

  it('Persists receipt and readback matches runtime proof under admissible variability', () => {
    fc.assert(
      fc.property(validDeltaArb, (delta) => {
        const result = engine.evaluate(delta);
        
        const readback = engine.getStore().read(result.receipt.id);
        expect(readback).not.toBeNull();
        expect(readback?.receiptHash).toBe(result.receipt.receiptHash);
        
        // Ensure replay converges using persisted receipt
        expect(engine.replay(delta, readback!)).toBe(true);
      }),
      { numRuns: 10 } // SQLite is slower, limit runs slightly
    );
  });

  it('Transaction rollback leaves no partial state', () => {
    fc.assert(
      fc.property(validDeltaArb, (delta) => {
        const countBefore = db.prepare('SELECT count(*) as c FROM gall_receipts').get() as { c: number };
        
        try {
          db.transaction(() => {
            // Write a dummy receipt to mimic partial work
            db.prepare('INSERT INTO gall_receipts (id, data) VALUES (?, ?)').run(randomUUID(), '{}');
            throw new Error('Simulated Rollback');
          })();
        } catch {
          // Expected
        }

        const countAfter = db.prepare('SELECT count(*) as c FROM gall_receipts').get() as { c: number };
        expect(countAfter.c).toBe(countBefore.c); // Rolled back cleanly
      }),
      { numRuns: 10 }
    );
  });
});
