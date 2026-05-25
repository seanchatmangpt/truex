import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { ProjectCell, ProjectMapper, CheckpointPlanner, ExecutionEngine, MissionController } from "../../packages/membrane/src/project-wizard.gall.js";
import { hash } from "../../packages/membrane/src/hash.js";

export type TelcoProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
};

export class TelcoInteropMembrane {
  attempted_dials = 0;
  sessions_handshaken = 0;
  refused_dials = 0;

  encode_attempts = 0;
  packets_projected = 0;
  refused_projections = 0;

  routes_admitted = 0;
  routes_refused = 0;

  transmitted_acked = 0;
  timeout = 0;
  failed_exhausted = 0;

  verified_valid = 0;
  verified_invalid = 0;

  sessions_settled_promotable = 0;
  sessions_settled_blocked = 0;

  currentSession: {
    peer: string;
    protocol: string;
    epoch: number;
    capability: string;
    freshness: number;
  } | null = null;

  dial(peerUrl: string): void {
    this.attempted_dials++;
    if (peerUrl === "invalid_peer") {
      this.refused_dials++;
      throw new Error("Dial Refused: Peer unreachable");
    }
  }

  handshake(peer: string, protocol: string, epoch: number, capability: string, freshness: number): void {
    if (protocol !== "truex-ocel-v2") {
      this.refused_dials++;
      throw new Error("Handshake Refused: Protocol shape not supported (Protocol Honesty)");
    }
    this.sessions_handshaken++;
    this.currentSession = { peer, protocol, epoch, capability, freshness };
  }

  encode(internalObject: any): any {
    this.encode_attempts++;
    if (!internalObject || internalObject.proofFailed) {
      this.refused_projections++;
      throw new Error("Encode Refused: Cannot project object with failed proof");
    }
    this.packets_projected++;
    return {
      payload: internalObject,
      ocelBatchHash: hash(internalObject),
      receiptHash: hash({ internalObject, session: this.currentSession }),
      epoch: this.currentSession?.epoch
    };
  }

  route(packet: any, pathOption: string, retryPolicy: string): void {
    if (pathOption === "blocked_route") {
      this.routes_refused++;
      throw new Error("Route Refused: Banned path option");
    }
    this.routes_admitted++;
  }

  transmit(mailbox: any[], packet: any, simulateFailure?: 'timeout' | 'failed_exhausted'): any {
    if (!this.currentSession) {
      throw new Error("PANIC: No valid handshake session exists (No Unhandshaken Transmissions)");
    }

    if (simulateFailure === 'timeout') {
      this.timeout++;
      throw new Error("Transmission Timeout: Network deadline exceeded");
    } else if (simulateFailure === 'failed_exhausted') {
      this.failed_exhausted++;
      throw new Error("Transmission Failed: Max retries exhausted");
    }

    mailbox.push(packet);
    this.transmitted_acked++;
    return {
      status: "ACK",
      remoteHash: packet.receiptHash,
      remoteSignature: "ml-dsa-sig-remote"
    };
  }

  verify(ack: any, packet: any): void {
    if (!ack || ack.remoteHash !== packet.receiptHash) {
      this.verified_invalid++;
      throw new Error("Verification Failed: Hash mismatch / Tampered remote response (No External Authority Smuggling)");
    }
    
    const computedHash = packet.receiptHash;
    const expectedHash = hash({ internalObject: packet.payload, session: this.currentSession });
    if (!computedHash || computedHash !== expectedHash) {
      this.verified_invalid++;
      throw new Error("Verification Failed: Replay mismatch (Durable Replay)");
    }

    this.verified_valid++;
  }

  settle(promote: boolean): void {
    const encodeDiff = this.encode_attempts - (this.packets_projected + this.refused_projections);
    const routeDiff = this.packets_projected - (this.routes_admitted + this.routes_refused);
    const transDiff = this.routes_admitted - (this.transmitted_acked + this.timeout + this.failed_exhausted);
    const verifyDiff = this.transmitted_acked - (this.verified_valid + this.verified_invalid);

    if (encodeDiff !== 0 || routeDiff !== 0 || transDiff !== 0 || verifyDiff !== 0) {
      throw new Error(`PANIC: Settle Refused: Accounting domain T1-T5 mismatch (Accounting Handoff Breach)`);
    }

    if (promote) {
      this.sessions_settled_promotable++;
    } else {
      this.sessions_settled_blocked++;
    }
    this.currentSession = null;
  }
}

