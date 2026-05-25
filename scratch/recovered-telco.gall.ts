Created At: 2026-05-24T16:25:03Z
Completed At: 2026-05-24T16:25:03Z
File Path: `file:///Users/sac/truex/packages/membrane/src/telco.gall.ts`
Total Lines: 446
Total Bytes: 14499
Showing lines 1 to 446
The following code has been modified to include a line number before every line, in the format: <line_number>: <original_line>. Please note that any changes targeting the original code should remove the line number, colon, and leading space.
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

The above content shows the entire, complete file contents of the requested file.
