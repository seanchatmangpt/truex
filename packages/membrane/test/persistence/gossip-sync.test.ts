import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { SQLiteReceiptStore } from '../../src/persistence/receipt-store.js';
import { GossipSync, type PeerNetwork } from '../../src/persistence/gossip-sync.js';
import { createReceipt } from '../../../../skills/receipt/mutations.ts';
import { type TruexContext, createDeterministicContext } from '../../src/context.ts';
import { initializeSchema } from '../../src/persistence/schema.ts';

/**
 * Mock implementation of PeerNetwork for testing GossipSync.
 */
class MockNetwork implements PeerNetwork {
  private handlers: ((peerId: string, hash: string) => void)[] = [];

  broadcast(peerId: string, hash: string): void {
    // In this mock, we immediately trigger the handlers for all "peers"
    for (const handler of this.handlers) {
      handler(peerId, hash);
    }
  }

  onHash(callback: (peerId: string, hash: string) => void): void {
    this.handlers.push(callback);
  }
}

describe('GossipSync and Tier 0 Stabilization', () => {
  let db: Database.Database;
  let store: SQLiteReceiptStore;
  let network: MockNetwork;
  let gossip: GossipSync;
  let ctx: TruexContext;

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    store = new SQLiteReceiptStore(db);
    network = new MockNetwork();
    gossip = new GossipSync(network, 'local-node');
    store.setGossip(gossip);
    ctx = createDeterministicContext(42);
  });

  it('should broadcast latest hash when a receipt is appended', () => {
    let broadcastedHash: string | undefined;
    let broadcasterId: string | undefined;
    
    network.onHash((peerId, hash) => {
      if (peerId === 'local-node') {
        broadcasterId = peerId;
        broadcastedHash = hash;
      }
    });

    const receipt = createReceipt(ctx, 'e1', 'd1', 'in1', 'out1', null);
    store.append(receipt);

    expect(broadcasterId).toBe('local-node');
    expect(broadcastedHash).toBe(receipt.receiptHash);
  });

  it('should refuse promotion if a peer has a different hash for the current tip', () => {
    // 1. Establish a local tip
    const r1 = createReceipt(ctx, 'e0', 'd0', 'in0', 'out0', null);
    store.append(r1);
    
    // 2. Peer reports a different hash for what we think is the current tip
    // We simulate this by having the mock network deliver a hash from 'peer-1'
    network.broadcast('peer-1', 'wrong-tip-hash');
    
    // 3. Attempting to append a new receipt should fail
    const r2 = createReceipt(ctx, 'e1', 'd1', 'in1', 'out1', r1.receiptHash);
    
    expect(() => store.append(r2)).toThrow(/Promotion refused: local chain has diverged/);
  });

  it('should allow promotion if all peers agree with the current tip', () => {
    // 1. Establish a local tip
    const r1 = createReceipt(ctx, 'e0', 'd0', 'in0', 'out0', null);
    store.append(r1);

    // 2. Peer agrees with our tip
    network.broadcast('peer-1', r1.receiptHash);

    // 3. Promotion should be allowed
    const r2 = createReceipt(ctx, 'e1', 'd1', 'in1', 'out1', r1.receiptHash);
    expect(() => store.append(r2)).not.toThrow();
  });

  it('should allow the first receipt even if peers have some hashes (initial sync case)', () => {
    // Peer already has some hash, but we are empty
    network.broadcast('peer-1', 'some-existing-hash');

    const r1 = createReceipt(ctx, 'e0', 'd0', 'in0', 'out0', null);
    // Should be allowed because isDiverged(null) returns false
    expect(() => store.append(r1)).not.toThrow();
  });
});
