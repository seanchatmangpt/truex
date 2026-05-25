/**
 * @module persistent-mailbox
 * @description Gall Checkpoint S10: Persistent Operational Mailbox and Queue-State Discipline.
 * SQLite-backed, receipt-bearing operational causation engine.
 */

import type { Database } from 'better-sqlite3';
import { hash } from './hash.js';
import { createReceipt, verifyReceipt } from './receipt.js';
import type { Receipt } from './runtime-law.js';
import type { TruexContext } from './context.js';

function mapDbRowToReceipt(row: any): Receipt {
  const receipt: any = {
    id: row.id,
    eventId: row.event_id ?? row.eventId,
    deltaId: row.delta_id ?? row.deltaId,
    inputHash: row.input_hash ?? row.inputHash,
    outputHash: row.output_hash ?? row.outputHash,
    previousReceiptHash: row.previous_receipt_hash === undefined ? row.previousReceiptHash : row.previous_receipt_hash,
    status: row.status as 'confirmed' | 'refused',
    receiptHash: row.receipt_hash ?? row.receiptHash,
  };

  if (row.signature !== undefined && row.signature !== null) receipt.signature = row.signature;
  if (row.publicKey !== undefined && row.publicKey !== null) receipt.publicKey = row.publicKey;
  
  const rollbackOf = row.rollback_of === undefined ? row.rollbackOf : row.rollback_of;
  if (rollbackOf !== undefined && rollbackOf !== null) receipt.rollbackOf = rollbackOf;

  const failedChildId = row.failed_child_id === undefined ? row.failedChildId : row.failed_child_id;
  if (failedChildId !== undefined && failedChildId !== null) receipt.failedChildId = failedChildId;

  const reason = row.reason;
  if (reason !== undefined && reason !== null) receipt.reason = reason;

  return receipt;
}

export type MailboxMessageState =
  | 'scheduled'
  | 'available'
  | 'executing'
  | 'retryable'
  | 'suspended'
  | 'rescueCandidate'
  | 'confirmed'
  | 'refused'
  | 'rolledBack'
  | 'quarantined'
  | 'discarded'
  | 'cancelled';

export interface MailboxMessage {
  id: string;
  queue: string;
  payload_json: string;
  priority: number;
  state: MailboxMessageState;
  created_at: number;
  available_at: number;
  claimed_at: number | null;
  attempt: number;
  consequence_key: string;
  parent_receipt_hash: string | null;
  epoch: number;
  error_info: string | null;
  receipt_hash: string | null;
}

export interface MailboxTransition {
  id: string;
  message_id: string;
  from_state: MailboxMessageState | 'none';
  to_state: MailboxMessageState;
  transitioned_at: number;
  receipt_hash: string | null;
}

export type RetryPolicyType = 'none' | 'constant' | 'linear' | 'squared' | 'exponential' | 'jittered-deterministic';

export interface RetryPolicy {
  type: RetryPolicyType;
  baseDelayMs: number;
  windowMs?: number; // for jittered policy
}

export interface QueueConfig {
  queue: string;
  concurrencyLimit: number;
  maxDepth: number;
  retryPolicy: RetryPolicy;
  priorityRange: [number, number]; // [0, 9]
  rescueAfterMs: number;
}

/**
 * Initializes the SQLite schema for the persistent mailbox system.
 */
