import { describe, it, expect } from "vitest";
import Database from "better-sqlite3";
import { createDeterministicContext } from "../../src/context.js";
import {
  createPersistentMailbox,
  enqueueMessage,
  claimNextMessage,
  completeMessage,
  type QueueConfig,
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

describe("Persistent Mailbox - Queue Isolation & Scheduling Discipline", () => {
  it("claimNextMessage preserves priority desc, then FIFO", () => {
    const db = new Database(":memory:");
    createPersistentMailbox(db);
    const ctx = createDeterministicContext(100);

    const config = makeConfig("test-queue", { priorityRange: [0, 9] });

    // Enqueue messages with different priorities and timing
    // Msg A: priority 5
    const resA = enqueueMessage(
      db,
      ctx,
      { queue: "test-queue", payload: { name: "A" }, priority: 5 },
      config
    );
    expect(resA.status).toBe("enqueued");

    // Msg B: priority 8
    const resB = enqueueMessage(
      db,
      ctx,
      { queue: "test-queue", payload: { name: "B" }, priority: 8 },
      config
    );
    expect(resB.status).toBe("enqueued");

    // Msg C: priority 5 (same as A, but enqueued later)
    const resC = enqueueMessage(
      db,
      ctx,
      { queue: "test-queue", payload: { name: "C" }, priority: 5 },
      config
    );
    expect(resC.status).toBe("enqueued");

    // Msg D: priority 2
    const resD = enqueueMessage(
      db,
      ctx,
      { queue: "test-queue", payload: { name: "D" }, priority: 2 },
      config
    );
    expect(resD.status).toBe("enqueued");

    // Claim messages one by one and check ordering
    // First claim should be Msg B (priority 8)
    const claim1 = claimNextMessage(db, ctx, "test-queue", config);
    expect(claim1.status).toBe("claimed");
    expect(claim1.message?.id).toBe(resB.messageId);
    expect(JSON.parse(claim1.message!.payload_json).name).toBe("B");

    // Second claim should be Msg A (priority 5, enqueued before C)
    const claim2 = claimNextMessage(db, ctx, "test-queue", config);
    expect(claim2.status).toBe("claimed");
    expect(claim2.message?.id).toBe(resA.messageId);
    expect(JSON.parse(claim2.message!.payload_json).name).toBe("A");

    // Third claim should be Msg C (priority 5, enqueued after A)
    const claim3 = claimNextMessage(db, ctx, "test-queue", config);
    expect(claim3.status).toBe("claimed");
    expect(claim3.message?.id).toBe(resC.messageId);
    expect(JSON.parse(claim3.message!.payload_json).name).toBe("C");

    // Fourth claim should be Msg D (priority 2)
    const claim4 = claimNextMessage(db, ctx, "test-queue", config);
    expect(claim4.status).toBe("claimed");
    expect(claim4.message?.id).toBe(resD.messageId);
    expect(JSON.parse(claim4.message!.payload_json).name).toBe("D");

    // Fifth claim should be empty
    const claim5 = claimNextMessage(db, ctx, "test-queue", config);
    expect(claim5.status).toBe("empty");
    expect(claim5.message).toBeUndefined();

    db.close();
  });

  it("empty queue returns empty claim result", () => {
    const db = new Database(":memory:");
    createPersistentMailbox(db);
    const ctx = createDeterministicContext(200);
    const config = makeConfig("empty-queue");

    const claim = claimNextMessage(db, ctx, "empty-queue", config);
    expect(claim.status).toBe("empty");
    expect(claim.message).toBeUndefined();

    db.close();
  });

  it("max queue depth refuses overflow", () => {
    const db = new Database(":memory:");
    createPersistentMailbox(db);
    const ctx = createDeterministicContext(300);

    const config = makeConfig("depth-queue", { maxDepth: 2 });

    // Enqueue 1
    const res1 = enqueueMessage(
      db,
      ctx,
      { queue: "depth-queue", payload: { msg: 1 } },
      config
    );
    expect(res1.status).toBe("enqueued");

    // Enqueue 2
    const res2 = enqueueMessage(
      db,
      ctx,
      { queue: "depth-queue", payload: { msg: 2 } },
      config
    );
    expect(res2.status).toBe("enqueued");

    // Enqueue 3 (should fail due to depth limit)
    const res3 = enqueueMessage(
      db,
      ctx,
      { queue: "depth-queue", payload: { msg: 3 } },
      config
    );
    expect(res3.status).toBe("refused");
    expect(res3.messageId).toBe("");
    expect(res3.receipt).toBeDefined();
    expect(res3.receipt?.status).toBe("refused");

    // Verify messages in DB
    const count = db.prepare("SELECT count(*) as count FROM truex_mailbox_messages WHERE queue = ?").get("depth-queue") as { count: number };
    expect(count.count).toBe(2);

    db.close();
  });

  it("concurrency limits are respected", () => {
    const db = new Database(":memory:");
    createPersistentMailbox(db);
    const ctx = createDeterministicContext(400);

    const config = makeConfig("concurrency-queue", { concurrencyLimit: 2 });

    // Enqueue 3 messages
    enqueueMessage(db, ctx, { queue: "concurrency-queue", payload: { msg: 1 } }, config);
    enqueueMessage(db, ctx, { queue: "concurrency-queue", payload: { msg: 2 } }, config);
    enqueueMessage(db, ctx, { queue: "concurrency-queue", payload: { msg: 3 } }, config);

    // Claim 1
    const claim1 = claimNextMessage(db, ctx, "concurrency-queue", config);
    expect(claim1.status).toBe("claimed");

    // Claim 2
    const claim2 = claimNextMessage(db, ctx, "concurrency-queue", config);
    expect(claim2.status).toBe("claimed");

    // Claim 3 - should fail with locked
    const claim3 = claimNextMessage(db, ctx, "concurrency-queue", config);
    expect(claim3.status).toBe("locked");
    expect(claim3.message).toBeUndefined();

    // Complete claim 1
    completeMessage(db, ctx, claim1.message!.id, "output-hash-1");

    // Claim 3 should now succeed
    const claim3Retry = claimNextMessage(db, ctx, "concurrency-queue", config);
    expect(claim3Retry.status).toBe("claimed");
    expect(claim3Retry.message).toBeDefined();

    db.close();
  });

  it("poisoned queue does not starve replay/rollback/observatory queues", () => {
    const db = new Database(":memory:");
    createPersistentMailbox(db);
    const ctx = createDeterministicContext(500);

    // Initialize configurations
    const poisonedConfig = makeConfig("poisoned", { concurrencyLimit: 1, maxDepth: 2 });
    const replayConfig = makeConfig("replay");
    const rollbackConfig = makeConfig("rollback");
    const observatoryConfig = makeConfig("observatory");

    // Fill poisoned queue to overflow and concurrency limits
    // 1. Enqueue and claim a message (saturates concurrency limit of 1)
    const resP1 = enqueueMessage(db, ctx, { queue: "poisoned", payload: { name: "poison-1" } }, poisonedConfig);
    expect(resP1.status).toBe("enqueued");
    const claimP1 = claimNextMessage(db, ctx, "poisoned", poisonedConfig);
    expect(claimP1.status).toBe("claimed");

    // 2. Enqueue another message (fills the max depth of 2)
    const resP2 = enqueueMessage(db, ctx, { queue: "poisoned", payload: { name: "poison-2" } }, poisonedConfig);
    expect(resP2.status).toBe("enqueued");

    // 3. Try to claim another message from poisoned (returns locked due to concurrency limit)
    const claimP2 = claimNextMessage(db, ctx, "poisoned", poisonedConfig);
    expect(claimP2.status).toBe("locked");

    // 4. Try to enqueue one more message to poisoned (refused due to depth limit of 2)
    const resP3 = enqueueMessage(db, ctx, { queue: "poisoned", payload: { name: "poison-3" } }, poisonedConfig);
    expect(resP3.status).toBe("refused");

    // Now, verify that system queues (replay, rollback, observatory) can be operated completely independently
    // 1. Replay Queue
    const resReplay = enqueueMessage(db, ctx, { queue: "replay", payload: { action: "replay-op" } }, replayConfig);
    expect(resReplay.status).toBe("enqueued");
    const claimReplay = claimNextMessage(db, ctx, "replay", replayConfig);
    expect(claimReplay.status).toBe("claimed");
    expect(claimReplay.message?.id).toBe(resReplay.messageId);

    // 2. Rollback Queue
    const resRollback = enqueueMessage(db, ctx, { queue: "rollback", payload: { action: "rollback-op" } }, rollbackConfig);
    expect(resRollback.status).toBe("enqueued");
    const claimRollback = claimNextMessage(db, ctx, "rollback", rollbackConfig);
    expect(claimRollback.status).toBe("claimed");
    expect(claimRollback.message?.id).toBe(resRollback.messageId);

    // 3. Observatory Queue
    const resObs = enqueueMessage(db, ctx, { queue: "observatory", payload: { action: "observe-op" } }, observatoryConfig);
    expect(resObs.status).toBe("enqueued");
    const claimObs = claimNextMessage(db, ctx, "observatory", observatoryConfig);
    expect(claimObs.status).toBe("claimed");
    expect(claimObs.message?.id).toBe(resObs.messageId);

    db.close();
  });
});
