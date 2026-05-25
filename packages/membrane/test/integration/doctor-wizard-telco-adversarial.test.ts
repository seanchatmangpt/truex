import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { ProjectCell, CheckpointPlanner, ExecutionEngine } from '../../src/project-wizard.gall.js';
import { TelcoAgent } from '../../../../agents/telco/agent.js';
import { DoctorAgent, type TruexProofReport } from '../../../../agents/doctor/agent.js';
import type { TelcoPeer, TelcoSession, TelcoPacket, TransmissionRecord } from '../../src/telco.gall.js';

// Helper classes to support adversarial integration test context

/**
 * Manages checkpoint promotion coordination with a Telco Agent.
 */
class IntegrationCoordinationManager {
  constructor(
    public engine: ExecutionEngine,
    public telco: TelcoAgent
  ) {}

  async coordinateCheckpointPromotion(
    checkpointId: string,
    options: {
      simulateTransmissionFailure?: boolean;
      simulateT5Mismatch?: boolean;
    } = {}
  ): Promise<{ promoted: boolean; reason?: string }> {
    // 1. Forge changes (creates backup rollback fixtures and writes target files)
    this.engine.forge(checkpointId);

    // 2. Prepare Telco packet representing checkpoint execution
    const checkpointReportPath = this.engine.cell.resolvePath(`.truex/reports/proof-${checkpointId}.json`);
    let payload = "";
    payload = fs.existsSync(checkpointReportPath) ? fs.readFileSync(checkpointReportPath, 'utf8') : JSON.stringify({ checkpointId, status: "executed" });

    // Cryptographically ingest using TelcoAgent (this simulates generating the OCEL envelope)
    const balanceState = { balance: 100 };
    const ingestion = this.telco.ingestTransition(
      "TransmitCheckpoint",
      "WizardCoordinator",
      balanceState,
      150
    );

    // Simulation of transmission status
    const transmissionStatus = options.simulateTransmissionFailure ? 'failed' : 'transmitted';

    // Simulation of T5 verification (verified or mismatched)
    const isT5Valid = options.simulateT5Mismatch ? false : ingestion.isValid;

    const transmissionRecord: TransmissionRecord = {
      id: `tx_${Date.now()}`,
      routeId: "route_1",
      status: transmissionStatus,
      remoteResponseHash: ingestion.envelope.receiptHash
    };

    const verificationResult = {
      attempted: 1,
      verified: isT5Valid ? 1 : 0,
      mismatched: isT5Valid ? 0 : 1
    };

    // Checkpoint promotion boundary condition:
    // Must have successfully transmitted AND T5 verification must match (no mismatch)
    const canPromote = transmissionRecord.status === 'transmitted' && verificationResult.mismatched === 0;

    if (canPromote) {
      // Promote checkpoint: call bind to persist connection in integration-map.json
      this.engine.bind(checkpointId);
      return { promoted: true };
    } else {
      // Refuse promotion and perform transaction rollback
      this.engine.rollback(checkpointId);
      return {
        promoted: false,
        reason: transmissionRecord.status === 'failed' ? 'transmission failed' : 'T5 mismatched'
      };
    }
  }
}

/**
 * Gateway implementing Telco interop boundary security.
 */
class TelcoBoundaryGate {
  constructor(
    private telco: TelcoAgent,
    private engine: ExecutionEngine
  ) {}

  async transmitCheckpointPacket(
    session: TelcoSession,
    packet: TelcoPacket,
    checkpointId: string
  ): Promise<TransmissionRecord> {
    // 1. Run Doctor / Wizard target verification before transmitting
    let proofResult;
    try {
      proofResult = this.engine.prove(checkpointId);
    } catch {
      throw new Error(`Epoch/capability breach: cannot transmit unproven checkpoint packet in epoch ${session.capability.epoch}`);
    }
    
    if (proofResult.exitCode !== 0) {
      throw new Error(`Epoch/capability breach: cannot transmit unproven checkpoint packet in epoch ${session.capability.epoch}`);
    }

    // 2. Cryptographically sign/ingest transition on successful verification
    const state = { balance: 500 };
    const ingestion = this.telco.ingestTransition(
      "CheckpointTransmission",
      "TelcoBoundaryGate",
      state,
      600
    );

    return {
      id: `tx_${packet.id}`,
      routeId: "route_outbound",
      status: "transmitted",
      remoteResponseHash: ingestion.envelope.receiptHash
    };
  }
}

/**
 * Handles peer authorization, session drops, and logs tamper events.
 */
class TelcoConnectionHandler {
  private peers = new Map<string, TelcoPeer>();
  private sessions = new Map<string, TelcoSession>();
  private tamperEvents: any[] = [];

  registerPeer(peer: TelcoPeer) {
    this.peers.set(peer.id, peer);
  }

