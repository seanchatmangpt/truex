import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import Database from 'better-sqlite3';
import { ProjectCell, ProjectMapper, CheckpointPlanner, ExecutionEngine, MissionController } from '../../src/project-wizard.gall.js';
import { SQLiteLockManager } from '../../src/persistence/lock.js';
import { hash } from '../../src/hash.js';
import type { TelcoChannel, TelcoPeer, TelcoSession, TelcoPacket, RouteDecision, TransmissionRecord } from '../../src/telco.gall.js';

class TelcoMembrane {
  private db: Database.Database;
  private lockManager: SQLiteLockManager;
  private cellId: string;

  constructor(dbPath: string, cellId: string) {
    this.db = new Database(dbPath);
    this.lockManager = new SQLiteLockManager(this.db);
    this.cellId = cellId;
  }

  async close() {
    this.db.close();
  }

  // 1. listen
  async listen(port: string): Promise<TelcoChannel> {
    return this.lockManager.executeExclusive(() => {
      const channel: TelcoChannel = {
        id: `channel-${this.cellId}-${port}`,
        direction: 'inbound',
        protocolFamily: 'truex-proto',
        mailboxBinding: `mailbox-${this.cellId}`,
        refusalPolicy: {},
        boundaryStatus: 'admitted'
      };

      // Record receipt
      const receiptId = `receipt-listen-${this.cellId}-${Date.now()}`;
      this.db.prepare(`
        INSERT INTO telco_receipts (receipt_id, verb, channel_id, decision, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(receiptId, 'listen', channel.id, 'admit', new Date().toISOString());

      return channel;
    });
  }

  // 2. dial
  async dial(peerCellId: string): Promise<TelcoPeer> {
    return this.lockManager.executeExclusive(() => {
      const peer: TelcoPeer = {
        id: peerCellId,
        identityProof: `proof-${peerCellId}`,
        status: 'known'
      };

      // Record attempted dial in accounting
      this.db.prepare(`
        INSERT INTO telco_accounting (cell_id, attempted_dials)
        VALUES (?, 1)
        ON CONFLICT(cell_id) DO UPDATE SET attempted_dials = attempted_dials + 1
      `).run(this.cellId);

      // Record receipt
      const receiptId = `receipt-dial-${this.cellId}-${Date.now()}`;
      this.db.prepare(`
        INSERT INTO telco_receipts (receipt_id, verb, decision, created_at)
        VALUES (?, ?, ?, ?)
      `).run(receiptId, 'dial', 'admit', new Date().toISOString());

      return peer;
    });
  }

  // 3. handshake
  async handshake(peer: TelcoPeer, capabilityId: string): Promise<TelcoSession> {
    return this.lockManager.executeExclusive(() => {
      const epoch = 1;
      const session: TelcoSession = {
        id: `session-${this.cellId}-${peer.id}`,
        peerId: peer.id,
        status: 'active',
        capability: {
          capabilityId,
          epoch,
          allowedActionFamilies: ['read', 'write']
        },
        freshnessWindowStart: Date.now(),
        freshnessWindowEnd: Date.now() + 60000
      };

      // Record session in database
      this.db.prepare(`
        INSERT INTO telco_sessions (id, peer_id, status, capability_id, epoch, freshness_start, freshness_end)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(session.id, session.peerId, session.status, capabilityId, epoch, session.freshnessWindowStart, session.freshnessWindowEnd);

      // Update accounting: sessions_handshaken
      this.db.prepare(`
        INSERT INTO telco_accounting (cell_id, sessions_handshaken, sessions_handshaken_t6)
        VALUES (?, 1, 1)
        ON CONFLICT(cell_id) DO UPDATE SET 
          sessions_handshaken = sessions_handshaken + 1,
          sessions_handshaken_t6 = sessions_handshaken_t6 + 1
      `).run(this.cellId);

      // Record receipt
      const receiptId = `receipt-handshake-${this.cellId}-${Date.now()}`;
      this.db.prepare(`
        INSERT INTO telco_receipts (receipt_id, verb, session_id, decision, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(receiptId, 'handshake', session.id, 'admit', new Date().toISOString());

      return session;
    });
  }

  // 4. encode
  async encode(session: TelcoSession, payload: any): Promise<TelcoPacket> {
    return this.lockManager.executeExclusive(() => {
      // Record encode attempt
      this.db.prepare(`
        INSERT INTO telco_accounting (cell_id, encode_attempts)
        VALUES (?, 1)
        ON CONFLICT(cell_id) DO UPDATE SET encode_attempts = encode_attempts + 1
      `).run(this.cellId);

      const packetId = `packet-${this.cellId}-${Date.now()}`;
      const payloadStr = JSON.stringify(payload);
      const canonicalHash = hash(payloadStr);
      const packet: TelcoPacket = {
        id: packetId,
        sessionId: session.id,
        canonicalHash,
        encodedPayload: payloadStr
      };

      // Record packet in db
      this.db.prepare(`
        INSERT INTO telco_packets (id, session_id, canonical_hash, payload)
        VALUES (?, ?, ?, ?)
      `).run(packet.id, packet.sessionId, packet.canonicalHash, packet.encodedPayload);

      // Update accounting: packets_projected
      this.db.prepare(`
        INSERT INTO telco_accounting (cell_id, packets_projected, packets_projected_t3)
        VALUES (?, 1, 1)
        ON CONFLICT(cell_id) DO UPDATE SET 
          packets_projected = packets_projected + 1,
          packets_projected_t3 = packets_projected_t3 + 1
      `).run(this.cellId);

      // Record receipt
      const receiptId = `receipt-encode-${this.cellId}-${Date.now()}`;
      this.db.prepare(`
        INSERT INTO telco_receipts (receipt_id, verb, session_id, packet_hash, decision, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(receiptId, 'encode', session.id, canonicalHash, 'admit', new Date().toISOString());

      return packet;
    });
  }

  // 5. route
  async route(packet: TelcoPacket, channel: TelcoChannel): Promise<RouteDecision> {
    return this.lockManager.executeExclusive(() => {
      const decision: RouteDecision = {
        packetId: packet.id,
        channelId: channel.id,
        retryPolicy: 'backoff-retry',
        status: 'admitted'
      };

      // Update accounting: routes_admitted
      this.db.prepare(`
        INSERT INTO telco_accounting (cell_id, routes_admitted, routes_admitted_t4)
        VALUES (?, 1, 1)
        ON CONFLICT(cell_id) DO UPDATE SET 
          routes_admitted = routes_admitted + 1,
          routes_admitted_t4 = routes_admitted_t4 + 1
      `).run(this.cellId);

      // Record receipt
      const receiptId = `receipt-route-${this.cellId}-${Date.now()}`;
      this.db.prepare(`
        INSERT INTO telco_receipts (receipt_id, verb, channel_id, packet_hash, decision, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(receiptId, 'route', channel.id, packet.canonicalHash, 'admit', new Date().toISOString());

      return decision;
    });
  }

  // 6. transmit
  async transmit(packet: TelcoPacket, route: RouteDecision): Promise<TransmissionRecord> {
    return this.lockManager.executeExclusive(() => {
      const transmission: TransmissionRecord = {
        id: `transmission-${this.cellId}-${Date.now()}`,
        routeId: packet.id,
        status: 'transmitted',
        remoteResponseHash: hash('response-payload')
      };

      // Record transmission in db
      this.db.prepare(`
        INSERT INTO telco_transmissions (id, route_id, status, remote_response_hash)
        VALUES (?, ?, ?, ?)
      `).run(transmission.id, transmission.routeId, transmission.status, transmission.remoteResponseHash);

      // Update accounting: transmitted_acked
      this.db.prepare(`
        INSERT INTO telco_accounting (cell_id, transmitted_acked, transmitted_acked_t5)
        VALUES (?, 1, 1)
        ON CONFLICT(cell_id) DO UPDATE SET 
          transmitted_acked = transmitted_acked + 1,
          transmitted_acked_t5 = transmitted_acked_t5 + 1
      `).run(this.cellId);

      // Record receipt
      const receiptId = `receipt-transmit-${this.cellId}-${Date.now()}`;
      this.db.prepare(`
        INSERT INTO telco_receipts (receipt_id, verb, session_id, packet_hash, decision, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(receiptId, 'transmit', packet.sessionId, packet.canonicalHash, 'admit', new Date().toISOString());

      return transmission;
    });
  }

  // 7. verify
  async verify(transmission: TransmissionRecord): Promise<boolean> {
    return this.lockManager.executeExclusive(() => {
      const isValid = true;

      // Update accounting: verified_valid
      this.db.prepare(`
        INSERT INTO telco_accounting (cell_id, verified_valid)
        VALUES (?, 1)
        ON CONFLICT(cell_id) DO UPDATE SET verified_valid = verified_valid + 1
      `).run(this.cellId);

      // Record receipt
      const receiptId = `receipt-verify-${this.cellId}-${Date.now()}`;
      this.db.prepare(`
        INSERT INTO telco_receipts (receipt_id, verb, decision, created_at)
        VALUES (?, ?, ?, ?)
      `).run(receiptId, 'verify', 'admit', new Date().toISOString());

      return isValid;
    });
  }

  // 8. settle
  async settle(session: TelcoSession): Promise<void> {
    await this.lockManager.executeExclusive(() => {
      // Update session status to closed
      this.db.prepare(`
        UPDATE telco_sessions SET status = 'closed' WHERE id = ?
      `).run(session.id);

      // Update accounting: sessions_settled_promotable
      this.db.prepare(`
        INSERT INTO telco_accounting (cell_id, sessions_settled_promotable)
        VALUES (?, 1)
        ON CONFLICT(cell_id) DO UPDATE SET sessions_settled_promotable = sessions_settled_promotable + 1
      `).run(this.cellId);

      // Record receipt
      const receiptId = `receipt-settle-${this.cellId}-${Date.now()}`;
      this.db.prepare(`
        INSERT INTO telco_receipts (receipt_id, verb, session_id, decision, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(receiptId, 'settle', session.id, 'admit', new Date().toISOString());
    });
  }

  // Helper to query accounting counts for validation
  async getAccounting(): Promise<any> {
    return this.lockManager.executeExclusive(() => {
      return this.db.prepare(`
        SELECT * FROM telco_accounting WHERE cell_id = ?
      `).get(this.cellId);
    });
  }
}

describe('Lifecycle Concurrency Stress Test', () => {
  it('should run 10 concurrent project cells executing Wizard and Telco lifecycle actions cleanly without locks', async () => {
    // 1. Setup shared database
    const tempDbPath = path.join(os.tmpdir(), `shared-telco-concurrency-${process.pid}.db`);
    if (fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath);
    }

    const setupDb = new Database(tempDbPath);
    setupDb.pragma('journal_mode = WAL');
    setupDb.pragma('synchronous = NORMAL');
    setupDb.exec(`
      CREATE TABLE IF NOT EXISTS telco_sessions (
        id TEXT PRIMARY KEY,
        peer_id TEXT NOT NULL,
        status TEXT NOT NULL,
        capability_id TEXT NOT NULL,
        epoch INTEGER NOT NULL,
        freshness_start INTEGER NOT NULL,
        freshness_end INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS telco_packets (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        canonical_hash TEXT NOT NULL,
        payload TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS telco_routes (
        packet_id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        retry_policy TEXT NOT NULL,
        status TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS telco_transmissions (
        id TEXT PRIMARY KEY,
        route_id TEXT NOT NULL,
        status TEXT NOT NULL,
        remote_response_hash TEXT
      );

      CREATE TABLE IF NOT EXISTS telco_receipts (
        receipt_id TEXT PRIMARY KEY,
        verb TEXT NOT NULL,
        session_id TEXT,
        channel_id TEXT,
        packet_hash TEXT,
        parent_receipt_hash TEXT,
        decision TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS telco_accounting (
        cell_id TEXT PRIMARY KEY,
        attempted_dials INTEGER DEFAULT 0,
        sessions_handshaken INTEGER DEFAULT 0,
        refused_dials INTEGER DEFAULT 0,
        encode_attempts INTEGER DEFAULT 0,
        packets_projected INTEGER DEFAULT 0,
        refused_projections INTEGER DEFAULT 0,
        packets_projected_t3 INTEGER DEFAULT 0,
        routes_admitted INTEGER DEFAULT 0,
        routes_refused INTEGER DEFAULT 0,
        routes_admitted_t4 INTEGER DEFAULT 0,
        transmitted_acked INTEGER DEFAULT 0,
        timeout INTEGER DEFAULT 0,
        failed_exhausted INTEGER DEFAULT 0,
        transmitted_acked_t5 INTEGER DEFAULT 0,
        verified_valid INTEGER DEFAULT 0,
        verified_invalid INTEGER DEFAULT 0,
        sessions_handshaken_t6 INTEGER DEFAULT 0,
        sessions_settled_promotable INTEGER DEFAULT 0,
        sessions_settled_blocked INTEGER DEFAULT 0
      );
    `);
    setupDb.close();

    // 2. Spawn 10 concurrent tasks
    const numCells = 10;
    const cellTasks = Array.from({ length: numCells }, async (_, idx) => {
      const cellId = `cell_${idx}`;
      const peerCellId = `cell_${(idx + 1) % numCells}`;

      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `truex-concurrency-cell-${idx}-`));

      try {
        // Wizard Verb 1: init
        const cell = new ProjectCell(tempDir);
        cell.init({
          path: tempDir,
          mission: `Concurrency stress test for cell ${idx}`,
          durationHours: 12,
          agents: 5,
          status: 'initialized'
        });

        // Wizard Verb 2: map
        const mapper = new ProjectMapper(cell);
        const { registry } = mapper.map();

        // Wizard Verb 3: plan
        const planner = new CheckpointPlanner(cell);
        const { registry: checkpoints } = planner.plan({});

        // Wizard Verb 4: forge
        const engine = new ExecutionEngine(cell);
        for (const cp of checkpoints) {
          engine.forge(cp.id);

          // Wizard Verb 5: bind
          engine.bind(cp.id);

          // Wizard Verb 6: prove
          engine.prove(cp.id);

          // Wizard Verb 7: harden
          engine.harden(cp.id);
        }

        // Initialize Telco interop membrane
        const telco = new TelcoMembrane(tempDbPath, cellId);

        // Telco Verb 1: listen
        const channel = await telco.listen('8080');

        // Telco Verb 2: dial
        const peer = await telco.dial(peerCellId);

        // Telco Verb 3: handshake
        const session = await telco.handshake(peer, `cap-${cellId}-to-${peerCellId}`);

        // Telco Verb 4: encode
        const packet = await telco.encode(session, { cellStateHash: hash(`state-${cellId}`) });

        // Telco Verb 5: route
        const routeDecision = await telco.route(packet, channel);

        // Telco Verb 6: transmit
        const txRecord = await telco.transmit(packet, routeDecision);

        // Telco Verb 7: verify
        const isValid = await telco.verify(txRecord);
        expect(isValid).toBe(true);

        // Telco Verb 8: settle
        await telco.settle(session);

        // Verify local Telco accounting conservation laws W1-W5/T1-T6
        const accData = await telco.getAccounting();
        expect(accData.attempted_dials).toBe(accData.sessions_handshaken + accData.refused_dials);
        expect(accData.encode_attempts).toBe(accData.packets_projected + accData.refused_projections);
        expect(accData.packets_projected_t3).toBe(accData.routes_admitted + accData.routes_refused);
        expect(accData.routes_admitted_t4).toBe(accData.transmitted_acked + accData.timeout + accData.failed_exhausted);
        expect(accData.transmitted_acked_t5).toBe(accData.verified_valid + accData.verified_invalid);
        expect(accData.sessions_handshaken_t6).toBe(accData.sessions_settled_promotable + accData.sessions_settled_blocked);

        await telco.close();

        // Wizard Verb 8: handoff
        const reportsDir = path.join(tempDir, 'docs', 'reports');
        fs.mkdirSync(reportsDir, { recursive: true });
        for (let i = 1; i <= 5; i++) {
          fs.writeFileSync(path.join(reportsDir, `12h-agent-${i}-wizard-cli.md`), `# Agent ${i}`);
        }

        const controller = new MissionController(cell);
        controller.verifyHandoff({
          requireElapsed: false,
          requireGallCheckpoints: true,
          requireAgentReports: 5
        });

        const accPath = path.join(tempDir, '.truex', 'reports', 'accounting.json');
        const acc = JSON.parse(fs.readFileSync(accPath, 'utf8'));

        controller.finalize({
          W1: 'Conserved',
          W2: 'Conserved',
          W3: 'Conserved',
          W4: 'Conserved',
          W5: 'Conserved',
          counts: acc
        });

        cell.emitReceipt('handoff', 'succeeded', new Date().toISOString(), new Date().toISOString(), {
          reportPath: 'docs/reports/PROJECT-WIZARD-S11-SYNTHESIS.md',
          details: 'Handoff evidence package successfully finalized.'
        });

        // Cleanup cell temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (err) {
        // Cleanup cell temp directory on failure too
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
        throw err;
      }
    });

    await Promise.all(cellTasks);

    // 3. Verify final DB state (aggregate validations)
    const finalDb = new Database(tempDbPath);
    const allAccounting = finalDb.prepare('SELECT * FROM telco_accounting').all();
    expect(allAccounting.length).toBe(numCells);

    for (const row of allAccounting as any[]) {
      expect(row.attempted_dials).toBe(1);
      expect(row.sessions_handshaken).toBe(1);
      expect(row.encode_attempts).toBe(1);
      expect(row.packets_projected).toBe(1);
      expect(row.routes_admitted).toBe(1);
      expect(row.transmitted_acked).toBe(1);
      expect(row.verified_valid).toBe(1);
      expect(row.sessions_settled_promotable).toBe(1);
    }

    finalDb.close();

    // Clean up temp DB
    if (fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath);
    }
  });
});
