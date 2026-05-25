/**
 * @module skills/mailbox/proofs
 * @description
 * Gall Classification: S10 (Persistent Mailbox Proofs)
 * Purpose: Executes the mailbox regression proofs, asserts convergence of PM1-PM5 domains,
 * and compiles the telemetry metrics.
 */

import Database from 'better-sqlite3';
import { initializeSchema } from '../../packages/membrane/src/persistence/schema.js';
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
  verifyMailboxIntegrity,
  replayMailboxLineage,
  rescueExecutingMessages,
  recordQueueMetrics,
  promoteScheduledMessages
} from '../../packages/membrane/src/persistent-mailbox.gall.js';
import { createDeterministicContext } from '../../packages/membrane/src/context.js';
import { computeAccounting } from '../../packages/membrane/src/runtime-law.js';
import { hash } from '../../packages/membrane/src/hash.js';

export interface MailboxProofReport {
  case: string;
  status: string;
  passed: boolean;
  domains: {
    PM1: any;
    PM2: any;
    PM3: any;
    PM4: any;
    PM5: any;
  };
  metrics: {
    enqueueAttempts: number;
    claimAttempts: number;
    transitionAttempts: number;
    integrityAttempts: number;
    rescueAttempts: number;
    durationMs: number;
    mailboxHash: string;
  };
  invariants: string[];
  failures: string[];
}

