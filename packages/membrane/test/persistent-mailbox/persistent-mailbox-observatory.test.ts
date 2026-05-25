import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createDeterministicContext } from '../../src/context.js';
import {
  createPersistentMailbox,
  enqueueMessage,
  claimNextMessage,
  completeMessage,
  retryMessage,
  quarantineMessage,
  rollbackMessage,
  replayMailboxLineage,
  recordQueueMetrics,
  getHistoricQueueMetrics
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

describe('Persistent Mailbox Observatory & Queue Metrics', () => {
  let db: Database.Database;
  const queue = 'test-observatory';
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

  it('queue metrics are persisted and durations, counts are calculated correctly', () => {
    const ctx = createControllableContext(10);

    // 1. Enqueue 2 messages
    const eq1 = enqueueMessage(db, ctx, { queue, payload: { hookId: 'h1', val: 1 }, priority: 5 }, config);
    const eq2 = enqueueMessage(db, ctx, { queue, payload: { hookId: 'h2', val: 2 }, priority: 6 }, config);

    // Advance clock, claim and complete message 1 (success)
    ctx.advanceClock(500);
    const claim1 = claimNextMessage(db, ctx, queue, config);
    ctx.advanceClock(1000); // execution takes 1000ms
    const r1 = completeMessage(db, ctx, claim1.message!.id, 'out-1');

    // Claim and retry message 2
    const claim2 = claimNextMessage(db, ctx, queue, config);
    ctx.advanceClock(500); // execution takes 500ms
    retryMessage(db, ctx, claim2.message!.id, 'some error', config);

    // Trigger a replay to populate replay duration log
    replayMailboxLineage(db, claim1.message!.id);

    // Record metrics
    recordQueueMetrics(db, ctx, queue, config.rescueAfterMs);

    // Retrieve metrics rows
    const metrics = getHistoricQueueMetrics(db, queue);
    expect(metrics).toHaveLength(1);

    const m = metrics[0];
    expect(m.queue).toBe(queue);
    
    // Depth: should count scheduled, available, executing, retryable, etc.
    // Message 1 is confirmed (terminal). Message 2 is retryable (active).
    expect(m.queue_depth).toBe(1);

    // Oldest available age: since msg2 is retryable (not available yet due to backoff), available is empty.
    // Let's verify durations
    // Message 1: claim to complete took 1000ms.
    // Message 2: claim to retry took 500ms.
    console.log("METRICS REAL VALUE:", m);
    expect(m.execution_duration_avg).toBeGreaterThanOrEqual(745);
    expect(m.execution_duration_avg).toBeLessThanOrEqual(755);

    // Receipt duration avg:
    // Message 1 receipt generated at 500 + 1000 = 1500ms from creation.
    // Avg receipt duration: 1500ms.
    expect(m.receipt_duration_avg).toBeGreaterThanOrEqual(1495);
    expect(m.receipt_duration_avg).toBeLessThanOrEqual(1515);

    // Replay duration avg should be recorded as a positive number (since we triggered replay)
    expect(m.replay_duration_avg).toBeGreaterThanOrEqual(0);

    // Counts check
    expect(m.retry_count).toBe(1);
    expect(m.quarantine_count).toBe(0);
    expect(m.rollback_count).toBe(0);
    expect(m.rescue_count).toBe(0);
  });

  it('historic metrics rows are retained across multiple recordings', () => {
    const ctx = createControllableContext(11);

    // Enqueue message
    enqueueMessage(db, ctx, { queue, payload: { hookId: 'h1', val: 1 } }, config);

    // Record first time
    recordQueueMetrics(db, ctx, queue, config.rescueAfterMs);
    ctx.advanceClock(1000);

    // Record second time
    recordQueueMetrics(db, ctx, queue, config.rescueAfterMs);

    const metrics = getHistoricQueueMetrics(db, queue);
    expect(metrics).toHaveLength(2);
    expect(metrics[0].recorded_at).toBeLessThan(metrics[1].recorded_at);
  });

  it('starvation count increments when available messages are bypassed', () => {
    const ctx = createControllableContext(12);

    // Enqueue a low priority message msg1
    const eq1 = enqueueMessage(db, ctx, { queue, payload: { hookId: 'h1', val: 1 }, priority: 1 }, config);

    // Advance clock past starvation threshold (rescueAfterMs / 2 = 2500ms)
    ctx.advanceClock(3000);

    // Enqueue a high priority message msg2
    const eq2 = enqueueMessage(db, ctx, { queue, payload: { hookId: 'h2', val: 2 }, priority: 9 }, config);

    // Claim next message. Since msg2 is priority 9, it is claimed first.
    // Msg1 (priority 1) is bypassed. Since it has been waiting 3000ms (> 2500ms),
    // starvation count should increment.
    const claim = claimNextMessage(db, ctx, queue, config);
    expect(claim.message!.id).toBe(eq2.messageId);

    // Record metrics
    recordQueueMetrics(db, ctx, queue, config.rescueAfterMs);

    let metrics = getHistoricQueueMetrics(db, queue);
    expect(metrics[0].starvation_count).toBe(1);

    // Do it again: enqueue another high priority message and claim it, starvation count increments again!
    ctx.advanceClock(3000); // Msg1 has now been waiting even longer
    const eq3 = enqueueMessage(db, ctx, { queue, payload: { hookId: 'h3', val: 3 }, priority: 9 }, config);
    const claim2 = claimNextMessage(db, ctx, queue, config);
    expect(claim2.message!.id).toBe(eq3.messageId);

    recordQueueMetrics(db, ctx, queue, config.rescueAfterMs);
    metrics = getHistoricQueueMetrics(db, queue);
    expect(metrics[1].starvation_count).toBe(2); // incremented cumulative starvation count
  });
});
