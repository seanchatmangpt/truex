import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createDeterministicContext } from '../../src/context.js';
import {
  createPersistentMailbox,
  enqueueMessage,
  claimNextMessage,
  completeMessage,
  verifyMailboxIntegrity,
  replayMailboxLineage
} from '../../src/persistent-mailbox.gall.js';
import { hash } from '../../src/hash.js';
import { createReceipt } from '../../src/receipt.js';

describe('Persistent Mailbox Tamper Detection', () => {
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

  it('mutated mailbox row fails integrity', () => {
    const enqueueRes = enqueueMessage(
      db,
      ctx,
      { queue: 'test-queue', payload: { hookId: 'hook1', val: 100 } },
      queueConfig
    );
    const msgId = enqueueRes.messageId;

    const claimRes = claimNextMessage(db, ctx, 'test-queue', queueConfig);
    completeMessage(db, ctx, msgId, hash('output'));

    // Initially, integrity is valid
    const integrityBefore = verifyMailboxIntegrity(db);
    console.log('INTEGRITY BEFORE:', integrityBefore);
    expect(integrityBefore.isValid).toBe(true);

    // Mutate the payload in the DB
    db.prepare('UPDATE truex_mailbox_messages SET payload_json = ? WHERE id = ?').run(
      JSON.stringify({ hookId: 'hook1', val: 999 }),
      msgId
    );

    // Now, integrity should fail
    const integrityRes = verifyMailboxIntegrity(db);
    expect(integrityRes.isValid).toBe(false);
    expect(integrityRes.tamperedIds).toContain(msgId);
  });

  it('truncated transition lineage fails replay', () => {
    const enqueueRes = enqueueMessage(
      db,
      ctx,
      { queue: 'test-queue', payload: { hookId: 'hook1', val: 100 } },
      queueConfig
    );
    const msgId = enqueueRes.messageId;

    claimNextMessage(db, ctx, 'test-queue', queueConfig);
    completeMessage(db, ctx, msgId, hash('output'));

    // Replay succeeds initially
    const originalLineage = replayMailboxLineage(db, msgId);
    expect(originalLineage).toEqual(['available', 'executing', 'confirmed']);

    // Truncate/delete transition records
    db.prepare('DELETE FROM truex_mailbox_transitions WHERE message_id = ?').run(msgId);

    // Replay fails
    expect(() => {
      replayMailboxLineage(db, msgId);
    }).toThrow();
  });

  it('mutated parent receipt hash fails verification', () => {
    // Enqueue message with parent receipt hash
    const parentHash = hash('parent-receipt');
    const enqueueRes = enqueueMessage(
      db,
      ctx,
      {
        queue: 'test-queue',
        payload: { hookId: 'hook1', val: 100 },
        parentReceiptHash: parentHash
      },
      queueConfig
    );
    const msgId = enqueueRes.messageId;

    // Mutate parent receipt hash in the database
    db.prepare('UPDATE truex_mailbox_messages SET parent_receipt_hash = ? WHERE id = ?').run(
      hash('mutated-parent-receipt'),
      msgId
    );

    // Verification should fail (due to consequence key mismatch)
    const integrityRes = verifyMailboxIntegrity(db);
    expect(integrityRes.isValid).toBe(false);
    expect(integrityRes.tamperedIds).toContain(msgId);
  });

  it('replay hash changes on tampered payload', () => {
    const payload1 = { hookId: 'hook1', val: 100 };
    const payload2 = { hookId: 'hook1', val: 200 };

    const r1 = createReceipt(
      ctx,
      'event-1',
      'delta-1',
      hash(JSON.stringify(payload1)),
      hash('output'),
      null,
      'confirmed'
    );

    const r2 = createReceipt(
      ctx,
      'event-1',
      'delta-1',
      hash(JSON.stringify(payload2)),
      hash('output'),
      null,
      'confirmed'
    );

    // Receipts have different input hashes and different receipt hashes
    expect(r1.receiptHash).not.toBe(r2.receiptHash);
  });
});
