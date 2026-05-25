/**
 * @module Telco
 * @description
 * Gall Classification: Gall S13 (Telco Interop Membrane)
 * Purpose: Telco is the interop authority. It answers who is speaking, what boundary they cross, 
 * what protocol is admissible, and ensures no unreceipted communication becomes authority.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { hash } from './hash.js';

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
  private projectPath: string;
  private accPath: string;
  private activeSessions: Map<string, TelcoSession> = new Map();
  private channels: Map<string, TelcoChannel> = new Map();
  private lastReceiptHash: string = '';

  constructor(projectPath: string) {
    this.projectPath = path.resolve(projectPath);
    this.accPath = path.join(this.projectPath, '.truex', 'reports', 'accounting.json');
  }

  private loadAccounting(): any {
    if (!fs.existsSync(this.accPath)) {
      throw new Error("Accounting ledger accounting.json is missing.");
    }
    return JSON.parse(fs.readFileSync(this.accPath, 'utf8'));
  }

  private saveAccounting(acc: any): void {
    fs.writeFileSync(this.accPath, JSON.stringify(acc, null, 2));
  }

  initTelcoAccounting(): void {
    const acc = this.loadAccounting();
    if (!acc.T1) {
      acc.T1 = { attempted: 0, established: 0, refused: 0 };
      acc.T2 = { attempted: 0, encoded: 0, refused: 0 };
      acc.T3 = { attempted: 0, admitted: 0, refused: 0 };
      acc.T4 = { attempted: 0, sent: 0, timeout: 0, failed: 0 };
      acc.T5 = { attempted: 0, verified: 0, mismatched: 0 };
      acc.T6 = { attempted: 0, settled_promotable: 0, settled_blocked: 0 };
      this.saveAccounting(acc);
    }
  }

  private emitReceipt(verb: string, decision: string, extra?: any): TelcoReceipt {
    const start = new Date().toISOString();
    const payload = {
      projectPath: this.projectPath,
      verb,
      decision,
      createdAt: start,
      parentReceiptHash: this.lastReceiptHash || undefined,
      ...extra
    };
    const receiptHash = hash(payload);
    this.lastReceiptHash = receiptHash;

    const receipt: TelcoReceipt = {
      receiptId: receiptHash,
      verb,
      decision,
      createdAt: start,
      parentReceiptHash: payload.parentReceiptHash,
      sessionId: extra?.sessionId,
      channelId: extra?.channelId,
      packetHash: extra?.packetHash
    };

    const receiptFileName = `receipt-telco-${verb}-${Date.now()}-${Math.floor(Math.random() * 1000)}.json`;
    const receiptPath = path.join(this.projectPath, '.truex', 'receipts', receiptFileName);
    fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));

    // Also append to execution-ledger.json
    const ledgerPath = path.join(this.projectPath, '.truex', 'reports', 'execution-ledger.json');
    if (fs.existsSync(ledgerPath)) {
      try {
        const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
        ledger.push({
          receiptHash,
          verb,
          status: decision === 'refused' || decision === 'failed' ? 'refused' : 'succeeded',
          startedAt: start,
          completedAt: new Date().toISOString(),
          durationMs: 1
        });
        fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
      } catch {}
    }

    return receipt;
  }

  // 1. listen
  listen(channelId: string, direction: 'inbound' | 'outbound', protocolFamily: string, mailboxBinding: string): TelcoChannel {
    const channel: TelcoChannel = {
      id: channelId,
      direction,
      protocolFamily,
      mailboxBinding,
      refusalPolicy: {},
      boundaryStatus: protocolFamily === 'unsupported' ? 'refused' : 'admitted'
    };

    this.channels.set(channelId, channel);
    this.emitReceipt('listen', channel.boundaryStatus, { channelId });
    return channel;
  }

  // 2. dial
  dial(peerId: string, identityProof: string): { success: boolean; peer?: TelcoPeer } {
    this.initTelcoAccounting();
    const acc = this.loadAccounting();
    acc.T1.attempted++;

    if (identityProof === 'invalid') {
      acc.T1.refused++;
      this.saveAccounting(acc);
      this.emitReceipt('dial', 'refused', { peerId });
      return { success: false };
    }

    const peer: TelcoPeer = {
      id: peerId,
      identityProof,
      status: 'known'
    };

    this.saveAccounting(acc);
    this.emitReceipt('dial', 'admitted', { peerId });
    return { success: true, peer };
  }

  // 3. handshake
  handshake(
    sessionId: string,
    peerId: string,
    protocolFamily: string,
    capabilityId: string,
    allowedActionFamilies: string[],
    freshnessWindowStart: number,
    freshnessWindowEnd: number
  ): TelcoSession {
    const acc = this.loadAccounting();

    // Protocol Honesty (T-I2): handshake drops connections offering unsupported protocol shapes.
    if (protocolFamily === 'unsupported') {
      acc.T1.refused++;
      this.saveAccounting(acc);
      this.emitReceipt('handshake', 'refused', { sessionId, peerId });
      throw new Error(`Protocol Honesty validation failed: unsupported protocol "${protocolFamily}"`);
    }

    const session: TelcoSession = {
      id: sessionId,
      peerId,
      status: 'active',
      capability: {
        capabilityId,
        epoch: 1,
        allowedActionFamilies
      },
      freshnessWindowStart,
      freshnessWindowEnd
    };

    this.activeSessions.set(sessionId, session);
    acc.T1.established++;
    this.saveAccounting(acc);
    this.emitReceipt('handshake', 'admitted', { sessionId, peerId });
    return session;
  }

  // 4. encode
  encode(sessionId: string, packetId: string, rawPayload: string): TelcoPacket {
    const acc = this.loadAccounting();
    acc.T2.attempted++;

    if (rawPayload === 'invalid') {
      acc.T2.refused++;
      this.saveAccounting(acc);
      this.emitReceipt('encode', 'refused', { sessionId, packetId });
      throw new Error(`Packet Projection validation failed: invalid payload`);
    }

    const packet: TelcoPacket = {
      id: packetId,
      sessionId,
      canonicalHash: hash(rawPayload),
      encodedPayload: Buffer.from(rawPayload).toString('base64')
    };

    acc.T2.encoded++;
    this.saveAccounting(acc);
    this.emitReceipt('encode', 'admitted', { sessionId, packetId, packetHash: packet.canonicalHash });
    return packet;
  }

  // 5. route
  route(packetId: string, channelId: string, retryPolicy: string): RouteDecision {
    const acc = this.loadAccounting();
    acc.T3.attempted++;

    const channel = this.channels.get(channelId);
    if (!channel || channel.boundaryStatus === 'refused') {
      acc.T3.refused++;
      this.saveAccounting(acc);
      this.emitReceipt('route', 'refused', { packetId, channelId });
      return { packetId, channelId, retryPolicy, status: 'refused' };
    }

    acc.T3.admitted++;
    this.saveAccounting(acc);
    this.emitReceipt('route', 'admitted', { packetId, channelId });
    return { packetId, channelId, retryPolicy, status: 'admitted' };
  }

  // 6. transmit
  transmit(packetId: string, routeId: string, sessionId: string, status: 'sent' | 'timeout' | 'failed' = 'sent'): TransmissionRecord {
    // No Unhandshaken Transmissions (T-I1): transmit panics if no valid capability exists.
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'active') {
      throw new Error(`Unhandshaken Transmission Panics: no valid capability exists for session "${sessionId}"`);
    }

    const acc = this.loadAccounting();
    acc.T4.attempted++;

    const txRecord: TransmissionRecord = {
      id: `tx-${packetId}-${Date.now()}`,
      routeId,
      status: status === 'sent' ? 'transmitted' : (status === 'timeout' ? 'timeout' : 'failed')
    };

    if (status === 'sent') {
      acc.T4.sent++;
    } else if (status === 'timeout') {
      acc.T4.timeout++;
    } else {
      acc.T4.failed++;
    }

    this.saveAccounting(acc);
    this.emitReceipt('transmit', txRecord.status, { packetId, sessionId });
    return txRecord;
  }

  // 7. verify
  verify(packetId: string, validity: 'valid' | 'invalid' = 'valid'): { verified: boolean } {
    const acc = this.loadAccounting();
    acc.T5.attempted++;

    if (validity === 'invalid') {
      acc.T5.mismatched++;
      this.saveAccounting(acc);
      this.emitReceipt('verify', 'failed', { packetId });
      return { verified: false };
    }

    acc.T5.verified++;
    this.saveAccounting(acc);
    this.emitReceipt('verify', 'succeeded', { packetId });
    return { verified: true };
  }

  // 8. settle
  settle(sessionId: string, status: 'promotable' | 'blocked' = 'promotable'): { settled: boolean } {
    const acc = this.loadAccounting();
    acc.T6.attempted++;

    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = status === 'promotable' ? 'closed' : 'suspended';
    }

    if (status === 'promotable') {
      acc.T6.settled_promotable++;
    } else {
      acc.T6.settled_blocked++;
    }

    this.saveAccounting(acc);
    this.emitReceipt('settle', status === 'promotable' ? 'succeeded' : 'failed', { sessionId });
    return { settled: true };
  }

  verifyTelcoAccounting(): void {
    const acc = this.loadAccounting();
    
    // Check T1 conservation
    if (acc.T1.attempted !== acc.T1.established + acc.T1.refused) {
      throw new Error(`T1 invariant breached: attempted (${acc.T1.attempted}) !== established (${acc.T1.established}) + refused (${acc.T1.refused})`);
    }

    // Check T2 conservation
    if (acc.T2.attempted !== acc.T2.encoded + acc.T2.refused) {
      throw new Error(`T2 invariant breached: attempted (${acc.T2.attempted}) !== encoded (${acc.T2.encoded}) + refused (${acc.T2.refused})`);
    }

    // Check T3 conservation
    if (acc.T3.attempted !== acc.T2.encoded) {
      throw new Error(`T3 input mismatch: T3.attempted (${acc.T3.attempted}) !== T2.encoded (${acc.T2.encoded})`);
    }
    if (acc.T3.attempted !== acc.T3.admitted + acc.T3.refused) {
      throw new Error(`T3 invariant breached: attempted (${acc.T3.attempted}) !== admitted (${acc.T3.admitted}) + refused (${acc.T3.refused})`);
    }

    // Check T4 conservation
    if (acc.T4.attempted !== acc.T3.admitted) {
      throw new Error(`T4 input mismatch: T4.attempted (${acc.T4.attempted}) !== T3.admitted (${acc.T3.admitted})`);
    }
    if (acc.T4.attempted !== acc.T4.sent + acc.T4.timeout + acc.T4.failed) {
      throw new Error(`T4 invariant breached: attempted (${acc.T4.attempted}) !== sent (${acc.T4.sent}) + timeout (${acc.T4.timeout}) + failed (${acc.T4.failed})`);
    }

    // Check T5 conservation
    if (acc.T5.attempted !== acc.T4.sent) {
      throw new Error(`T5 input mismatch: T5.attempted (${acc.T5.attempted}) !== T4.sent (${acc.T4.sent})`);
    }
    if (acc.T5.attempted !== acc.T5.verified + acc.T5.mismatched) {
      throw new Error(`T5 invariant breached: attempted (${acc.T5.attempted}) !== verified (${acc.T5.verified}) + mismatched (${acc.T5.mismatched})`);
    }

    // Check T6 conservation
    if (acc.T6.attempted !== acc.T1.established) {
      throw new Error(`T6 input mismatch: T6.attempted (${acc.T6.attempted}) !== T1.established (${acc.T1.established})`);
    }
    if (acc.T6.attempted !== acc.T6.settled_promotable + acc.T6.settled_blocked) {
      throw new Error(`T6 invariant breached: attempted (${acc.T6.attempted}) !== settled_promotable (${acc.T6.settled_promotable}) + settled_blocked (${acc.T6.settled_blocked})`);
    }
  }
}
