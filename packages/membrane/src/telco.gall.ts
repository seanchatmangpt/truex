/**
 * @module Telco
 * @description
 * Gall Classification: Gall S13 (Telco Interop Membrane)
 * Purpose: Telco is the interop authority. It answers who is speaking, what boundary they cross, 
 * what protocol is admissible, and ensures no unreceipted communication becomes authority.
 */

import { hash } from "./hash.js";

export interface TelcoChannel {
  id: string;
  direction: 'inbound' | 'outbound';
  protocolFamily: string;
  mailboxBinding: string;
  refusalPolicy: Record<string, any>;
  boundaryStatus: 'admitted' | 'refused';
}

export interface TelcoPeer {
  id: string;
  identityProof: string;
  status: 'known' | 'unknown';
}

export interface CapabilityBinding {
  capabilityId: string;
  epoch: number;
  allowedActionFamilies: string[];
}

export interface TelcoSession {
  id: string;
  peerId: string;
  status: 'pending' | 'handshaking' | 'active' | 'closed' | 'suspended';
  capability: CapabilityBinding;
  freshnessWindowStart: number;
  freshnessWindowEnd: number;
}

export interface TelcoPacket {
  id: string;
  sessionId: string;
  canonicalHash: string;
  encodedPayload: string;
}

export interface RouteDecision {
  packetId: string;
  channelId: string;
  retryPolicy: string;
  status: 'admitted' | 'refused';
}

export interface TransmissionRecord {
  id: string;
  routeId: string;
  status: 'enqueued' | 'executing' | 'transmitted' | 'failed' | 'timeout';
  remoteResponseHash?: string;
}

export interface TelcoReceipt {
  receiptId: string;
  verb: string;
  sessionId?: string;
  channelId?: string;
  packetHash?: string;
  parentReceiptHash?: string;
  decision: string;
  createdAt: string;
}

export interface TelcoAccounting {
  T1: { attempted: number; established: number; refused: number }; // Sessions
  T2: { attempted: number; encoded: number; refused: number };     // Packets
  T3: { attempted: number; admitted: number; refused: number };    // Routes
  T4: { attempted: number; sent: number; timeout: number; failed: number }; // Transmissions
  T5: { attempted: number; verified: number; mismatched: number }; // Verifications
  T6: { attempted: number; settled_promotable: number; settled_blocked: number }; // Settlement
}

export class TelcoMembrane {
  public channels: Map<string, TelcoChannel> = new Map();
  public peers: Map<string, TelcoPeer> = new Map();
  public sessions: Map<string, TelcoSession> = new Map();
  public packets: Map<string, TelcoPacket> = new Map();
  public routeDecisions: Map<string, RouteDecision> = new Map();
  public transmissions: Map<string, TransmissionRecord> = new Map();
  public verifications: Map<string, { recordId: string; isValid: boolean }> = new Map();
  public receipts: TelcoReceipt[] = [];

  // Strict Accounting Ledger (T1-T6)
  public ledger: TelcoAccounting = {
    T1: { attempted: 0, established: 0, refused: 0 },
    T2: { attempted: 0, encoded: 0, refused: 0 },
    T3: { attempted: 0, admitted: 0, refused: 0 },
    T4: { attempted: 0, sent: 0, timeout: 0, failed: 0 },
    T5: { attempted: 0, verified: 0, mismatched: 0 },
    T6: { attempted: 0, settled_promotable: 0, settled_blocked: 0 },
  };

  private parentReceiptHash?: string;
  private supportedProtocols: string[] = ['proto/zoe.ocel2.v1', 'proto/grpc.v1'];

  constructor(supportedProtocols?: string[]) {
    if (supportedProtocols) {
      this.supportedProtocols = supportedProtocols;
    }
  }

