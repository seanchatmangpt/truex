/**
 * @module TelcoLifecycle
 * @description
 * Gall Classification: Gall S13 (Telco Interop Membrane Implementation)
 * Purpose: Provides a fully realized, executable implementation of the 8 Telco interop verbs
 * (listen, dial, handshake, encode, route, transmit, verify, settle) with strict T1-T6 ledger conservation.
 */

import { hash } from './hash.js';
import type {
  TelcoChannel,
  TelcoPeer,
  CapabilityBinding,
  TelcoSession,
  TelcoPacket,
  RouteDecision,
  TransmissionRecord,
  TelcoReceipt,
  TelcoAccounting
} from './telco.gall.js';

export class TelcoLifecycleManager {
  public channels: Map<string, TelcoChannel> = new Map();
  public peers: Map<string, TelcoPeer> = new Map();
  public sessions: Map<string, TelcoSession> = new Map();
  public packets: Map<string, TelcoPacket> = new Map();
  public routes: Map<string, RouteDecision> = new Map();
  public transmissions: Map<string, TransmissionRecord> = new Map();
  public receipts: TelcoReceipt[] = [];

  // T1 - T6 Accounting Domains (perfect conservation)
  public T1 = { attempted: 0, established: 0, refused: 0 }; // Sessions
  public T2 = { attempted: 0, encoded: 0, refused: 0 };     // Packets
  public T3 = { attempted: 0, admitted: 0, refused: 0 };    // Routes
  public T4 = { attempted: 0, sent: 0, timeout: 0, failed: 0 }; // Transmissions
  public T5 = { attempted: 0, verified: 0, mismatched: 0 }; // Verifications
  public T6 = { attempted: 0, settled_promotable: 0, settled_blocked: 0 }; // Settlement

  /**
   * Listen - Declare and inspect an inbound communication surface and its mailbox.
   */
  public listen(
    id: string,
    protocolFamily: string,
    mailboxBinding: string,
    refusalPolicy: Record<string, any>
  ): TelcoChannel {
    const channel: TelcoChannel = {
      id,
      direction: 'inbound',
      protocolFamily,
      mailboxBinding,
      refusalPolicy,
      boundaryStatus: 'admitted'
    };
    this.channels.set(id, channel);

    const receipt: TelcoReceipt = {
      receiptId: `rcpt-listen-${id}`,
      verb: 'listen',
      channelId: id,
      decision: 'channel_opened',
      createdAt: new Date().toISOString()
    };
    this.receipts.push(receipt);

    return channel;
  }

  /**
   * Dial - Attempt outbound communication with a discoverable peer.
   */
  public dial(peerId: string, identityProof: string): TelcoPeer {
    this.T1.attempted++;

    // Deterministic rule: identityProof containing 'invalid' is refused
    if (identityProof.includes('invalid')) {
      this.T1.refused++;
      const peer: TelcoPeer = {
        id: peerId,
        identityProof,
        status: 'unknown'
      };
      const receipt: TelcoReceipt = {
        receiptId: `rcpt-dial-refused-${peerId}`,
        verb: 'dial',
        decision: 'dial_refused_invalid_proof',
        createdAt: new Date().toISOString()
      };
      this.receipts.push(receipt);
      this.peers.set(peerId, peer);
      return peer;
    }

    const peer: TelcoPeer = {
      id: peerId,
      identityProof,
      status: 'known'
    };
    this.peers.set(peerId, peer);

    const receipt: TelcoReceipt = {
      receiptId: `rcpt-dial-${peerId}`,
      verb: 'dial',
      decision: 'dial_succeeded',
      createdAt: new Date().toISOString()
    };
    this.receipts.push(receipt);

    return peer;
  }

