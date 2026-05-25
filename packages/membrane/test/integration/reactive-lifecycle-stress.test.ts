import { describe, it, expect, afterAll, vi } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { faker } from '@faker-js/faker';
import Database from 'better-sqlite3';
import { 
  ProjectCell, 
  ProjectMapper, 
  CheckpointPlanner, 
  ExecutionEngine, 
  MissionController 
} from '../../src/project-wizard.gall.js';
import { SQLiteLockManager } from '../../src/persistence/lock.js';
import { createDeterministicContext } from '../../src/context.js';
import { TelcoAgent } from '../../../../agents/telco/agent.js';
import { OcelCollector } from '../../../../skills/membrane/mutations.js';
import { getReactivePatternNames, runReactivePattern } from '../../src/utils/reactive-patterns.js';

// Setup deterministic entropy in accordance with Entropy Law
faker.seed(424242);

const tempDirsToClean: string[] = [];

afterAll(() => {
  // Clean up all temporary directories created during the stress test
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

/**
 * Runs a complete programmatic Project Cell lifecycle and returns its accounting count.
 */
async function executeProjectCellLifecycle(tempDir: string, mission: string) {
  const cell = new ProjectCell(tempDir);
  
  // 1. Initialize the cell
  const initReceipt = cell.init({
    path: tempDir,
    mission,
    durationHours: 12,
    agents: 5,
    status: 'initialized'
  });
  expect(initReceipt.status).toBe('succeeded');

  // 2. Map the cell topology
  const mapper = new ProjectMapper(cell);
  const { hash: topoHash } = mapper.map();
  expect(topoHash).toBeDefined();

  // 3. Plan checkpoints
  const planner = new CheckpointPlanner(cell);
  const { registry } = planner.plan({});
  expect(registry).toHaveLength(5);

  // 4. Forge, bind, prove, and harden each checkpoint
  const engine = new ExecutionEngine(cell);
  for (const cp of registry) {
    engine.forge(cp.id);
    engine.bind(cp.id);
    const proveRes = engine.prove(cp.id);
    expect(proveRes.exitCode).toBe(0);
    const hardenRes = engine.harden(cp.id);
    expect(hardenRes.failureEnvelope.resilienceIndex).toBe(1.0);
  }

  // 5. Simulate 12 hours elapsed time by modifying start.json to satisfy handoff gate rules
  const startPath = path.join(tempDir, '.truex', 'mission', 'start.json');
  const startData = JSON.parse(fs.readFileSync(startPath, 'utf8'));
  startData.startTime = new Date(Date.now() - 13 * 3600 * 1000).toISOString();
  fs.writeFileSync(startPath, JSON.stringify(startData, null, 2), 'utf8');

  // 6. Write agent reports to docs/reports
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
    fs.writeFileSync(path.join(reportsDir, names[i - 1]), `# Mock report for agent ${i}`, 'utf8');
  }

  // 7. Verify and finalize handoff
  const controller = new MissionController(cell);
  controller.verifyHandoff({
    requireElapsed: true,
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

  // Assert accounting conservation across the 5 domains
  expect(acc.W1.succeeded + acc.W1.refused + acc.W1.failed).toBe(acc.W1.attempted);
  expect(acc.W2.created + acc.W2.updated + acc.W2.unchanged + acc.W2.refused + acc.W2.failed).toBe(acc.W2.attempted);
  expect(acc.W3.proposed).toBe(acc.W3.accepted + acc.W3.refused);
  expect(acc.W4.succeeded + acc.W4.failed + acc.W4.skipped + acc.W4.refused).toBe(acc.W4.attempted);
  expect(acc.W5.reported + acc.W5.missing + acc.W5.failed + acc.W5.refused).toBe(acc.W5.expected);

  return acc;
}

describe('Truex Unified Lifecycle Concurrency & Stress Tests', () => {

  it('should execute 10 concurrent project cells and Telco sessions executing combined examples/reactive patterns', async () => {
    // 1. Setup shared directory for Telco SQLite DB
    const sharedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-telco-stress-shared-'));
    tempDirsToClean.push(sharedDir);
    const dbPath = path.join(sharedDir, 'telco-stress.db');

    // 2. Initialize Telco Accounts Database Schema and State
    const db = new Database(dbPath);
    db.exec(`CREATE TABLE telco_accounts (id TEXT PRIMARY KEY, balance INTEGER)`);
    
    // Total balance in the system = 10 accounts * 1000 = 10000
    const initialBalancePerAccount = 1000;
    const accountCount = 10;
    const initialTotalBalance = accountCount * initialBalancePerAccount;

    for (let j = 0; j < accountCount; j++) {
      db.prepare('INSERT INTO telco_accounts (id, balance) VALUES (?, ?)').run(`acc_${j}`, initialBalancePerAccount);
    }
    db.close();

    // 3. Define the list of 34 examples/reactive patterns dynamically
    const reactivePatterns = getReactivePatternNames();

    // Suppress console.log output from reactive patterns to avoid test log clutter
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const concurrency = 10;
    const workerPromises: Promise<any>[] = [];

    // 4. Spawn 10 concurrent project cells and Telco sessions
    for (let i = 0; i < concurrency; i++) {
      workerPromises.push((async () => {
        // A. Create unique Project Cell directory
        const cellDir = fs.mkdtempSync(path.join(os.tmpdir(), `truex-stress-cell-${i}-`));
        tempDirsToClean.push(cellDir);

        const mission = `Verify concurrent SQLite locks and accounting conservation for worker cell ${i}`;
        
        // Execute the full programmatic project lifecycle for this cell
        const projectAccounting = await executeProjectCellLifecycle(cellDir, mission);
        expect(projectAccounting).toBeDefined();

        // B. Run a series of Telco transfers on the shared SQLite database
        const workerDb = new Database(dbPath);
        workerDb.pragma('journal_mode = WAL'); // Enable WAL mode for concurrent readers/writers
        const lockManager = new SQLiteLockManager(workerDb);
        const telcoAgent = new TelcoAgent();

        const numTransfers = 15;
        for (let t = 0; t < numTransfers; t++) {
          // Select source and target accounts deterministically (no transfer to self)
          const fromIdx = (i + t) % accountCount;
          const toIdx = (fromIdx + 1 + (t % (accountCount - 1))) % accountCount;
          const fromId = `acc_${fromIdx}`;
          const toId = `acc_${toIdx}`;
          const transferAmount = 10 + (t % 5) * 5; // transfer amounts between 10 and 30

          await lockManager.executeExclusive(() => {
            const fromRow = workerDb.prepare('SELECT balance FROM telco_accounts WHERE id = ?').get(fromId) as { balance: number };
            if (fromRow && fromRow.balance >= transferAmount) {
              // Perform atomic state updates
              workerDb.prepare('UPDATE telco_accounts SET balance = balance - ? WHERE id = ?').run(transferAmount, fromId);
              workerDb.prepare('UPDATE telco_accounts SET balance = balance + ? WHERE id = ?').run(transferAmount, toId);

              // Ingest the transition through Telco Agent to yield an OCEL receipt envelope
              const result = telcoAgent.ingestTransition(
                'Transfer',
                `worker_${i}_t_${t}`,
                { balance: fromRow.balance },
                fromRow.balance - transferAmount
              );

              // Verify the integrity of the generated OCEL receipt
              expect(result.isValid).toBe(true);
              expect(OcelCollector.verifyEnvelope(result.envelope)).toBe(true);
            }
          }, { maxRetries: 150, initialDelayMs: 2, maxDelayMs: 50 });

          // Interleave execution slightly to challenge concurrent locks
          await new Promise(resolve => setTimeout(resolve, 1 + (t % 3)));
        }
        workerDb.close();

        // C. Execute a designated partition of the 34 examples/reactive patterns dynamically
        // Since we have 10 workers, we split the 34 patterns:
        // Workers 0-8 execute 3 patterns each, Worker 9 executes the remaining 7 patterns
        const startPatternIdx = i * 3;
        const endPatternIdx = i === concurrency - 1 ? reactivePatterns.length : (i + 1) * 3;
        const myPatterns = reactivePatterns.slice(startPatternIdx, endPatternIdx);

        for (const patternName of myPatterns) {
          await runReactivePattern(patternName);
        }

        return { cellDir };
      })());
    }

    // Wait for all concurrent workers to finish executing
    const results = await Promise.all(workerPromises);
    expect(results).toHaveLength(concurrency);

    // Restore original console.log
    consoleLogSpy.mockRestore();

    // 5. Assert strict conservation of the Telco accounting domain (balances)
    const verifyDb = new Database(dbPath);
    const rows = verifyDb.prepare('SELECT balance FROM telco_accounts').all() as { balance: number }[];
    
    expect(rows).toHaveLength(accountCount);
    let finalTotalBalance = 0;
    for (const row of rows) {
      expect(row.balance).toBeGreaterThanOrEqual(0); // balance can't be negative
      finalTotalBalance += row.balance;
    }
    
    // Assert that the sum of balances in the system did not change (is strictly conserved)
    expect(finalTotalBalance).toBe(initialTotalBalance);
    verifyDb.close();

    // 6. Clean up temporary directories
    for (const res of results) {
      if (fs.existsSync(res.cellDir)) {
        fs.rmSync(res.cellDir, { recursive: true, force: true });
        const idx = tempDirsToClean.indexOf(res.cellDir);
        if (idx > -1) tempDirsToClean.splice(idx, 1);
      }
    }
  });

});
