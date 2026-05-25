import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ProjectCell, ProjectMapper, CheckpointPlanner, ExecutionEngine, MissionController } from '../src/project-wizard.gall.js';
import { TelcoLifecycleManager } from '../src/telco.gall.js';
import { hash } from '../src/hash.js';

describe('Unified Lifecycle E2E Integration Suite', () => {
  
  it('exercises the entire 8-verb Wizard project manufacturing lifecycle and verifies W1-W5 conservation', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-wizard-e2e-'));
    const cell = new ProjectCell(tempDir);

    // 1. Init
    cell.init({
      path: tempDir,
      mission: 'E2E Manufacturing Test Mission',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });
    expect(cell.isInitialized()).toBe(true);

    // 2. Map
    cell.updateHeartbeat();
    const mapper = new ProjectMapper(cell);
    const { topology } = mapper.map();
    expect(topology).toBeDefined();

    // 3. Plan
    cell.updateHeartbeat();
    const planner = new CheckpointPlanner(cell);
    const { hash: regHash } = planner.plan(topology);
    expect(regHash).toBeDefined();

    // 4. Forge
    cell.updateHeartbeat();
    const engine = new ExecutionEngine(cell);
    engine.forge('cp-cli-contract');
    
    // 5. Bind
    cell.updateHeartbeat();
    engine.bind('cp-cli-contract');

    // 6. Prove
    cell.updateHeartbeat();
    engine.prove('cp-cli-contract');

    // 7. Harden
    cell.updateHeartbeat();
    engine.harden('cp-cli-contract');

    // Mock 12-hour elapsed time
    const startPath = path.join(tempDir, '.truex', 'mission', 'start.json');
    const startData = JSON.parse(fs.readFileSync(startPath, 'utf8'));
    startData.startTime = new Date(Date.now() - 13 * 3600 * 1000).toISOString();
    fs.writeFileSync(startPath, JSON.stringify(startData, null, 2));

    // Mock 5 agent md reports
    const reportsDir = path.join(tempDir, 'docs', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });
    for (let i = 1; i <= 5; i++) {
      const names = [
        `12h-agent-${i}-wizard-cli.md`,
        `12h-agent-${i}-project-cell-topology.md`,
        `12h-agent-${i}-gall-checkpoint-planner.md`,
        `12h-agent-${i}-forge-bind-prove-harden.md`,
        `12h-agent-${i}-mission-handoff.md`
      ];
      fs.writeFileSync(path.join(reportsDir, names[i - 1]), '# Mock Report for E2E', 'utf8');
    }

    // 8. Handoff
    cell.updateHeartbeat();
    const controller = new MissionController(cell);
    controller.verifyHandoff({ requireElapsed: true, requireGallCheckpoints: true, requireAgentReports: 5 });
    
    const accPath = cell.resolvePath('.truex/reports/accounting.json');
    const acc = JSON.parse(fs.readFileSync(accPath, 'utf8'));
    
    controller.finalize({
      W1: 'Conserved',
      W2: 'Conserved',
      W3: 'Conserved',
      W4: 'Conserved',
      W5: 'Conserved',
      counts: acc
    });

    // Clean up tempDir
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('exercises the entire 8-verb Telco interop lifecycle under stress and verifies T1-T6 conservation', () => {
    const manager = new TelcoLifecycleManager();

    // 1. Listen
    manager.listen('ch-1', 'JSON-RPC', 'mailbox-1', { maxRetries: 3 });

    // Seeded random helper for deterministic behavior
    let state = 42;
    const nextRandom = () => {
      state = (state * 1664525 + 1013904223) % 4294967296;
      return state / 4294967296;
    };

    // Run 1000 iterations of stress interop
    for (let i = 0; i < 1000; i++) {
      const peerId = `peer-${i}`;
      
      // Determine deterministic status
      const r = nextRandom();
      
      // 2. Dial
      // 5% of dials are invalid
      const identityProof = r < 0.05 ? 'invalid-proof' : `valid-proof-for-peer-${i}`;
      const peer = manager.dial(peerId, identityProof);

      if (peer.status === 'unknown') {
        // Dial was refused. Confirm session not established.
        expect(peer.status).toBe('unknown');
        continue;
      }

      // 3. Handshake
      // 5% of handshakes fail due to invalid epoch
      const epoch = r < 0.10 && r >= 0.05 ? -1 : i;
      let session;
      try {
        session = manager.handshake(
          peerId,
          'ch-1',
          'JSON-RPC',
          epoch,
          { capabilityId: `cap-${i}`, epoch: Math.max(0, epoch), allowedActionFamilies: ['read', 'write'] },
          Date.now(),
          Date.now() + 10000
        );
      } catch {
        // Handshake threw refusal.
        expect(epoch).toBe(-1);
        continue;
      }

      expect(session.status).toBe('active');

      // 4. Encode
      // 5% of encodes fail due to empty payload
      const payloadObjects = r < 0.15 && r >= 0.10 ? [] : [{ type: 'Transaction', amount: 100 + i }];
      let packet;
      try {
        packet = manager.encode(session.id, payloadObjects);
      } catch {
        expect(payloadObjects.length).toBe(0);
        // Settle the session as suspended/blocked
        manager.settle(session.id, 'encode_failed_empty_payload');
        continue;
      }

      // 5. Route
      const decision = manager.route(packet.id, 'ch-1', 'exponential-backoff');
      expect(decision.status).toBe('admitted');

      // 6. Transmit
      // Force status: 80% sent, 10% timeout, 10% failed
      let forceStatus: 'sent' | 'timeout' | 'failed' = 'sent';
      if (r >= 0.80 && r < 0.90) {
        forceStatus = 'timeout';
      } else if (r >= 0.90) {
        forceStatus = 'failed';
      }

      const tx = manager.transmit(packet.id, 'ch-1', forceStatus);

      if (forceStatus !== 'sent') {
        expect(tx.status).toBe(forceStatus);
        // Settle session as suspended/blocked
        manager.settle(session.id, `transmission_error_${forceStatus}`);
        continue;
      }

      // 7. Verify
      // 5% of verifications fail due to hash mismatch (e.g. tampered ack)
      const ackData = r < 0.25 && r >= 0.20 ? { ack: false, packetId: 'tampered' } : { ack: true, packetId: packet.id };
      const isVerified = manager.verify(tx.id, ackData);

      // 8. Settle
      if (isVerified) {
        manager.settle(session.id);
        expect(session.status).toBe('closed');
      } else {
        manager.settle(session.id, 'verification_failed');
        expect(session.status).toBe('suspended');
      }
    }

    // Verify all accounting conservation rules
    expect(() => manager.verifyLedgerConservation()).not.toThrow();
    
    // Compile and verify compiled numbers are intact
    const report = manager.compileAccountingReport();
    expect(report.T1.attempted).toBe(1000);
    expect(report.T1.established + report.T1.refused).toBe(1000);
  });
});