  /**
   * Verb 1: listen - Declare and inspect an inbound communication surface and its mailbox.
   */
  public listen(channel: Omit<TelcoChannel, 'boundaryStatus'>, isAdmitted: boolean): TelcoChannel {
    const status = isAdmitted ? 'admitted' : 'refused';
    const finalChannel: TelcoChannel = {
      ...channel,
      boundaryStatus: status
    };
    this.channels.set(finalChannel.id, finalChannel);
    this.emitReceipt('listen', undefined, finalChannel.id, undefined, status);
    return finalChannel;
  }

  /**
   * Verb 2: dial - Attempt outbound communication with a discoverable peer.
   */
  public dial(peerId: string, peerProof: string, isKnown: boolean): TelcoPeer {
    this.ledger.T1.attempted++;
    const status = isKnown ? 'known' : 'unknown';
    const peer: TelcoPeer = {
      id: peerId,
      identityProof: peerProof,
      status
    };
    this.peers.set(peerId, peer);
    if (!isKnown) {
      this.ledger.T1.refused++;
      this.emitReceipt('dial', undefined, undefined, undefined, 'refused');
    } else {
      this.emitReceipt('dial', undefined, undefined, undefined, 'succeeded');
    }
    return peer;
  }

  /**
   * Verb 3: handshake - Bind peer, protocol, epoch, capability, and freshness window.
   * Drops connections offering unsupported protocol shapes (T-I2).
   */
  public handshake(
    sessionId: string,
    peerId: string,
    protocolShape: string,
    capability: CapabilityBinding,
    freshnessStart: number,
    freshnessEnd: number
  ): TelcoSession {
    const peer = this.peers.get(peerId);
    
    // T-I2: Handshake drops connections offering unsupported protocol shapes.
    const isProtoSupported = this.supportedProtocols.includes(protocolShape);
    
    if (!isProtoSupported || !peer || peer.status === 'unknown' || capability.epoch <= 0) {
      if (peer && peer.status === 'known') {
        this.ledger.T1.refused++;
      }
      this.emitReceipt('handshake', sessionId, undefined, undefined, 'refused');
      throw new Error(`T-I2 Handshake refused: Unsupported protocol shape, unknown peer, or invalid epoch`);
    }

    const session: TelcoSession = {
      id: sessionId,
      peerId,
      status: 'active',
      capability,
      freshnessWindowStart: freshnessStart,
      freshnessWindowEnd: freshnessEnd
    };

    this.sessions.set(sessionId, session);
    this.ledger.T1.established++;
    this.ledger.T6.attempted++;
    this.emitReceipt('handshake', sessionId, undefined, undefined, 'active');
    return session;
  }

  /**
   * Verb 4: encode - Project internal objects into canonical boundary packets.
   */
  public encode(
    packetId: string,
    sessionId: string,
    payload: string
  ): TelcoPacket {
    this.ledger.T2.attempted++;
    const session = this.sessions.get(sessionId);

    if (!session || session.status !== 'active') {
      this.ledger.T2.refused++;
      this.emitReceipt('encode', sessionId, undefined, undefined, 'refused');
      throw new Error(`Encode refused: Session is not active or does not exist`);
    }

    // T-I4: Every packet sent/received is hash-linked and deterministic.
    const canonicalHash = hash({
      packetId,
      sessionId,
      payload,
      epoch: session.capability.epoch,
      parentHash: this.parentReceiptHash || ''
    });

    const packet: TelcoPacket = {
      id: packetId,
      sessionId,
      canonicalHash,
      encodedPayload: payload
    };

    this.packets.set(packetId, packet);
    this.ledger.T2.encoded++;
    this.emitReceipt('encode', sessionId, undefined, canonicalHash, 'succeeded');
    return packet;
  }