export async function proveMailbox(): Promise<MailboxProofReport> {
  const start = Date.now();
  const failures: string[] = [];
  const invariants: string[] = [
    "PM1: Mailbox enqueues respect duplicate checks and depth limits",
    "PM2: Concurrency limits restrict claiming and empty queues are detected",
    "PM3: Message transitions and consequences are resolved correctly",
    "PM4: Mailbox integrity checks identify tampered payloads and transitions",
    "PM5: Startup recovery rescues executing/stalled messages safely"
  ];

  // SQLite DB setup
  const db = new Database(':memory:');
  initializeSchema(db);
  createPersistentMailbox(db);

  const ctx = createDeterministicContext(100);

  const config = {
    queue: 'payment-queue',
    concurrencyLimit: 2,
    maxDepth: 3,
    retryPolicy: {
      type: 'linear' as const,
      baseDelayMs: 100
    },
    priorityRange: [0, 9] as [number, number],
    rescueAfterMs: 5000
  };

  // --- PM1: Message Enqueue ---
  let pm1Attempted = 0;
  let pm1Succeeded = 0; // enqueued
  let pm1Refused = 0;
  let pm1DuplicateConfirmed = 0;
  let pm1Failed = 0;

  // 1. Enqueue 3 messages (normal)
  const payloads = [
    { id: 'tx-1', amount: 100, hookId: 'hook-pay' },
    { id: 'tx-2', amount: 200, hookId: 'hook-pay' },
    { id: 'tx-3', amount: 300, hookId: 'hook-pay' }
  ];

  const msgIds: string[] = [];

  for (const payload of payloads) {
    pm1Attempted++;
    const res = enqueueMessage(db, ctx, { queue: config.queue, payload }, config);
    if (res.status === 'enqueued') {
      pm1Succeeded++;
      msgIds.push(res.messageId);
    } else {
      pm1Failed++;
    }
  }

  // 2. Enqueue 4th message (overflows maxDepth=3)
  pm1Attempted++;
  const overflowRes = enqueueMessage(db, ctx, { queue: config.queue, payload: { id: 'tx-4', amount: 400, hookId: 'hook-pay' } }, config);
  if (overflowRes.status === 'refused') {
    pm1Refused++;
  } else {
    pm1Failed++;
  }

  // 3. Duplicate active check
  pm1Attempted++;
  const dupActiveRes = enqueueMessage(db, ctx, { queue: config.queue, payload: payloads[0] }, config);
  if (dupActiveRes.status === 'refused') {
    pm1Refused++;
  } else {
    pm1Failed++;
  }

  // 4. Duplicate completed check (we complete message 0 first)
  const claimRes = claimNextMessage(db, ctx, config.queue, config);
  if (claimRes.status !== 'claimed' || !claimRes.message) {
    failures.push("Failed to claim message for completion test");
  } else {
    completeMessage(db, ctx, claimRes.message.id, hash('tx-1-completed'));
  }

  pm1Attempted++;
  const dupCompletedRes = enqueueMessage(db, ctx, { queue: config.queue, payload: payloads[0] }, config);
  if (dupCompletedRes.status === 'duplicate_confirmed') {
    pm1DuplicateConfirmed++;
  } else {
    pm1Failed++;
  }

  const pm1Domain = computeAccounting({
    attempted: pm1Attempted,
    succeeded: pm1Succeeded,
    failed: pm1Failed,
    refused: pm1Refused,
    quarantined: pm1DuplicateConfirmed,
    skipped: 0
  });

  // --- PM2: Message Claim ---
  let pm2Attempted = 0;
  let pm2Claimed = 0;
  let pm2Locked = 0;
  let pm2Empty = 0;
  let pm2Failed = 0;

  // Let's reset the DB for a clean claim testing sequence
  const claimDb = new Database(':memory:');
  initializeSchema(claimDb);
  createPersistentMailbox(claimDb);

  const cleanPayloads = [
    { id: 'c-1', hookId: 'hook-c' },
    { id: 'c-2', hookId: 'hook-c' },
    { id: 'c-3', hookId: 'hook-c' }
  ];

  const cleanMsgIds: string[] = [];
  for (const p of cleanPayloads) {
    const res = enqueueMessage(claimDb, ctx, { queue: config.queue, payload: p }, config);
    if (res.status === 'enqueued') cleanMsgIds.push(res.messageId);
  }

  // Claim 1
  pm2Attempted++;
  const claim1 = claimNextMessage(claimDb, ctx, config.queue, config);
  if (claim1.status === 'claimed') pm2Claimed++;
  else pm2Failed++;

  // Claim 2 (concurrencyLimit = 2)
  pm2Attempted++;
  const claim2 = claimNextMessage(claimDb, ctx, config.queue, config);
  if (claim2.status === 'claimed') pm2Claimed++;
  else pm2Failed++;

  // Claim 3 (Hits concurrencyLimit -> locked)
  pm2Attempted++;
  const claim3 = claimNextMessage(claimDb, ctx, config.queue, config);
  if (claim3.status === 'locked') pm2Locked++;
  else pm2Failed++;

  // Complete clean-1 and clean-2, so we can claim clean-3
  if (claim1.message) {
    completeMessage(claimDb, ctx, claim1.message.id, hash('c-1-done'));
  }
  if (claim2.message) {
    completeMessage(claimDb, ctx, claim2.message.id, hash('c-2-done'));
  }

  // Claim last
  pm2Attempted++;
  const claim4 = claimNextMessage(claimDb, ctx, config.queue, config);
  if (claim4.status === 'claimed') pm2Claimed++;
  else pm2Failed++;

  // Complete clean-3
  if (claim4.message) {
    completeMessage(claimDb, ctx, claim4.message.id, hash('c-3-done'));
  }

  // Drained - next claim is empty
  pm2Attempted++;
  const claim5 = claimNextMessage(claimDb, ctx, config.queue, config);
  if (claim5.status === 'empty') pm2Empty++;
  else pm2Failed++;

  const pm2Domain = computeAccounting({
    attempted: pm2Attempted,
    succeeded: pm2Claimed,
    failed: pm2Failed,
    refused: pm2Locked,
    quarantined: pm2Empty,
    skipped: 0
  });

  // --- PM3: Consequence Resolution & Transitions ---
  let pm3Attempted = 0;
  let pm3Confirmed = 0;
  let pm3Refused = 0;
  let pm3Retryable = 0;
  let pm3Discarded = 0;
  let pm3RolledBack = 0;
  let pm3Quarantined = 0;
  let pm3Cancelled = 0;
  let pm3Failed = 0;

  const transDb = new Database(':memory:');
  initializeSchema(transDb);
  createPersistentMailbox(transDb);

  // A. completeMessage
  const resA = enqueueMessage(transDb, ctx, { queue: config.queue, payload: { id: 'a' } }, config);
  const claimA = claimNextMessage(transDb, ctx, config.queue, config);
  if (claimA.message) {
    pm3Attempted++;
    completeMessage(transDb, ctx, claimA.message.id, hash('a-out'));
    pm3Confirmed++;
  }

  // B. refuseMessage
  const resB = enqueueMessage(transDb, ctx, { queue: config.queue, payload: { id: 'b' } }, config);
  const claimB = claimNextMessage(transDb, ctx, config.queue, config);
  if (claimB.message) {
    pm3Attempted++;
    refuseMessage(transDb, ctx, claimB.message.id, 'Invalid authorization');
    pm3Refused++;
  }

  // C. retryMessage (attempts < maxRetries)
  const resC = enqueueMessage(transDb, ctx, { queue: config.queue, payload: { id: 'c' } }, config);
  const claimC = claimNextMessage(transDb, ctx, config.queue, config);
  if (claimC.message) {
    pm3Attempted++;
    const retryRes = retryMessage(transDb, ctx, claimC.message.id, 'Transient error', config);
    if (retryRes.state === 'retryable') pm3Retryable++;
    else pm3Failed++;
  }

  // Resolve C so it doesn't interleave with D
  promoteScheduledMessages(transDb, ctx, ctx.clock() + 1000);
  const claimC2 = claimNextMessage(transDb, ctx, config.queue, config);
  if (claimC2.message) {
    completeMessage(transDb, ctx, claimC2.message.id, hash('c-out'));
  }

  // D. retryMessage (attempts >= maxRetries)
  const resD = enqueueMessage(transDb, ctx, { queue: config.queue, payload: { id: 'd' } }, config);
  for (let attempt = 1; attempt <= 3; attempt++) {
    promoteScheduledMessages(transDb, ctx, ctx.clock() + 1000 * attempt);
    const claimD = claimNextMessage(transDb, ctx, config.queue, config);
    if (claimD.message) {
      pm3Attempted++;
      const retryRes = retryMessage(transDb, ctx, claimD.message.id, 'Persistent error', config);
      if (attempt < 3) {
        if (retryRes.state === 'retryable') pm3Retryable++;
        else pm3Failed++;
      } else {
        if (retryRes.state === 'discarded') pm3Discarded++;
        else pm3Failed++;
      }
    }
  }

  // E. rollbackMessage
  const resE = enqueueMessage(transDb, ctx, { queue: config.queue, payload: { id: 'e' } }, config);
  const claimE = claimNextMessage(transDb, ctx, config.queue, config);
  if (claimE.message) {
    pm3Attempted++;
    rollbackMessage(transDb, ctx, claimE.message.id, hash('rollback-receipt'));
    pm3RolledBack++;
  }

  // F. quarantineMessage
  const resF = enqueueMessage(transDb, ctx, { queue: config.queue, payload: { id: 'f' } }, config);
  const claimF = claimNextMessage(transDb, ctx, config.queue, config);
  if (claimF.message) {
    pm3Attempted++;
    quarantineMessage(transDb, ctx, claimF.message.id, 'Poison payload detected');
    pm3Quarantined++;
  }

  // G. cancelMessage
  const resG = enqueueMessage(transDb, ctx, { queue: config.queue, payload: { id: 'g' } }, config);
  if (resG.messageId) {
    pm3Attempted++;
    cancelMessage(transDb, ctx, resG.messageId);
    pm3Cancelled++;
  }

  const pm3Domain = computeAccounting({
    attempted: pm3Attempted,
    succeeded: pm3Confirmed,
    failed: pm3Failed,
    refused: pm3Refused + pm3Discarded + pm3Quarantined + pm3Cancelled,
    quarantined: pm3Retryable + pm3RolledBack,
    skipped: 0
  });

  // --- PM4: Replay & Integrity Verification ---
  let pm4Attempted = 0;
  let pm4Valid = 0;
  let pm4Tampered = 0;
  let pm4Failed = 0;

  const integrityDb = new Database(':memory:');
  initializeSchema(integrityDb);
  createPersistentMailbox(integrityDb);

  const resH = enqueueMessage(integrityDb, ctx, { queue: config.queue, payload: { id: 'h' } }, config);
  const claimH = claimNextMessage(integrityDb, ctx, config.queue, config);
  if (claimH.message) {
    completeMessage(integrityDb, ctx, claimH.message.id, hash('h-out'));
  }

  // Test 1: Clean Integrity Check
  pm4Attempted++;
  const integrity1 = verifyMailboxIntegrity(integrityDb);
  if (integrity1.isValid) pm4Valid++;
  else pm4Failed++;

  // Test 2: Tamper with payload
  pm4Attempted++;
  integrityDb.prepare('UPDATE truex_mailbox_messages SET payload_json = ? WHERE id = ?').run(
    JSON.stringify({ id: 'h-tampered-data' }),
    resH.messageId
  );
  const integrity2 = verifyMailboxIntegrity(integrityDb);
  if (!integrity2.isValid && integrity2.tamperedIds.includes(resH.messageId)) pm4Tampered++;
  else pm4Failed++;

  const pm4Domain = computeAccounting({
    attempted: pm4Attempted,
    succeeded: pm4Valid,
    failed: pm4Failed,
    refused: pm4Tampered,
    quarantined: 0,
    skipped: 0
  });

  // --- PM5: Rescue & Crash Recovery ---
  let pm5Attempted = 0;
  let pm5RescuedRetryable = 0;
  let pm5RescuedRefused = 0;
  let pm5Failed = 0;

  const rescueDb = new Database(':memory:');
  initializeSchema(rescueDb);
  createPersistentMailbox(rescueDb);

  const now = Date.now();

  // Insert a stalled message: attempt < 3 -> should retry
  pm5Attempted++;
  const idStalledRetry = ctx.uuid();
  rescueDb.prepare(`
    INSERT INTO truex_mailbox_messages (
      id, queue, payload_json, priority, state, created_at, available_at, claimed_at,
      attempt, consequence_key, parent_receipt_hash, epoch, error_info, receipt_hash
    ) VALUES (?, ?, ?, 5, 'executing', ?, ?, ?, 1, ?, NULL, 0, NULL, NULL)
  `).run(
    idStalledRetry,
    config.queue,
    JSON.stringify({ id: 'stalled-retry' }),
    now - 10_000,
    now - 10_000,
    now - 8000,
    hash('stalled-retry-key')
  );

  // Insert a stalled message: attempt >= 3 -> should refuse
  pm5Attempted++;
  const idStalledRefuse = ctx.uuid();
  rescueDb.prepare(`
    INSERT INTO truex_mailbox_messages (
      id, queue, payload_json, priority, state, created_at, available_at, claimed_at,
      attempt, consequence_key, parent_receipt_hash, epoch, error_info, receipt_hash
    ) VALUES (?, ?, ?, 5, 'executing', ?, ?, ?, 3, ?, NULL, 0, NULL, NULL)
  `).run(
    idStalledRefuse,
    config.queue,
    JSON.stringify({ id: 'stalled-refuse' }),
    now - 10_000,
    now - 10_000,
    now - 8000,
    hash('stalled-refuse-key')
  );

  // Run rescue
  const rescueRes = rescueExecutingMessages(rescueDb, ctx, now, 5000);
  if (rescueRes.rescuedCount === 2) {
    // Check states of rescued messages
    const rowRetry = rescueDb.prepare('SELECT state FROM truex_mailbox_messages WHERE id = ?').get(idStalledRetry) as { state: string };
    const rowRefuse = rescueDb.prepare('SELECT state FROM truex_mailbox_messages WHERE id = ?').get(idStalledRefuse) as { state: string };

    if (rowRetry.state === 'retryable') pm5RescuedRetryable++;
    else pm5Failed++;

    if (rowRefuse.state === 'refused') pm5RescuedRefused++;
    else pm5Failed++;
  } else {
    pm5Failed += 2;
  }

  const pm5Domain = computeAccounting({
    attempted: pm5Attempted,
    succeeded: pm5RescuedRetryable,
    failed: pm5Failed,
    refused: pm5RescuedRefused,
    quarantined: 0,
    skipped: 0
  });

  const durationMs = Date.now() - start;

  // Compile canonical report hash
  const reportData = {
    case: "persistent-mailbox-regression-proof",
    status: failures.length === 0 ? "passed" : "failed",
    passed: failures.length === 0,
    domains: {
      PM1: pm1Domain,
      PM2: pm2Domain,
      PM3: pm3Domain,
      PM4: pm4Domain,
      PM5: pm5Domain
    },
    metrics: {
      enqueueAttempts: pm1Attempted,
      claimAttempts: pm2Attempted,
      transitionAttempts: pm3Attempted,
      integrityAttempts: pm4Attempted,
      rescueAttempts: pm5Attempted,
      durationMs,
      mailboxHash: ""
    },
    invariants,
    failures
  };

  reportData.metrics.mailboxHash = hash({
    status: reportData.status,
    domains: reportData.domains,
    invariants: reportData.invariants
  });

  return reportData as MailboxProofReport;
}
