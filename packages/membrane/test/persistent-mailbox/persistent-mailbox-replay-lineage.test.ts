import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createDeterministicContext } from '../../src/context.js';
import {
  createPersistentMailbox,
  enqueueMessage,
  claimNextMessage,
  completeMessage,
  refuseMessage,
  retryMessage,
  rollbackMessage,
  quarantineMessage,
  discardMessage,
  cancelMessage,
  replayMailboxLineage,
  verifyMailboxIntegrity,
  promoteScheduledMessages
} from '../../src/persistent-mailbox.gall.js';
import { verifyReceipt } from '../../src/receipt.js';
import { hash } from '../../src/hash.js';

describe('Persistent Mailbox Replay Lineage', () => {
  let db: Database.Database;
  const ctx = createDeterministicContext(42);
  const queueConfig = {
    queue: 'test-queue',
    concurrencyLimit: 2,
    maxDepth: 3,
    retryPolicy: {
      type: 'constant' as const,
      baseDelayMs: 10
    },
    priorityRange: [0, 9] as [number, number],
    rescueAfterMs: 5000
  };

  beforeEach(() => {
    db = new Database(':memory:');
    createPersistentMailbox(db);
  });

  afterEach(() => {
    db.close();
  });

  it('executing becomes confirmed with verified receipt', () => {
    const enqueueRes = enqueueMessage(
      db,
      ctx,
      { queue: 'test-queue', payload: { hookId: 'hook1', val: 100 } },
      queueConfig
    );
    expect(enqueueRes.status).toBe('enqueued');

    const claimRes = claimNextMessage(db, ctx, 'test-queue', queueConfig);
    expect(claimRes.status).toBe('claimed');
    expect(claimRes.message?.state).toBe('executing');

    const outHash = hash('some-output');
    const receipt = completeMessage(db, ctx, claimRes.message!.id, outHash);

    // Verify receipt self-integrity
    expect(verifyReceipt(receipt)).toBe(true);
    expect(receipt.status).toBe('confirmed');
    expect(receipt.outputHash).toBe(outHash);

    // Verify state in DB is confirmed
    const updated = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(claimRes.message!.id) as any;
    expect(updated.state).toBe('confirmed');
    expect(updated.receipt_hash).toBe(receipt.receiptHash);
  });

  it('admission refusal emits refused receipt', () => {
    // 1. Queue depth refusal test
    const qConfig = { ...queueConfig, maxDepth: 2 };
    const r1 = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { hookId: 'h', val: 1 } }, qConfig);
    const r2 = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { hookId: 'h', val: 2 } }, qConfig);
    expect(r1.status).toBe('enqueued');
    expect(r2.status).toBe('enqueued');

    // Third enqueue should be refused
    const r3 = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { hookId: 'h', val: 3 } }, qConfig);
    expect(r3.status).toBe('refused');
    expect(r3.receipt).toBeDefined();
    expect(verifyReceipt(r3.receipt!)).toBe(true);
    expect(r3.receipt!.status).toBe('refused');

    // 2. Refuse message test
    const claimRes = claimNextMessage(db, ctx, 'test-queue', qConfig);
    expect(claimRes.status).toBe('claimed');
    const refuseReceipt = refuseMessage(db, ctx, claimRes.message!.id, 'invalid parameter');
    expect(verifyReceipt(refuseReceipt)).toBe(true);
    expect(refuseReceipt.status).toBe('refused');

    const updated = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(claimRes.message!.id) as any;
    expect(updated.state).toBe('refused');
  });

  it('failed execution becomes retryable or discarded', () => {
    const enqueueRes = enqueueMessage(
      db,
      ctx,
      { queue: 'test-queue', payload: { hookId: 'hook1', val: 100 } },
      queueConfig
    );
    const msgId = enqueueRes.messageId;

    // First attempt
    let claimRes = claimNextMessage(db, ctx, 'test-queue', queueConfig);
    expect(claimRes.status).toBe('claimed');
    expect(claimRes.message?.attempt).toBe(1);

    // Fail first attempt -> becomes retryable
    const retryRes1 = retryMessage(db, ctx, msgId, 'temporary network error', queueConfig);
    expect(retryRes1.state).toBe('retryable');
    expect(verifyReceipt(retryRes1.receipt)).toBe(true);

    let updated = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(msgId) as any;
    expect(updated.state).toBe('retryable');

    // Advance time and promote scheduled messages
    let now = ctx.clock();
    db.prepare('UPDATE truex_mailbox_messages SET available_at = ? WHERE id = ?').run(now - 100, msgId);
    promoteScheduledMessages(db, ctx, now);

    // Second attempt
    claimRes = claimNextMessage(db, ctx, 'test-queue', queueConfig);
    expect(claimRes.status).toBe('claimed');
    expect(claimRes.message?.attempt).toBe(2);

    const retryRes2 = retryMessage(db, ctx, msgId, 'temporary database timeout', queueConfig);
    expect(retryRes2.state).toBe('retryable');

    now = ctx.clock();
    db.prepare('UPDATE truex_mailbox_messages SET available_at = ? WHERE id = ?').run(now - 100, msgId);
    promoteScheduledMessages(db, ctx, now);

    // Third attempt
    claimRes = claimNextMessage(db, ctx, 'test-queue', queueConfig);
    expect(claimRes.status).toBe('claimed');
    expect(claimRes.message?.attempt).toBe(3);

    // Fail third attempt -> reaches maxRetries (3) and becomes discarded
    const retryRes3 = retryMessage(db, ctx, msgId, 'fatal error', queueConfig);
    expect(retryRes3.state).toBe('discarded');
    expect(verifyReceipt(retryRes3.receipt)).toBe(true);

    updated = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(msgId) as any;
    expect(updated.state).toBe('discarded');
    expect(updated.receipt_hash).toBe(retryRes3.receipt.receiptHash);
  });

  it('rollback state emits rollback receipt', () => {
    const enqueueRes = enqueueMessage(
      db,
      ctx,
      { queue: 'test-queue', payload: { hookId: 'hook1', val: 100 } },
      queueConfig
    );
    const msgId = enqueueRes.messageId;

    const claimRes = claimNextMessage(db, ctx, 'test-queue', queueConfig);
    expect(claimRes.status).toBe('claimed');

    const rollbackReceipt = rollbackMessage(db, ctx, msgId, 'receipt-hash-to-rollback');
    expect(verifyReceipt(rollbackReceipt)).toBe(true);
    expect(rollbackReceipt.status).toBe('refused');
    expect(rollbackReceipt.rollbackOf).toBe('receipt-hash-to-rollback');

    const updated = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(msgId) as any;
    expect(updated.state).toBe('rolledBack');
    expect(updated.receipt_hash).toBe(rollbackReceipt.receiptHash);
  });

  it('quarantine state emits quarantine receipt', () => {
    const enqueueRes = enqueueMessage(
      db,
      ctx,
      { queue: 'test-queue', payload: { hookId: 'hook1', val: 100 } },
      queueConfig
    );
    const msgId = enqueueRes.messageId;

    const claimRes = claimNextMessage(db, ctx, 'test-queue', queueConfig);
    expect(claimRes.status).toBe('claimed');

    const quarantineReceipt = quarantineMessage(db, ctx, msgId, 'corrupt delta format');
    expect(verifyReceipt(quarantineReceipt)).toBe(true);
    expect(quarantineReceipt.status).toBe('refused');
    expect(quarantineReceipt.reason).toContain('corrupt delta format');

    const updated = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(msgId) as any;
    expect(updated.state).toBe('quarantined');
    expect(updated.receipt_hash).toBe(quarantineReceipt.receiptHash);
  });

  it('replay from mailbox lineage converges', () => {
    const enqueueRes = enqueueMessage(
      db,
      ctx,
      { queue: 'test-queue', payload: { hookId: 'hook1', val: 100 } },
      queueConfig
    );
    const msgId = enqueueRes.messageId;

    claimNextMessage(db, ctx, 'test-queue', queueConfig);
    completeMessage(db, ctx, msgId, hash('output'));

    const lineage = replayMailboxLineage(db, msgId);
    expect(lineage).toEqual(['available', 'executing', 'confirmed']);
  });

  it('cancelled message cannot later become executing', () => {
    const enqueueRes = enqueueMessage(
      db,
      ctx,
      { queue: 'test-queue', payload: { hookId: 'hook1', val: 100 } },
      queueConfig
    );
    const msgId = enqueueRes.messageId;

    cancelMessage(db, ctx, msgId);

    const updated = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(msgId) as any;
    expect(updated.state).toBe('cancelled');

    // Attempt to claim cancelled message
    const claimRes = claimNextMessage(db, ctx, 'test-queue', queueConfig);
    expect(claimRes.status).toBe('empty');
  });

  it('discarded message cannot later become confirmed', () => {
    const enqueueRes = enqueueMessage(
      db,
      ctx,
      { queue: 'test-queue', payload: { hookId: 'hook1', val: 100 } },
      queueConfig
    );
    const msgId = enqueueRes.messageId;

    claimNextMessage(db, ctx, 'test-queue', queueConfig);
    discardMessage(db, ctx, msgId, 'explicit discard');

    const updated = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(msgId) as any;
    expect(updated.state).toBe('discarded');

    // Attempt to complete/confirm it
    expect(() => {
      completeMessage(db, ctx, msgId, hash('some-output'));
    }).toThrow('must be executing to complete');
  });
});
