import type { Database } from 'better-sqlite3';

/**
 * Migration interface for evolving the schema.
 * Gall Law S3: Systems evolve from simple working systems.
 */
export interface Migration {
  id: number;
  name: string;
  up: (db: Database) => void;
}

/**
 * The base SQLite schema for Truex Core.
 * Reference: Toyota Production System (TPS) - Zero-Loss Cold-Load via WAL.
 */
export const migrations: Migration[] = [
  {
    id: 1,
    name: 'initial_schema',
    up: (db: Database) => {
      // Create migrations table first
      db.prepare(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Receipts table
      db.prepare(`
        CREATE TABLE IF NOT EXISTS receipts (
          id TEXT PRIMARY KEY,
          event_id TEXT NOT NULL,
          delta_id TEXT NOT NULL,
          input_hash TEXT NOT NULL,
          output_hash TEXT NOT NULL,
          previous_receipt_hash TEXT,
          status TEXT NOT NULL,
          receipt_hash TEXT NOT NULL UNIQUE
        )
      `).run();

      // Events table
      db.prepare(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          hook_id TEXT,
          type TEXT NOT NULL,
          delta_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Deltas table
      db.prepare(`
        CREATE TABLE IF NOT EXISTS deltas (
          id TEXT PRIMARY KEY,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Quads table - storing the actual graph state or delta components
      db.prepare(`
        CREATE TABLE IF NOT EXISTS quads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subject TEXT NOT NULL,
          predicate TEXT NOT NULL,
          object TEXT NOT NULL,
          graph TEXT,
          delta_id TEXT,
          op_type TEXT CHECK(op_type IN ('add', 'delete', 'state')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Zero-Loss Cold-Load WAL (Write-Ahead Log) table for deltas
      // TPS Jidoka: Prevent loss by buffering incoming deltas before full processing
      db.prepare(`
        CREATE TABLE IF NOT EXISTS wal_deltas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          delta_id TEXT NOT NULL,
          payload TEXT NOT NULL, -- JSON serialized GraphDelta
          applied INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Indexes for performance
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_receipts_hash ON receipts(receipt_hash)`).run();
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_quads_delta ON quads(delta_id)`).run();
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_wal_unapplied ON wal_deltas(applied) WHERE applied = 0`).run();
    }
  }
];

/**
 * Initializes the database schema and runs pending migrations.
 */
export function initializeSchema(db: Database): void {
  // Ensure we are in WAL mode for SQLite for better concurrency and TPS-style durability
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  // Check which migrations have been applied
  db.prepare(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const appliedMigrations = db.prepare('SELECT id FROM migrations').all() as { id: number }[];
  const appliedIds = new Set(appliedMigrations.map(m => m.id));

  for (const migration of migrations) {
    if (!appliedIds.has(migration.id)) {
      db.transaction(() => {
        migration.up(db);
        db.prepare('INSERT INTO migrations (id, name) VALUES (?, ?)').run(migration.id, migration.name);
      })();
    }
  }
}
