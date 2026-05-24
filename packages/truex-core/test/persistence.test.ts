import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeSchema } from '../src/persistence/schema.js';

describe('Persistence Schema', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('should initialize the schema correctly', () => {
    initializeSchema(db);

    // Verify tables exist
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const tableNames = tables.map(t => t.name);

    expect(tableNames).toContain('migrations');
    expect(tableNames).toContain('receipts');
    expect(tableNames).toContain('events');
    expect(tableNames).toContain('deltas');
    expect(tableNames).toContain('quads');
    expect(tableNames).toContain('wal_deltas');
  });

  it('should be idempotent (can run initializeSchema multiple times)', () => {
    initializeSchema(db);
    initializeSchema(db);

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const tableNames = tables.map(t => t.name);

    expect(tableNames).toContain('migrations');
  });

  it('should have applied the initial migration', () => {
    initializeSchema(db);

    const migrations = db.prepare('SELECT id, name FROM migrations').all() as { id: number, name: string }[];
    expect(migrations).toHaveLength(2);
    expect(migrations[0].name).toBe('initial_schema');
    expect(migrations[1].name).toBe('ontology_schema');
  });
});