  /**
   * Verb 5: route - Select an admissible communication path and retry policy.
   */
  public route(
    packetId: string,
    channelId: string,
    retryPolicy: string
  ): RouteDecision {
    this.ledger.T3.attempted++;
    const packet = this.packets.get(packetId);
    const channel = this.channels.get(channelId);

    if (!packet || !channel || channel.boundaryStatus === 'refused') {
      const decision: RouteDecision = {
        packetId,
        channelId,
        retryPolicy,
        status: 'refused'
      };
      this.routeDecisions.set(packetId, decision);
      this.ledger.T3.refused++;
      this.emitReceipt('route', undefined, channelId, packet?.canonicalHash, 'refused');
      return decision;
    }

    const decision: RouteDecision = {
      packetId,
      channelId,
      retryPolicy,
      status: 'admitted'
    };
    this.routeDecisions.set(packetId, decision);
    this.ledger.T3.admitted++;
    this.ledger.T4.attempted++;
    this.emitReceipt('route', undefined, channelId, packet.canonicalHash, 'admitted');
    return decision;
  }

  /**
   * Verb 6: transmit - Move the packet across the boundary via durable mailbox discipline.
   * Panics (throws) if no valid epoch/capability exists (T-I1).
   */
  public transmit(
    transmissionId: string,
    packetId: string,
    remoteBehavior: 'success' | 'timeout' | 'fail'
  ): TransmissionRecord {
    const packet = this.packets.get(packetId);
    if (!packet) {
      throw new Error(`Transmit error: Packet not found`);
    }

    const session = this.sessions.get(packet.sessionId);
    // T-I1: Transmit panics if no valid epoch/capability exists.
    if (!session || !session.capability || session.capability.epoch <= 0) {
      throw new Error(`T-I1 Invariant Breach: Transmit panics if no valid epoch/capability exists.`);
    }

    const decision = this.routeDecisions.get(packetId);
    if (!decision || decision.status !== 'admitted') {
      throw new Error(`Transmit error: No admitted route decision for packet`);
    }

    // T-I3: Remote outputs are never treated as local truth until verify and settle.
    let status: TransmissionRecord['status'] = 'enqueued';
    let remoteResponseHash: string | undefined;

    if (remoteBehavior === 'success') {
      status = 'transmitted';
      this.ledger.T4.sent++;
      remoteResponseHash = hash({ source: 'remote', content: 'ack', packetHash: packet.canonicalHash });
    } else if (remoteBehavior === 'timeout') {
      status = 'timeout';
      this.ledger.T4.timeout++;
    } else {
      status = 'failed';
      this.ledger.T4.failed++;
    }

    const record: TransmissionRecord = {
      id: transmissionId,
      routeId: packetId,
      status,
      remoteResponseHash
    };

    this.transmissions.set(transmissionId, record);
    if (status === 'transmitted') {
      this.ledger.T5.attempted++;
    }
    this.emitReceipt('transmit', packet.sessionId, decision.channelId, packet.canonicalHash, status);
    return record;
  }

  /**
   * Verb 7: verify - Verify acknowledgment, remote response, hash, and replay.
   */
  public verify(
    transmissionId: string,
    expectedResponseHash: string
  ): boolean {
    const record = this.transmissions.get(transmissionId);
    if (!record) {
      throw new Error(`Verification error: Transmission record not found`);
    }

    if (record.status !== 'transmitted') {
      this.ledger.T5.mismatched++;
      this.verifications.set(transmissionId, { recordId: transmissionId, isValid: false });
      this.emitReceipt('verify', undefined, undefined, record.remoteResponseHash, 'failed');
      return false;
    }

    const isValid = record.remoteResponseHash === expectedResponseHash;
    if (isValid) {
      this.ledger.T5.verified++;
    } else {
      this.ledger.T5.mismatched++;
    }

    this.verifications.set(transmissionId, { recordId: transmissionId, isValid });
    this.emitReceipt('verify', undefined, undefined, record.remoteResponseHash, isValid ? 'verified' : 'mismatched');
    return isValid;
  }

