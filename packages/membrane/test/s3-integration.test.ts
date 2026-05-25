import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import { 
  initializeSchema, 
  PersistenceOrchestrator, 
  ProductionLine,
  createDeterministicContext,
  hash
} from '../src/index.js';
import type { S3PersistenceMembrane, StateSnapshot } from '../src/persistence/index.js';
import type { GraphDelta, Receipt, Quad } from '../src/runtime-law.js';

describe('S3 Persistence Membrane Property Tests (Gall Law S3)', () => {
  let db: Database.Database;
  let mockS3: MockS3Membrane;

  class MockS3Membrane implements S3PersistenceMembrane {
    snapshots = new Map<string, StateSnapshot>();
    receipts = new Map<string, Receipt>();

    async putSnapshot(hash: string, s: StateSnapshot) { this.snapshots.set(hash, s); }
    async getSnapshot(hash: string) { return this.snapshots.get(hash) || null; }
    async putReceipt(r: Receipt) { this.receipts.set(r.receiptHash, r); }
    async getReceipt(hash: string) { return this.receipts.get(hash) || null; }
    async listReceipts() { return [...this.receipts.keys()]; }
  }

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    mockS3 = new MockS3Membrane();
  });

  const quadArb = fc.record({
    subject: fc.string({ minLength: 1 }),
    predicate: fc.string({ minLength: 1 }),
    object: fc.string({ minLength: 1 }),
    graph: fc.constant(null)
  });

  const deltaArb = fc.record({
    id: fc.uuid(),
    adds: fc.array(quadArb, { maxLength: 5 }),
    deletes: fc.array(quadArb, { maxLength: 5 })
  });

  it('∀ sequence of execution and crashes, recovery MUST converge to the same state', async () => {
    await fc.assert(
      fc.asyncProperty(fc.array(deltaArb, { minLength: 1, maxLength: 10 }), async (deltas) => {
        // Fresh DB and S3 for each property run
        const propertyDb = new Database(':memory:');
        initializeSchema(propertyDb);
        const propertyS3 = new MockS3Membrane();
        const ctx = createDeterministicContext(42);
        const line = new ProductionLine(ctx, []); // Empty line means deltas just pass through to state
        const orchestrator = new PersistenceOrchestrator(propertyDb, line, propertyS3);

        // 1. Execute the sequence
        for (const delta of deltas) {
          await orchestrator.execute(ctx, delta);
        }

        // Get the "truth" state after execution
        const truth = await orchestrator.recover();

        // 2. Simulate "Total Wipeout" of in-memory state but keeping persistent stores
        const recoveryLine = new ProductionLine(createDeterministicContext(43), []);
        const recoveryOrchestrator = new PersistenceOrchestrator(propertyDb, recoveryLine, propertyS3);

        // 3. Recover
        const { state: recoveredState } = await recoveryOrchestrator.recover();

        // 4. Converge: Recovered state must match truth state
        expect(hash(recoveredState)).toBe(hash(truth.state));
        expect(recoveredState).toEqual(truth.state);
      }),
      { numRuns: 10 } // S3/SQLite is heavy, limit runs
    );
  });

  it('should ensure Zero-Loss Cold-Load by processing unapplied WAL entries after an ungraceful shutdown', async () => {
    await fc.assert(
      fc.asyncProperty(deltaArb, async (delta) => {
        const propertyDb = new Database(':memory:');
        initializeSchema(propertyDb);
        const propertyS3 = new MockS3Membrane();
        const ctx = createDeterministicContext(7);
        const orchestrator = new PersistenceOrchestrator(propertyDb, new ProductionLine(ctx, []), propertyS3);

        // Simulate crash right AFTER WAL write but BEFORE execution
        orchestrator.getJournal().append(delta);
        
        // New orchestrator starting from that DB
        const recoveryOrchestrator = new PersistenceOrchestrator(propertyDb, new ProductionLine(ctx, []), propertyS3);
        const { state, replayed } = await recoveryOrchestrator.recover();

        expect(replayed).toBe(1);
        expect(state.length).toBeGreaterThanOrEqual(delta.adds.length);
        
        // Verify the added quads are present
        for (const added of delta.adds) {
          expect(state).toContainEqual(added);
        }
      })
    );
  });
});
