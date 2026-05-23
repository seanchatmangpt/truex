import type Database from 'better-sqlite3';

/**
 * Configuration options for the retry logic in SQLiteLockManager.
 */
export interface LockOptions {
  /**
   * Maximum number of retries before giving up.
   * @default 10
   */
  maxRetries?: number;
  /**
   * Initial delay in milliseconds for exponential backoff.
   * @default 50
   */
  initialDelayMs?: number;
  /**
   * Maximum delay in milliseconds between retries.
   * @default 1000
   */
  maxDelayMs?: number;
}

/**
 * SQLiteLockManager handles concurrent writers in a multi-agent environment.
 * It uses SQLite's IMMEDIATE transactions to ensure that once a transaction 
 * starts, it is guaranteed to be a writer and won't be blocked by other readers
 * trying to upgrade to writers (avoiding SQLITE_BUSY: database is locked).
 *
 * It implements retry logic with exponential backoff (Heijunka at the persistence layer)
 * to level the load and handle contention gracefully.
 */
export class SQLiteLockManager {
  private readonly defaultOptions: Required<LockOptions> = {
    maxRetries: 10,
    initialDelayMs: 50,
    maxDelayMs: 1000,
  };

  constructor(private readonly db: Database.Database) {}

  /**
   * Executes a callback within a SQLite IMMEDIATE transaction with retry logic.
   * 
   * This handles 'Mura' (unevenness) at the persistence layer by smoothing out
   * write contention using exponential backoff.
   * 
   * @param fn The callback to execute within the transaction.
   * @param options Configuration for retry logic.
   * @returns The result of the callback.
   * @throws Error if the transaction fails after max retries or due to non-locking errors.
   */
  async executeExclusive<T>(fn: () => T, options?: LockOptions): Promise<T> {
    const { maxRetries, initialDelayMs, maxDelayMs } = {
      ...this.defaultOptions,
      ...options,
    };

    let attempt = 0;

    // Create a transaction wrapper.
    const transaction = this.db.transaction(fn);

    while (true) {
      try {
        // .immediate() starts the transaction with BEGIN IMMEDIATE.
        // This is crucial for multi-agent concurrency as it prevents 
        // deadlocks when multiple connections want to write.
        return transaction.immediate();
      } catch (error: any) {
        attempt++;

        // SQLITE_BUSY: The database file is locked (usually by another process/connection)
        // SQLITE_BUSY_SNAPSHOT: Another process has modified the database since this transaction started.
        const isLockError = error.code === 'SQLITE_BUSY' || error.code === 'SQLITE_BUSY_SNAPSHOT';

        if (isLockError && attempt <= maxRetries) {
          const delay = Math.min(
            initialDelayMs * Math.pow(2, attempt - 1),
            maxDelayMs
          );
          
          // Add some jitter (±10%) to avoid thundering herd problem
          const jitter = (Math.random() * 0.2 - 0.1) * delay;
          await new Promise((resolve) => setTimeout(resolve, Math.max(0, delay + jitter)));
          
          continue;
        }

        // If it's not a locking error or we've exhausted retries, rethrow.
        throw error;
      }
    }
  }
}
