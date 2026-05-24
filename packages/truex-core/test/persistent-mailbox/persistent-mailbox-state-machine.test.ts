import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createDeterministicContext } from '../../src/context.js';
import { initializeSchema } from '../../src/persistence/schema.js';
import {
  createPersistentMailbox,
  enqueueMessage,
  claimNextMessage,
  completeMessage,
  refuseMessage,
  retryMessage,
  rollbackMessage,
  quarantineMessage,
  cancelMessage,
  promoteScheduledMessages,
  verifyMailboxIntegrity,
  replayMailboxLineage,
  rescueExecutingMessages,
  recordQueueMetrics,
  calculateBackoff
} from '../../src/persistent-mailbox.gall.js';
import type { QueueConfig } from '../../src/persistent-mailbox.gall.js';

describe('Persistent Mailbox State Machine Transitions', () => {
  let db: Database.Database;
  const ctx = createDeterministicContext(100);

  const config: QueueConfig = {
    queue: 'test-queue',
    concurrencyLimit: 2,
    maxDepth: 10,
    retryPolicy: {
      type: 'constant',
      baseDelayMs: 1000
    },
    priorityRange: [0, 9],
    rescueAfterMs: 5000
  };

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    createPersistentMailbox(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should transition scheduled -> available using promoteScheduledMessages', () => {
    const now = ctx.clock();
    // Enqueue message scheduled in the future (now + 10)
    const res = enqueueMessage(
      db,
      ctx,
      {
        queue: 'test-queue',
        payload: { task: 'scheduled-task' },
        availableAt: now + 10
      },
      config
    );

    expect(res.status).toBe('enqueued');
    const msgId = res.messageId;

    // Check that message is indeed scheduled
    const msgBefore = db.prepare('SELECT state FROM truex_mailbox_messages WHERE id = ?').get(msgId) as { state: string };
    expect(msgBefore.state).toBe('scheduled');

    // Trying to claim should return empty because it is scheduled
    const claimRes1 = claimNextMessage(db, ctx, 'test-queue', config);
    expect(claimRes1.status).toBe('empty');

    // Promote when clock has not advanced yet -> returns 0 promoted
    const promoted0 = promoteScheduledMessages(db, ctx, now);
    expect(promoted0).toBe(0);

    // Advance clock to now + 10 and promote
    const promoted1 = promoteScheduledMessages(db, ctx, now + 10);
    expect(promoted1).toBe(1);

    // Verify it is now available
    const msgAfter = db.prepare('SELECT state FROM truex_mailbox_messages WHERE id = ?').get(msgId) as { state: string };
    expect(msgAfter.state).toBe('available');

    // Claim next message succeeds
    const claimRes2 = claimNextMessage(db, ctx, 'test-queue', config);
    expect(claimRes2.status).toBe('claimed');
    expect(claimRes2.message?.id).toBe(msgId);
    expect(claimRes2.message?.state).toBe('executing');
  });

  it('should transition available -> executing -> confirmed', () => {
    const res = enqueueMessage(
      db,
      ctx,
      {
        queue: 'test-queue',
        payload: { task: 'complete-task' }
      },
      config
    );
    const msgId = res.messageId;

    // available -> executing
    const claimRes = claimNextMessage(db, ctx, 'test-queue', config);
    expect(claimRes.status).toBe('claimed');
    expect(claimRes.message?.state).toBe('executing');

    // executing -> confirmed
    const receipt = completeMessage(db, ctx, msgId, 'output-hash-xyz');
    expect(receipt.status).toBe('confirmed');

    const msg = db.prepare('SELECT state, receipt_hash FROM truex_mailbox_messages WHERE id = ?').get(msgId) as { state: string; receipt_hash: string };
    expect(msg.state).toBe('confirmed');
    expect(msg.receipt_hash).toBe(receipt.receiptHash);

    // Verify history transitions
    const lineage = replayMailboxLineage(db, msgId);
    expect(lineage).toEqual(['available', 'executing', 'confirmed']);
  });

  it('should transition executing -> refused', () => {
    const res = enqueueMessage(
      db,
      ctx,
      {
        queue: 'test-queue',
        payload: { task: 'refuse-task' }
      },
      config
    );
    const msgId = res.messageId;

    claimNextMessage(db, ctx, 'test-queue', config);
    const receipt = refuseMessage(db, ctx, msgId, 'invalid parameter format');
    expect(receipt.status).toBe('refused');

    const msg = db.prepare('SELECT state, error_info FROM truex_mailbox_messages WHERE id = ?').get(msgId) as { state: string; error_info: string };
    expect(msg.state).toBe('refused');
    expect(msg.error_info).toBe('invalid parameter format');

    const lineage = replayMailboxLineage(db, msgId);
    expect(lineage).toEqual(['available', 'executing', 'refused']);
  });

  it('should transition executing -> retryable -> available -> executing -> discarded', () => {
    const res = enqueueMessage(
      db,
      ctx,
      {
        queue: 'test-queue',
        payload: { task: 'retry-task' }
      },
      config
    );
    const msgId = res.messageId;

    // Attempt 1: claim & fail
    const claim1 = claimNextMessage(db, ctx, 'test-queue', config);
    expect(claim1.message?.attempt).toBe(1);

    const retryRes1 = retryMessage(db, ctx, msgId, 'database timeout', config);
    expect(retryRes1.state).toBe('retryable');

    let msg = db.prepare('SELECT state, attempt FROM truex_mailbox_messages WHERE id = ?').get(msgId) as { state: string; attempt: number; error_info?: string | null };
    expect(msg.state).toBe('retryable');

    // Promote retryable back to available
    promoteScheduledMessages(db, ctx, ctx.clock() + 2000);

    // Attempt 2: claim & fail
    const claim2 = claimNextMessage(db, ctx, 'test-queue', config);
    expect(claim2.message?.attempt).toBe(2);

    const retryRes2 = retryMessage(db, ctx, msgId, 'database timeout', config);
    expect(retryRes2.state).toBe('retryable');

    promoteScheduledMessages(db, ctx, ctx.clock() + 2000);

    // Attempt 3: claim & fail
    const claim3 = claimNextMessage(db, ctx, 'test-queue', config);
    expect(claim3.message?.attempt).toBe(3);

    // At attempt 3, calling retryMessage should transition state to discarded
    const retryRes3 = retryMessage(db, ctx, msgId, 'exhausted retry limits', config);
    expect(retryRes3.state).toBe('discarded');
    expect(retryRes3.receipt.status).toBe('refused');

    msg = db.prepare('SELECT state, attempt, error_info FROM truex_mailbox_messages WHERE id = ?').get(msgId) as { state: string; attempt: number; error_info: string };
    expect(msg.state).toBe('discarded');
    expect(msg.error_info).toBe('exhausted retry limits');

    const lineage = replayMailboxLineage(db, msgId);
    expect(lineage).toEqual([
      'available',
      'executing',
      'retryable',
      'available',
      'executing',
      'retryable',
      'available',
      'executing',
      'discarded'
    ]);
  });

  it('should transition executing -> rolledBack', () => {
    const res = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { task: 'rollback-task' } }, config);
    const msgId = res.messageId;

    claimNextMessage(db, ctx, 'test-queue', config);
    const receipt = rollbackMessage(db, ctx, msgId, 'receipt-hash-of-previous-mutation');
    expect(receipt.status).toBe('refused');

    const msg = db.prepare('SELECT state FROM truex_mailbox_messages WHERE id = ?').get(msgId) as { state: string };
    expect(msg.state).toBe('rolledBack');

    const lineage = replayMailboxLineage(db, msgId);
    expect(lineage).toEqual(['available', 'executing', 'rolledBack']);
  });

  it('should transition executing -> quarantined', () => {
    const res = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { task: 'poison-task' } }, config);
    const msgId = res.messageId;

    claimNextMessage(db, ctx, 'test-queue', config);
    const receipt = quarantineMessage(db, ctx, msgId, 'unparseable payload structure');
    expect(receipt.status).toBe('refused');

    const msg = db.prepare('SELECT state, error_info FROM truex_mailbox_messages WHERE id = ?').get(msgId) as { state: string; error_info: string };
    expect(msg.state).toBe('quarantined');
    expect(msg.error_info).toBe('unparseable payload structure');

    const lineage = replayMailboxLineage(db, msgId);
    expect(lineage).toEqual(['available', 'executing', 'quarantined']);
  });

  it('should transition scheduled/available -> cancelled', () => {
    const res1 = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { task: 'cancel-scheduled' }, availableAt: ctx.clock() + 100 }, config);
    const res2 = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { task: 'cancel-available' } }, config);

    cancelMessage(db, ctx, res1.messageId);
    cancelMessage(db, ctx, res2.messageId);

    const msg1 = db.prepare('SELECT state FROM truex_mailbox_messages WHERE id = ?').get(res1.messageId) as { state: string };
    const msg2 = db.prepare('SELECT state FROM truex_mailbox_messages WHERE id = ?').get(res2.messageId) as { state: string };

    expect(msg1.state).toBe('cancelled');
    expect(msg2.state).toBe('cancelled');

    // Cannot cancel message in terminal state
    const res3 = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { task: 'cancel-terminal' } }, config);
    claimNextMessage(db, ctx, 'test-queue', config);
    completeMessage(db, ctx, res3.messageId, 'some-output');

    expect(() => cancelMessage(db, ctx, res3.messageId)).toThrow('Cannot cancel message in terminal state');
  });

  it('should handle rescueExecutingMessages correctly', () => {
    // 1. Stalled message with attempt = 0 (before claiming) -> will have attempt = 1 when claimed
    const res1 = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { task: 'rescue-retry' } }, config);
    claimNextMessage(db, ctx, 'test-queue', config);

    // 2. Stalled message with attempt >= 3
    const res2 = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { task: 'rescue-fail' } }, config);
    // Claim 1
    claimNextMessage(db, ctx, 'test-queue', config);
    retryMessage(db, ctx, res2.messageId, 'fail', config);
    promoteScheduledMessages(db, ctx, ctx.clock() + 2000);
    // Claim 2
    claimNextMessage(db, ctx, 'test-queue', config);
    retryMessage(db, ctx, res2.messageId, 'fail', config);
    promoteScheduledMessages(db, ctx, ctx.clock() + 2000);
    // Claim 3
    claimNextMessage(db, ctx, 'test-queue', config);

    // Manually push claimed_at backward to simulate crash/stall
    db.prepare('UPDATE truex_mailbox_messages SET claimed_at = ? WHERE id IN (?, ?)').run(
      ctx.clock() - 10000,
      res1.messageId,
      res2.messageId
    );

    // Rescue running with rescueAfterMs = 5000
    const rescueRes = rescueExecutingMessages(db, ctx, ctx.clock(), 5000);
    expect(rescueRes.rescuedCount).toBe(2);
    expect(rescueRes.receipts).toHaveLength(2);

    // res1 (attempt = 1) -> retryable
    const msg1 = db.prepare('SELECT state FROM truex_mailbox_messages WHERE id = ?').get(res1.messageId) as { state: string };
    expect(msg1.state).toBe('retryable');

    // res2 (attempt = 3) -> refused
    const msg2 = db.prepare('SELECT state FROM truex_mailbox_messages WHERE id = ?').get(res2.messageId) as { state: string };
    expect(msg2.state).toBe('refused');

    // Verify lineage transitions
    expect(replayMailboxLineage(db, res1.messageId)).toEqual(['available', 'executing', 'rescueCandidate', 'retryable']);
    expect(replayMailboxLineage(db, res2.messageId)).toEqual([
      'available',
      'executing',
      'retryable',
      'available',
      'executing',
      'retryable',
      'available',
      'executing',
      'rescueCandidate',
      'refused'
    ]);
  });

  it('should detect transition list tampering in verifyMailboxIntegrity', () => {
    const res = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { task: 'tamper-me' } }, config);
    const msgId = res.messageId;

    claimNextMessage(db, ctx, 'test-queue', config);
    completeMessage(db, ctx, msgId, 'output-val');

    // Initially valid
    expect(verifyMailboxIntegrity(db).isValid).toBe(true);

    // Tamper with the transition table: delete a record
    db.prepare("DELETE FROM truex_mailbox_transitions WHERE message_id = ? AND to_state = 'executing'").run(msgId);

    const integrity = verifyMailboxIntegrity(db);
    expect(integrity.isValid).toBe(false);
    expect(integrity.tamperedIds).toContain(msgId);
  });
});
