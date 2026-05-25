import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TelcoMembrane, CapabilityBinding } from '../../src/telco.gall.js';

describe('TelcoMembrane (S13 Interop Membrane Boundary Nodes)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-24T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully execute the full 8-verb happy path and conserve accounting domains', () => {
    const membrane = new TelcoMembrane();

    // 1. listen
    const channel = membrane.listen({
      id: 'channel_1',
      direction: 'outbound',
      protocolFamily: 'proto/zoe.ocel2.v1',
      mailboxBinding: 'mailbox_1',
      refusalPolicy: {}
    }, true);
    expect(channel.boundaryStatus).toBe('admitted');

    // 2. dial
    const peer = membrane.dial('peer_1', 'proof_123', true);
    expect(peer.status).toBe('known');
    expect(membrane.ledger.T1.attempted).toBe(1);

    // 3. handshake
    const capability: CapabilityBinding = {
      capabilityId: 'cap_1',
      epoch: 1,
      allowedActionFamilies: ['read', 'write']
    };
    const session = membrane.handshake('session_1', 'peer_1', 'proto/zoe.ocel2.v1', capability, 100, 200);
    expect(session.status).toBe('active');
    expect(membrane.ledger.T1.established).toBe(1);
    expect(membrane.ledger.T1.refused).toBe(0);
    // T1 holds: attempted_dials (1) == sessions_handshaken (1) + refused_dials (0)
    expect(membrane.ledger.T1.attempted).toBe(membrane.ledger.T1.established + membrane.ledger.T1.refused);

    // 4. encode
    const packet = membrane.encode('packet_1', 'session_1', 'payload_1');
    expect(packet.canonicalHash).toBeDefined();
    expect(membrane.ledger.T2.attempted).toBe(1);
    expect(membrane.ledger.T2.encoded).toBe(1);
    expect(membrane.ledger.T2.refused).toBe(0);
    // T2 holds: encode_attempts (1) == packets_projected (1) + refused_projections (0)
    expect(membrane.ledger.T2.attempted).toBe(membrane.ledger.T2.encoded + membrane.ledger.T2.refused);

    // 5. route
    const decision = membrane.route('packet_1', 'channel_1', 'retry_backoff_3');
    expect(decision.status).toBe('admitted');
    expect(membrane.ledger.T3.attempted).toBe(1);
    expect(membrane.ledger.T3.admitted).toBe(1);
    expect(membrane.ledger.T3.refused).toBe(0);
    // T3 holds: packets_projected (1) == routes_admitted (1) + routes_refused (0)
    expect(membrane.ledger.T3.attempted).toBe(membrane.ledger.T3.admitted + membrane.ledger.T3.refused);

    // 6. transmit (success case)
    const record = membrane.transmit('trans_1', 'packet_1', 'success');
    expect(record.status).toBe('transmitted');
    expect(record.remoteResponseHash).toBeDefined();
    expect(membrane.ledger.T4.attempted).toBe(1);
    expect(membrane.ledger.T4.sent).toBe(1);
    expect(membrane.ledger.T4.timeout).toBe(0);
    expect(membrane.ledger.T4.failed).toBe(0);
    // T4 holds: routes_admitted (1) == transmitted_acked (1) + timeout (0) + failed_exhausted (0)
    expect(membrane.ledger.T4.attempted).toBe(membrane.ledger.T4.sent + membrane.ledger.T4.timeout + membrane.ledger.T4.failed);

    // 7. verify
    const expectedResponseHash = record.remoteResponseHash!;
    const isVerified = membrane.verify('trans_1', expectedResponseHash);
    expect(isVerified).toBe(true);
    expect(membrane.ledger.T5.attempted).toBe(1);
    expect(membrane.ledger.T5.verified).toBe(1);
    expect(membrane.ledger.T5.mismatched).toBe(0);
    // T5 holds: transmitted_acked (1) == verified_valid (1) + verified_invalid (0)
    expect(membrane.ledger.T5.attempted).toBe(membrane.ledger.T5.verified + membrane.ledger.T5.mismatched);

    // 8. settle
    const settleResult = membrane.settle('session_1');
    expect(settleResult.promotable).toBe(true);
    expect(membrane.ledger.T6.attempted).toBe(1);
    expect(membrane.ledger.T6.settled_promotable).toBe(1);
    expect(membrane.ledger.T6.settled_blocked).toBe(0);
    // T6 holds: sessions_handshaken (1) == sessions_settled_promotable (1) + sessions_settled_blocked (0)
    expect(membrane.ledger.T6.attempted).toBe(membrane.ledger.T6.settled_promotable + membrane.ledger.T6.settled_blocked);
  });

  it('should enforce T-I1: Transmit panics if no valid epoch/capability exists', () => {
    const membrane = new TelcoMembrane();
    membrane.listen({
      id: 'channel_1',
      direction: 'outbound',
      protocolFamily: 'proto/zoe.ocel2.v1',
      mailboxBinding: 'mailbox_1',
      refusalPolicy: {}
    }, true);
    membrane.dial('peer_1', 'proof_123', true);
    
    // Handshake with invalid/zero epoch capability
    const capability: CapabilityBinding = {
      capabilityId: 'cap_1',
      epoch: 0, // invalid epoch
      allowedActionFamilies: []
    };
    expect(() => {
      membrane.handshake('session_1', 'peer_1', 'proto/zoe.ocel2.v1', capability, 100, 200);
    }).toThrow();
  });

  it('should enforce T-I2: Handshake drops connections offering unsupported protocol shapes', () => {
    const membrane = new TelcoMembrane();
    membrane.dial('peer_1', 'proof_123', true);

    const capability: CapabilityBinding = {
      capabilityId: 'cap_1',
      epoch: 1,
      allowedActionFamilies: []
    };
    // Offering unsupported protocol family 'proto/bad'
    expect(() => {
      membrane.handshake('session_1', 'peer_1', 'proto/bad', capability, 100, 200);
    }).toThrow('T-I2 Handshake refused');
  });

  it('should enforce T-I3: Remote outputs are never treated as local truth until verify and settle', () => {
    const membrane = new TelcoMembrane();
    membrane.listen({
      id: 'channel_1',
      direction: 'outbound',
      protocolFamily: 'proto/zoe.ocel2.v1',
      mailboxBinding: 'mailbox_1',
      refusalPolicy: {}
    }, true);
    membrane.dial('peer_1', 'proof_123', true);
    const capability: CapabilityBinding = {
      capabilityId: 'cap_1',
      epoch: 1,
      allowedActionFamilies: []
    };
    membrane.handshake('session_1', 'peer_1', 'proto/zoe.ocel2.v1', capability, 100, 200);
    membrane.encode('packet_1', 'session_1', 'some_data');
    membrane.route('packet_1', 'channel_1', 'policy');
    
    const record = membrane.transmit('trans_1', 'packet_1', 'success');
    
    // Remote output is recorded in the record, but verification hasn't occurred yet
    expect(record.status).toBe('transmitted');
    expect(membrane.verifications.has('trans_1')).toBe(false);
    expect(membrane.sessions.get('session_1')?.status).toBe('active'); // Still active, not settled
  });

  it('should enforce T-I4: Every packet sent/received is hash-linked and deterministic', () => {
    const membrane1 = new TelcoMembrane();
    const membrane2 = new TelcoMembrane();

    // Set up same state on both membranes
    const setupMembrane = (m: TelcoMembrane) => {
      m.listen({
        id: 'channel_1',
        direction: 'outbound',
        protocolFamily: 'proto/zoe.ocel2.v1',
        mailboxBinding: 'mailbox_1',
        refusalPolicy: {}
      }, true);
      m.dial('peer_1', 'proof_123', true);
      const capability: CapabilityBinding = {
        capabilityId: 'cap_1',
        epoch: 1,
        allowedActionFamilies: []
      };
      m.handshake('session_1', 'peer_1', 'proto/zoe.ocel2.v1', capability, 100, 200);
    };

    setupMembrane(membrane1);
    setupMembrane(membrane2);

    const packet1 = membrane1.encode('packet_1', 'session_1', 'hello');
    const packet2 = membrane2.encode('packet_1', 'session_1', 'hello');

    // Canonical hashes must be identical (deterministic)
    expect(packet1.canonicalHash).toBe(packet2.canonicalHash);
  });

  it('should enforce T-I5: Settle must prove all T1-T5 conservations sum to zero unhandled packets', () => {
    const membrane = new TelcoMembrane();
    membrane.listen({
      id: 'channel_1',
      direction: 'outbound',
      protocolFamily: 'proto/zoe.ocel2.v1',
      mailboxBinding: 'mailbox_1',
      refusalPolicy: {}
    }, true);
    membrane.dial('peer_1', 'proof_123', true);
    const capability: CapabilityBinding = {
      capabilityId: 'cap_1',
      epoch: 1,
      allowedActionFamilies: []
    };
    membrane.handshake('session_1', 'peer_1', 'proto/zoe.ocel2.v1', capability, 100, 200);
    membrane.encode('packet_1', 'session_1', 'payload');
    membrane.route('packet_1', 'channel_1', 'policy');

    // We do NOT transmit the packet. This leaves a packet in flight / unhandled.
    // Calling settle should fail because of T-I5 breach (T4: routes_admitted (1) !== sent (0) + timeout (0) + failed (0))
    expect(() => {
      membrane.settle('session_1');
    }).toThrow('T-I5 Invariant Breach');
  });
});
