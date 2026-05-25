import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createDeterministicContext } from '../../src/context.js';
import { initializeSchema } from '../../src/persistence/schema.js';
import {
  createPersistentMailbox,
  enqueueMessage
} from '../../src/persistent-mailbox.gall.js';
import type { QueueConfig } from '../../src/persistent-mailbox.gall.js';

describe('Persistent Mailbox Transactional Enqueue', () => {
  let db: Database.Database;
  let ctx: ReturnType<typeof createDeterministicContext>;

  const config: QueueConfig = {
    queue: 'test-queue',
    concurrencyLimit: 2,
    maxDepth: 3, // Low depth to easily test limit
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

  it('should successfully enqueue a message and commit both message and transition', () => {
    const res = enqueueMessage(
      db,
      ctx,
      {
        queue: 'test-queue',
        payload: { data: 'normal-payload' },
        priority: 5
      },
      config
    );

    expect(res.status).toBe('enqueued');
    expect(res.messageId).toBeDefined();

    // Verify message exists in DB
    const msg = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(res.messageId) as any;
    expect(msg).toBeDefined();
    expect(msg.queue).toBe('test-queue');
    expect(msg.priority).toBe(5);
    expect(msg.state).toBe('available');

    // Verify transition exists in DB
    const transition = db.prepare('SELECT * FROM truex_mailbox_transitions WHERE message_id = ?').get(res.messageId) as any;
    expect(transition).toBeDefined();
    expect(transition.from_state).toBe('none');
    expect(transition.to_state).toBe('available');
  });

  it('should throw error when priority is out of range', () => {
    expect(() => {
      enqueueMessage(
        db,
        ctx,
        {
          queue: 'test-queue',
          payload: { data: 'invalid-priority' },
          priority: 10 // range is [0, 9]
        },
        config
      );
    }).toThrow('Priority 10 out of range [0, 9]');

    expect(() => {
      enqueueMessage(
        db,
        ctx,
        {
          queue: 'test-queue',
          payload: { data: 'invalid-priority' },
          priority: -1
        },
        config
      );
    }).toThrow('Priority -1 out of range [0, 9]');
  });

  it('should refuse enqueue when maxDepth is exceeded', () => {
    // Fill the queue up to maxDepth (3)
    enqueueMessage(db, ctx, { queue: 'test-queue', payload: { id: 1 } }, config);
    enqueueMessage(db, ctx, { queue: 'test-queue', payload: { id: 2 } }, config);
    enqueueMessage(db, ctx, { queue: 'test-queue', payload: { id: 3 } }, config);

    // The 4th enqueue should be refused
    const res = enqueueMessage(db, ctx, { queue: 'test-queue', payload: { id: 4 } }, config);
    expect(res.status).toBe('refused');
    expect(res.messageId).toBe('');
    expect(res.receipt).toBeDefined();
    expect(res.receipt?.status).toBe('refused');
    expect(res.receipt?.reason).toBe('max_depth_exceeded');

    // Verify there are still only 3 messages in the database
    const countRow = db.prepare("SELECT count(*) as count FROM truex_mailbox_messages WHERE queue = 'test-queue'").get() as { count: number };
    expect(countRow.count).toBe(3);
  });

  it('should roll back both message and transition completely on injected DB failure', () => {
    // Create a trigger that raises an error during transition insertion to simulate failure
    db.prepare(`
      CREATE TRIGGER inject_failure_trigger
      BEFORE INSERT ON truex_mailbox_transitions
      BEGIN
        SELECT RAISE(FAIL, 'Injected transition table failure');
      END;
    `).run();

    // Verify that attempting to enqueue throws the injected error
    expect(() => {
      enqueueMessage(
        db,
        ctx,
        {
          queue: 'test-queue',
          payload: { data: 'failure-payload' },
          priority: 5
        },
        config
      );
    }).toThrow('Injected transition table failure');

    // Verify that NO message was committed to truex_mailbox_messages
    const messagesCount = db.prepare('SELECT count(*) as count FROM truex_mailbox_messages').get() as { count: number };
    expect(messagesCount.count).toBe(0);

    // Verify that NO transition was committed to truex_mailbox_transitions
    const transitionsCount = db.prepare('SELECT count(*) as count FROM truex_mailbox_transitions').get() as { count: number };
    expect(transitionsCount.count).toBe(0);
  });
});