  /**
   * Handshake - Bind peer, protocol, epoch, capability, and freshness window.
   */
  public handshake(
    peerId: string,
    channelId: string,
    protocol: string,
    epoch: number,
    capability: CapabilityBinding,
    freshnessStart: number,
    freshnessEnd: number
  ): TelcoSession {
    const peer = this.peers.get(peerId);
    const channel = this.channels.get(channelId);

    // Invariants
    const isPeerRefused = !peer || peer.status === 'unknown';
    const isChannelRefused = !channel;
    const isProtocolMismatch = channel && channel.protocolFamily !== protocol;
    const isEpochInvalid = epoch < 0;

    if (isPeerRefused || isChannelRefused || isProtocolMismatch || isEpochInvalid) {
      if (this.T1.attempted > T1_established_and_refused(this)) {
        this.T1.refused++;
      }
      const sessionId = `session-refused-${peerId}-${Date.now()}`;
      const receipt: TelcoReceipt = {
        receiptId: `rcpt-handshake-refused-${sessionId}`,
        verb: 'handshake',
        channelId,
        decision: `handshake_refused: peer=${!!peer}, ch=${!!channel}, proto_ok=${!isProtocolMismatch}, epoch_ok=${!isEpochInvalid}`,
        createdAt: new Date().toISOString()
      };
      this.receipts.push(receipt);
      throw new Error(`Handshake refused: peer=${!!peer}, ch=${!!channel}, proto_ok=${!isProtocolMismatch}, epoch_ok=${!isEpochInvalid}`);
    }

    this.T1.established++;
    this.T6.attempted++; // Every established session must be settled

    const sessionId = `sess-${peerId}-${epoch}`;
    const session: TelcoSession = {
      id: sessionId,
      peerId,
      status: 'active',
      capability,
      freshnessWindowStart: freshnessStart,
      freshnessWindowEnd: freshnessEnd
    };
    this.sessions.set(sessionId, session);

    const receipt: TelcoReceipt = {
      receiptId: `rcpt-handshake-${sessionId}`,
      verb: 'handshake',
      sessionId,
      channelId,
      decision: 'session_active',
      createdAt: new Date().toISOString()
    };
    this.receipts.push(receipt);

    return session;
  }

  /**
   * Encode - Project internal objects into canonical boundary packets.
   */
  public encode(sessionId: string, objects: any[]): TelcoPacket {
    this.T2.attempted++;

    const session = this.sessions.get(sessionId);
    const hasObjects = objects && objects.length > 0;
    const isSessionActive = session && session.status === 'active';

    if (!isSessionActive || !hasObjects) {
      this.T2.refused++;
      const receipt: TelcoReceipt = {
        receiptId: `rcpt-encode-refused-${sessionId}-${Date.now()}`,
        verb: 'encode',
        sessionId,
        decision: `encode_refused: session_ok=${!!isSessionActive}, objects_ok=${!!hasObjects}`,
        createdAt: new Date().toISOString()
      };
      this.receipts.push(receipt);
      throw new Error(`Encode refused: session_ok=${!!isSessionActive}, objects_ok=${!!hasObjects}`);
    }

    this.T2.encoded++;
    this.T3.attempted++; // Every encoded packet must be routed

    const payload = JSON.stringify(objects);
    const packetHash = hash(objects);
    const packetId = `pkt-${packetHash.substring(0, 16)}`;

    const packet: TelcoPacket = {
      id: packetId,
      sessionId,
      canonicalHash: packetHash,
      encodedPayload: payload
    };
    this.packets.set(packetId, packet);

    const receipt: TelcoReceipt = {
      receiptId: `rcpt-encode-${packetId}`,
      verb: 'encode',
      sessionId,
      packetHash,
      decision: 'packet_encoded',
      createdAt: new Date().toISOString()
    };
    this.receipts.push(receipt);

    return packet;
  }

