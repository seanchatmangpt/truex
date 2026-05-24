import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import Database from 'better-sqlite3';
import { DeltaJournal } from '../../src/persistence/journal.js';
import { initializeSchema } from '../../src/persistence/schema.js';
import type { GraphDelta, Quad } from '../../src/runtime-law.js';

describe('DeltaJournal', () => {
  let db: Database.Database;
  let journal: DeltaJournal;

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    journal = new DeltaJournal(db);
  });

  afterEach(() => {
    db.close();
  });

  const quadArb = fc.record<Quad>({
    subject: fc.string({ minLength: 1 }),
    predicate: fc.string({ minLength: 1 }),
    object: fc.string({ minLength: 1 }),
    graph: fc.option(fc.string(), { nil: null })
  });

  const graphDeltaArb = fc.record<GraphDelta>({
    id: fc.uuid(),
    adds: fc.array(quadArb, { maxLength: 10 }),
    deletes: fc.array(quadArb, { maxLength: 10 })
  });

  it('should append and retrieve deltas', () => {
    const delta: GraphDelta = {
      id: 'd1',
      adds: [{ subject: 's1', predicate: 'p1', object: 'o1', graph: null }],
      deletes: []
    };

    const idx = journal.append(delta);
    expect(idx).toBe(1);

    const retrieved = [...journal.replay()];
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].idx).toBe(1);
    expect(retrieved[0].delta).toEqual(delta);
  });

  it('should maintain integrity for random deltas (Property-based)', () => {
    fc.assert(
      fc.property(fc.array(graphDeltaArb, { minLength: 1, maxLength: 20 }), (deltas) => {
        const localDb = new Database(':memory:');
        initializeSchema(localDb);
        const localJournal = new DeltaJournal(localDb);

        const indices: number[] = [];
        for (const delta of deltas) {
          indices.push(localJournal.append(delta));
        }

        const replayed = localJournal.replay();
        expect(replayed).toHaveLength(deltas.length);

        for (const [i, delta] of deltas.entries()) {
          expect(replayed[i].idx).toBe(indices[i]);
          expect(replayed[i].delta).toEqual(delta);
        }
        localDb.close();
      }),
      { numRuns: 20 }
    );
  });

  it('should correctly handle unapplied deltas (Property-based)', () => {
    fc.assert(
      fc.property(
        fc.array(graphDeltaArb, { minLength: 1, maxLength: 20 }),
        fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
        (deltas, applyFlags) => {
          const localDb = new Database(':memory:');
          initializeSchema(localDb);
          const localJournal = new DeltaJournal(localDb);

          const indices: number[] = [];
          for (const delta of deltas) {
            indices.push(localJournal.append(delta));
          }

          // Ensure applyFlags has the same length as deltas for this test
          const normalizedApplyFlags = applyFlags.slice(0, deltas.length);
          while (normalizedApplyFlags.length < deltas.length) {
            normalizedApplyFlags.push(false);
          }

          const expectedUnapplied: GraphDelta[] = [];
          for (const [i, delta] of deltas.entries()) {
            if (normalizedApplyFlags[i]) {
              localJournal.markApplied(indices[i]);
            } else {
              expectedUnapplied.push(delta);
            }
          }

          const actualUnapplied = localJournal.getUnapplied();
          expect(actualUnapplied.map(u => u.delta)).toEqual(expectedUnapplied);
          localDb.close();
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should mark deltas as applied', () => {
    const delta: GraphDelta = {
      id: 'd1',
      adds: [],
      deletes: []
    };

    const idx = journal.append(delta);
    journal.markApplied(idx);

    const unapplied = [...journal.getUnapplied()];
    expect(unapplied).toHaveLength(0);
  });

  it('should replay from a specific index', () => {
    const d1: GraphDelta = { id: 'd1', adds: [], deletes: [] };
    const d2: GraphDelta = { id: 'd2', adds: [], deletes: [] };
    const d3: GraphDelta = { id: 'd3', adds: [], deletes: [] };

    journal.append(d1);
    journal.append(d2);
    journal.append(d3);

    const replay = [...journal.replay(2)];
    expect(replay).toHaveLength(2);
    expect(replay[0].delta.id).toBe('d2');
    expect(replay[1].delta.id).toBe('d3');
  });

  it('should retrieve only unapplied deltas', () => {
    const d1: GraphDelta = { id: 'd1', adds: [], deletes: [] };
    const d2: GraphDelta = { id: 'd2', adds: [], deletes: [] };

    const idx1 = journal.append(d1);
    journal.append(d2);

    journal.markApplied(idx1);

    const unapplied = [...journal.getUnapplied()];
    expect(unapplied).toHaveLength(1);
    expect(unapplied[0].delta.id).toBe('d2');
  });

  it('should count total deltas', () => {
    journal.append({ id: 'd1', adds: [], deletes: [] });
    journal.append({ id: 'd2', adds: [], deletes: [] });
    expect(journal.count()).toBe(2);
  });
});
