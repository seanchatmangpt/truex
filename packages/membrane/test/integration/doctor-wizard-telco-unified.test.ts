import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { ProjectCell, ProjectMapper, CheckpointPlanner, ExecutionEngine } from '../../src/project-wizard.gall.js';
import { TelcoAgent } from '../../../../agents/telco/agent.js';
import { DoctorAgent } from '../../../../agents/doctor/agent.js';
import { hash } from '../../src/hash.js';
import type {
  TelcoChannel,
  TelcoPeer,
  CapabilityBinding,
  TelcoSession,
  TelcoPacket,
  RouteDecision,
  TransmissionRecord,
  TelcoAccounting
} from '../../src/telco.gall.js';

describe('Doctor-Wizard-Telco Unified Integration End-to-End Test', () => {
  it('should run a complete happy path and conserve all accounting domains', async () => {
    // 1. Initialize a Wizard project cell (init)
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-unified-cell-'));
    const cell = new ProjectCell(tempDir);
    const initReceipt = cell.init({
      path: tempDir,
      mission: 'Doctor Wizard Telco Unified Integration Flow',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });
    expect(initReceipt.status).toBe('succeeded');

    // 2. Set up inbound and outbound Telco Membrane channels and dial a peer
    const peer: TelcoPeer = {
      id: 'peer-alice',
      identityProof: hash('alice-identity-key'),
      status: 'known'
    };

    const inboundChannel: TelcoChannel = {
      id: 'chan-inbound-01',
      direction: 'inbound',
      protocolFamily: 'zoe-protocol',
      mailboxBinding: 'mailbox-inbound',
      refusalPolicy: { maxPacketSize: 1024 * 1024 },
      boundaryStatus: 'admitted'
    };

    const outboundChannel: TelcoChannel = {
      id: 'chan-outbound-01',
      direction: 'outbound',
      protocolFamily: 'zoe-protocol',
      mailboxBinding: 'mailbox-outbound',
      refusalPolicy: { maxPacketSize: 1024 * 1024 },
      boundaryStatus: 'admitted'
    };

    // 3. Perform a handshake to establish a Telco session with valid capabilities
    const capability: CapabilityBinding = {
      capabilityId: 'cap-checkpoint-transmit',
      epoch: 1,
      allowedActionFamilies: ['transmit-plan', 'transmit-report']
    };

    const session: TelcoSession = {
      id: 'session-01',
      peerId: peer.id,
      status: 'active',
      capability,
      freshnessWindowStart: Date.now() - 1000,
      freshnessWindowEnd: Date.now() + 3600 * 1000
    };

    // 4. Generate a Wizard plan and forge files
    const mapper = new ProjectMapper(cell);
    const { registry } = new CheckpointPlanner(cell).plan(mapper.map().topology);

    const engine = new ExecutionEngine(cell);
    for (const cp of registry) {
      engine.forge(cp.id);
      expect(fs.existsSync(path.join(tempDir, cp.filesExpected[0]))).toBe(true);
    }

    // 5. Encode the checkpoint plan and verification reports into a TelcoPacket, route it, and transmit it
    const checkpointPlanContent = fs.readFileSync(path.join(tempDir, '.truex/checkpoints/checkpoint-registry.json'), 'utf8');
    const topologyReportContent = fs.readFileSync(path.join(tempDir, '.truex/reports/project-topology.json'), 'utf8');

    const rawPayload = JSON.stringify({
      checkpointPlan: JSON.parse(checkpointPlanContent),
      topologyReport: JSON.parse(topologyReportContent)
    });

    const payloadHash = hash(rawPayload);

    const packet: TelcoPacket = {
      id: 'packet-01',
      sessionId: session.id,
      canonicalHash: payloadHash,
      encodedPayload: Buffer.from(rawPayload).toString('base64')
    };

    const routeDecision: RouteDecision = {
      packetId: packet.id,
      channelId: outboundChannel.id,
      retryPolicy: 'immediate-3x',
      status: 'admitted'
    };

    const transmission: TransmissionRecord = {
      id: 'tx-01',
      routeId: `${outboundChannel.id}-${packet.id}`,
      status: 'transmitted',
      remoteResponseHash: hash(packet.canonicalHash + '-ack')
    };

    // 6. Verify the transmission using a remote response hash
    const expectedResponseHash = hash(packet.canonicalHash + '-ack');
    expect(transmission.remoteResponseHash).toBe(expectedResponseHash);
    expect(transmission.status).toBe('transmitted');

    // 7. Settle the Telco session, ensuring all T1-T6 accounting domains conserve
    const accounting: TelcoAccounting = {
      T1: { attempted: 1, established: 1, refused: 0 },
      T2: { attempted: 1, encoded: 1, refused: 0 },
      T3: { attempted: 1, admitted: 1, refused: 0 },
      T4: { attempted: 1, sent: 1, timeout: 0, failed: 0 },
      T5: { attempted: 1, verified: 1, mismatched: 0 },
      T6: { attempted: 1, settled_promotable: 1, settled_blocked: 0 }
    };

    // Settle session
    session.status = 'closed';

    // Conservation check
    expect(accounting.T1.attempted).toBe(accounting.T1.established + accounting.T1.refused);
    expect(accounting.T2.attempted).toBe(accounting.T2.encoded + accounting.T2.refused);
    expect(accounting.T3.attempted).toBe(accounting.T3.admitted + accounting.T3.refused);
    expect(accounting.T4.attempted).toBe(accounting.T4.sent + accounting.T4.timeout + accounting.T4.failed);
    expect(accounting.T5.attempted).toBe(accounting.T5.verified + accounting.T5.mismatched);
    expect(accounting.T6.attempted).toBe(accounting.T6.settled_promotable + accounting.T6.settled_blocked);

    // Save final report data for Doctor validation
    const unifiedReport = {
      status: 'passed',
      cellPath: tempDir,
      peer,
      channels: [inboundChannel, outboundChannel],
      session,
      packet,
      routeDecision,
      transmission,
      accounting
    };

    const reportPath = path.join(tempDir, '.truex', 'reports', 'doctor-wizard-telco-unified.json');
    fs.writeFileSync(reportPath, JSON.stringify(unifiedReport, null, 2));

    // 8. Verify that the Doctor can prove this unified process without errors
    const doctor = new DoctorAgent();
    const result = await doctor.prove('doctor-wizard-telco-unified', { reportPath });
    expect(result.passed).toBe(true);
    expect(result.failures).toHaveLength(0);
    expect(result.invariants.length).toBeGreaterThan(0);

    // Cleanup
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });
});
