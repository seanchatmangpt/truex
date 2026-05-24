import { describe, it, expect, afterAll } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
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
import { 
  createPersistentMailbox, 
  enqueueMessage, 
  claimNextMessage, 
  completeMessage, 
  type QueueConfig 
} from '../../src/persistent-mailbox.gall.js';
import { hash } from '../../src/hash.js';

process.env.VITEST = 'true';

const execAsync = promisify(exec);
faker.seed(9876);

const tempDirsToClean: string[] = [];
const stressResults: any[] = [];

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

  // Write results to docs/benchmarks
  const benchmarksDir = path.resolve(process.cwd(), 'docs', 'benchmarks');
  if (!fs.existsSync(benchmarksDir)) {
    fs.mkdirSync(benchmarksDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(benchmarksDir, 'project-wizard.stress-results.json'),
    JSON.stringify(stressResults, null, 2),
    'utf8'
  );
});

async function runCliCmd(args: string) {
  const cliPath = path.resolve(process.cwd(), 'scripts/truex.ts');
  const cmd = `node --import tsx/esm "${cliPath}" wizard ${args}`;
  const { stdout } = await execAsync(cmd, {
    env: {
      ...process.env,
      VITEST: 'true'
    }
  });
  return JSON.parse(stdout.trim());
}

async function executeProgrammaticLifecycle(tempDir: string, mission: string) {
  const cell = new ProjectCell(tempDir);
  
  // 1. init
  const initReceipt = cell.init({
    path: tempDir,
    mission,
    durationHours: 12,
    agents: 5,
    status: 'initialized'
  });
  expect(initReceipt.status).toBe('succeeded');

  // 2. map
  const mapper = new ProjectMapper(cell);
  const { hash: topoHash } = mapper.map();
  expect(topoHash).toBeDefined();

  // 3. plan
  const planner = new CheckpointPlanner(cell);
  const { registry } = planner.plan({});
  expect(registry).toHaveLength(5);

  // 4. forge, bind, prove, harden
  const engine = new ExecutionEngine(cell);
  for (const cp of registry) {
    engine.forge(cp.id);
    engine.bind(cp.id);
    const proveRes = engine.prove(cp.id);
    expect(proveRes.exitCode).toBe(0);
    const hardenRes = engine.harden(cp.id);
    expect(hardenRes.failureEnvelope.resilienceIndex).toBe(1.0);
  }

  // 5. Simulate 12 hours elapsed time by modifying start.json
  const startPath = path.join(tempDir, '.truex', 'mission', 'start.json');
  const startData = JSON.parse(fs.readFileSync(startPath, 'utf8'));
  startData.startTime = new Date(Date.now() - 13 * 3600 * 1000).toISOString();
  fs.writeFileSync(startPath, JSON.stringify(startData, null, 2), 'utf8');

  // 6. Write expected agent reports
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

  // Verify final invariants
  expect(acc.W1.succeeded + acc.W1.refused + acc.W1.failed).toBe(acc.W1.attempted);
  expect(acc.W2.created + acc.W2.updated + acc.W2.unchanged + acc.W2.refused + acc.W2.failed).toBe(acc.W2.attempted);
  expect(acc.W3.proposed).toBe(acc.W3.accepted + acc.W3.refused);
  expect(acc.W4.succeeded + acc.W4.failed + acc.W4.skipped + acc.W4.refused).toBe(acc.W4.attempted);
  expect(acc.W5.reported + acc.W5.missing + acc.W5.failed + acc.W5.refused).toBe(acc.W5.expected);

  return acc;
}

