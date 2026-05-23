import type { Database } from 'better-sqlite3';
import { type GraphDelta, parseGraphDelta } from '../runtime-law.js';

/**
 * DeltaJournal: The source of truth for 'Zero-Loss Cold-Load'.
 * TPS Principle: Record every incoming GraphDelta to a dedicated SQLite table BEFORE execution.
 */
export class DeltaJournal {
  /**
   * Creates a new DeltaJournal instance.
   * @param db - The better-sqlite3 Database instance.
   */
  constructor(private db: Database) {}

  /**
   * Appends a GraphDelta to the journal.
   * This should be called BEFORE the delta is processed by the engine to ensure durability.
   * 
   * @param delta - The GraphDelta to record.
   * @returns The index (rowid) of the recorded delta.
   */
  append(delta: GraphDelta): number {
    const stmt = this.db.prepare(
      'INSERT INTO wal_deltas (delta_id, payload) VALUES (?, ?)'
    );
    const info = stmt.run(delta.id, JSON.stringify(delta));
    return info.lastInsertRowid as number;
  }

  /**
   * Marks a delta as applied in the journal.
   * This should be called AFTER the delta has been successfully processed.
   * 
   * @param idx - The index (rowid) returned by append().
   */
  markApplied(idx: number): void {
    const stmt = this.db.prepare(
      'UPDATE wal_deltas SET applied = 1 WHERE id = ?'
    );
    stmt.run(idx);
  }

  /**
   * Replays the journal from a specific index.
   * This is used for 'Zero-Loss Cold-Load' recovery and auditing.
   * 
   * @param fromIndex - The index (rowid) to start replaying from (inclusive).
   * @returns An array of recorded deltas with their indices.
   */
  replay(fromIndex: number = 0): { idx: number; delta: GraphDelta }[] {
    const stmt = this.db.prepare(
      'SELECT id, payload FROM wal_deltas WHERE id >= ? ORDER BY id ASC'
    );
    const rows = stmt.all(fromIndex) as { id: number; payload: string }[];
    return rows.map(row => ({
      idx: row.id,
      delta: parseGraphDelta(JSON.parse(row.payload)),
    }));
  }

  /**
   * Retrieves all unapplied deltas for cold-load recovery.
   * Useful when restarting a system that crashed during delta processing.
   * 
   * @returns An array of unapplied deltas with their indices.
   */
  getUnapplied(): { idx: number; delta: GraphDelta }[] {
    const stmt = this.db.prepare(
      'SELECT id, payload FROM wal_deltas WHERE applied = 0 ORDER BY id ASC'
    );
    const rows = stmt.all() as { id: number; payload: string }[];
    return rows.map(row => ({
      idx: row.id,
      delta: parseGraphDelta(JSON.parse(row.payload)),
    }));
  }

  /**
   * Returns the total number of deltas recorded in the journal.
   */
  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) as total FROM wal_deltas').get() as { total: number };
    return row.total;
  }
}