export function createPersistentMailbox(db: Database): void {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS receipts (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      delta_id TEXT NOT NULL,
      input_hash TEXT NOT NULL,
      output_hash TEXT NOT NULL,
      previous_receipt_hash TEXT,
      status TEXT NOT NULL,
      receipt_hash TEXT NOT NULL UNIQUE,
      rollback_of TEXT,
      failed_child_id TEXT,
      reason TEXT,
      signature TEXT,
      public_key TEXT
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS truex_mailbox_messages (
      id TEXT PRIMARY KEY,
      queue TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      priority INTEGER NOT NULL,
      state TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      available_at INTEGER NOT NULL,
      claimed_at INTEGER,
      attempt INTEGER NOT NULL DEFAULT 0,
      consequence_key TEXT NOT NULL,
      parent_receipt_hash TEXT,
      epoch INTEGER NOT NULL DEFAULT 0,
      error_info TEXT,
      receipt_hash TEXT
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS truex_mailbox_transitions (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      from_state TEXT NOT NULL,
      to_state TEXT NOT NULL,
      transitioned_at INTEGER NOT NULL,
      receipt_hash TEXT
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS truex_mailbox_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recorded_at INTEGER NOT NULL,
      queue TEXT NOT NULL,
      queue_depth INTEGER NOT NULL,
      oldest_available_age INTEGER NOT NULL,
      execution_duration_avg REAL NOT NULL,
      receipt_duration_avg REAL NOT NULL,
      replay_duration_avg REAL NOT NULL,
      retry_count INTEGER NOT NULL DEFAULT 0,
      quarantine_count INTEGER NOT NULL DEFAULT 0,
      rollback_count INTEGER NOT NULL DEFAULT 0,
      rescue_count INTEGER NOT NULL DEFAULT 0,
      starvation_count INTEGER NOT NULL DEFAULT 0
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS truex_mailbox_shutdowns (
      queue TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      paused_at INTEGER NOT NULL,
      grace_period_ms INTEGER NOT NULL
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS truex_mailbox_starvation_counter (
      queue TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS truex_mailbox_replay_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      queue TEXT NOT NULL,
      duration REAL NOT NULL
    )
  `).run();

  // Indexes for high-performance claiming and integrity tracing
  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_mailbox_claim 
    ON truex_mailbox_messages(queue, state, available_at, priority, created_at)
  `).run();

  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_mailbox_consequence_key 
    ON truex_mailbox_messages(consequence_key)
  `).run();

  db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_mailbox_transitions_msg 
    ON truex_mailbox_transitions(message_id)
  `).run();

  // Evolve receipts table to support metadata fields required for transactional mailbox and recovery causation
  try {
    db.prepare('ALTER TABLE receipts ADD COLUMN failed_child_id TEXT').run();
  } catch {}
  try {
    db.prepare('ALTER TABLE receipts ADD COLUMN reason TEXT').run();
  } catch {}
  try {
    db.prepare('ALTER TABLE receipts ADD COLUMN rollback_of TEXT').run();
  } catch {}
  try {
    db.prepare('ALTER TABLE receipts ADD COLUMN signature TEXT').run();
  } catch {}
  try {
    db.prepare('ALTER TABLE receipts ADD COLUMN public_key TEXT').run();
  } catch {}
}

/**
 * Derives the unique consequence identity hash for duplicate detection.
 */
export function deriveConsequenceKey(
  queue: string,
  payloadJson: string,
  hookId: string,
  parentReceiptHash: string | null,
  epoch: number
): string {
  const payloadHash = hash(payloadJson);
  const normalizedParentHash = parentReceiptHash || '';
  const keyMaterial = `${queue}:${payloadHash}:${hookId}:${normalizedParentHash}:${epoch}`;
  return hash(keyMaterial);
}

/**
 * Helper to record state transitions inside a transaction.
 */
function recordTransition(
  db: Database,
  ctx: TruexContext,
  messageId: string,
  fromState: MailboxMessageState | 'none',
  toState: MailboxMessageState,
  receiptHash: string | null
): void {
  const transitionId = ctx.uuid();
  const now = ctx.clock();
  db.prepare(`
    INSERT INTO truex_mailbox_transitions (id, message_id, from_state, to_state, transitioned_at, receipt_hash)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(transitionId, messageId, fromState, toState, now, receiptHash);
}

/**
 * Enqueues a message with strict duplicate checking, transactional safety, and queue depth validation.
 */
export function enqueueMessage(
  db: Database,
  ctx: TruexContext,
  msg: {
    queue: string;
    payload: any;
    priority?: number;
    availableAt?: number;
    parentReceiptHash?: string | null;
    epoch?: number;
  },
  config: QueueConfig
): { status: 'enqueued' | 'refused' | 'duplicate_confirmed'; messageId: string; receipt?: Receipt } {
  const priority = msg.priority ?? 5;
  if (priority < config.priorityRange[0] || priority > config.priorityRange[1]) {
    throw new Error(`Priority ${priority} out of range [${config.priorityRange[0]}, ${config.priorityRange[1]}]`);
  }

  const payloadJson = JSON.stringify(msg.payload);
  const hookId = msg.payload.hookId || '';
  const parentReceiptHash = msg.parentReceiptHash || null;
  const epoch = msg.epoch ?? 0;

  const consequenceKey = deriveConsequenceKey(msg.queue, payloadJson, hookId, parentReceiptHash, epoch);

  return db.transaction(() => {
    // 1. Check max depth limits for active/open messages
    const activeCount = db.prepare(`
      SELECT COUNT(*) as count FROM truex_mailbox_messages
      WHERE queue = ? AND state IN ('scheduled', 'available', 'executing', 'retryable')
    `).get(msg.queue) as { count: number };

    if (activeCount.count >= config.maxDepth) {
      // Create a refusal receipt to document depth overflow
      const receipt = createReceipt(
        ctx,
        ctx.uuid(),
        ctx.uuid(),
        hash(payloadJson),
        hash('refused_depth_limit'),
        parentReceiptHash,
        'refused',
        undefined,
        { reason: 'max_depth_exceeded' }
      );
      return { status: 'refused' as const, messageId: '', receipt };
    }

    // 2. Query duplicate consequence records
    const existing = db.prepare(`
      SELECT * FROM truex_mailbox_messages WHERE consequence_key = ?
    `).get(consequenceKey) as MailboxMessage | undefined;

    if (existing) {
      if (existing.state === 'confirmed') {
        const receiptRow = db.prepare(`
          SELECT * FROM receipts WHERE receipt_hash = ?
        `).get(existing.receipt_hash) as any;

        if (receiptRow) {
          return {
            status: 'duplicate_confirmed' as const,
            messageId: existing.id,
            receipt: mapDbRowToReceipt(receiptRow),
          };
        }
      }

      // If active (scheduled, available, executing, retryable, suspended, rescueCandidate), dedupe and refuse insertion
      const activeStates: MailboxMessageState[] = [
        'scheduled',
        'available',
        'executing',
        'retryable',
        'suspended',
        'rescueCandidate',
      ];
      if (activeStates.includes(existing.state)) {
        const receipt = createReceipt(
          ctx,
          ctx.uuid(),
          ctx.uuid(),
          hash(payloadJson),
          hash('refused_duplicate_active'),
          parentReceiptHash,
          'refused',
          undefined,
          { reason: 'duplicate_active_consequence' }
        );
        return { status: 'refused' as const, messageId: existing.id, receipt };
      }

      // If terminal but inactive (discarded, refused, rolledBack, quarantined, cancelled),
      // allow only if epoch changes.
      if (existing.epoch === epoch) {
        const receipt = createReceipt(
          ctx,
          ctx.uuid(),
          ctx.uuid(),
          hash(payloadJson),
          hash('refused_duplicate_terminal_epoch'),
          parentReceiptHash,
          'refused',
          undefined,
          { reason: 'duplicate_terminal_same_epoch' }
        );
        return { status: 'refused' as const, messageId: existing.id, receipt };
      }
    }

    // 3. Insert new message atomically
    const messageId = ctx.uuid();
    const now = ctx.clock();
    const availableAt = msg.availableAt ?? now;
    const initialState: MailboxMessageState = availableAt > now ? 'scheduled' : 'available';

    db.prepare(`
      INSERT INTO truex_mailbox_messages (
        id, queue, payload_json, priority, state, created_at, available_at, claimed_at,
        attempt, consequence_key, parent_receipt_hash, epoch, error_info, receipt_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?, ?, NULL, NULL)
    `).run(
      messageId,
      msg.queue,
      payloadJson,
      priority,
      initialState,
      now,
      availableAt,
      consequenceKey,
      parentReceiptHash,
      epoch
    );

    recordTransition(db, ctx, messageId, 'none', initialState, null);

    return { status: 'enqueued' as const, messageId };
  })();
}

/**
 * Calculates retry backoff delay with deterministic jitter based on message ID, attempt, and parent receipt hash.
 */
export function calculateBackoff(
  messageId: string,
  attempt: number,
  parentReceiptHash: string | null,
  policy: RetryPolicy
): number {
  const base = policy.baseDelayMs;
  switch (policy.type) {
    case 'none': {
      return 0;
    }
    case 'constant': {
      return base;
    }
    case 'linear': {
      return attempt * base;
    }
    case 'squared': {
      return attempt * attempt * base;
    }
    case 'exponential': {
      return Math.pow(2, attempt) * base;
    }
    case 'jittered-deterministic': {
      // Deterministic Jitter Formula: hash(messageId || attempt || parentReceiptHash) mod window
      const normalizedParent = parentReceiptHash || '';
      const jHash = hash(messageId + String(attempt) + normalizedParent);
      const window = policy.windowMs ?? 1000;
      const jitterVal = Number.parseInt(jHash.slice(0, 8), 16) % window;
      const exponentialBackoff = Math.pow(2, attempt) * base;
      return exponentialBackoff + jitterVal;
    }
    default: {
      return base;
    }
  }
}

/**
 * Claims the next available message for processing using exclusive transactional isolation.
 */
export function claimNextMessage(
  db: Database,
  ctx: TruexContext,
  queueName: string,
  config: QueueConfig
): { status: 'claimed' | 'empty' | 'locked' | 'refused' | 'failed' | 'paused' | 'stopped'; message?: MailboxMessage; receipt?: Receipt } {
  return db.transaction(() => {
    // Check if the queue is paused or stopped
    const shutdown = db.prepare(`
      SELECT status FROM truex_mailbox_shutdowns WHERE queue = ?
    `).get(queueName) as { status: string } | undefined;

    if (shutdown) {
      if (shutdown.status === 'paused') {
        return { status: 'paused' as const };
      }
      if (shutdown.status === 'stopped') {
        return { status: 'stopped' as const };
      }
    }

    // Check concurrency limits
    const executingCount = db.prepare(`
      SELECT COUNT(*) as count FROM truex_mailbox_messages
      WHERE queue = ? AND state = 'executing'
    `).get(queueName) as { count: number };

    if (executingCount.count >= config.concurrencyLimit) {
      return { status: 'locked' as const };
    }

    const now = ctx.clock();
    // Select highest priority available message
    const message = db.prepare(`
      SELECT * FROM truex_mailbox_messages
      WHERE queue = ? AND state = 'available' AND available_at <= ?
      ORDER BY priority DESC, created_at ASC
      LIMIT 1
    `).get(queueName, now) as MailboxMessage | undefined;

    if (!message) {
      return { status: 'empty' as const };
    }

    // Starvation check: Available messages waiting longer than threshold
    const starvationThreshold = config.rescueAfterMs / 2;
    const starvedCount = (db.prepare(`
      SELECT COUNT(*) as count FROM truex_mailbox_messages
      WHERE queue = ? AND state = 'available' AND (? - available_at) > ?
    `).get(queueName, now, starvationThreshold) as { count: number }).count;

    if (starvedCount > 0) {
      db.prepare(`
        INSERT INTO truex_mailbox_starvation_counter (queue, count)
        VALUES (?, ?)
        ON CONFLICT(queue) DO UPDATE SET count = count + ?
      `).run(queueName, starvedCount, starvedCount);
    }

    // Mark as executing
    db.prepare(`
      UPDATE truex_mailbox_messages
      SET state = 'executing', claimed_at = ?, attempt = attempt + 1
      WHERE id = ?
    `).run(now, message.id);

    // Append transition record
    recordTransition(db, ctx, message.id, message.state, 'executing', null);

    const updatedMessage = {
      ...message,
      state: 'executing' as const,
      claimed_at: now,
      attempt: message.attempt + 1,
    };

    return { status: 'claimed' as const, message: updatedMessage };
  })();
}

/**
 * Helper to save a receipt to the global receipts table.
 */
function saveReceipt(db: Database, receipt: Receipt): void {
  try {
    db.prepare(`
      INSERT INTO receipts (id, event_id, delta_id, input_hash, output_hash, previous_receipt_hash, status, receipt_hash, rollback_of, failed_child_id, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      receipt.id,
      receipt.eventId,
      receipt.deltaId,
      receipt.inputHash,
      receipt.outputHash,
      receipt.previousReceiptHash,
      receipt.status,
      receipt.receiptHash,
      receipt.rollbackOf || null,
      receipt.failedChildId || null,
      receipt.reason || null
    );
  } catch {
    // Fall back to without extra columns if those columns don't exist
    try {
      db.prepare(`
        INSERT INTO receipts (id, event_id, delta_id, input_hash, output_hash, previous_receipt_hash, status, receipt_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        receipt.id,
        receipt.eventId,
        receipt.deltaId,
        receipt.inputHash,
        receipt.outputHash,
        receipt.previousReceiptHash,
        receipt.status,
        receipt.receiptHash
      );
    } catch {
      // Ignore if receipts table does not exist or duplicate
    }
  }
}

/**
 * Helper to check if a queue is paused or stopped, and whether we are within the grace period.
 */
function checkGracePeriod(db: Database, ctx: TruexContext, queue: string): void {
  const shutdown = db.prepare(`
    SELECT status, paused_at, grace_period_ms FROM truex_mailbox_shutdowns WHERE queue = ?
  `).get(queue) as { status: string; paused_at: number; grace_period_ms: number } | undefined;

  if (!shutdown) return;
  if (shutdown.status === 'stopped') {
    throw new Error(`Queue ${queue} is stopped`);
  }
  const now = ctx.clock();
  if (now > shutdown.paused_at + shutdown.grace_period_ms) {
    throw new Error(`Grace period expired for queue ${queue}`);
  }
}

/**
 * Transitions a message to confirmed terminal state upon successful completion.
 */
export function completeMessage(
  db: Database,
  ctx: TruexContext,
  messageId: string,
  outputHash: string,
  keys?: any
): Receipt {
  return db.transaction(() => {
    const msg = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(messageId) as MailboxMessage | undefined;
    if (!msg) throw new Error(`Message ${messageId} not found`);
    if (msg.state !== 'executing') throw new Error(`Message ${messageId} must be executing to complete, currently ${msg.state}`);

    checkGracePeriod(db, ctx, msg.queue);

    const now = ctx.clock();
    const receipt = createReceipt(
      ctx,
      ctx.uuid(),
      ctx.uuid(),
      hash(msg.payload_json),
      outputHash,
      msg.parent_receipt_hash,
      'confirmed',
      keys
    );

    saveReceipt(db, receipt);

    db.prepare(`
      UPDATE truex_mailbox_messages
      SET state = 'confirmed', receipt_hash = ?
      WHERE id = ?
    `).run(receipt.receiptHash, messageId);

    recordTransition(db, ctx, messageId, 'executing', 'confirmed', receipt.receiptHash);

    return receipt;
  })();
}

/**
 * Transitions a message to refused terminal state (e.g. invalid inputs or invalid authorization).
 */
export function refuseMessage(
  db: Database,
  ctx: TruexContext,
  messageId: string,
  reason: string
): Receipt {
  return db.transaction(() => {
    const msg = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(messageId) as MailboxMessage | undefined;
    if (!msg) throw new Error(`Message ${messageId} not found`);

    checkGracePeriod(db, ctx, msg.queue);

    const receipt = createReceipt(
      ctx,
      ctx.uuid(),
      ctx.uuid(),
      hash(msg.payload_json),
      hash('refused'),
      msg.parent_receipt_hash,
      'refused',
      undefined,
      { reason }
    );

    saveReceipt(db, receipt);

    db.prepare(`
      UPDATE truex_mailbox_messages
      SET state = 'refused', error_info = ?, receipt_hash = ?
      WHERE id = ?
    `).run(reason, receipt.receiptHash, messageId);

    recordTransition(db, ctx, messageId, msg.state, 'refused', receipt.receiptHash);

    return receipt;
  })();
}

/**
 * Handles message retry operations using configured backoff algorithms.
 */
export function retryMessage(
  db: Database,
  ctx: TruexContext,
  messageId: string,
  errorMsg: string,
  config: QueueConfig
): { state: 'retryable' | 'discarded'; receipt: Receipt } {
  return db.transaction(() => {
    const msg = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(messageId) as MailboxMessage | undefined;
    if (!msg) throw new Error(`Message ${messageId} not found`);

    checkGracePeriod(db, ctx, msg.queue);

    const now = ctx.clock();
    const maxRetries = 3; // Standard retry boundary

    if (msg.attempt >= maxRetries || config.retryPolicy.type === 'none') {
      // Exceeded retries, transition to discarded
      const receipt = createReceipt(
        ctx,
        ctx.uuid(),
        ctx.uuid(),
        hash(msg.payload_json),
        hash('discarded'),
        msg.parent_receipt_hash,
        'refused',
        undefined,
        { reason: `retries_exhausted: ${errorMsg}` }
      );

      saveReceipt(db, receipt);

      db.prepare(`
        UPDATE truex_mailbox_messages
        SET state = 'discarded', error_info = ?, receipt_hash = ?
        WHERE id = ?
      `).run(errorMsg, receipt.receiptHash, messageId);

      recordTransition(db, ctx, messageId, msg.state, 'discarded', receipt.receiptHash);

      return { state: 'discarded' as const, receipt };
    } else {
      // Schedule next attempt with backoff
      const backoffMs = calculateBackoff(messageId, msg.attempt, msg.parent_receipt_hash, config.retryPolicy);
      const availableAt = now + backoffMs;

      db.prepare(`
        UPDATE truex_mailbox_messages
        SET state = 'retryable', available_at = ?, error_info = ?
        WHERE id = ?
      `).run(availableAt, errorMsg, messageId);

      recordTransition(db, ctx, messageId, msg.state, 'retryable', null);

      const receipt = createReceipt(
        ctx,
        ctx.uuid(),
        ctx.uuid(),
        hash(msg.payload_json),
        hash('retryable'),
        msg.parent_receipt_hash,
        'refused',
        undefined,
        { reason: `retry_scheduled: ${errorMsg}` }
      );

      saveReceipt(db, receipt);

      return { state: 'retryable' as const, receipt };
    }
  })();
}

/**
 * Transitions a message to rolledBack terminal state (e.g. topology compensation execution completed).
 */
export function rollbackMessage(
  db: Database,
  ctx: TruexContext,
  messageId: string,
  rollbackReceiptHash: string
): Receipt {
  return db.transaction(() => {
    const msg = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(messageId) as MailboxMessage | undefined;
    if (!msg) throw new Error(`Message ${messageId} not found`);

    checkGracePeriod(db, ctx, msg.queue);

    const receipt = createReceipt(
      ctx,
      ctx.uuid(),
      ctx.uuid(),
      hash(msg.payload_json),
      hash('rolled_back'),
      msg.parent_receipt_hash,
      'refused',
      undefined,
      { rollbackOf: rollbackReceiptHash }
    );

    saveReceipt(db, receipt);

    db.prepare(`
      UPDATE truex_mailbox_messages
      SET state = 'rolledBack', receipt_hash = ?
      WHERE id = ?
    `).run(receipt.receiptHash, messageId);

    recordTransition(db, ctx, messageId, msg.state, 'rolledBack', receipt.receiptHash);

    return receipt;
  })();
}

/**
 * Quarantines a poisoned or corrupt message to prevent starvation or crashes.
 */
export function quarantineMessage(
  db: Database,
  ctx: TruexContext,
  messageId: string,
  evidence: string
): Receipt {
  return db.transaction(() => {
    const msg = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(messageId) as MailboxMessage | undefined;
    if (!msg) throw new Error(`Message ${messageId} not found`);

    checkGracePeriod(db, ctx, msg.queue);

    const receipt = createReceipt(
      ctx,
      ctx.uuid(),
      ctx.uuid(),
      hash(msg.payload_json),
      hash('quarantined'),
      msg.parent_receipt_hash,
      'refused',
      undefined,
      { reason: `quarantined: ${evidence}` }
    );

    saveReceipt(db, receipt);

    db.prepare(`
      UPDATE truex_mailbox_messages
      SET state = 'quarantined', error_info = ?, receipt_hash = ?
      WHERE id = ?
    `).run(evidence, receipt.receiptHash, messageId);

    recordTransition(db, ctx, messageId, msg.state, 'quarantined', receipt.receiptHash);

    return receipt;
  })();
}

/**
 * Explicitly discards a message.
 */
export function discardMessage(
  db: Database,
  ctx: TruexContext,
  messageId: string,
  reason: string
): Receipt {
  return db.transaction(() => {
    const msg = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(messageId) as MailboxMessage | undefined;
    if (!msg) throw new Error(`Message ${messageId} not found`);

    checkGracePeriod(db, ctx, msg.queue);

    const receipt = createReceipt(
      ctx,
      ctx.uuid(),
      ctx.uuid(),
      hash(msg.payload_json),
      hash('discarded'),
      msg.parent_receipt_hash,
      'refused',
      undefined,
      { reason }
    );

    saveReceipt(db, receipt);

    db.prepare(`
      UPDATE truex_mailbox_messages
      SET state = 'discarded', error_info = ?, receipt_hash = ?
      WHERE id = ?
    `).run(reason, receipt.receiptHash, messageId);

    recordTransition(db, ctx, messageId, msg.state, 'discarded', receipt.receiptHash);

    return receipt;
  })();
}

/**
 * Cancels a message.
 */
export function cancelMessage(
  db: Database,
  ctx: TruexContext,
  messageId: string
): void {
  db.transaction(() => {
    const msg = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(messageId) as MailboxMessage | undefined;
    if (!msg) throw new Error(`Message ${messageId} not found`);

    checkGracePeriod(db, ctx, msg.queue);

    if (
      msg.state === 'confirmed' ||
      msg.state === 'refused' ||
      msg.state === 'rolledBack' ||
      msg.state === 'quarantined' ||
      msg.state === 'discarded' ||
      msg.state === 'cancelled'
    ) {
      throw new Error(`Cannot cancel message in terminal state ${msg.state}`);
    }

    db.prepare(`
      UPDATE truex_mailbox_messages
      SET state = 'cancelled'
      WHERE id = ?
    `).run(messageId);

    recordTransition(db, ctx, messageId, msg.state, 'cancelled', null);
  })();
}

/**
 * Verifies cryptographic integrity of the entire mailbox transitions list.
 */
export function verifyMailboxIntegrity(db: Database): { isValid: boolean; tamperedIds: string[] } {
  const messages = db.prepare('SELECT * FROM truex_mailbox_messages').all() as MailboxMessage[];
  const tamperedIds: string[] = [];

  for (const msg of messages) {
    // 1. Validate consequence key consistency
    let parsedPayload: any = {};
    try {
      parsedPayload = JSON.parse(msg.payload_json);
    } catch {
      console.warn(`[verifyMailboxIntegrity] Message ${msg.id} has invalid payload JSON`);
      tamperedIds.push(msg.id);
      continue;
    }
    const hookId = parsedPayload.hookId || '';
    const derivedKey = deriveConsequenceKey(msg.queue, msg.payload_json, hookId, msg.parent_receipt_hash, msg.epoch);
    if (derivedKey !== msg.consequence_key) {
      console.warn(`[verifyMailboxIntegrity] Message ${msg.id} consequence key mismatch. DB: ${msg.consequence_key}, Derived: ${derivedKey}`);
      tamperedIds.push(msg.id);
      continue;
    }

    // 2. Validate receipt details if present
    if (msg.receipt_hash) {
      const payloadHash = hash(msg.payload_json);
      const receiptRow = db.prepare('SELECT * FROM receipts WHERE receipt_hash = ?').get(msg.receipt_hash) as any;
      if (!receiptRow) {
        console.warn(`[verifyMailboxIntegrity] Message ${msg.id} receipt not found in receipts table for hash ${msg.receipt_hash}`);
        tamperedIds.push(msg.id);
        continue;
      }
      const receipt = mapDbRowToReceipt(receiptRow);
      if (!verifyReceipt(receipt)) {
        console.warn(`[verifyMailboxIntegrity] Message ${msg.id} receipt self-integrity check failed. Receipt:`, receipt);
        tamperedIds.push(msg.id);
        continue;
      }
      if (receipt.inputHash !== payloadHash) {
        console.warn(`[verifyMailboxIntegrity] Message ${msg.id} payload input hash mismatch. Receipt inputHash: ${receipt.inputHash}, payloadHash: ${payloadHash}`);
        tamperedIds.push(msg.id);
        continue;
      }
      if (receipt.previousReceiptHash !== msg.parent_receipt_hash) {
        console.warn(`[verifyMailboxIntegrity] Message ${msg.id} parent receipt hash mismatch. Receipt previousReceiptHash: ${receipt.previousReceiptHash}, message parent_receipt_hash: ${msg.parent_receipt_hash}`);
        tamperedIds.push(msg.id);
        continue;
      }
    }

    // 3. Validate transition lineage
    const transitions = db.prepare(`
      SELECT * FROM truex_mailbox_transitions WHERE message_id = ? ORDER BY transitioned_at ASC
    `).all(msg.id) as MailboxTransition[];

    if (transitions.length === 0) {
      console.warn(`[verifyMailboxIntegrity] Message ${msg.id} has no transition history`);
      tamperedIds.push(msg.id);
      continue;
    }

    // Validate transition path and verify terminal receipts
    let current: MailboxMessageState | 'none' = 'none';
    let pathValid = true;
    for (const t of transitions) {
      if (t.from_state !== current) {
        pathValid = false;
        break;
      }
      current = t.to_state;
    }

    if (!pathValid || current !== msg.state) {
      console.warn(`[verifyMailboxIntegrity] Message ${msg.id} transition path invalid or ends at ${current} instead of DB state ${msg.state}`);
      tamperedIds.push(msg.id);
      continue;
    }

    // Check terminal receipt hash link
    const lastTransition = transitions.at(-1)!;
    if (msg.receipt_hash !== lastTransition.receipt_hash) {
      console.warn(`[verifyMailboxIntegrity] Message ${msg.id} terminal receipt hash link mismatch. DB msg.receipt_hash: ${msg.receipt_hash}, Last transition receipt_hash: ${lastTransition.receipt_hash}`);
      tamperedIds.push(msg.id);
    }
  }

  return {
    isValid: tamperedIds.length === 0,
    tamperedIds,
  };
}

/**
 * Replays transitions from the mailbox transitions table.
 */
export function replayMailboxLineage(db: Database, messageId: string): MailboxMessageState[] {
  const start = Date.now();
  const msg = db.prepare('SELECT * FROM truex_mailbox_messages WHERE id = ?').get(messageId) as MailboxMessage | undefined;
  if (!msg) throw new Error(`Message ${messageId} not found`);

  const transitions = db.prepare(`
    SELECT * FROM truex_mailbox_transitions WHERE message_id = ? ORDER BY transitioned_at ASC
  `).all(messageId) as MailboxTransition[];

  if (transitions.length === 0) {
    throw new Error(`No transitions found for message ${messageId}`);
  }

  let current: MailboxMessageState | 'none' = 'none';
  for (const t of transitions) {
    if (t.from_state !== current) {
      throw new Error(`Lineage replay failure: transition from ${t.from_state} expected ${current}`);
    }
    current = t.to_state;
  }

  if (current !== msg.state) {
    throw new Error(`Lineage replay failure: terminal state ${current} does not match message state ${msg.state}`);
  }

  const duration = Date.now() - start;
  db.prepare(`
    INSERT INTO truex_mailbox_replay_logs (queue, duration)
    VALUES (?, ?)
  `).run(msg.queue, duration);

  return transitions.map(t => t.to_state);
}

/**
 * Startup crash recovery scanning: identifies stalled executing messages and transitions them to rescueCandidate.
 */
export function rescueExecutingMessages(
  db: Database,
  ctx: TruexContext,
  now: number,
  rescueAfterMs: number
): { rescuedCount: number; receipts: Receipt[] } {
  return db.transaction(() => {
    const limitTime = now - rescueAfterMs;
    
    // We select executing messages that are stalled based on:
    // 1. claimed_at < now - rescueAfterMs
    // 2. Queue is stopped
    // 3. Queue is paused and grace period expired
    const executing = db.prepare(`
      SELECT * FROM truex_mailbox_messages
      WHERE state = 'executing'
    `).all() as MailboxMessage[];

    const stalled: MailboxMessage[] = [];

    for (const msg of executing) {
      if (msg.claimed_at !== null && msg.claimed_at < limitTime) {
        stalled.push(msg);
        continue;
      }

      const shutdown = db.prepare(`
        SELECT status, paused_at, grace_period_ms FROM truex_mailbox_shutdowns WHERE queue = ?
      `).get(msg.queue) as { status: string; paused_at: number; grace_period_ms: number } | undefined;

      if (shutdown) {
        if (shutdown.status === 'stopped') {
          stalled.push(msg);
        } else if (shutdown.status === 'paused' && now > shutdown.paused_at + shutdown.grace_period_ms) {
          stalled.push(msg);
        }
      }
    }

    const receipts: Receipt[] = [];

    for (const msg of stalled) {
      // 1. Move to rescueCandidate
      db.prepare(`
        UPDATE truex_mailbox_messages
        SET state = 'rescueCandidate'
        WHERE id = ?
      `).run(msg.id);

      recordTransition(db, ctx, msg.id, 'executing', 'rescueCandidate', null);

      // 2. Transition candidate to retryable or refused based on attempt limits
      const maxRetries = 3;
      let nextState: MailboxMessageState;
      let recReceipt: Receipt;

      if (msg.attempt >= maxRetries) {
        nextState = 'refused';
        recReceipt = createReceipt(
          ctx,
          ctx.uuid(),
          ctx.uuid(),
          hash(msg.payload_json),
          hash('rescued_refused'),
          msg.parent_receipt_hash,
          'refused',
          undefined,
          {
            failedChildId: msg.id,
            reason: `rescued_failed_attempts: ${msg.attempt}`
          }
        );

        saveReceipt(db, recReceipt);

        db.prepare(`
          UPDATE truex_mailbox_messages
          SET state = 'refused', error_info = ?, receipt_hash = ?
          WHERE id = ?
        `).run('rescued_refused', recReceipt.receiptHash, msg.id);

        receipts.push(recReceipt);
      } else {
        nextState = 'retryable';
        recReceipt = createReceipt(
          ctx,
          ctx.uuid(),
          ctx.uuid(),
          hash(msg.payload_json),
          hash('rescued_retryable'),
          msg.parent_receipt_hash,
          'refused',
          undefined,
          {
            failedChildId: msg.id,
            reason: `rescued_retry_scheduled_attempt: ${msg.attempt}`
          }
        );

        saveReceipt(db, recReceipt);

        // Schedule for immediate retrying
        db.prepare(`
          UPDATE truex_mailbox_messages
          SET state = 'retryable', available_at = ?, error_info = ?, receipt_hash = ?
          WHERE id = ?
        `).run(now, 'rescued_retryable', recReceipt.receiptHash, msg.id);

        receipts.push(recReceipt);
      }

      recordTransition(db, ctx, msg.id, 'rescueCandidate', nextState, recReceipt.receiptHash);
    }

    return { rescuedCount: stalled.length, receipts };
  })();
}

/**
 * Persists historic queue metrics inside the mailbox metrics table.
 */
export function recordQueueMetrics(
  db: Database,
  ctx: TruexContext,
  queue: string,
  rescueAfterMs?: number
): void {
  const now = ctx.clock();

  // Calculate stats
  const depthRow = db.prepare(`
    SELECT COUNT(*) as count FROM truex_mailbox_messages
    WHERE queue = ? AND state IN ('scheduled', 'available', 'executing', 'retryable', 'suspended', 'rescueCandidate')
  `).get(queue) as { count: number };

  const oldestRow = db.prepare(`
    SELECT MIN(available_at) as min_avail FROM truex_mailbox_messages
    WHERE queue = ? AND state = 'available'
  `).get(queue) as { min_avail: number | null };

  const oldestAge = oldestRow.min_avail ? Math.max(0, now - oldestRow.min_avail) : 0;

  // Let's count metrics transitions
  const retryCount = (db.prepare(`
    SELECT COUNT(*) as count FROM truex_mailbox_transitions
    WHERE to_state = 'retryable' AND message_id IN (SELECT id FROM truex_mailbox_messages WHERE queue = ?)
  `).get(queue) as { count: number }).count;

  const quarantineCount = (db.prepare(`
    SELECT COUNT(*) as count FROM truex_mailbox_transitions
    WHERE to_state = 'quarantined' AND message_id IN (SELECT id FROM truex_mailbox_messages WHERE queue = ?)
  `).get(queue) as { count: number }).count;

  const rollbackCount = (db.prepare(`
    SELECT COUNT(*) as count FROM truex_mailbox_transitions
    WHERE to_state = 'rolledBack' AND message_id IN (SELECT id FROM truex_mailbox_messages WHERE queue = ?)
  `).get(queue) as { count: number }).count;

  const rescueCount = (db.prepare(`
    SELECT COUNT(*) as count FROM truex_mailbox_transitions
    WHERE to_state = 'rescueCandidate' AND message_id IN (SELECT id FROM truex_mailbox_messages WHERE queue = ?)
  `).get(queue) as { count: number }).count;

  // Calculate execution duration avg
  const execDurRow = db.prepare(`
    SELECT AVG(t2.transitioned_at - t1.transitioned_at) as avg_dur
    FROM truex_mailbox_transitions t1
    JOIN truex_mailbox_transitions t2 ON t1.message_id = t2.message_id
    JOIN truex_mailbox_messages m ON m.id = t1.message_id
    WHERE m.queue = ?
      AND t1.to_state = 'executing'
      AND t2.transitioned_at = (
        SELECT MIN(t3.transitioned_at)
        FROM truex_mailbox_transitions t3
        WHERE t3.message_id = t1.message_id
          AND t3.transitioned_at > t1.transitioned_at
      )
      AND t2.to_state IN ('confirmed', 'refused', 'retryable', 'quarantined', 'discarded', 'rolledBack')
  `).get(queue) as { avg_dur: number | null };

  const execDurAvg = execDurRow.avg_dur ?? 0;

  // Calculate receipt duration avg
  const receiptDurRow = db.prepare(`
    SELECT AVG(t.transitioned_at - m.created_at) as avg_dur
    FROM truex_mailbox_transitions t
    JOIN truex_mailbox_messages m ON m.id = t.message_id
    WHERE m.queue = ?
      AND t.receipt_hash IS NOT NULL
  `).get(queue) as { avg_dur: number | null };

  const receiptDurAvg = receiptDurRow.avg_dur ?? 0;

  // Calculate replay duration avg
  const replayDurRow = db.prepare(`
    SELECT AVG(duration) as avg_dur
    FROM truex_mailbox_replay_logs
    WHERE queue = ?
  `).get(queue) as { avg_dur: number | null };

  const replayDurAvg = replayDurRow.avg_dur ?? 0;

  // Calculate starvation count
  const starvationRow = db.prepare(`
    SELECT count FROM truex_mailbox_starvation_counter WHERE queue = ?
  `).get(queue) as { count: number } | undefined;
  const starvationCount = starvationRow ? starvationRow.count : 0;

  db.prepare(`
    INSERT INTO truex_mailbox_metrics (
      recorded_at, queue, queue_depth, oldest_available_age,
      execution_duration_avg, receipt_duration_avg, replay_duration_avg,
      retry_count, quarantine_count, rollback_count, rescue_count, starvation_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    now,
    queue,
    depthRow.count,
    oldestAge,
    execDurAvg,
    receiptDurAvg,
    replayDurAvg,
    retryCount,
    quarantineCount,
    rollbackCount,
    rescueCount,
    starvationCount
  );
}

/**
 * Pauses a queue for graceful shutdown.
 */
export function pauseQueue(db: Database, ctx: TruexContext, queue: string, gracePeriodMs: number): void {
  const now = ctx.clock();
  db.prepare(`
    INSERT INTO truex_mailbox_shutdowns (queue, status, paused_at, grace_period_ms)
    VALUES (?, 'paused', ?, ?)
    ON CONFLICT(queue) DO UPDATE SET status = 'paused', paused_at = ?, grace_period_ms = ?
  `).run(queue, now, gracePeriodMs, now, gracePeriodMs);
}

/**
 * Stops a queue immediately.
 */
export function stopQueue(db: Database, ctx: TruexContext, queue: string): void {
  const now = ctx.clock();
  db.prepare(`
    INSERT INTO truex_mailbox_shutdowns (queue, status, paused_at, grace_period_ms)
    VALUES (?, 'stopped', ?, 0)
    ON CONFLICT(queue) DO UPDATE SET status = 'stopped', paused_at = ?, grace_period_ms = 0
  `).run(queue, now, now);
}

/**
 * Resumes a paused/stopped queue.
 */
export function resumeQueue(db: Database, queue: string): void {
  db.prepare(`
    DELETE FROM truex_mailbox_shutdowns WHERE queue = ?
  `).run(queue);
}

/**
 * Retrieves the recorded metrics history for a queue.
 */
export function getHistoricQueueMetrics(db: Database, queue: string): any[] {
  return db.prepare(`
    SELECT * FROM truex_mailbox_metrics
    WHERE queue = ?
    ORDER BY recorded_at ASC
  `).all(queue);
}

/**
 * Promotes scheduled and retryable messages to available state once their available_at time has passed.
 */
export function promoteScheduledMessages(
  db: Database,
  ctx: TruexContext,
  now: number
): number {
  return db.transaction(() => {
    const messages = db.prepare(`
      SELECT * FROM truex_mailbox_messages
      WHERE state IN ('scheduled', 'retryable') AND available_at <= ?
    `).all(now) as MailboxMessage[];

    for (const msg of messages) {
      db.prepare(`
        UPDATE truex_mailbox_messages
        SET state = 'available', available_at = 0
        WHERE id = ?
      `).run(msg.id);

      recordTransition(db, ctx, msg.id, msg.state, 'available', null);
    }

    return messages.length;
  })();
}