  /**
   * Verb 8: settle - Close session, conserve accounting, and declare consequence promotability.
   * Proves all T1-T5 conservations sum to zero unhandled packets (T-I5).
   */
  public settle(sessionId: string): { promotable: boolean; reasons: string[] } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Settle error: Session not found`);
    }

    // T-I5: Settle must prove all T1-T5 conservations sum to zero unhandled packets.
    const t1Holds = this.ledger.T1.attempted === this.ledger.T1.established + this.ledger.T1.refused;
    const t2Holds = this.ledger.T2.attempted === this.ledger.T2.encoded + this.ledger.T2.refused;
    const t3Holds = this.ledger.T3.attempted === this.ledger.T3.admitted + this.ledger.T3.refused;
    const t4Holds = this.ledger.T4.attempted === this.ledger.T4.sent + this.ledger.T4.timeout + this.ledger.T4.failed;
    const t5Holds = this.ledger.T5.attempted === this.ledger.T5.verified + this.ledger.T5.mismatched;

    const allConservationHolds = t1Holds && t2Holds && t3Holds && t4Holds && t5Holds;

    if (!allConservationHolds) {
      throw new Error(`T-I5 Invariant Breach: Accounting domains must strictly conserve to settle.`);
    }

    const sessionPackets = Array.from(this.packets.values()).filter(p => p.sessionId === sessionId);
    let promotable = true;
    const reasons: string[] = [];

    if (sessionPackets.length === 0) {
      promotable = false;
      reasons.push("No packets were processed in this session.");
    }

    for (const packet of sessionPackets) {
      const decision = this.routeDecisions.get(packet.id);
      if (!decision || decision.status !== 'admitted') {
        promotable = false;
        reasons.push(`Packet ${packet.id} had route status: ${decision ? decision.status : 'missing'}`);
        continue;
      }

      const trans = Array.from(this.transmissions.values()).find(t => t.routeId === packet.id);
      if (!trans) {
        promotable = false;
        reasons.push(`Packet ${packet.id} was not transmitted`);
        continue;
      }

      if (trans.status !== 'transmitted') {
        promotable = false;
        reasons.push(`Packet ${packet.id} transmission status was: ${trans.status}`);
        continue;
      }

      const verifyStatus = this.verifications.get(trans.id);
      if (!verifyStatus || !verifyStatus.isValid) {
        promotable = false;
        reasons.push(`Packet ${packet.id} verification status was: ${verifyStatus ? 'invalid' : 'missing'}`);
      }
    }

    session.status = 'closed';

    if (promotable) {
      this.ledger.T6.settled_promotable++;
    } else {
      this.ledger.T6.settled_blocked++;
    }

    this.emitReceipt('settle', sessionId, undefined, undefined, promotable ? 'promotable' : 'blocked');
    return { promotable, reasons };
  }

  private emitReceipt(
    verb: string,
    sessionId?: string,
    channelId?: string,
    packetHash?: string,
    decision: string
  ): TelcoReceipt {
    const receiptId = `rcpt_${verb}_${hash({ verb, sessionId, channelId, packetHash, decision, index: this.receipts.length }).slice(0, 12)}`;
    const receipt: TelcoReceipt = {
      receiptId,
      verb,
      sessionId,
      channelId,
      packetHash,
      parentReceiptHash: this.parentReceiptHash,
      decision,
      createdAt: new Date().toISOString()
    };
    this.parentReceiptHash = hash(receipt);
    this.receipts.push(receipt);
    return receipt;
  }
}

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
      throw new Error(`Transmit error: No admitted route decision for packet ${packetId}`);
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
      T5: { attempted: this.T5.attempted, verified: this.T5.verified, mismatched: this.T5.mismatched },
      T6: { attempted: this.T6.attempted, settled_promotable: this.T6.settled_promotable, settled_blocked: this.T6.settled_blocked }
    };
  }
}

function T1_established_and_refused(manager: TelcoLifecycleManager): number {
  return manager.T1.established + manager.T1.refused;
}