  handshake(peerId: string, identityProof: string): TelcoSession {
    const peer = this.peers.get(peerId);
    
    if (!peer || peer.status !== 'known' || peer.identityProof !== identityProof) {
      // Record tamper event for the Doctor to validate
      this.tamperEvents.push({
        timestamp: new Date().toISOString(),
        eventType: "unauthorized_handshake_attempt",
        peerId,
        identityProof
      });
      throw new Error(`Security breach: unauthorized peer ${peerId} attempted handshake`);
    }

    const session: TelcoSession = {
      id: `session_${randomUUID()}`,
      peerId,
      status: 'active',
      capability: {
        capabilityId: "cap_checkpoint_transmit",
        epoch: 1,
        allowedActionFamilies: ["checkpoint"]
      },
      freshnessWindowStart: Date.now(),
      freshnessWindowEnd: Date.now() + 60_000
    };
    this.sessions.set(session.id, session);
    return session;
  }

  transmitCheckpoint(sessionId: string, packet: TelcoPacket): TransmissionRecord {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'active') {
      this.tamperEvents.push({
        timestamp: new Date().toISOString(),
        eventType: "invalid_session_transmission",
        sessionId,
        packetId: packet.id
      });
      throw new Error("Security breach: attempt to transmit on inactive/invalid session");
    }

    const peer = this.peers.get(session.peerId);
    if (!peer || peer.status !== 'known') {
      session.status = 'closed';
      this.tamperEvents.push({
        timestamp: new Date().toISOString(),
        eventType: "unauthorized_peer_active_session",
        peerId: session.peerId,
        sessionId
      });
      throw new Error("Security breach: peer status unknown/revoked, dropping session");
    }

    return {
      id: `tx_${packet.id}`,
      routeId: "route_1",
      status: "transmitted"
    };
  }

  getTamperEvents() {
    return this.tamperEvents;
  }
}

/**
 * Doctor auditor that verifies connection security logs and flags tamper events.
 */
class DoctorConnectionAuditor {
  proveConnectionIntegrity(handler: TelcoConnectionHandler): TruexProofReport {
    const tamperEvents = handler.getTamperEvents();
    const failures: string[] = [];
    const invariants: string[] = [];

    invariants.push("Only authorized peers can establish sessions");
    invariants.push("All handshake attempts must present valid cryptographic identity proof");
    
    if (tamperEvents.length > 0) {
      for (const event of tamperEvents) {
        failures.push(`Tamper event [${event.eventType}] detected for peer: ${event.peerId || 'N/A'}`);
      }
    }

    return {
      primitive: "telco-connection-security",
      passed: failures.length === 0,
      invariants,
      failures,
      timings: { auditing: 1 }
    };
  }
}