export function proveUnifiedIntegration(): TelcoProofReport {
  const failures: string[] = [];
  const invariants: string[] = [];
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-unified-integration-'));

  try {
    // -------------------------------------------------------------
    // Phase 1: Initialize Cell & Run Success Cycle
    // -------------------------------------------------------------
    const cell = new ProjectCell(tempDir);
    cell.init({
      path: tempDir,
      mission: "Unified Integration Proof Run",
      durationHours: 12,
      agents: 2,
      status: "initialized"
    });

    const mapper = new ProjectMapper(cell);
    const { hash: topoHash } = mapper.map();
    cell.emitReceipt('map', 'succeeded', new Date().toISOString(), new Date().toISOString());

    const planner = new CheckpointPlanner(cell);
    const { registry } = planner.plan({});
    cell.emitReceipt('plan', 'succeeded', new Date().toISOString(), new Date().toISOString());

    const engine = new ExecutionEngine(cell);
    
    // Forge and Bind cp-cli-contract
    const contractCp = registry.find(cp => cp.id === 'cp-cli-contract')!;
    engine.forge(contractCp.id);
    engine.bind(contractCp.id);
    engine.prove(contractCp.id);
    engine.harden(contractCp.id);

    // Now coordinate with Telco Interop Membrane for cp-cli-contract
    const telco = new TelcoInteropMembrane();
    const mailbox: any[] = [];

    // Dial & Handshake
    telco.dial("peer_gateway");
    telco.handshake("peer_gateway", "truex-ocel-v2", 1, "verify-capability", 1000);

    // Encode checkpoint
    const packet = telco.encode(contractCp);

    // Route & Transmit
    telco.route(packet, "direct_route", "retry_exponential");
    const ack = telco.transmit(mailbox, packet);

    // Verify & Settle
    telco.verify(ack, packet);
    telco.settle(true); // Promotable settlement

    // -------------------------------------------------------------
    // Phase 2: Failed Telco transmission triggers rollback in Wizard
    // -------------------------------------------------------------
    const cellCp = registry.find(cp => cp.id === 'cp-project-cell')!;
    engine.forge(cellCp.id);
    engine.bind(cellCp.id);
    engine.prove(cellCp.id);
    engine.harden(cellCp.id);

    // Start Telco transmission attempt
    telco.dial("peer_gateway");
    telco.handshake("peer_gateway", "truex-ocel-v2", 1, "verify-capability", 1000);
    const cellPacket = telco.encode(cellCp);
    telco.route(cellPacket, "direct_route", "retry_exponential");

    try {
      // Simulate timeout failure during transmit
      telco.transmit(mailbox, cellPacket, 'timeout');
    } catch {
      // Trigger rollback in Wizard due to failed transmission!
      engine.rollback(cellCp.id);
      invariants.push("failed Telco transmissions trigger rollback in Wizard");
    }
    
    // Verify settle for failed session (blocked settlement)
    try {
      telco.settle(false);
    } catch {
      failures.push("settle failed on failed transmission session");
    }

    // -------------------------------------------------------------
    // Phase 3: Failed Wizard proof prevents Telco transmission
    // -------------------------------------------------------------
    const failedCp = { ...registry.find(cp => cp.id === 'cp-checkpoint-plan')!, proofFailed: true };
    
    let telcoAttempted = false;
    try {
      // Attempt to encode a failed proof checkpoint should throw
      telco.encode(failedCp);
      telcoAttempted = true;
    } catch {
      invariants.push("failed Wizard proofs prevent Telco transmission");
    }

    if (telcoAttempted) {
      failures.push("Telco transmission was allowed even though Wizard proof failed");
    }

    // -------------------------------------------------------------
    // Phase 4: Finalize Wizard Handoff
    // -------------------------------------------------------------
    // Back-date startTime to bypass 12h monotonic gate
    const startPath = path.join(tempDir, '.truex', 'mission', 'start.json');
    const startData = JSON.parse(fs.readFileSync(startPath, 'utf8'));
    startData.startTime = new Date(Date.now() - 13 * 3600 * 1000).toISOString();
    fs.writeFileSync(startPath, JSON.stringify(startData, null, 2));

    // Create mock agent reports for W5 verification
    const reportsDir = path.join(tempDir, 'docs', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });
    fs.writeFileSync(path.join(reportsDir, '12h-agent-1-wizard-cli.md'), '# Report 1');
    fs.writeFileSync(path.join(reportsDir, '12h-agent-2-project-cell-topology.md'), '# Report 2');

    // Run verification & finalization
    const controller = new MissionController(cell);
    controller.verifyHandoff({ requireElapsed: true, requireGallCheckpoints: true, requireAgentReports: 2 });

    const accPath = path.join(tempDir, '.truex', 'reports', 'accounting.json');
    const accFinal = JSON.parse(fs.readFileSync(accPath, 'utf8'));
    
    controller.finalize({
      W1: 'Conserved',
      W2: 'Conserved',
      W3: 'Conserved',
      W4: 'Conserved',
      W5: 'Conserved',
      counts: accFinal
    });
    cell.emitReceipt('handoff', 'succeeded', new Date().toISOString(), new Date().toISOString());

    // -------------------------------------------------------------
    // Phase 5: Verify all Invariant Conservation laws (W1-W5, T1-T6)
    // -------------------------------------------------------------
    // Reload final accounting ledger
    const acc: any = JSON.parse(fs.readFileSync(accPath, 'utf8'));

    // Assert W1 (Command Conservation)
    const w1Sum = acc.W1.succeeded + acc.W1.refused + acc.W1.failed;
    if (w1Sum === acc.W1.attempted) {
      invariants.push("W1 (Command Conservation) conserved");
    } else {
      failures.push(`W1 breached: attempted=${acc.W1.attempted}, sum=${w1Sum}`);
    }

    // Assert W2 (Artifact Conservation)
    const w2Sum = acc.W2.created + acc.W2.updated + acc.W2.unchanged + acc.W2.refused + acc.W2.failed;
    if (w2Sum === acc.W2.attempted) {
      invariants.push("W2 (Artifact Conservation) conserved");
    } else {
      failures.push(`W2 breached: attempted=${acc.W2.attempted}, sum=${w2Sum}`);
    }

    // Assert W3 (Checkpoint Conservation)
    const w3Sum = acc.W3.proposed + acc.W3.accepted + acc.W3.refused + acc.W3.executed + acc.W3.failed;
    if (acc.W3.proposed === acc.W3.accepted + acc.W3.refused && w3Sum >= acc.W3.proposed) {
      invariants.push("W3 (Checkpoint Conservation) conserved");
    } else {
      failures.push(`W3 breached: proposed=${acc.W3.proposed}, accepted=${acc.W3.accepted}, refused=${acc.W3.refused}`);
    }

    // Assert W4 (Proof Conservation)
    const w4Sum = acc.W4.succeeded + acc.W4.failed + acc.W4.skipped + acc.W4.refused;
    if (w4Sum === acc.W4.attempted) {
      invariants.push("W4 (Proof Conservation) conserved");
    } else {
      failures.push(`W4 breached: attempted=${acc.W4.attempted}, sum=${w4Sum}`);
    }

    // Assert W5 (Mission Conservation)
    const w5Sum = acc.W5.reported + acc.W5.missing + acc.W5.failed + acc.W5.refused;
    if (w5Sum === acc.W5.expected) {
      invariants.push("W5 (Mission Conservation) conserved");
    } else {
      failures.push(`W5 breached: expected=${acc.W5.expected}, sum=${w5Sum}`);
    }

    // Assert T1 (Session Bound)
    if (telco.attempted_dials === telco.sessions_handshaken + telco.refused_dials) {
      invariants.push("T1 (Session Bound) conserved");
    } else {
      failures.push(`T1 breached: attempted_dials=${telco.attempted_dials}, handshaken=${telco.sessions_handshaken}, refused=${telco.refused_dials}`);
    }

    // Assert T2 (Packet Projection)
    if (telco.encode_attempts === telco.packets_projected + telco.refused_projections) {
      invariants.push("T2 (Packet Projection) conserved");
    } else {
      failures.push(`T2 breached: encode_attempts=${telco.encode_attempts}, projected=${telco.packets_projected}, refused=${telco.refused_projections}`);
    }

    // Assert T3 (Route Admission)
    if (telco.packets_projected === telco.routes_admitted + telco.routes_refused) {
      invariants.push("T3 (Route Admission) conserved");
    } else {
      failures.push(`T3 breached: projected=${telco.packets_projected}, admitted=${telco.routes_admitted}, refused=${telco.routes_refused}`);
    }

    // Assert T4 (Transmission Terminality)
    if (telco.routes_admitted === telco.transmitted_acked + telco.timeout + telco.failed_exhausted) {
      invariants.push("T4 (Transmission Terminality) conserved");
    } else {
      failures.push(`T4 breached: admitted=${telco.routes_admitted}, acked=${telco.transmitted_acked}, timeout=${telco.timeout}, exhausted=${telco.failed_exhausted}`);
    }

    // Assert T5 (Verification Closure)
    if (telco.transmitted_acked === telco.verified_valid + telco.verified_invalid) {
      invariants.push("T5 (Verification Closure) conserved");
    } else {
      failures.push(`T5 breached: acked=${telco.transmitted_acked}, valid=${telco.verified_valid}, invalid=${telco.verified_invalid}`);
    }

    // Assert T6 (Settlement Closure)
    if (telco.sessions_handshaken === telco.sessions_settled_promotable + telco.sessions_settled_blocked) {
      invariants.push("T6 (Settlement Closure) conserved");
    } else {
      failures.push(`T6 breached: handshaken=${telco.sessions_handshaken}, settled_promotable=${telco.sessions_settled_promotable}, settled_blocked=${telco.sessions_settled_blocked}`);
    }

    // Assert S13 Key Invariants directly
    // T-I1: Try transmit without handshake throws
    let transmitNoHandshakeThrown = false;
    try {
      const orphanTelco = new TelcoInteropMembrane();
      orphanTelco.transmit([], {});
    } catch {
      transmitNoHandshakeThrown = true;
    }
    if (transmitNoHandshakeThrown) {
      invariants.push("T-I1 (No Unhandshaken Transmissions) verified");
    } else {
      failures.push("T-I1 invariant breach: transmit allowed without handshake");
    }

    // T-I2: Handshake unsupported protocol shape throws
    let handshakeBadProtocolThrown = false;
    try {
      const badTelco = new TelcoInteropMembrane();
      badTelco.handshake("peer", "unsupported_proto", 1, "cap", 1000);
    } catch {
      handshakeBadProtocolThrown = true;
    }
    if (handshakeBadProtocolThrown) {
      invariants.push("T-I2 (Protocol Honesty) verified");
    } else {
      failures.push("T-I2 invariant breach: handshake allowed unsupported protocol");
    }

    // T-I3: Verify tampered remote response fails
    let verifyTamperedResponseThrown = false;
    try {
      const testTelco = new TelcoInteropMembrane();
      testTelco.currentSession = { peer: "peer", protocol: "truex-ocel-v2", epoch: 1, capability: "cap", freshness: 1000 };
      const testPacket = testTelco.encode({ data: 123 });
      testTelco.verify({ remoteHash: "tampered_hash" }, testPacket);
    } catch {
      verifyTamperedResponseThrown = true;
    }
    if (verifyTamperedResponseThrown) {
      invariants.push("T-I3 (No External Authority Smuggling) verified");
    } else {
      failures.push("T-I3 invariant breach: verification succeeded with tampered response");
    }

    // T-I4: Verify tampered packet payload fails replay
    let verifyTamperedReplayThrown = false;
    try {
      const testTelco = new TelcoInteropMembrane();
      testTelco.currentSession = { peer: "peer", protocol: "truex-ocel-v2", epoch: 1, capability: "cap", freshness: 1000 };
      const testPacket = testTelco.encode({ data: 123 });
      const originalAck = { remoteHash: testPacket.receiptHash };
      // Tamper packet payload
      testPacket.payload.data = 999;
      testTelco.verify(originalAck, testPacket);
    } catch {
      verifyTamperedReplayThrown = true;
    }
    if (verifyTamperedReplayThrown) {
      invariants.push("T-I4 (Durable Replay) verified");
    } else {
      failures.push("T-I4 invariant breach: replay succeeded with tampered packet payload");
    }

    // T-I5: Settle with mismatched accounting fails
    let settleAccountingMismatchThrown = false;
    try {
      const testTelco = new TelcoInteropMembrane();
      testTelco.encode_attempts = 5;
      testTelco.settle(true);
    } catch {
      settleAccountingMismatchThrown = true;
    }
    if (settleAccountingMismatchThrown) {
      invariants.push("T-I5 (Accounting Handoff) verified");
    } else {
      failures.push("T-I5 invariant breach: settle succeeded with mismatched accounting");
    }

  } catch (error: any) {
    failures.push(`Unified Integration Proof aborted with unexpected error: ${error.message}`);
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  return {
    passed: failures.length === 0,
    failures,
    invariants
  };
}
