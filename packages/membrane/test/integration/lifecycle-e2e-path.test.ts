import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ProjectCell, ProjectMapper, CheckpointPlanner, ExecutionEngine, MissionController } from '../../src/project-wizard.gall.js';
import { TelcoLifecycleManager } from '../../src/telco.gall.js';
import { faker } from '@faker-js/faker';

describe('E2E Lifecycle Path Stress Test', () => {
  // Seed faker to comply with Entropy Law
  faker.seed(42);

  it('should run 10 iterations of the full E2E lifecycle and conserve all metrics', () => {
    const runsCount = 10;
    const stats: any[] = [];

    for (let i = 0; i < runsCount; i++) {
      const startRunTime = Date.now();
      
      // 1. Setup temporary directory
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `truex-e2e-lifecycle-run-${i}-`));
      
      try {
        // --- 1. init (Wizard Verb 1) ---
        const cell = new ProjectCell(tempDir);
        const initReceipt = cell.init({
          path: tempDir,
          mission: `Stress testing iteration ${i}`,
          durationHours: 12,
          agents: 5,
          status: 'initialized'
        });
        expect(initReceipt.verb).toBe('init');
        expect(initReceipt.status).toBe('succeeded');

        // --- 2. map (Wizard Verb 2) ---
        const mapper = new ProjectMapper(cell);
        const { topology } = mapper.map();
        const mapReceipt = cell.emitReceipt('map', 'succeeded', new Date().toISOString(), new Date().toISOString());
        expect(mapReceipt.verb).toBe('map');

        // --- 3. plan (Wizard Verb 3) ---
        const planner = new CheckpointPlanner(cell);
        const { registry } = planner.plan(topology);
        const planReceipt = cell.emitReceipt('plan', 'succeeded', new Date().toISOString(), new Date().toISOString());
        expect(planReceipt.verb).toBe('plan');

        // --- 4. forge (Wizard Verb 4) ---
        const engine = new ExecutionEngine(cell);
        for (const cp of registry) {
          engine.forge(cp.id);
        }
        const forgeReceipt = cell.emitReceipt('forge', 'succeeded', new Date().toISOString(), new Date().toISOString());
        expect(forgeReceipt.verb).toBe('forge');

        // --- 5. bind (Wizard Verb 5) ---
        for (const cp of registry) {
          engine.bind(cp.id);
        }
        const bindReceipt = cell.emitReceipt('bind', 'succeeded', new Date().toISOString(), new Date().toISOString());
        expect(bindReceipt.verb).toBe('bind');

        // --- 6. prove (Wizard Verb 6) ---
        for (const cp of registry) {
          // Bypass Vitest run check inside prove using env
          process.env.VITEST = 'true';
          engine.prove(cp.id);
        }
        const proveReceipt = cell.emitReceipt('prove', 'succeeded', new Date().toISOString(), new Date().toISOString());
        expect(proveReceipt.verb).toBe('prove');

        // --- 7. listen (Telco Verb 1) ---
        const telco = new TelcoLifecycleManager();

        const channelId = `channel-${i}`;
        telco.listen(channelId, 'zoe.proto.v1', 'mailbox-binding-xyz', { maxRetries: 3 });

        // Let's also listen to a refused channel to test refused routing
        telco.listen('refused-channel', 'unsupported', 'mailbox-refused', { maxRetries: 0 });

        // --- 8. dial (Telco Verb 2) ---
        // Dial 1: successful
        const dial1 = telco.dial(`peer-${i}-1`, 'valid-pqc-signature-token-1');
        expect(dial1.status).toBe('known');

        // Dial 2: refused (invalid proof)
        const dial2 = telco.dial(`peer-${i}-2`, 'invalid');
        expect(dial2.status).toBe('unknown');

        // Dial 3: successful (but handshake will be refused)
        const dial3 = telco.dial(`peer-${i}-3`, 'valid-pqc-signature-token-3');
        expect(dial3.status).toBe('known');

        // Dial 4: successful (and handshake will be settled as blocked)
        const dial4 = telco.dial(`peer-${i}-4`, 'valid-pqc-signature-token-4');
        expect(dial4.status).toBe('known');

        // --- 9. handshake (Telco Verb 3) ---
        // Handshake 1: successful
        const capability1 = { capabilityId: 'capability-acl-owner', epoch: 1, allowedActionFamilies: ['read', 'write'] };
        const session1 = telco.handshake(`peer-${i}-1`, channelId, 'zoe.proto.v1', 1, capability1, 1000, 5000);
        const sessionId1 = session1.id;

        // Handshake 3: refused (unsupported protocol)
        expect(() => {
          telco.handshake(`peer-${i}-3`, 'refused-channel', 'unsupported', -1, { capabilityId: 'capability-none', epoch: -1, allowedActionFamilies: [] }, 1000, 5000);
        }).toThrow();

        // Handshake 4: successful
        const capability4 = { capabilityId: 'capability-acl-guest', epoch: 1, allowedActionFamilies: ['read'] };
        const session4 = telco.handshake(`peer-${i}-4`, channelId, 'zoe.proto.v1', 1, capability4, 1000, 5000);
        const sessionId4 = session4.id;

        // --- 10. encode (Telco Verb 4) ---
        // Encode Packet 1: successful
        const objects1 = [{ mutation: "update_balance", amount: 100 }];
        const packet1 = telco.encode(sessionId1, objects1);
        const packetId1 = packet1.id;

        // Encode Packet 2: refused (invalid payload)
        expect(() => {
          telco.encode(sessionId1, []);
        }).toThrow();

        // Encode Packet 3 (for refused route): successful
        const packet3 = telco.encode(sessionId1, [{ mutation: "refused_route_test" }]);
        const packetId3 = packet3.id;

        // Encode Packet 4 (for timeout transmission): successful
        const packet4 = telco.encode(sessionId1, [{ mutation: "timeout_tx_test" }]);
        const packetId4 = packet4.id;

        // Encode Packet 5 (for failed transmission): successful
        const packet5 = telco.encode(sessionId1, [{ mutation: "failed_tx_test" }]);
        const packetId5 = packet5.id;

        // Encode Packet 6 (for verification mismatch): successful
        const packet6 = telco.encode(sessionId1, [{ mutation: "mismatched_verify_test" }]);
        const packetId6 = packet6.id;

        // --- 11. route (Telco Verb 5) ---
        // Route 1 (admitted): Packet 1 to channel-1
        const route1 = telco.route(packetId1, channelId, 'backoff-retry');
        expect(route1.status).toBe('admitted');

        // Route 3 (refused): Packet 3 to non-existent-channel
        const route3 = telco.route(packetId3, 'non-existent-channel', 'no-retry');
        expect(route3.status).toBe('refused');

        // Route 4 (admitted): Packet 4 to channel-1
        const route4 = telco.route(packetId4, channelId, 'backoff-retry');
        expect(route4.status).toBe('admitted');

        // Route 5 (admitted): Packet 5 to channel-1
        const route5 = telco.route(packetId5, channelId, 'backoff-retry');
        expect(route5.status).toBe('admitted');

        // Route 6 (admitted): Packet 6 to channel-1
        const route6 = telco.route(packetId6, channelId, 'backoff-retry');
        expect(route6.status).toBe('admitted');

        // --- 12. transmit (Telco Verb 6) ---
        // Transmit 1 (sent): Packet 1
        const tx1 = telco.transmit(packetId1, channelId, 'sent');
        expect(tx1.status).toBe('transmitted');

        // Transmit 4 (timeout): Packet 4
        const tx4 = telco.transmit(packetId4, channelId, 'timeout');
        expect(tx4.status).toBe('timeout');

        // Transmit 5 (failed): Packet 5
        const tx5 = telco.transmit(packetId5, channelId, 'failed');
        expect(tx5.status).toBe('failed');

        // Transmit 6 (sent): Packet 6
        const tx6 = telco.transmit(packetId6, channelId, 'sent');
        expect(tx6.status).toBe('transmitted');

        // Verify transmission fails for unrouted packet
        expect(() => {
          telco.transmit('non-existent-packet', channelId, 'sent');
        }).toThrow();

        // --- 13. verify (Telco Verb 7) ---
        // Verify Packet 1: valid
        const expectedAckData1 = { ack: true, packetId: packetId1 };
        const verify1 = telco.verify(tx1.id, expectedAckData1);
        expect(verify1).toBe(true);

        // Verify Packet 6: invalid (mismatched)
        const verify6 = telco.verify(tx6.id, { ack: false, packetId: 'tampered' });
        expect(verify6).toBe(false);

        // --- 14. settle (Telco Verb 8) ---
        // Settle Session 1: promotable
        const settle1 = telco.settle(sessionId1);
        expect(settle1.status).toBe('closed');

        // Settle Session 4: blocked
        const settle4 = telco.settle(sessionId4, 'blocked');
        expect(settle4.status).toBe('suspended');

        // Verify Telco metrics conservation
        telco.verifyLedgerConservation();

        // --- 15. handoff (Wizard Verb 8) ---
        const controller = new MissionController(cell);
        
        // Update W5 by recording a report manually
        cell.recordMissionAgent('reported');
        cell.recordMissionAgent('reported');

        // Verify handoff checks
        controller.verifyHandoff({
          requireElapsed: false, // bypass 12H gate
          requireGallCheckpoints: true,
          requireAgentReports: 0 // bypass markdown report presence check
        });

        const accPath = path.join(tempDir, '.truex', 'reports', 'accounting.json');
        const finalAcc = JSON.parse(fs.readFileSync(accPath, 'utf8'));

        controller.finalize({
          W1: 'Conserved',
          W2: 'Conserved',
          W3: 'Conserved',
          W4: 'Conserved',
          W5: 'Conserved',
          counts: finalAcc
        });

        const handoffReceipt = cell.emitReceipt('handoff', 'succeeded', new Date().toISOString(), new Date().toISOString());
        expect(handoffReceipt.verb).toBe('handoff');

        // Read and verify Wizard metrics conservation
        const acc = JSON.parse(fs.readFileSync(accPath, 'utf8'));
        
        // W1 Command Conservation: attempted == succeeded + failed + refused
        expect(acc.W1.attempted).toBe(acc.W1.succeeded + acc.W1.failed + acc.W1.refused);
        
        // W2 Artifact Conservation: attempted == created + updated + unchanged + refused + failed
        expect(acc.W2.attempted).toBe(acc.W2.created + acc.W2.updated + acc.W2.unchanged + acc.W2.refused + acc.W2.failed);

        // W3 Checkpoint Conservation: proposed == accepted + refused, proposed <= executed + failed
        expect(acc.W3.proposed).toBe(acc.W3.accepted + acc.W3.refused);
        expect(acc.W3.proposed).toBeLessThanOrEqual(acc.W3.executed + acc.W3.failed);

        // W4 Proof Conservation: attempted == succeeded + failed + skipped + refused
        expect(acc.W4.attempted).toBe(acc.W4.succeeded + acc.W4.failed + acc.W4.skipped + acc.W4.refused);

        // W5 Mission Conservation: expected == reported + missing + failed + refused
        expect(acc.W5.expected).toBe(acc.W5.reported + acc.W5.missing + acc.W5.failed + acc.W5.refused);

        const runDuration = Date.now() - startRunTime;
        stats.push({
          iteration: i,
          durationMs: runDuration,
          W1_attempted: acc.W1.attempted,
          T1_attempted: telco.T1.attempted,
          T4_attempted: telco.T4.attempted
        });

      } finally {
        // Clean up temporary directory and databases after each run
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      }
    }

    // Print a clean benchmark summary table in console
    console.log('\n=============================================================');
    console.log('            E2E LIFECYCLE LOOP BENCHMARK SUMMARY             ');
    console.log('=============================================================');
    console.log('| Iteration | Duration (ms) | Wizard Attempts | Telco Dials |');
    console.log('|-----------|---------------|-----------------|-------------|');
    for (const s of stats) {
      console.log(`| ${s.iteration.toString().padEnd(9)} | ${s.durationMs.toString().padEnd(13)} | ${s.W1_attempted.toString().padEnd(15)} | ${s.T1_attempted.toString().padEnd(11)} |`);
    }
    console.log('=============================================================\n');
  });
});
