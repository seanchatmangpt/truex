import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { createDeterministicContext } from "../../src/context.js";
import { hash } from "../../src/hash.js";
import {
  createPersistentMailbox,
  enqueueMessage,
  claimNextMessage,
  retryMessage,
  calculateBackoff,
  promoteScheduledMessages,
  type QueueConfig,
  type MailboxMessage,
} from "../../src/persistent-mailbox.gall.js";

function makeConfig(queueName: string, overrides?: Partial<QueueConfig>): QueueConfig {
  return {
    queue: queueName,
    concurrencyLimit: 5,
    maxDepth: 10,
    retryPolicy: {
      type: "constant",
      baseDelayMs: 1000,
    },
    priorityRange: [0, 9],
    rescueAfterMs: 60000,
    ...overrides,
  };
}

describe("Persistent Mailbox - Retry and Backoff Policies", () => {
  it("retryable message becomes available after backoff", () => {
    const db = new Database(":memory:");
    createPersistentMailbox(db);
    const ctx = createDeterministicContext(100);

    const config = makeConfig("retry-queue", {
      retryPolicy: {
        type: "constant",
        baseDelayMs: 2000,
      },
    });

    // 1. Enqueue
    const res = enqueueMessage(db, ctx, { queue: "retry-queue", payload: { task: "do-work" } }, config);
    expect(res.status).toBe("enqueued");

    // 2. Claim (attempt 1)
    const claim1 = claimNextMessage(db, ctx, "retry-queue", config);
    expect(claim1.status).toBe("claimed");
    const msgId = claim1.message!.id;

    // 3. Retry message
    const retryResult = retryMessage(db, ctx, msgId, "error-1", config);
    expect(retryResult.state).toBe("retryable");
    expect(retryResult.receipt.status).toBe("refused");

    // 4. Verify in db it is scheduled for backoff
    const msgInDb = db.prepare("SELECT * FROM truex_mailbox_messages WHERE id = ?").get(msgId) as MailboxMessage;
    expect(msgInDb.state).toBe("retryable");
    const targetTime = msgInDb.available_at;

    // 5. Try to claim immediately (should be empty because it is not promoted and available_at is in the future)
    const claim2Immediate = claimNextMessage(db, ctx, "retry-queue", config);
    expect(claim2Immediate.status).toBe("empty");

    // 6. Advance clock past targetTime.
    let now = ctx.clock();
    while (now <= targetTime) {
      now = ctx.clock();
    }

    // 7. Promote scheduled/retryable messages
    const promoted = promoteScheduledMessages(db, ctx, now);
    expect(promoted).toBe(1);

    // 8. Claim should now succeed since time has advanced and message was promoted
    const claim2AfterDelay = claimNextMessage(db, ctx, "retry-queue", config);
    expect(claim2AfterDelay.status).toBe("claimed");
    expect(claim2AfterDelay.message?.id).toBe(msgId);
    expect(claim2AfterDelay.message?.attempt).toBe(2);

    db.close();
  });

  it("retries exhaust into discarded", () => {
    const db = new Database(":memory:");
    createPersistentMailbox(db);
    const ctx = createDeterministicContext(200);

    const config = makeConfig("exhaust-queue", {
      retryPolicy: {
        type: "constant",
        baseDelayMs: 10,
      },
    });

    const res = enqueueMessage(db, ctx, { queue: "exhaust-queue", payload: { task: "exhaust" } }, config);
    const msgId = res.messageId;

    // First attempt (Claim 1)
    const claim1 = claimNextMessage(db, ctx, "exhaust-queue", config);
    expect(claim1.status).toBe("claimed");
    expect(claim1.message?.attempt).toBe(1);
    retryMessage(db, ctx, msgId, "error-1", config);

    // Second attempt (Claim 2)
    // Advance clock to make it available
    let msgInDb = db.prepare("SELECT * FROM truex_mailbox_messages WHERE id = ?").get(msgId) as MailboxMessage;
    let now = ctx.clock();
    while (now <= msgInDb.available_at) {
      now = ctx.clock();
    }
    // Promote
    promoteScheduledMessages(db, ctx, now);

    const claim2 = claimNextMessage(db, ctx, "exhaust-queue", config);
    expect(claim2.status).toBe("claimed");
    expect(claim2.message?.attempt).toBe(2);
    retryMessage(db, ctx, msgId, "error-2", config);

    // Third attempt (Claim 3)
    // Advance clock to make it available
    msgInDb = db.prepare("SELECT * FROM truex_mailbox_messages WHERE id = ?").get(msgId) as MailboxMessage;
    now = ctx.clock();
    while (now <= msgInDb.available_at) {
      now = ctx.clock();
    }
    // Promote
    promoteScheduledMessages(db, ctx, now);

    const claim3 = claimNextMessage(db, ctx, "exhaust-queue", config);
    expect(claim3.status).toBe("claimed");
    expect(claim3.message?.attempt).toBe(3);

    // This retry call will exceed maxRetries (which is 3) and transition to discarded
    const retryResult = retryMessage(db, ctx, msgId, "error-3", config);
    expect(retryResult.state).toBe("discarded");
    expect(retryResult.receipt.status).toBe("refused");

    // Verify in db
    msgInDb = db.prepare("SELECT * FROM truex_mailbox_messages WHERE id = ?").get(msgId) as MailboxMessage;
    expect(msgInDb.state).toBe("discarded");
    expect(msgInDb.error_info).toBe("error-3");

    // Claim should be empty now
    const claim4 = claimNextMessage(db, ctx, "exhaust-queue", config);
    expect(claim4.status).toBe("empty");

    db.close();
  });

  it("deterministic jitter (same inputs yield same jitter, jitter changes with attempt)", () => {
    const policy = {
      type: "jittered-deterministic" as const,
      baseDelayMs: 1000,
      windowMs: 500,
    };

    const messageId = "msg-unique-id";
    const parentHash = "parent-receipt-hash-value";

    // 1. Same inputs yield same jitter
    const delay1 = calculateBackoff(messageId, 1, parentHash, policy);
    const delay2 = calculateBackoff(messageId, 1, parentHash, policy);
    expect(delay1).toBe(delay2);

    // Validate exact math:
    // hash(messageId || attempt || parentReceiptHash) mod window
    const expectedHash = hash(messageId + "1" + parentHash);
    const expectedJitter = parseInt(expectedHash.slice(0, 8), 16) % 500;
    const expectedExpBackoff = Math.pow(2, 1) * 1000;
    expect(delay1).toBe(expectedExpBackoff + expectedJitter);

    // 2. Jitter changes with attempt
    const delayAttempt2 = calculateBackoff(messageId, 2, parentHash, policy);
    const expectedHashAttempt2 = hash(messageId + "2" + parentHash);
    const expectedJitterAttempt2 = parseInt(expectedHashAttempt2.slice(0, 8), 16) % 500;
    const expectedExpBackoffAttempt2 = Math.pow(2, 2) * 1000;
    expect(delayAttempt2).toBe(expectedExpBackoffAttempt2 + expectedJitterAttempt2);

    // Ensure jitter values are different (since input attempt is different)
    expect(expectedJitter).not.toBe(expectedJitterAttempt2);

    // 3. Constant, linear, squared, exponential policies verify mathematical expectations
    expect(calculateBackoff(messageId, 3, parentHash, { type: "constant", baseDelayMs: 100 })).toBe(100);
    expect(calculateBackoff(messageId, 3, parentHash, { type: "linear", baseDelayMs: 100 })).toBe(300);
    expect(calculateBackoff(messageId, 3, parentHash, { type: "squared", baseDelayMs: 100 })).toBe(900);
    expect(calculateBackoff(messageId, 3, parentHash, { type: "exponential", baseDelayMs: 100 })).toBe(800);
  });

  it("retry policy 'none' discards without retry", () => {
    const db = new Database(":memory:");
    createPersistentMailbox(db);
    const ctx = createDeterministicContext(300);

    const config = makeConfig("none-queue", {
      retryPolicy: {
        type: "none",
        baseDelayMs: 0,
      },
    });

    const res = enqueueMessage(db, ctx, { queue: "none-queue", payload: { action: "quick-fail" } }, config);
    const msgId = res.messageId;

    // Claim
    const claim = claimNextMessage(db, ctx, "none-queue", config);
    expect(claim.status).toBe("claimed");
    expect(claim.message?.attempt).toBe(1);

    // Retry should immediately discard
    const retryResult = retryMessage(db, ctx, msgId, "error-none-policy", config);
    expect(retryResult.state).toBe("discarded");
    expect(retryResult.receipt.status).toBe("refused");

    // Verify state in DB
    const msgInDb = db.prepare("SELECT * FROM truex_mailbox_messages WHERE id = ?").get(msgId) as MailboxMessage;
    expect(msgInDb.state).toBe("discarded");

    db.close();
  });
});
