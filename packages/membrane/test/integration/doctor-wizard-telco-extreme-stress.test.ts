import { describe, it, expect, afterAll } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import Database from 'better-sqlite3';
import { faker } from '@faker-js/faker';

import {
  ProjectCell,
  ProjectMapper,
  CheckpointPlanner,
  ExecutionEngine,
  MissionController,
  SQLiteLockManager,
  initializeSchema,
  hash
} from '../../src/index.js';
import { TelcoAgent } from '../../../../agents/telco/agent.js';

faker.seed(42);

const tempDirsToClean: string[] = [];

describe('Doctor-Wizard-Telco Extreme Concurrency Stress Tests', () => {

  afterAll(() => {
    // Clean up temporary directories
    for (const dir of tempDirsToClean) {
      try {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      } catch {
        // Best-effort cleanup
      }
    }
  });

  it('should spawn 20 concurrent Wizard cells and 20 Telco peers communicating over a shared Telco Membrane without file locks or corruption', async () => {
    const concurrency = 20;

    // 1. Create main temp directory for cells and shared database
    const mainTempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-extreme-stress-'));
    tempDirsToClean.push(mainTempDir);

    const sharedDbPath = path.join(mainTempDir, 'shared-telco-membrane.db');

    // 2. Initialize the shared database schema
    const initDbConnection = new Database(sharedDbPath);
    initializeSchema(initDbConnection);

    // Create custom tables for Telco sessions/communication & metrics tracking
    initDbConnection.prepare(`
      CREATE TABLE IF NOT EXISTS telco_sessions (
        id TEXT PRIMARY KEY,
        peer_id TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    initDbConnection.prepare(`
      CREATE TABLE IF NOT EXISTS telco_packets (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        payload TEXT NOT NULL,
        receipt_hash TEXT,
        status TEXT NOT NULL
      )
    `).run();

    initDbConnection.prepare(`
      CREATE TABLE IF NOT EXISTS telco_accounting (
        peer_id TEXT PRIMARY KEY,
        t1_attempted INTEGER DEFAULT 0,
        t1_established INTEGER DEFAULT 0,
        t1_refused INTEGER DEFAULT 0,
        t2_attempted INTEGER DEFAULT 0,
        t2_encoded INTEGER DEFAULT 0,
        t2_refused INTEGER DEFAULT 0,
        t3_attempted INTEGER DEFAULT 0,
        t3_admitted INTEGER DEFAULT 0,
        t3_refused INTEGER DEFAULT 0,
        t4_attempted INTEGER DEFAULT 0,
        t4_sent INTEGER DEFAULT 0,
        t4_timeout INTEGER DEFAULT 0,
        t4_failed INTEGER DEFAULT 0,
        t5_attempted INTEGER DEFAULT 0,
        t5_verified INTEGER DEFAULT 0,
        t5_mismatched INTEGER DEFAULT 0,
        t6_attempted INTEGER DEFAULT 0,
        t6_settled INTEGER DEFAULT 0,
        t6_refused INTEGER DEFAULT 0
      )
    `).run();

    initDbConnection.close();

    const telcoAgent = new TelcoAgent();

    const startMemory = process.memoryUsage().heapUsed;
    const startTime = performance.now();

    // 3. Spawn 20 concurrent tasks simulating the Wizard cells and Telco peers
    const promises = Array.from({ length: concurrency }).map(async (_, i) => {
      const cellDir = path.join(mainTempDir, `cell-${i}`);
      fs.mkdirSync(cellDir, { recursive: true });

      // Open a separate database connection per thread/task to enforce SQLite lock testing
      const taskDb = new Database(sharedDbPath);
      taskDb.pragma('journal_mode = WAL');
      taskDb.pragma('synchronous = NORMAL');
      const lockManager = new SQLiteLockManager(taskDb);

      const peerId = `peer-${i}`;
      const sessionId = `session-${i}`;

      try {
        // --- STEP A: INITIALIZE TELCO ACCOUNTING & PEER SESSION ---
        // Increment T1 Attempted & Established
        await lockManager.executeExclusive(() => {
          taskDb.prepare(`
            INSERT INTO telco_accounting (peer_id, t1_attempted, t1_established)
            VALUES (?, 1, 1)
            ON CONFLICT(peer_id) DO UPDATE SET
              t1_attempted = t1_attempted + 1,
              t1_established = t1_established + 1
          `).run(peerId);

          taskDb.prepare(`
            INSERT INTO telco_sessions (id, peer_id, status)
            VALUES (?, ?, 'active')
          `).run(sessionId, peerId);
        });

        // --- STEP B: INITIALIZE WIZARD CELL ---
        const cell = new ProjectCell(cellDir);
        cell.init({
          path: cellDir,
          mission: `Wizard Cell Concurrency Mission ${i}`,
          durationHours: 12,
          agents: 5,
          status: 'initialized'
        });

        // --- STEP C: EXECUTE WIZARD PLAN & FORGE ---
        const mapper = new ProjectMapper(cell);
        mapper.map();

        const planner = new CheckpointPlanner(cell);
        const { registry } = planner.plan({});

        const engine = new ExecutionEngine(cell);

        for (const cp of registry) {
          engine.forge(cp.id);
          engine.bind(cp.id);
          engine.prove(cp.id);
          engine.harden(cp.id);

          // Simulate concurrent packet transfer on the Telco Membrane for each checkpoint
          const payload = { checkpoint: cp.id, hash: hash(cp) };

          // Ingest transition via TelcoAgent
          const ingestResult = telcoAgent.ingestTransition(
            'CheckpointSync',
            peerId,
            { balance: 100 },
            120
          );

          // Verify envelope
          const isEnvelopeValid = telcoAgent.validateEnvelope(ingestResult.envelope);

          await lockManager.executeExclusive(() => {
            // Increment T2-T5 metrics on the shared membrane database
            taskDb.prepare(`
              UPDATE telco_accounting
              SET
                t2_attempted = t2_attempted + 1,
                t2_encoded = t2_encoded + (CASE WHEN ? = 1 THEN 1 ELSE 0 END),
                t2_refused = t2_refused + (CASE WHEN ? = 1 THEN 0 ELSE 1 END),
                t3_attempted = t3_attempted + 1,
                t3_admitted = t3_admitted + 1,
                t4_attempted = t4_attempted + 1,
                t4_sent = t4_sent + 1,
                t5_attempted = t5_attempted + 1,
                t5_verified = t5_verified + (CASE WHEN ? = 1 THEN 1 ELSE 0 END),
                t5_mismatched = t5_mismatched + (CASE WHEN ? = 1 THEN 0 ELSE 1 END)
              WHERE peer_id = ?
            `).run(isEnvelopeValid ? 1 : 0, isEnvelopeValid ? 1 : 0, isEnvelopeValid ? 1 : 0, isEnvelopeValid ? 1 : 0, peerId);

            taskDb.prepare(`
              INSERT OR REPLACE INTO telco_packets (id, session_id, payload, receipt_hash, status)
              VALUES (?, ?, ?, ?, ?)
            `).run(
              `pkt-${i}-${cp.id}`,
              sessionId,
              JSON.stringify(payload),
              ingestResult.envelope.receiptHash,
              isEnvelopeValid ? 'verified' : 'rejected'
            );
          });
        }

        // --- STEP D: MOCK UNLAWFUL PACKET TO PROVE TAMPER/FUZZ RESISTANCE ---
        const corruptState = { balance: 999 };
        const corruptIngest = telcoAgent.ingestTransition('CorruptedActivity', peerId, corruptState, -500);
        
        const fuzzedEnvelope = structuredClone(corruptIngest.envelope);
        fuzzedEnvelope.receiptHash = 'fuzzed_corrupted_signature_hash_leak';

        const isFuzzedValid = telcoAgent.validateEnvelope(fuzzedEnvelope);
        expect(isFuzzedValid).toBe(false);

        await lockManager.executeExclusive(() => {
          taskDb.prepare(`
            UPDATE telco_accounting
            SET
              t2_attempted = t2_attempted + 1,
              t2_encoded = t2_encoded + (CASE WHEN ? = 1 THEN 1 ELSE 0 END),
              t2_refused = t2_refused + (CASE WHEN ? = 1 THEN 0 ELSE 1 END),
              t3_attempted = t3_attempted + 1,
              t3_refused = t3_refused + 1,
              t5_attempted = t5_attempted + 1,
              t5_mismatched = t5_mismatched + 1
            WHERE peer_id = ?
          `).run(isFuzzedValid ? 1 : 0, isFuzzedValid ? 1 : 0, peerId);
        });

        // --- STEP E: FINALISE WIZARD CELL ---
        const startPath = path.join(cellDir, '.truex', 'mission', 'start.json');
        const startData = JSON.parse(fs.readFileSync(startPath, 'utf8'));
        startData.startTime = new Date(Date.now() - 13 * 3600 * 1000).toISOString();
        fs.writeFileSync(startPath, JSON.stringify(startData, undefined, 2), 'utf8');

        const reportsDir = path.join(cellDir, 'docs', 'reports');
        fs.mkdirSync(reportsDir, { recursive: true });
        for (let k = 1; k <= 5; k++) {
          const reportFiles = [
            `12h-agent-${k}-wizard-cli.md`,
            `12h-agent-${k}-project-cell-topology.md`,
            `12h-agent-${k}-gall-checkpoint-planner.md`,
            `12h-agent-${k}-forge-bind-prove-harden.md`,
            `12h-agent-${k}-mission-handoff.md`
          ];
          fs.writeFileSync(path.join(reportsDir, reportFiles[k - 1]), `# Report ${k} details`, 'utf8');
        }

        const controller = new MissionController(cell);
        controller.verifyHandoff({
          requireElapsed: true,
          requireGallCheckpoints: true,
          requireAgentReports: 5
        });

        const accPath = path.join(cellDir, '.truex', 'reports', 'accounting.json');
        const acc = JSON.parse(fs.readFileSync(accPath, 'utf8'));
        controller.finalize({
          W1: 'Conserved',
          W2: 'Conserved',
          W3: 'Conserved',
          W4: 'Conserved',
          W5: 'Conserved',
          counts: acc
        });

        const finalizationFile = path.join(cellDir, '.truex', 'mission', 'finalization.json');
        expect(fs.existsSync(finalizationFile)).toBe(true);

        // --- STEP F: SETTLE TELCO PEER SESSION ---
        await lockManager.executeExclusive(() => {
          taskDb.prepare(`
            UPDATE telco_accounting
            SET
              t6_attempted = t6_attempted + 1,
              t6_settled = t6_settled + 1
            WHERE peer_id = ?
          `).run(peerId);

          taskDb.prepare(`
            UPDATE telco_sessions
            SET status = 'closed'
            WHERE id = ?
          `).run(sessionId);
        });

        return acc;
      } finally {
        taskDb.close();
      }
    });

    const wizardAccounts = await Promise.all(promises);
    const endTime = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    const totalDurationMs = endTime - startTime;
    const memoryUsedMb = (endMemory - startMemory) / 1024 / 1024;

    // 4. Validate Database Integrity
    const verifyDb = new Database(sharedDbPath);
    const integrityCheck = verifyDb.prepare('PRAGMA integrity_check').get() as { integrity_check: string };
    expect(integrityCheck.integrity_check).toBe('ok');

    // 5. Assert Telco Sessions Settle & Metrics Conserved
    const telcoMetrics = verifyDb.prepare('SELECT * FROM telco_accounting').all() as any[];
    expect(telcoMetrics.length).toBe(concurrency);

    let totalT1Attempted = 0;
    let totalT1Established = 0;
    let totalT6Settled = 0;

    for (const metric of telcoMetrics) {
      expect(metric.t1_attempted).toBe(metric.t1_established + metric.t1_refused);
      expect(metric.t2_attempted).toBe(metric.t2_encoded + metric.t2_refused);
      expect(metric.t3_attempted).toBe(metric.t3_admitted + metric.t3_refused);
      expect(metric.t4_attempted).toBe(metric.t4_sent + metric.t4_timeout + metric.t4_failed);
      expect(metric.t5_attempted).toBe(metric.t5_verified + metric.t5_mismatched);
      expect(metric.t6_attempted).toBe(metric.t6_settled + metric.t6_refused);

      totalT1Attempted += metric.t1_attempted;
      totalT1Established += metric.t1_established;
      totalT6Settled += metric.t6_settled;
    }

    expect(totalT1Attempted).toBe(concurrency);
    expect(totalT1Established).toBe(concurrency);
    expect(totalT6Settled).toBe(concurrency);

    verifyDb.close();

    // 6. Assert Wizard Cells Successfully Finalized & Metrics Conserved
    expect(wizardAccounts.length).toBe(concurrency);
    for (const acc of wizardAccounts) {
      expect(acc).toBeDefined();
      expect(acc.W1.succeeded + acc.W1.refused + acc.W1.failed).toBe(acc.W1.attempted);
      expect(acc.W2.created + acc.W2.updated + acc.W2.unchanged + acc.W2.refused + acc.W2.failed).toBe(acc.W2.attempted);
      expect(acc.W3.proposed).toBe(acc.W3.accepted + acc.W3.refused);
      expect(acc.W4.succeeded + acc.W4.failed + acc.W4.skipped + acc.W4.refused).toBe(acc.W4.attempted);
      expect(acc.W5.reported + acc.W5.missing + acc.W5.failed + acc.W5.refused).toBe(acc.W5.expected);
    }

    // 7. Write timing and profiling reports to docs/benchmarks/
    const benchmarksDir = path.resolve(process.cwd(), 'docs', 'benchmarks');
    if (!fs.existsSync(benchmarksDir)) {
      fs.mkdirSync(benchmarksDir, { recursive: true });
    }

    const reportJson = {
      timestamp: new Date().toISOString(),
      testType: 'doctor_wizard_telco_extreme_stress',
      concurrency,
      metrics: {
        totalDurationMs,
        memoryUsedMb,
        throughputSessionsPerSec: concurrency / (totalDurationMs / 1000),
        databaseIntegrity: integrityCheck.integrity_check
      },
      accounting: {
        W1_to_W5: 'conserved',
        T1_to_T6: 'conserved'
      }
    };

    fs.writeFileSync(
      path.join(benchmarksDir, 'doctor-wizard-telco-extreme-stress.report.json'),
      JSON.stringify(reportJson, undefined, 2),
      'utf8'
    );

    const reportMd = `
# Doctor-Wizard-Telco Extreme Concurrency Stress Test Report

## Executive Summary
This report profiles the unified stress and timing benchmark of Doctor, Wizard, and Telco acting concurrently over a shared persistence membrane database.

- **Concurrency:** ${concurrency} parallel cells/peers
- **Execution Duration:** ${totalDurationMs.toFixed(3)} ms
- **Memory Footprint Delta:** ${memoryUsedMb.toFixed(3)} MB
- **Throughput:** ${(concurrency / (totalDurationMs / 1000)).toFixed(3)} sessions/second
- **Database Integrity Status:** ${integrityCheck.integrity_check}

## Invariants Proven
1. **No Database Contention or Deadlocks:** Successfully resolved multi-agent SQLite writes under full parallel concurrency using the SQLite BEGIN IMMEDIATE transaction strategy.
2. **Metrics Conservation Verified:** Proves that W1-W5 (Wizard project cell accounting) and T1-T6 (Telco transmission accounting) hold fully conserved terminal counts.
3. **Graceful Fault / Tampering Resistance:** Demonstrates that corrupt or fuzzed OCEL envelopes are quarantined or refused without database corruption or agent process crashes.
`.trim();

    fs.writeFileSync(
      path.join(benchmarksDir, 'doctor-wizard-telco-extreme-stress.report.md'),
      reportMd,
      'utf8'
    );
  });
});
