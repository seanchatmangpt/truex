import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createDeterministicContext } from '../../src/context.js';
import {
  createPersistentMailbox,
  enqueueMessage,
  claimNextMessage,
  completeMessage,
  retryMessage,
  rescueExecutingMessages,
  pauseQueue,
  stopQueue,
  resumeQueue,
  verifyMailboxIntegrity,
  replayMailboxLineage
} from '../../src/persistent-mailbox.gall.js';
import type { QueueConfig } from '../../src/persistent-mailbox.gall.js';

function createControllableContext(seed: number) {
  const base = createDeterministicContext(seed);
  let timeState = 1_716_480_000_000;
  return {
    seed,
    clock: () => {
      const val = timeState;
      timeState += 1;
      return val;
    },
    uuid: base.uuid,
    advanceClock: (ms: number) => {
      timeState += ms;
    }
  };
}

describe('Persistent Mailbox Graceful Shutdown & Rescue', () => {
  let db: Database.Database;
  const queue = 'test-graceful-rescue';
  const config: QueueConfig = {
    queue,
    concurrencyLimit: 2,
    maxDepth: 10,
    retryPolicy: {
      type: 'constant',
      baseDelayMs: 100
    },
    priorityRange: [0, 9],
    rescueAfterMs: 5000
  };

  beforeEach(() => {
    db = new Database(':memory:');
    createPersistentMailbox(db);
    db.prepare(`
      CREATE TABLE IF NOT EXISTS receipts (
        id TEXT PRIMARY KEY,
        event_id TEXT,
        delta_id TEXT,
        input_hash TEXT,
        output_hash TEXT,
        previous_receipt_hash TEXT,
        status TEXT,
        receipt_hash TEXT UNIQUE
      )
    `).run();
  });

  afterEach(() => {
    db.close();
  });

  it('graceful shutdown stops new claims, resume allows them again', () => {
    const ctx = createControllableContext(1);
    
    // Enqueue message
    const eq = enqueueMessage(db, ctx, { queue, payload: { hookId: 'h1', val: 10 } }, config);
    expect(eq.status).toBe('enqueued');

    // Pause queue
    pauseQueue(db, ctx, queue, 1000);

    // Try to claim - should be stopped (paused)
    const claimPaused = claimNextMessage(db, ctx, queue, config);
    expect(claimPaused.status).toBe('paused');

    // Resume queue
    resumeQueue(db, queue);

    // Claim again - should succeed
    const claimResumed = claimNextMessage(db, ctx, queue, config);
    expect(claimResumed.status).toBe('claimed');
    expect(claimResumed.message!.id).toBe(eq.messageId);
  });

  it('hard stop stops new claims immediately', () => {
    const ctx = createControllableContext(2);
    
    enqueueMessage(db, ctx, { queue, payload: { hookId: 'h1', val: 10 } }, config);

    // Stop queue
    stopQueue(db, ctx, queue);

    // Try to claim - should return stopped
    const claimStopped = claimNextMessage(db, ctx, queue, config);
    expect(claimStopped.status).toBe('stopped');
  });

  it('existing executing message is allowed to finish when within grace period', () => {
    const ctx = createControllableContext(3);

    const eq = enqueueMessage(db, ctx, { queue, payload: { hookId: 'h1', val: 10 } }, config);
    const claim = claimNextMessage(db, ctx, queue, config);
    expect(claim.status).toBe('claimed');

    // Pause queue with 5000ms grace period
    pauseQueue(db, ctx, queue, 5000);

    // Advance clock by 2000ms (within grace period)
    ctx.advanceClock(2000);

    // Should be able to complete message successfully
    const receipt = completeMessage(db, ctx, claim.message!.id, 'output-hash');
    expect(receipt).toBeDefined();
    expect(receipt.status).toBe('confirmed');

    // Validate database reflects confirmed status
    const dbMsg = db.prepare('SELECT state FROM truex_mailbox_messages WHERE id = ?').get(claim.message!.id) as { state: string };
    expect(dbMsg.state).toBe('confirmed');
  });

  it('existing executing message cannot finish after grace period expires or queue stopped', () => {
    const ctx = createControllableContext(4);

    const eq1 = enqueueMessage(db, ctx, { queue, payload: { hookId: 'h1', val: 10 } }, config);
    const claim1 = claimNextMessage(db, ctx, queue, config);
    
    // Pause queue with 1000ms grace period
    pauseQueue(db, ctx, queue, 1000);

    // Advance clock by 1500ms (grace period expired)
    ctx.advanceClock(1500);

    // Trying to complete should throw error
    expect(() => {
      completeMessage(db, ctx, claim1.message!.id, 'output-hash');
    }).toThrow(/Grace period expired/);

    // Resume queue to claim next message and test stopped case
    resumeQueue(db, queue);

    const eq2 = enqueueMessage(db, ctx, { queue, payload: { hookId: 'h2', val: 20 } }, config);
    const claim2 = claimNextMessage(db, ctx, queue, config);

    // Stop queue (hard stop)
    stopQueue(db, ctx, queue);

    // Complete should fail immediately
    expect(() => {
      completeMessage(db, ctx, claim2.message!.id, 'output-hash-2');
    }).toThrow(/is stopped/);
  });

  it('stalled messages become rescue candidates and transition to retryable/refused with recovery receipts', () => {
    const ctx = createControllableContext(5);

    // 1. Message under attempt limit (going to retryable)
    const eq1 = enqueueMessage(db, ctx, { queue, payload: { hookId: 'h1', val: 10 } }, config);
    const claim1 = claimNextMessage(db, ctx, queue, config);
    expect(claim1.message!.attempt).toBe(1);

    // 2. Message exceeding attempt limit (going to refused)
    const eq2 = enqueueMessage(db, ctx, { queue, payload: { hookId: 'h2', val: 20 } }, config);
    
    // Claim message 2 and fail it 3 times to increment attempt count to 3
    const claim2 = claimNextMessage(db, ctx, queue, config);
    expect(claim2.status).toBe('claimed');
    expect(claim2.message!.attempt).toBe(1);
    
    // Fail it to retryable (Attempt 1 -> retryable)
    retryMessage(db, ctx, claim2.message!.id, 'error', config);
    db.prepare("UPDATE truex_mailbox_messages SET state = 'available', available_at = 0 WHERE id = ?").run(claim2.message!.id);
    db.prepare(`
      INSERT INTO truex_mailbox_transitions (id, message_id, from_state, to_state, transitioned_at, receipt_hash)
      VALUES (?, ?, 'retryable', 'available', ?, NULL)
    `).run(ctx.uuid(), claim2.message!.id, ctx.clock());
    
    // Claim again (Attempt 2 -> executing)
    const claim2_2 = claimNextMessage(db, ctx, queue, config);
    expect(claim2_2.message!.attempt).toBe(2);
    
    // Fail it to retryable (Attempt 2 -> retryable)
    retryMessage(db, ctx, claim2.message!.id, 'error', config);
    db.prepare("UPDATE truex_mailbox_messages SET state = 'available', available_at = 0 WHERE id = ?").run(claim2.message!.id);
    db.prepare(`
      INSERT INTO truex_mailbox_transitions (id, message_id, from_state, to_state, transitioned_at, receipt_hash)
      VALUES (?, ?, 'retryable', 'available', ?, NULL)
    `).run(ctx.uuid(), claim2.message!.id, ctx.clock());

    // Claim again (Attempt 3 -> executing)
    const claim2_3 = claimNextMessage(db, ctx, queue, config);
    expect(claim2_3.message!.attempt).toBe(3);

    // Now message 1 is executing (attempt 1). Message 2 is executing (attempt 3).
    // Let's trigger a timeout by advancing the clock past rescueAfterMs
    ctx.advanceClock(config.rescueAfterMs + 1000);

    // Run rescue executing messages
    const rescueRes = rescueExecutingMessages(db, ctx, ctx.clock(), config.rescueAfterMs);
    expect(rescueRes.rescuedCount).toBe(2);
    expect(rescueRes.receipts).toHaveLength(2);

    // Verify recovery receipts reference original messages
    const receiptForMsg1 = rescueRes.receipts.find(r => r.failedChildId === claim1.message!.id);
    const receiptForMsg2 = rescueRes.receipts.find(r => r.failedChildId === claim2.message!.id);

    expect(receiptForMsg1).toBeDefined();
    expect(receiptForMsg1!.status).toBe('refused'); // standard status for rescue transition
    expect(receiptForMsg1!.reason).toContain('rescued_retry_scheduled_attempt');

    expect(receiptForMsg2).toBeDefined();
    expect(receiptForMsg2!.status).toBe('refused');
    expect(receiptForMsg2!.reason).toContain('rescued_failed_attempts');

    // Verify terminal/target states in the database
    const dbMsg1 = db.prepare('SELECT state, attempt, available_at FROM truex_mailbox_messages WHERE id = ?').get(claim1.message!.id) as any;
    expect(dbMsg1.state).toBe('retryable');
    expect(dbMsg1.available_at).toBeLessThanOrEqual(ctx.clock()); // scheduled for immediate retrying

    const dbMsg2 = db.prepare('SELECT state FROM truex_mailbox_messages WHERE id = ?').get(claim2.message!.id) as any;
    expect(dbMsg2.state).toBe('refused');

    // Verify transition lineages
    const lineage1 = replayMailboxLineage(db, claim1.message!.id);
    expect(lineage1).toEqual(['available', 'executing', 'rescueCandidate', 'retryable']);

    const lineage2 = replayMailboxLineage(db, claim2.message!.id);
    expect(lineage2).toEqual([
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

    // Verify integrity of database
    const integrity = verifyMailboxIntegrity(db);
    expect(integrity.isValid).toBe(true);
  });
});
