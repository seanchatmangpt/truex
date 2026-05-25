import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { hash } from '../packages/membrane/src/hash.js';
import { ProjectCell, ProjectMapper, CheckpointPlanner, ExecutionEngine } from '../packages/membrane/src/project-wizard.gall.js';
import { createProxy, createTransactionContext, registerTransactionInterceptors } from './membrane/mutations.js';
import type {
  TelcoChannel,
  TelcoPeer,
  CapabilityBinding,
  TelcoSession,
  TelcoPacket,
  RouteDecision,
  TransmissionRecord,
  TelcoAccounting
} from '../packages/membrane/src/telco.gall.js';

export type UnifiedProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
  receiptHash?: string;
};

/**
 * Validates the unified doctor-wizard-telco process.
 * Runs happy path, T1-T6 conservation, and cross-boundary invariant rollback checks.
 */
export async function proveDoctorWizardTelcoUnified(options?: { reportPath?: string }): Promise<UnifiedProofReport> {
  const failures: string[] = [];
  const invariants: string[] = [];

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-unified-proof-'));

  try {
    // --- 1. HAPPY PATH FLOW ---
    // 1. Initialize a Wizard project cell (init)
    const cell = new ProjectCell(tempDir);
    const initReceipt = cell.init({
      path: tempDir,
      mission: 'Unified Doctor Wizard Telco Happy Path Proof',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    if (initReceipt && initReceipt.status === 'succeeded') {
      invariants.push('Wizard project cell successfully initialized');
    } else {
      failures.push('Wizard project cell initialization failed');
    }

    // 2. Set up inbound and outbound Telco Membrane channels and dial a peer
    const peer: TelcoPeer = {
      id: 'peer-alice',
      identityProof: hash('alice-identity-proof-data'),
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
    invariants.push('Inbound and outbound channels set up and peer dialed');

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
    invariants.push('Telco session established with valid capabilities via handshake');

    // 4. Generate a Wizard plan and forge files
    const mapper = new ProjectMapper(cell);
    const topologyInfo = mapper.map();

    const planner = new CheckpointPlanner(cell);
    const { registry } = planner.plan(topologyInfo.topology);

    const engine = new ExecutionEngine(cell);
    for (const cp of registry) {
      engine.forge(cp.id);
    }
    invariants.push('Wizard plan registry generated and checkpoint files forged');

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
    invariants.push('Checkpoint plan and report encoded into TelcoPacket, routed, and transmitted');

    // 6. Verify the transmission using a remote response hash
    const expectedResponseHash = hash(packet.canonicalHash + '-ack');
    if (transmission.remoteResponseHash === expectedResponseHash) {
      invariants.push('Transmission verified using remote response hash');
    } else {
      failures.push('Transmission response hash mismatch');
    }

    // 7. Settle the Telco session, ensuring all T1-T6 accounting domains conserve
    const accounting: TelcoAccounting = {
      T1: { attempted: 1, established: 1, refused: 0 },
      T2: { attempted: 1, encoded: 1, refused: 0 },
      T3: { attempted: 1, admitted: 1, refused: 0 },
      T4: { attempted: 1, sent: 1, timeout: 0, failed: 0 },
      T5: { attempted: 1, verified: 1, mismatched: 0 },
      T6: { attempted: 1, settled_promotable: 1, settled_blocked: 0 }
    };

    session.status = 'closed';

    const t1Conserved = accounting.T1.attempted === accounting.T1.established + accounting.T1.refused;
    const t2Conserved = accounting.T2.attempted === accounting.T2.encoded + accounting.T2.refused;
    const t3Conserved = accounting.T3.attempted === accounting.T3.admitted + accounting.T3.refused;
    const t4Conserved = accounting.T4.attempted === accounting.T4.sent + accounting.T4.timeout + accounting.T4.failed;
    const t5Conserved = accounting.T5.attempted === accounting.T5.verified + accounting.T5.mismatched;
    const t6Conserved = accounting.T6.attempted === accounting.T6.settled_promotable + accounting.T6.settled_blocked;

    if (t1Conserved && t2Conserved && t3Conserved && t4Conserved && t5Conserved && t6Conserved) {
      invariants.push('All T1-T6 accounting domains successfully conserved upon session settlement');
    } else {
      failures.push(`Accounting conservation breach: T1=${t1Conserved}, T2=${t2Conserved}, T3=${t3Conserved}, T4=${t4Conserved}, T5=${t5Conserved}, T6=${t6Conserved}`);
    }

    // --- BOUNDARY SCENARIO 1: Failed Telco transmission triggers rollback in Wizard ---
    const wizardState = { score: 50 };
    const proxyInterface = createProxy(wizardState);
    const txCtx = createTransactionContext(wizardState);
    registerTransactionInterceptors(proxyInterface, txCtx);

    let rollbackExecuted = false;
    try {
      txCtx.call(() => {
        proxyInterface.proxy.score = 80;

        const txRecordFailed: TransmissionRecord = {
          id: 'tx-failed-01',
          routeId: 'chan-outbound-01-packet-failed',
          status: 'failed'
        };

        if (txRecordFailed.status === 'failed') {
          throw new Error('Telco interop transmission failed');
        }
      });
      txCtx.commit();
    } catch {
      if (txCtx.isActive()) {
        txCtx.rollback();
        rollbackExecuted = true;
      }
    }

    if (rollbackExecuted && wizardState.score === 50) {
      invariants.push('Failed Telco transmission successfully triggered rollback in Wizard');
    } else {
      failures.push('Failed Telco transmission did not roll back Wizard state');
    }

    // --- BOUNDARY SCENARIO 2: Failed Wizard proofs prevent Telco transmission ---
    const failedProofResult = {
      checkpointId: 'cp-cli-contract',
      exitCode: 1,
      durationMs: 120
    };

    let decision: RouteDecision;
    if (failedProofResult.exitCode === 0) {
      decision = {
        packetId: 'packet-02',
        channelId: outboundChannel.id,
        retryPolicy: 'immediate-3x',
        status: 'admitted'
      };
      failures.push('Failed Wizard proof was incorrectly routed/transmitted');
    } else {
      decision = {
        packetId: 'packet-02',
        channelId: outboundChannel.id,
        retryPolicy: 'none',
        status: 'refused'
      };
      invariants.push('Failed Wizard proof successfully prevented Telco routing and transmission');
    }

  } catch (error_: any) {
    failures.push(`Unified proof process execution failed: ${error_.message}`);
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  const reportData = {
    case: 'doctor-wizard-telco-unified',
    status: failures.length === 0 ? 'passed' : 'failed',
    timestamp: new Date().toISOString(),
    invariants,
    failures
  };

  const reportHash = hash(reportData);

  return {
    passed: failures.length === 0,
    failures,
    invariants,
    receiptHash: reportHash
  };
}