async function executeCliLifecycle(tempDir: string, mission: string) {
  // 1. init
  const initReceipt = await runCliCmd(`init "${tempDir}" --mission "${mission}" --duration-hours 12 --agents 5`);
  expect(initReceipt.verb).toBe('init');
  expect(initReceipt.status).toBe('succeeded');

  // 2. map
  const mapReceipt = await runCliCmd(`map "${tempDir}"`);
  expect(mapReceipt.verb).toBe('map');
  expect(mapReceipt.status).toBe('succeeded');

  // 3. plan
  const planReceipt = await runCliCmd(`plan "${tempDir}"`);
  expect(planReceipt.verb).toBe('plan');
  expect(planReceipt.status).toBe('succeeded');

  // 4. forge, bind, prove, harden for each checkpoint
  const checkpoints = ['cp-cli-contract', 'cp-project-cell', 'cp-checkpoint-plan', 'cp-execution-proof', 'cp-mission-handoff'];
  for (const cp of checkpoints) {
    const forgeReceipt = await runCliCmd(`forge "${tempDir}" --checkpoint ${cp}`);
    expect(forgeReceipt.verb).toBe('forge');
    expect(forgeReceipt.status).toBe('succeeded');

    const bindReceipt = await runCliCmd(`bind "${tempDir}" --checkpoint ${cp}`);
    expect(bindReceipt.verb).toBe('bind');
    expect(bindReceipt.status).toBe('succeeded');

    const proveReceipt = await runCliCmd(`prove "${tempDir}" --checkpoint ${cp}`);
    expect(proveReceipt.verb).toBe('prove');
    expect(proveReceipt.status).toBe('succeeded');

    const hardenReceipt = await runCliCmd(`harden "${tempDir}" --checkpoint ${cp}`);
    expect(hardenReceipt.verb).toBe('harden');
    expect(hardenReceipt.status).toBe('succeeded');
  }

  // 5. Simulate 12 hours elapsed time by modifying start.json
  const startPath = path.join(tempDir, '.truex', 'mission', 'start.json');
  const startData = JSON.parse(fs.readFileSync(startPath, 'utf8'));
  startData.startTime = new Date(Date.now() - 13 * 3600 * 1000).toISOString();
  fs.writeFileSync(startPath, JSON.stringify(startData, null, 2), 'utf8');

  // 6. Write expected agent reports
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

  // 7. handoff
  const handoffReceipt = await runCliCmd(`handoff "${tempDir}" --require-elapsed --require-gall-checkpoints --require-agent-reports 5`);
  expect(handoffReceipt.verb).toBe('handoff');
  expect(handoffReceipt.status).toBe('succeeded');

  // 8. Verify accounting
  const accPath = path.join(tempDir, '.truex', 'reports', 'accounting.json');
  const acc = JSON.parse(fs.readFileSync(accPath, 'utf8'));
  return acc;
}

