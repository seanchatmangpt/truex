/**
 * @module Telco
 * @description
 * Gall Classification: Gall S13 (Telco Interop Membrane)
 * Purpose: Telco is the interop authority. It answers who is speaking, what boundary they cross, 
 * what protocol is admissible, and ensures no unreceipted communication becomes authority.
 */

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
}
