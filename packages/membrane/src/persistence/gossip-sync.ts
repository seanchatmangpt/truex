/**
 * @module gossip-sync
 * @description Gossip-based synchronization prototype for Tier 0 consensus.
 * Gall Classification: S0 (consensus primitives).
 */

/**
 * PeerNetwork interface for broadcasting and receiving hashes.
 * In a real implementation, this would use libp2p or similar.
 */
export interface PeerNetwork {
  broadcast(peerId: string, hash: string): void;
  onHash(callback: (peerId: string, hash: string) => void): void;
}

/**
 * GossipSync manages the peer network state and detects divergence.
 */
export class GossipSync {
  private remoteHashes: Map<string, string> = new Map(); // peerId -> latestHash

  constructor(
    private network: PeerNetwork,
    private localPeerId: string
  ) {
    this.network.onHash((peerId, hash) => {
      if (peerId !== this.localPeerId) {
        this.remoteHashes.set(peerId, hash);
      }
    });
  }

  /**
   * Broadcasts the local latest receipt hash to the network.
   */
  broadcast(hash: string): void {
    this.network.broadcast(this.localPeerId, hash);
  }

  /**
   * Checks if the local state has diverged from the network's known state.
   * For this prototype, any disagreement in the reported latest hashes 
   * is considered a divergence if we assume all nodes should be at the same tip.
   */
  isDiverged(localHash: string | null): boolean {
    if (localHash === null) return false;
    
    for (const [peerId, remoteHash] of this.remoteHashes.entries()) {
      if (remoteHash !== localHash) {
        // In a real consensus, we might check if remoteHash is an ancestor/descendant.
        // For Tier 0 stabilization prototype, we demand strict equality at the tip.
        console.warn(`[GossipSync] Divergence detected with peer ${peerId}. Local: ${localHash}, Remote: ${remoteHash}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Returns the current known remote hashes.
   */
  getRemoteHashes(): Map<string, string> {
    return new Map(this.remoteHashes);
  }
}