describe('Project Wizard Concurrency & Stress Tests', () => {

  it('should run 12 concurrent programmatic lifecycles without conflict or state corruption', async () => {
    const concurrency = 12;
    const promises: Promise<any>[] = [];
    const dirs: string[] = [];

    const startTime = Date.now();

    for (let i = 0; i < concurrency; i++) {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `truex-stress-prog-${i}-`));
      dirs.push(tempDir);
      tempDirsToClean.push(tempDir);
      
      const mission = faker.helpers.arrayElement([
        'Optimize local databases and state-machine transitions',
        'Verify concurrent file-system capabilities under load',
        'Validate telemetry and receipt compliance in high-concurrency environments',
        'Analyze AST structures and build topologies without race conditions'
      ]);

      promises.push(executeProgrammaticLifecycle(tempDir, mission));
    }

    const results = await Promise.all(promises);
    const durationMs = Date.now() - startTime;

    expect(results).toHaveLength(concurrency);
    for (const acc of results) {
      expect(acc).toBeDefined();
      expect(acc.W1.attempted).toBeGreaterThan(0);
    }

    stressResults.push({
      testType: 'programmatic_concurrency',
      concurrency,
      durationMs,
      status: 'passed'
    });

    // Clean up successful dirs
    for (const dir of dirs) {
      fs.rmSync(dir, { recursive: true, force: true });
      const index = tempDirsToClean.indexOf(dir);
      if (index > -1) {
        tempDirsToClean.splice(index, 1);
      }
    }
  });

  it('should run 4 concurrent CLI child process lifecycles without conflict or state corruption', async () => {
    const concurrency = 4;
    const promises: Promise<any>[] = [];
    const dirs: string[] = [];

    const startTime = Date.now();

    for (let i = 0; i < concurrency; i++) {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `truex-stress-cli-${i}-`));
      dirs.push(tempDir);
      tempDirsToClean.push(tempDir);

      const mission = faker.helpers.arrayElement([
        'Harden CLI routing surfaces',
        'Execute multi-threaded pipeline validations',
        'Track monotonic time gates in parallel subprocesses',
        'Enforce accounting conservation constraints'
      ]);

      promises.push(executeCliLifecycle(tempDir, mission));
    }

    const results = await Promise.all(promises);
    const durationMs = Date.now() - startTime;

    expect(results).toHaveLength(concurrency);
    for (const acc of results) {
      expect(acc).toBeDefined();
      expect(acc.W1.attempted).toBeGreaterThan(0);
    }

    stressResults.push({
      testType: 'cli_concurrency',
      concurrency,
      durationMs,
      status: 'passed'
    });

    // Clean up successful dirs
    for (const dir of dirs) {
      fs.rmSync(dir, { recursive: true, force: true });
      const index = tempDirsToClean.indexOf(dir);
      if (index > -1) {
        tempDirsToClean.splice(index, 1);
      }
    }
  });

  it('should verify database locks, message queue states, and execution ledger concurrency under heavy parallel loads', async () => {
    // 1. Setup shared database path
    const dbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-db-stress-'));
    const dbPath = path.join(dbDir, 'shared-stress.db');
    tempDirsToClean.push(dbDir);

    // Initialize schema on the database
    const initialDb = new Database(dbPath);
    createPersistentMailbox(initialDb);
    initialDb.close();

    const queueConfig: QueueConfig = {
      queue: 'stress-queue',
      concurrencyLimit: 20,
      maxDepth: 1000,
      retryPolicy: {
        type: 'constant',
        baseDelayMs: 5
      },
      priorityRange: [0, 9],
      rescueAfterMs: 5000
    };

    const ctx = createDeterministicContext(12345);

    // 2. We will run 8 concurrent database workers that perform heavy queue enqueues/claims/completions.
    // They will open independent better-sqlite3 database connections to force SQLITE_BUSY write contention.
    const dbWorkersCount = 8;
    const dbPromises: Promise<void>[] = [];

    // 3. Simultaneously, we will run the 8 verbs of the Truex Wizard on 6 concurrent programmatic cell directories.
    const wizardWorkersCount = 6;
    const wizardPromises: Promise<any>[] = [];

    const startTime = Date.now();

    // Start DB/Queue workers
    for (let i = 0; i < dbWorkersCount; i++) {
      dbPromises.push((async () => {
        const workerDb = new Database(dbPath);
        // Enable WAL mode to support parallel readers/writers
        workerDb.pragma('journal_mode = WAL');
        const lockManager = new SQLiteLockManager(workerDb);

        // Run multiple batches of enqueues, claims, and completions
        for (let batch = 0; batch < 15; batch++) {
          const msgPayload = { action: `db-worker-action-${i}-${batch}`, timestamp: Date.now() };
          
          // Enqueue a message
          const enqueueResult = await lockManager.executeExclusive(() => {
            return enqueueMessage(workerDb, ctx, {
              queue: 'stress-queue',
              payload: msgPayload,
              priority: faker.number.int({ min: 0, max: 9 })
            }, queueConfig);
          }, { maxRetries: 50, initialDelayMs: 2, maxDelayMs: 50 });

          expect(enqueueResult.status).toBe('enqueued');

          // Claim and process a message
          await lockManager.executeExclusive(() => {
            const claim = claimNextMessage(workerDb, ctx, 'stress-queue', queueConfig);
            if (claim.status === 'claimed' && claim.message) {
              completeMessage(workerDb, ctx, claim.message.id, hash(JSON.stringify({ completed: true, worker: i, batch })));
            }
          }, { maxRetries: 50, initialDelayMs: 2, maxDelayMs: 50 });

          // Sleep briefly to interleave with other workers
          await new Promise(resolve => setTimeout(resolve, faker.number.int({ min: 1, max: 5 })));
        }

        workerDb.close();
      })());
    }

    // Start Wizard lifecycles
    const wizardDirs: string[] = [];
    for (let i = 0; i < wizardWorkersCount; i++) {
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `truex-stress-wizard-db-${i}-`));
      wizardDirs.push(tempDir);
      tempDirsToClean.push(tempDir);
      
      const mission = `Verify concurrent database locks and queue execution for worker ${i}`;
      wizardPromises.push(executeProgrammaticLifecycle(tempDir, mission));
    }

    // Wait for all database operations and wizard verbs to complete in parallel
    const [_, wizardResults] = await Promise.all([
      Promise.all(dbPromises),
      Promise.all(wizardPromises)
    ]);

    const durationMs = Date.now() - startTime;

    // 4. Verify Database Integrity & Message States
    const verifyDb = new Database(dbPath);
    
    // Check transitions and messages count
    const messages = verifyDb.prepare('SELECT * FROM truex_mailbox_messages WHERE queue = ?').all('stress-queue') as any[];
    expect(messages.length).toBeGreaterThan(0);
    
    // Assert all messages are in expected states
    for (const msg of messages) {
      expect(['confirmed', 'available', 'executing', 'retryable']).toContain(msg.state);
    }

    const transitions = verifyDb.prepare('SELECT COUNT(*) as count FROM truex_mailbox_transitions').get() as { count: number };
    expect(transitions.count).toBeGreaterThan(0);

    verifyDb.close();

    // 5. Verify Wizard Invariants
    expect(wizardResults).toHaveLength(wizardWorkersCount);
    for (const acc of wizardResults) {
      expect(acc).toBeDefined();
      expect(acc.W1.attempted).toBeGreaterThan(0);
      expect(acc.W1.succeeded).toBeGreaterThan(0);
      
      // Ensure accounting conservation matches the 8 verbs
      expect(acc.W1.succeeded + acc.W1.refused + acc.W1.failed).toBe(acc.W1.attempted);
      expect(acc.W2.created + acc.W2.updated + acc.W2.unchanged + acc.W2.refused + acc.W2.failed).toBe(acc.W2.attempted);
    }

    stressResults.push({
      testType: 'db_locks_mailbox_queues_wizard_concurrency',
      concurrency: dbWorkersCount + wizardWorkersCount,
      durationMs,
      status: 'passed'
    });

    // Clean up successfully completed dirs
    for (const dir of wizardDirs) {
      fs.rmSync(dir, { recursive: true, force: true });
      const index = tempDirsToClean.indexOf(dir);
      if (index > -1) {
        tempDirsToClean.splice(index, 1);
      }
    }
  });

});
