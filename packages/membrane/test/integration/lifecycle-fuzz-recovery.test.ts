import { describe, it, expect } from 'vitest';
import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ProjectCell, CheckpointPlanner, ExecutionEngine, MissionController } from '../../src/project-wizard.gall.js';
import type { AccountingData } from '../../src/project-wizard.gall.js';
import { TelcoAgent } from '../../../../agents/telco/agent.js';
import { OcelCollector } from '../../../../skills/membrane/mutations.js';
import { faker } from '@faker-js/faker';

describe('Adversarial Fuzzing and Recovery Lifecycle', () => {
  // Use deterministic seeded entropy
  faker.seed(42);

  const getTempDir = () => {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'truex-fuzz-recovery-'));
  };

  const cleanup = (dir: string) => {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  };

  it('1. should handle file corruption mid-lifecycle and roll back cleanly', () => {
    const tempDir = getTempDir();
    try {
      const cell = new ProjectCell(tempDir);
      cell.init({
        path: tempDir,
        mission: 'Fuzz Test Mid-Lifecycle Corruption',
        durationHours: 12,
        agents: 5,
        status: 'initialized'
      });

      const planner = new CheckpointPlanner(cell);
      planner.plan({});

      const engine = new ExecutionEngine(cell);
      const cpId = 'cp-cli-contract';

      // Verify the expected file is not created yet
      const expectedFile = path.join(tempDir, 'scripts', 'truex.ts');
      expect(fs.existsSync(expectedFile)).toBe(false);

      // Perform forge phase
      engine.forge(cpId);
      expect(fs.existsSync(expectedFile)).toBe(true);

      // Introduce File Corruption mid-lifecycle (after forge, before bind)
      // Corrupt registry file (invalid JSON structure)
      const registryPath = path.join(tempDir, '.truex', 'checkpoints', 'checkpoint-registry.json');
      fs.writeFileSync(registryPath, '{ corrupt_json: "missing-end-bracket"', 'utf8');

      // Corrupt a forged file as well
      fs.writeFileSync(expectedFile, '// CORRUPTED SCRIPTS CONTENT', 'utf8');

      // Attempt to bind after corruption
      expect(() => {
        engine.bind(cpId);
      }).toThrow();

      // Initiate rollback recovery to the last committed clean state
      engine.rollback(cpId);

      // Verify that after rollback, the newly created/forged file is cleanly deleted
      expect(fs.existsSync(expectedFile)).toBe(false);

      // Ensure that we can still repair the registry and restart the forge/bind cycle
      // Restore registry using planner
      planner.plan({});
      expect(JSON.parse(fs.readFileSync(registryPath, 'utf8'))).toBeDefined();

      // Forge and bind should succeed now
      engine.forge(cpId);
      engine.bind(cpId);
      expect(fs.existsSync(expectedFile)).toBe(true);

    } finally {
      cleanup(tempDir);
    }
  });

  it('2. should refuse execution when checkpoint plan files are tampered with before execution', () => {
    const tempDir = getTempDir();
    try {
      const cell = new ProjectCell(tempDir);
      cell.init({
        path: tempDir,
        mission: 'Fuzz Test Plan Tampering',
        durationHours: 12,
        agents: 5,
        status: 'initialized'
      });

      const planner = new CheckpointPlanner(cell);
      planner.plan({});

      const engine = new ExecutionEngine(cell);
      const cpId = 'cp-cli-contract';

      // Tamper with checkpoint plan files: Modify file list to contain an unlawful path traversal path
      const registryPath = path.join(tempDir, '.truex', 'checkpoints', 'checkpoint-registry.json');
      const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

      // Inject malicious path traversal file
      registry[0].filesExpected.push('../outside-boundary-fuzz.ts');
      fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

      // Attempting to forge cp-cli-contract must now throw a path traversal boundary violation
      expect(() => {
        engine.forge(cpId);
      }).toThrow(/Path traversal refused/);

      // Verify that no expected files were forged or created in the workspace due to immediate refusal
      const expectedFile = path.join(tempDir, 'scripts', 'truex.ts');
      expect(fs.existsSync(expectedFile)).toBe(false);

    } finally {
      cleanup(tempDir);
    }
  });

  it('3. should refuse validations when invalid or tampered packet hashes are injected during Telco transmission', () => {
    const telco = new TelcoAgent();
    const activity = 'call_established';
    const actor = 'adversary_agent_99';
    const initialState = { balance: 100 };
    const newBalance = 70;

    // Normal successful ingestion
    const { envelope, isValid } = telco.ingestTransition(activity, actor, initialState, newBalance);
    expect(isValid).toBe(true);
    expect(telco.validateEnvelope(envelope)).toBe(true);

    // Adversarial Tampering: Inject wrong/corrupted packet hash
    const tamperedBatchHash = JSON.parse(JSON.stringify(envelope));
    tamperedBatchHash.ocelBatchHash = '0000000000000000000000000000000000000000000000000000000000000000';
    expect(telco.validateEnvelope(tamperedBatchHash)).toBe(false);

    // Adversarial Tampering: Inject wrong/corrupted receipt signature hash
    const tamperedReceiptHash = JSON.parse(JSON.stringify(envelope));
    tamperedReceiptHash.receiptHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    expect(telco.validateEnvelope(tamperedReceiptHash)).toBe(false);

    // Adversarial Tampering: Modify the underlying OCEL payload without updating the hashes
    const tamperedPayload = JSON.parse(JSON.stringify(envelope));
    tamperedPayload.ocel.objectChanges[0]['ocel:value'] = 999999;
    expect(telco.validateEnvelope(tamperedPayload)).toBe(false);

    // Adversarial Tampering: Modify the causal chain link (previousReceiptHash)
    const tamperedChain = JSON.parse(JSON.stringify(envelope));
    tamperedChain.previousReceiptHash = 'tampered_previous_hash_value';
    expect(telco.validateEnvelope(tamperedChain)).toBe(false);

    // Test chain integrity failure
    const secondTransitionRaw = telco.ingestTransition('call_ended', actor, { balance: 70 }, 60);
    const e1 = envelope;
    const e2 = OcelCollector.createEnvelope(
      secondTransitionRaw.envelope.ocel,
      secondTransitionRaw.envelope.traceId,
      secondTransitionRaw.envelope.spanId,
      e1.receiptHash
    );
    expect(OcelCollector.verifyEnvelopeChain(e1, e2)).toBe(true);

    // Corrupt the chain linking
    const brokenChain = JSON.parse(JSON.stringify(e2));
    brokenChain.previousReceiptHash = 'corrupted_parent_link';
    expect(OcelCollector.verifyEnvelopeChain(e1, brokenChain)).toBe(false);
  });

  it('4. should refuse handoff before the 12-hour gate without warping the timestamp', () => {
    const tempDir = getTempDir();
    try {
      const cell = new ProjectCell(tempDir);
      cell.init({
        path: tempDir,
        mission: 'Fuzz Handoff Gate',
        durationHours: 12,
        agents: 5,
        status: 'initialized'
      });

      // Write start.json containing current timestamp (forcing elapsed time to be close to 0 hours)
      const missionDir = path.join(tempDir, '.truex', 'mission');
      fs.mkdirSync(missionDir, { recursive: true });
      fs.writeFileSync(
        path.join(missionDir, 'start.json'),
        JSON.stringify({ startTime: new Date().toISOString() }, null, 2),
        'utf8'
      );

      const controller = new MissionController(cell);

      // Invoke handoff verification and assert it throws Handoff Refused due to elapsed time check
      expect(() => {
        controller.verifyHandoff({ requireElapsed: true });
      }).toThrow(/Handoff Refused: Monotonic mission gate has not opened yet/);

    } finally {
      cleanup(tempDir);
    }
  });

  it('5. should refuse unlawful transitions and roll back cleanly to the last committed state', () => {
    const tempDir = getTempDir();
    try {
      const cell = new ProjectCell(tempDir);
      cell.init({
        path: tempDir,
        mission: 'Refusal of Unlawful Transitions',
        durationHours: 12,
        agents: 5,
        status: 'initialized'
      });

      const planner = new CheckpointPlanner(cell);
      planner.plan({});

      const engine = new ExecutionEngine(cell);
      const cpId = 'cp-cli-contract';

      // 1. Establish last committed clean state
      engine.forge(cpId);
      engine.bind(cpId);
      const testFile = path.join(tempDir, 'scripts', 'truex.ts');
      const testContentBefore = fs.readFileSync(testFile, 'utf8');

      // 2. Prohibit self-completion claims (unlawful transitions)
      const mockReportPath = path.join(tempDir, '.truex', 'reports', `proof-${cpId}.json`);
      fs.mkdirSync(path.dirname(mockReportPath), { recursive: true });
      fs.writeFileSync(mockReportPath, JSON.stringify({ verified: true }), 'utf8');

      // Executing forge again while it holds an unlawful self-completed proof must throw/fail
      expect(() => {
        engine.forge(cpId);
      }).toThrow(/Self-completion claim restricted/);

      // Clean up the mock report to unblock engine
      fs.unlinkSync(mockReportPath);

      // 3. Prohibit write set boundary violations (unlawful write target)
      expect(() => {
        engine.forge(cpId, ['packages/membrane/src/project-wizard.gall.ts']); // outside active write set
      }).toThrow(/Checkpoint write set boundary violation/);

      // 4. Verify that the workspace files remain unmodified, preserving the last clean committed state
      const testContentAfter = fs.readFileSync(testFile, 'utf8');
      expect(testContentAfter).toBe(testContentBefore);

      // 5. Check that accounting totals track failures/refusals without becoming unbalanced
      const accountingPath = path.join(tempDir, '.truex', 'reports', 'accounting.json');
      const acc = JSON.parse(fs.readFileSync(accountingPath, 'utf8')) as AccountingData;

      // Check W1 command invariant: attempted == succeeded + refused + failed
      const w1Sum = acc.W1.succeeded + acc.W1.refused + acc.W1.failed;
      expect(acc.W1.attempted).toBe(w1Sum);

      // Check W2 invariant: attempted == created + updated + unchanged + refused + failed
      const w2Sum = acc.W2.created + acc.W2.updated + acc.W2.unchanged + acc.W2.refused + acc.W2.failed;
      expect(acc.W2.attempted).toBe(w2Sum);

    } finally {
      cleanup(tempDir);
    }
  });
});
