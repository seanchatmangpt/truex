import { describe, it, expect, vi } from 'vitest';
import { SQLiteLockManager } from '../../src/persistence/lock.js';
import type Database from 'better-sqlite3';

describe('SQLiteLockManager', () => {
  it('should execute the callback successfully', async () => {
    const mockDb = {
      transaction: vi.fn().mockReturnValue({
        immediate: vi.fn().mockReturnValue('result'),
      }),
    } as unknown as Database.Database;

    const lockManager = new SQLiteLockManager(mockDb);
    const result = await lockManager.executeExclusive(() => 'result');

    expect(result).toBe('result');
    expect(mockDb.transaction).toHaveBeenCalled();
  });

  it('should retry on SQLITE_BUSY', async () => {
    const mockFn = vi.fn().mockReturnValue('result');
    
    let calls = 0;
    const mockImmediate = vi.fn().mockImplementation(() => {
      calls++;
      if (calls === 1) {
        const error = new Error('Database is busy');
        (error as any).code = 'SQLITE_BUSY';
        throw error;
      }
      return mockFn();
    });

    const mockDb = {
      transaction: vi.fn().mockReturnValue({
        immediate: mockImmediate,
      }),
    } as unknown as Database.Database;

    const lockManager = new SQLiteLockManager(mockDb);
    const result = await lockManager.executeExclusive(mockFn, {
      initialDelayMs: 1,
      maxRetries: 3,
    });

    expect(result).toBe('result');
    expect(calls).toBe(2);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on SQLITE_BUSY_SNAPSHOT', async () => {
    const mockFn = vi.fn().mockReturnValue('result');
    
    let calls = 0;
    const mockImmediate = vi.fn().mockImplementation(() => {
      calls++;
      if (calls === 1) {
        const error = new Error('Database is busy snapshot');
        (error as any).code = 'SQLITE_BUSY_SNAPSHOT';
        throw error;
      }
      return mockFn();
    });

    const mockDb = {
      transaction: vi.fn().mockReturnValue({
        immediate: mockImmediate,
      }),
    } as unknown as Database.Database;

    const lockManager = new SQLiteLockManager(mockDb);
    const result = await lockManager.executeExclusive(mockFn, {
      initialDelayMs: 1,
      maxRetries: 3,
    });

    expect(result).toBe('result');
    expect(calls).toBe(2);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should throw after max retries', async () => {
    const mockImmediate = vi.fn().mockImplementation(() => {
      const error = new Error('Database is busy');
      (error as any).code = 'SQLITE_BUSY';
      throw error;
    });

    const mockDb = {
      transaction: vi.fn().mockReturnValue({
        immediate: mockImmediate,
      }),
    } as unknown as Database.Database;

    const lockManager = new SQLiteLockManager(mockDb);
    
    await expect(lockManager.executeExclusive(() => 'result', {
      initialDelayMs: 1,
      maxRetries: 2,
    })).rejects.toThrow('Database is busy');

    expect(mockImmediate).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should not retry on non-locking errors', async () => {
    const mockImmediate = vi.fn().mockImplementation(() => {
      const error = new Error('Some other error');
      (error as any).code = 'SQLITE_ERROR';
      throw error;
    });

    const mockDb = {
      transaction: vi.fn().mockReturnValue({
        immediate: mockImmediate,
      }),
    } as unknown as Database.Database;

    const lockManager = new SQLiteLockManager(mockDb);
    
    await expect(lockManager.executeExclusive(() => 'result', {
      initialDelayMs: 1,
      maxRetries: 5,
    })).rejects.toThrow('Some other error');

    expect(mockImmediate).toHaveBeenCalledTimes(1);
  });
});