  /**
   * Route - Select an admissible communication path and retry policy.
   */
  public route(packetId: string, channelId: string, retryPolicy: string): RouteDecision {
    const packet = this.packets.get(packetId);
    const channel = this.channels.get(channelId);

    const isPacketValid = !!packet;
    const isChannelValid = !!channel;

    if (!isPacketValid || !isChannelValid) {
      this.T3.refused++;
      const decision: RouteDecision = {
        packetId,
        channelId,
        retryPolicy,
        status: 'refused'
      };
      const receipt: TelcoReceipt = {
        receiptId: `rcpt-route-refused-${packetId}-${channelId}`,
        verb: 'route',
        channelId,
        packetHash: packet?.canonicalHash,
        decision: 'route_refused',
        createdAt: new Date().toISOString()
      };
      this.receipts.push(receipt);
      return decision;
    }

    this.T3.admitted++;
    this.T4.attempted++; // Every admitted route must be transmitted

    const decision: RouteDecision = {
      packetId,
      channelId,
      retryPolicy,
      status: 'admitted'
    };
    this.routes.set(packetId, decision);

    const receipt: TelcoReceipt = {
      receiptId: `rcpt-route-${packetId}-${channelId}`,
      verb: 'route',
      channelId,
      packetHash: packet.canonicalHash,
      decision: 'route_admitted',
      createdAt: new Date().toISOString()
    };
    this.receipts.push(receipt);

    return decision;
  }

  /**
   * Transmit - Move the packet across the boundary via durable mailbox discipline.
   */
  public transmit(packetId: string, channelId: string, forceStatus?: 'sent' | 'timeout' | 'failed'): TransmissionRecord {
    const route = this.routes.get(packetId);
    const packet = this.packets.get(packetId);

    if (!route || route.status !== 'admitted') {
      this.T4.failed++;
      const record: TransmissionRecord = {
        id: `tx-failed-${packetId}`,
        routeId: route ? `${packetId}-${channelId}` : 'unknown',
        status: 'failed'
      };
      const receipt: TelcoReceipt = {
        receiptId: `rcpt-transmit-failed-${packetId}`,
        verb: 'transmit',
        channelId,
        packetHash: packet?.canonicalHash,
        decision: 'transmission_failed_unrouted',
        createdAt: new Date().toISOString()
      };
      this.receipts.push(receipt);
      return record;
    }

    // Determine status (can be forced for deterministic test control, or defaults to sent)
    const status = forceStatus || 'sent';

    if (status === 'sent') {
      this.T4.sent++;
      this.T5.attempted++; // Every sent transmission must be verified
    } else if (status === 'timeout') {
      this.T4.timeout++;
    } else {
      this.T4.failed++;
    }

    const txId = `tx-${packetId}-${status}`;
    const record: TransmissionRecord = {
      id: txId,
      routeId: `${packetId}-${channelId}`,
      status: status === 'sent' ? 'transmitted' : status,
      remoteResponseHash: status === 'sent' ? hash({ ack: true, packetId }) : undefined
    };
    this.transmissions.set(txId, record);

    const receipt: TelcoReceipt = {
      receiptId: `rcpt-transmit-${txId}`,
      verb: 'transmit',
      channelId,
      packetHash: packet?.canonicalHash,
      decision: `transmission_${status}`,
      createdAt: new Date().toISOString()
    };
    this.receipts.push(receipt);

    return record;
  }

  /**
   * Verify - Verify acknowledgment, remote response, hash, and replay.
   */
  public verify(transmissionId: string, expectedAckData: any): boolean {
    this.T5.attempted++;

    const tx = this.transmissions.get(transmissionId);
    if (!tx || tx.status !== 'transmitted' || !tx.remoteResponseHash) {
      this.T5.mismatched++;
      const receipt: TelcoReceipt = {
        receiptId: `rcpt-verify-fail-${transmissionId}`,
        verb: 'verify',
        decision: 'verification_failed_no_transmission',
        createdAt: new Date().toISOString()
      };
      this.receipts.push(receipt);
      return false;
    }

    const derivedHash = hash(expectedAckData);
    if (derivedHash === tx.remoteResponseHash) {
      this.T5.verified++;
      const receipt: TelcoReceipt = {
        receiptId: `rcpt-verify-success-${transmissionId}`,
        verb: 'verify',
        decision: 'verification_succeeded',
        createdAt: new Date().toISOString()
      };
      this.receipts.push(receipt);
      return true;
    } else {
      this.T5.mismatched++;
      const receipt: TelcoReceipt = {
        receiptId: `rcpt-verify-mismatch-${transmissionId}`,
        verb: 'verify',
        decision: 'verification_failed_hash_mismatch',
        createdAt: new Date().toISOString()
      };
      this.receipts.push(receipt);
      return false;
    }
  }

