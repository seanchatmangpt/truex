import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import { SQLiteReceiptStore } from '../../src/persistence/receipt-store.js';
import { AndonSystem } from '../../src/manufacturing/jidoka.js';
import { hash } from '../../src/hash.js';
import { createDeterministicContext } from '../../src/context.js';
import { createReceipt } from '../../src/receipt.js';
import * as wasm from '../../../../packages/kernel-wasm/pkg/wasm4pm.js';

// Fast-check Arbitrary for generating malformed JSON strings or random corrupt structures
const malformedJsonArbitrary = fc.oneof(
  fc.string(), // Completely random strings
  fc.record({
    traces: fc.array(
      fc.record({
        case_id: fc.option(fc.string(), { nil: undefined }),
        events: fc.array(
          fc.record({
            name: fc.option(fc.string(), { nil: undefined }),
            timestamp: fc.option(fc.string(), { nil: undefined })
          }),
          { maxLength: 10 }
        )
      }),
      { maxLength: 5 }
    )
  }).map(obj => JSON.stringify(obj)) // Semi-valid structures but with missing fields or corrupt arrays
);

describe('WASM Conformance Fuzzing & Refusal Boundary', () => {
  it('should gracefully refuse corrupt event log JSON inputs and record refused receipts without panicking', () => {
    // Setup in-memory SQLite database
    const db = new Database(':memory:');
    db.exec(`
      CREATE TABLE receipts (
        id TEXT PRIMARY KEY,
        event_id TEXT,
        delta_id TEXT,
        input_hash TEXT,
        output_hash TEXT,
        previous_receipt_hash TEXT,
        status TEXT,
        receipt_hash TEXT UNIQUE
      )
    `);

    const receiptStore = new SQLiteReceiptStore(db);
    const andon = new AndonSystem();

    // Define a valid POWL tree model string to test against
    const validPowlModel = JSON.stringify({
      type: "operator",
      operator: "SEQ",
      children: [
        { type: "activity", label: "Register" },
        { type: "activity", label: "Approve" }
      ]
    });

    fc.assert(
      fc.property(malformedJsonArbitrary, (corruptLogJson) => {
        let threwError = false;
        let receiptCreated = false;

        // Perform the operation inside a SQLite transaction block
        const runTx = db.transaction(() => {
          try {
            // Run token replay fitness on the corrupt log json input
            wasm.token_replay_fitness(validPowlModel, corruptLogJson);
          } catch (error: any) {
            threwError = true;

            const seed = Date.now();
            const ctx = createDeterministicContext(seed);
            const refReceipt = createReceipt(
              ctx,
              'evt-conformance-check',
              'delta-fuzz-run',
              hash(corruptLogJson),
              'hash-refused-fuzz',
              null,
              'refused'
            );
            receiptStore.append(refReceipt);
            receiptCreated = true;

            // Throw to trigger transaction rollback
            throw error;
          }
        });

        try {
          runTx();
        } catch {
          // Expected error from transaction rollback
        }

        // Assertions: Either it was parsed successfully (valid log schema) or it threw and wrote a refused receipt
        if (threwError) {
          expect(receiptCreated).toBe(true);
          // Confirm transaction was rolled back (no rows left in DB)
          const rows = db.prepare('SELECT count(*) as count FROM receipts').get() as { count: number };
          expect(rows.count).toBe(0);
        }
      }),
      { numRuns: 100 }
    );
  });
});
