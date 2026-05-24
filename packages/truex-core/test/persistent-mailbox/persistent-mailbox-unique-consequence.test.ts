import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createDeterministicContext } from '../../src/context.js';
import { initializeSchema } from '../../src/persistence/schema.js';
import {
  createPersistentMailbox,
  enqueueMessage,
  claimNextMessage,
  completeMessage,
  retryMessage,
  refuseMessage,
  cancelMessage
} from '../../src/persistent-mailbox.gall.js';
import type { QueueConfig } from '../../src/persistent-mailbox.gall.js';

describe('Persistent Mailbox Unique Consequence Checks', () => {
  let db: Database.Database;
  let ctx: ReturnType<typeof createDeterministicContext>;

  const config: QueueConfig = {
    queue: 'test-queue',
    concurrencyLimit: 2,
    maxDepth: 10,
    retryPolicy: {
      type: 'constant',
      baseDelayMs: 0
    },
    priorityRange: [0, 9],
    rescueAfterMs: 5000
  };

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    createPersistentMailbox(db);
    ctx = createDeterministicContext(100);
  });

  afterEach(() => {
    db.close();
  });

  it('should refuse duplicate insertion if existing message is active (available)', () => {
    const payload = { hookId: 'hook-1', task: 'unique-task' };

    // Enqueue first message (initially available)
    const res1 = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);
    expect(res1.status).toBe('enqueued');

    // Attempt to enqueue duplicate
    const res2 = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);
    expect(res2.status).toBe('refused');
    expect(res2.receipt?.status).toBe('refused');
    expect(res2.receipt?.reason).toBe('duplicate_active_consequence');
  });

  it('should refuse duplicate insertion if existing message is active (executing)', () => {
    const payload = { hookId: 'hook-1', task: 'unique-task' };

    enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);

    // Claim to transition state to executing
    claimNextMessage(db, ctx, 'test-queue', config);

    // Attempt duplicate
    const res = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);
    expect(res.status).toBe('refused');
    expect(res.receipt?.reason).toBe('duplicate_active_consequence');
  });

  it('should refuse duplicate insertion if existing message is active (retryable)', () => {
    const payload = { hookId: 'hook-1', task: 'unique-task' };

    const res1 = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);
    claimNextMessage(db, ctx, 'test-queue', config);
    retryMessage(db, ctx, res1.messageId, 'temporary error', config);

    // Attempt duplicate
    const res2 = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);
    expect(res2.status).toBe('refused');
    expect(res2.receipt?.reason).toBe('duplicate_active_consequence');
  });

  it('should return duplicate_confirmed and original receipt if duplicate is confirmed', () => {
    const payload = { hookId: 'hook-1', task: 'unique-task' };

    const res1 = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);
    claimNextMessage(db, ctx, 'test-queue', config);
    const receipt = completeMessage(db, ctx, res1.messageId, 'output-xyz');

    // Attempt duplicate
    const res2 = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);
    expect(res2.status).toBe('duplicate_confirmed');
    expect(res2.messageId).toBe(res1.messageId);
    expect(res2.receipt).toBeDefined();
    expect(res2.receipt?.receiptHash).toBe(receipt.receiptHash);
  });

  it('should refuse duplicate in same epoch if existing is terminal-inactive (discarded/refused/cancelled)', () => {
    const payload = { hookId: 'hook-1', task: 'unique-task' };

    // Case 1: Refused
    const res1 = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);
    refuseMessage(db, ctx, res1.messageId, 'bad params');

    const resDuplicate1 = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);
    expect(resDuplicate1.status).toBe('refused');
    expect(resDuplicate1.receipt?.reason).toBe('duplicate_terminal_same_epoch');

    // Case 2: Cancelled
    const payload2 = { hookId: 'hook-2', task: 'another-task' };
    const res2 = enqueueMessage(db, ctx, { queue: 'test-queue', payload: payload2, epoch: 0 }, config);
    cancelMessage(db, ctx, res2.messageId);

    const resDuplicate2 = enqueueMessage(db, ctx, { queue: 'test-queue', payload: payload2, epoch: 0 }, config);
    expect(resDuplicate2.status).toBe('refused');
    expect(resDuplicate2.receipt?.reason).toBe('duplicate_terminal_same_epoch');
  });

  it('should allow duplicate insertion if epoch changes', () => {
    const payload = { hookId: 'hook-1', task: 'unique-task' };

    // Enqueue in epoch 0 and cancel it (so it is in terminal-inactive cancelled state)
    const res1 = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);
    cancelMessage(db, ctx, res1.messageId);

    // Attempt duplicate in epoch 0 (refused)
    const res2 = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 0 }, config);
    expect(res2.status).toBe('refused');

    // Attempt duplicate in epoch 1 (should succeed!)
    const res3 = enqueueMessage(db, ctx, { queue: 'test-queue', payload, epoch: 1 }, config);
    expect(res3.status).toBe('enqueued');
    expect(res3.messageId).toBeDefined();
    expect(res3.messageId).not.toBe(res1.messageId);

    // Verify it exists in DB as available
    const msg = db.prepare('SELECT state, epoch FROM truex_mailbox_messages WHERE id = ?').get(res3.messageId) as any;
    expect(msg.state).toBe('available');
    expect(msg.epoch).toBe(1);
  });
});