describe('Doctor-Wizard-Telco Adversarial Integration Tests', () => {
  let tempDir: string;
  let cell: ProjectCell;
  let planner: CheckpointPlanner;
  let engine: ExecutionEngine;
  let telco: TelcoAgent;
  let coordinator: IntegrationCoordinationManager;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-adversarial-'));
    cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: 'Test Adversarial Coordination',
      durationHours: 12,
      agents: 5,
      status: 'initialized'
    });

    planner = new CheckpointPlanner(cell);
    planner.plan({});

    engine = new ExecutionEngine(cell);
    telco = new TelcoAgent();
    coordinator = new IntegrationCoordinationManager(engine, telco);
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Failure Mode 1: Telco failure/T5 mismatched rollback checkpoint promotion', () => {
    it('should promote checkpoint and write to integration-map when transmission succeeds and T5 matches', async () => {
      const checkpointId = 'cp-cli-contract';
      const result = await coordinator.coordinateCheckpointPromotion(checkpointId);

      expect(result.promoted).toBe(true);

      // Verify that the integration map is updated
      const integrationMapPath = path.join(tempDir, '.truex', 'reports', 'integration-map.json');
      expect(fs.existsSync(integrationMapPath)).toBe(true);
      const mapData = JSON.parse(fs.readFileSync(integrationMapPath, 'utf8'));
      expect(mapData[checkpointId]).toBeDefined();
    });

    it('should refuse promotion, trigger rollback, and delete forged changes when Telco transmission fails', async () => {
      const checkpointId = 'cp-cli-contract';
      
      // Expected files to be created by cp-cli-contract
      const expectedFilePath = path.join(tempDir, 'scripts/truex.ts');
      
      // Execute checkpoint promotion coordination with transmission failure simulated
      const result = await coordinator.coordinateCheckpointPromotion(checkpointId, {
        simulateTransmissionFailure: true
      });

      expect(result.promoted).toBe(false);
      expect(result.reason).toBe('transmission failed');

      // Verify forged files are rolled back (deleted/cleaned up)
      expect(fs.existsSync(expectedFilePath)).toBe(false);

      // Verify that checkpointId is NOT promoted in the integration map
      const integrationMapPath = path.join(tempDir, '.truex', 'reports', 'integration-map.json');
      if (fs.existsSync(integrationMapPath)) {
        const mapData = JSON.parse(fs.readFileSync(integrationMapPath, 'utf8'));
        expect(mapData[checkpointId]).toBeUndefined();
      }
    });

    it('should refuse promotion, trigger rollback, and delete forged changes when T5 verification mismatches', async () => {
      const checkpointId = 'cp-cli-contract';
      const expectedFilePath = path.join(tempDir, 'scripts/truex.ts');

      // Execute checkpoint promotion coordination with T5 mismatch simulated
      const result = await coordinator.coordinateCheckpointPromotion(checkpointId, {
        simulateT5Mismatch: true
      });

      expect(result.promoted).toBe(false);
      expect(result.reason).toBe('T5 mismatched');

      // Verify forged files are rolled back (deleted/cleaned up)
      expect(fs.existsSync(expectedFilePath)).toBe(false);

      // Verify that checkpointId is NOT promoted in the integration map
      const integrationMapPath = path.join(tempDir, '.truex', 'reports', 'integration-map.json');
      if (fs.existsSync(integrationMapPath)) {
        const mapData = JSON.parse(fs.readFileSync(integrationMapPath, 'utf8'));
        expect(mapData[checkpointId]).toBeUndefined();
      }
    });
  });

  describe('Failure Mode 2: Wizard doctor target validation fails, Telco rejects transmitting packet', () => {
    it('should successfully transmit checkpoint packet when Wizard target validation passes', async () => {
      const checkpointId = 'cp-checkpoint-plan';
      const boundaryGate = new TelcoBoundaryGate(telco, engine);

      // Forge valid expected files first
      engine.forge(checkpointId);

      const session: TelcoSession = {
        id: "session_valid",
        peerId: "peer_1",
        status: "active",
        capability: {
          capabilityId: "cap_checkpoint_transmit",
          epoch: 1,
          allowedActionFamilies: ["checkpoint"]
        },
        freshnessWindowStart: Date.now(),
        freshnessWindowEnd: Date.now() + 10_000
      };

      const packet: TelcoPacket = {
        id: "pkt_1",
        sessionId: session.id,
        canonicalHash: "hash_1",
        encodedPayload: "checkpoint_payload"
      };

      const txRecord = await boundaryGate.transmitCheckpointPacket(session, packet, checkpointId);
      expect(txRecord.status).toBe('transmitted');
    });

    it('should reject transmitting packet and throw epoch/capability breach when target validation fails', async () => {
      const checkpointId = 'cp-checkpoint-plan';
      const boundaryGate = new TelcoBoundaryGate(telco, engine);

      // Forge files, but then intentionally corrupt the JSON file to fail validation
      engine.forge(checkpointId);
      const registryPath = path.join(tempDir, '.truex/checkpoints/checkpoint-registry.json');
      fs.writeFileSync(registryPath, 'INVALID_JSON_GARBAGE', 'utf8');

      const session: TelcoSession = {
        id: "session_valid",
        peerId: "peer_1",
        status: "active",
        capability: {
          capabilityId: "cap_checkpoint_transmit",
          epoch: 1,
          allowedActionFamilies: ["checkpoint"]
        },
        freshnessWindowStart: Date.now(),
        freshnessWindowEnd: Date.now() + 10_000
      };

      const packet: TelcoPacket = {
        id: "pkt_1",
        sessionId: session.id,
        canonicalHash: "hash_1",
        encodedPayload: "checkpoint_payload"
      };

      // Validation should fail due to JSON parsing error, causing Telco to throw breach
      await expect(
        boundaryGate.transmitCheckpointPacket(session, packet, checkpointId)
      ).rejects.toThrow(/Epoch\/capability breach: cannot transmit unproven checkpoint packet/);
    });
  });

  describe('Failure Mode 3: Unauthorized peer attempts handshake/transmission, session drops, Doctor flags tamper', () => {
    it('should drop session / refuse handshake for unauthorized peers, and Doctor validation should flag it', () => {
      const connectionHandler = new TelcoConnectionHandler();
      const auditor = new DoctorConnectionAuditor();

      // Register authorized peer
      connectionHandler.registerPeer({
        id: "peer_authorized",
        identityProof: "cryptographic_signature_valid",
        status: "known"
      });

      // 1. Authorized peer handshake should succeed
      const session = connectionHandler.handshake("peer_authorized", "cryptographic_signature_valid");
      expect(session.status).toBe('active');

      // 2. Unauthorized peer handshake should fail and throw security breach
      expect(() => {
        connectionHandler.handshake("peer_attacker", "cryptographic_signature_forged");
      }).toThrow(/Security breach: unauthorized peer/);

      // 3. Run Doctor validation to audit connection logs
      const proof = auditor.proveConnectionIntegrity(connectionHandler);
      expect(proof.passed).toBe(false);
      expect(proof.failures.length).toBe(1);
      expect(proof.failures[0]).toContain("unauthorized_handshake_attempt");
      expect(proof.invariants).toContain("Only authorized peers can establish sessions");
    });
  });
});
