import { describe, it, expect } from 'vitest';
import { WizardAgent } from '../../../../agents/wizard/agent.js';
import { TelcoAgent } from '../../../../agents/telco/agent.js';
import { DoctorAgent } from '../../../../agents/doctor/agent.js';
import { ProjectCell } from '../../src/project-wizard.gall.js';
import { OcelCollector, createOcelProxy } from '../../../../skills/membrane/mutations.js';
import { createDeterministicContext } from '../../src/context.js';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Doctor-Wizard-Telco Integrated Fuzzing and Garbage Input Tests', () => {
  const wizard = new WizardAgent();
  const telco = new TelcoAgent();

  describe('1. Programmatic API Fuzzing', () => {
    it('should handle corrupt, out-of-bounds, and non-numeric metrics in WizardAgent programmatically', () => {
      // Out of bounds
      const trace1 = wizard.simulateTransaction({ score: 50 }, 150);
      const writeFailure1 = trace1.find(t => t.step === 'Speculative Write Failure');
      expect(writeFailure1).toBeDefined();
      expect(writeFailure1?.error).toContain('Invariant violation');

      const trace2 = wizard.simulateTransaction({ score: 50 }, -5);
      const writeFailure2 = trace2.find(t => t.step === 'Speculative Write Failure');
      expect(writeFailure2).toBeDefined();
      expect(writeFailure2?.error).toContain('Invariant violation');

      // Non-numeric
      const trace3 = wizard.simulateTransaction({ score: 50 }, 'not-a-number' as any);
      const writeFailure3 = trace3.find(t => t.step === 'Speculative Write Failure');
      expect(writeFailure3).toBeDefined();
      expect(writeFailure3?.error).toContain('Invariant violation');

      // NaN/Infinity
      const traceNaN = wizard.simulateTransaction({ score: 50 }, Number.NaN);
      const commitOrFailureNaN = traceNaN.some(t => (t.step === 'Transaction Commit' && t.success) || t.step === 'Speculative Write Failure');
      expect(commitOrFailureNaN).toBe(true);

      const traceInf = wizard.simulateTransaction({ score: 50 }, Number.POSITIVE_INFINITY);
      const writeFailureInf = traceInf.find(t => t.step === 'Speculative Write Failure');
      expect(writeFailureInf).toBeDefined();

      // Empty config envelopes / state
      const traceEmpty = wizard.simulateTransaction({} as any, 50);
      const commitOrFailureEmpty = traceEmpty.some(t => (t.step === 'Transaction Commit' && t.success) || t.step === 'Speculative Write Failure');
      expect(commitOrFailureEmpty).toBe(true);
    });

    it('should handle malformed, missing, and oversized inputs in TelcoAgent programmatically', () => {
      // Ingest transitions with malformed activity name (e.g. corrupt JSON string)
      const corruptJsonStr = '{"malformed": ';
      const result1 = telco.ingestTransition(corruptJsonStr, 'actor_1', { balance: 100 }, 120);
      expect(result1.isValid).toBe(true);
      expect(result1.envelope.ocel.events[0]['ocel:type']).toBe(corruptJsonStr);

      // Null byte strings in names
      const nullByteStr = 'session_closed\0';
      expect(() => telco.ingestTransition(nullByteStr, 'user\0name', { balance: 100 }, 120)).toThrow();

      // Empty/null targetState
      expect(() => telco.ingestTransition('act', 'act', null as any, 120)).toThrow();
      expect(() => telco.ingestTransition('act', 'act', {} as any, 120)).not.toThrow();

      // Oversized payload buffers
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 0x41); // 10MB
      const largeString = largeBuffer.toString();
      const result3 = telco.ingestTransition(largeString, 'heavy_actor', { balance: 100 }, 150);
      expect(result3.isValid).toBe(true);
      expect(OcelCollector.verifyEnvelope(result3.envelope)).toBe(true);
    });

    it('should handle invalid/tampered cryptographic response hashes and invalid parent receipts in verifyEnvelope', () => {
      const { envelope } = telco.ingestTransition('payment', 'user_1', { balance: 100 }, 150);

      // Validate envelope should be true initially
      expect(OcelCollector.verifyEnvelope(envelope)).toBe(true);

      // Tamper receiptHash
      const tamperedReceipt = { ...envelope, receiptHash: 'invalid_hash_value' };
      expect(OcelCollector.verifyEnvelope(tamperedReceipt)).toBe(false);

      // Tamper ocelBatchHash
      const tamperedBatch = { ...envelope, ocelBatchHash: 'invalid_batch_hash' };
      expect(OcelCollector.verifyEnvelope(tamperedBatch)).toBe(false);

      // Tamper ocel object content
      const tamperedOcel = JSON.parse(JSON.stringify(envelope));
      tamperedOcel.ocel.events[0]['ocel:type'] = 'TAMPERED';
      expect(OcelCollector.verifyEnvelope(tamperedOcel)).toBe(false);

      // Null/undefined/empty envelope passed to verification
      expect(OcelCollector.verifyEnvelope(null)).toBe(false);
      expect(OcelCollector.verifyEnvelope({})).toBe(false);
      expect(OcelCollector.verifyEnvelope({ ocel: {} })).toBe(false);

      // Test verifyEnvelopeChain with valid linkages
      const collector1 = new OcelCollector(createDeterministicContext(1));
      const proxy1 = createOcelProxy({ balance: 100 }, { id: "obj_1", type: "Account" }, collector1);
      collector1.event({ activity: 'evt1', actor: 'actor1', objects: [{ id: "obj_1", qualifier: "account_modified" }] }, () => {
        proxy1.balance = 120;
      });
      const envelope1 = collector1.exportEnvelope("trace_1", "span_1");

      const collector2 = new OcelCollector(createDeterministicContext(2));
      const proxy2 = createOcelProxy({ balance: 120 }, { id: "obj_1", type: "Account" }, collector2);
      collector2.event({ activity: 'evt2', actor: 'actor2', objects: [{ id: "obj_1", qualifier: "account_modified" }] }, () => {
        proxy2.balance = 150;
      });
      const envelope2 = collector2.exportEnvelope("trace_1", "span_2", envelope1.receiptHash);

      // Check chaining holds
      expect(OcelCollector.verifyEnvelope(envelope1)).toBe(true);
      expect(OcelCollector.verifyEnvelope(envelope2)).toBe(true);
      expect(OcelCollector.verifyEnvelopeChain(envelope1, envelope2)).toBe(true);

      // Tamper with chain linkage
      const tamperedEnv2 = { ...envelope2, previousReceiptHash: 'tampered_previous' };
      expect(OcelCollector.verifyEnvelopeChain(envelope1, tamperedEnv2)).toBe(false);
    });
  });

  describe('2. CLI Execution Pathway Fuzzing', () => {
    it('should reject malformed JSON, invalid arguments, and null bytes via CLI safely with exit code 1', () => {
      // 1. Corrupt JSON structure passed to telco validate
      const malformedJson = '{"activity": "payment", ';
      const cmd1 = `npx tsx scripts/truex.ts telco validate --envelope '${malformedJson}'`;
      expect(() => {
        execSync(cmd1, { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow(/Validation error/);

      // 2. Non-existent file containing null byte in path passed to telco validate
      const cmd2 = `npx tsx scripts/truex.ts telco validate --envelope "nonexistent_file.json\\0"`;
      expect(() => {
        execSync(cmd2, { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow(/(TypeError \[ERR_INVALID_ARG_VALUE\]|File not found)/);

      // 3. Wizard simulate with invalid/non-numeric arguments
      const cmd3 = `npx tsx scripts/truex.ts wizard simulate --score "invalid" --value "invalid"`;
      expect(() => {
        execSync(cmd3, { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow(/Initial score and speculative value must be valid numbers/);

      const cmd4 = `npx tsx scripts/truex.ts wizard simulate --score "50" --value "150"`;
      expect(() => {
        execSync(cmd4, { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow(/Simulation Refused: speculative write of 150 failed/);
    });
  });

  describe('3. ProjectCell Boundary & Path Traversal Fuzzing', () => {
    it('should reject null-bytes and path traversal in ProjectCell', () => {
      const validPath = path.resolve(process.cwd(), 'temp_fuzz_project_cell');

      // Null-byte in constructor path
      expect(() => new ProjectCell('temp_project_cell\0')).toThrow(/Project path contains null bytes/);

      // Path traversal
      const cell = new ProjectCell(validPath);
      expect(() => cell.resolvePath('../../outside')).toThrow(/Path traversal refused/);
      expect(() => cell.resolvePath('file\0name')).toThrow(/Path traversal refused/);

      // Empty config validation
      expect(() => cell.validateConfig(null)).toThrow(/Project configuration is missing or null/);
      expect(() => cell.validateConfig({})).toThrow(/path.*must be a non-empty string/);
    });
  });

  describe('4. Doctor Validation & Stability under Repetitive Iterations', () => {
    it('should run Doctor proofs successfully and preserve stable resource footprint', async () => {
      const doctor = new DoctorAgent();

      // Prove Telco and Wizard
      const telcoReport = await doctor.prove('telco');
      expect(telcoReport.passed).toBe(true);

      const wizardReport = await doctor.prove('wizard-simulate');
      expect(wizardReport.passed).toBe(true);

      // Run multiple fuzzing loops to verify memory/heap stability
      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < 20; i++) {
        // Run light programmatic fuzz tests in loop
        wizard.simulateTransaction({ score: 50 }, 150);
        wizard.simulateTransaction({ score: 50 }, -10);
        wizard.simulateTransaction({ score: 50 }, 'NaN' as any);

        telco.ingestTransition('payment', 'actor', { balance: 100 }, 200);
        OcelCollector.verifyEnvelope(null);
        OcelCollector.verifyEnvelope({});
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const leakDelta = finalMemory - initialMemory;

      // Assert that heap remains stable (leakDelta < 50MB after 20 loops, typical JS VM variation)
      expect(leakDelta).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