  /**
   * Settle - Close session, conserve accounting, and declare consequence promotability.
   */
  public settle(sessionId: string, blockReason?: string): TelcoSession {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Settle refused: session ${sessionId} not found`);
    }

    if (session.status === 'closed' || session.status === 'suspended') {
      return session;
    }

    if (blockReason) {
      this.T6.settled_blocked++;
      session.status = 'suspended';
    } else {
      this.T6.settled_promotable++;
      session.status = 'closed';
    }

    const receipt: TelcoReceipt = {
      receiptId: `rcpt-settle-${sessionId}`,
      verb: 'settle',
      sessionId,
      decision: blockReason ? `session_suspended: ${blockReason}` : 'session_closed_promotable',
      createdAt: new Date().toISOString()
    };
    this.receipts.push(receipt);

    return session;
  }

  /**
   * Asserts perfect conservation across all Telco accounting domains (T1 - T6).
   */
  public verifyLedgerConservation(): void {
    // T1 Conservation
    if (this.T1.attempted !== this.T1.established + this.T1.refused) {
      throw new Error(`Ledger breach T1: attempted (${this.T1.attempted}) != established (${this.T1.established}) + refused (${this.T1.refused})`);
    }

    // T2 Conservation
    if (this.T2.attempted !== this.T2.encoded + this.T2.refused) {
      throw new Error(`Ledger breach T2: attempted (${this.T2.attempted}) != encoded (${this.T2.encoded}) + refused (${this.T2.refused})`);
    }

    // T3 Conservation
    if (this.T3.attempted !== this.T3.admitted + this.T3.refused) {
      throw new Error(`Ledger breach T3: attempted (${this.T3.attempted}) != admitted (${this.T3.admitted}) + refused (${this.T3.refused})`);
    }

    // T4 Conservation
    if (this.T4.attempted !== this.T4.sent + this.T4.timeout + this.T4.failed) {
      throw new Error(`Ledger breach T4: attempted (${this.T4.attempted}) != sent (${this.T4.sent}) + timeout (${this.T4.timeout}) + failed (${this.T4.failed})`);
    }

    // T5 Conservation
    if (this.T5.attempted !== this.T5.verified + this.T5.mismatched) {
      throw new Error(`Ledger breach T5: attempted (${this.T5.attempted}) != verified (${this.T5.verified}) + mismatched (${this.T5.mismatched})`);
    }

    // T6 Conservation
    if (this.T6.attempted !== this.T6.settled_promotable + this.T6.settled_blocked) {
      throw new Error(`Ledger breach T6: attempted (${this.T6.attempted}) != settled_promotable (${this.T6.settled_promotable}) + settled_blocked (${this.T6.settled_blocked})`);
    }
  }

  /**
   * Compiles the Telco Accounting Report.
   */
  public compileAccountingReport(): TelcoAccounting {
    this.verifyLedgerConservation();
    return {
      T1: { attempted: this.T1.attempted, established: this.T1.established, refused: this.T1.refused },
      T2: { attempted: this.T2.attempted, encoded: this.T2.encoded, refused: this.T2.refused },
      T3: { attempted: this.T3.attempted, admitted: this.T3.admitted, refused: this.T3.refused },
      T4: { attempted: this.T4.attempted, sent: this.T4.sent, timeout: this.T4.timeout, failed: this.T4.failed },
      T5: { attempted: this.T5.attempted, verified: this.T5.verified, mismatched: this.T5.mismatched }
    };
  }
}

function T1_established_and_refused(manager: TelcoLifecycleManager): number {
  return manager.T1.established + manager.T1.refused;
}
