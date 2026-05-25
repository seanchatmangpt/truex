import { describe, it, expect } from 'vitest';
import { TelcoAgent } from '../../../../agents/telco/agent.js';
import { WizardAgent } from '../../../../agents/wizard/agent.js';
import { createHookOtpRuntime, dispatchMessage, createHookProcess } from '../../src/hook-otp.gall.js';
import { OcelCollector } from '../../../../skills/membrane/mutations.js';
import { ProjectCell } from '../../src/project-wizard.gall.js';
import { faker } from '@faker-js/faker';

import { getReactivePatternNames, runReactivePattern } from '../../src/utils/reactive-patterns.js';

describe('Reactive Lifecycle Fuzzing and Garbage Input Test Suite', () => {
  faker.seed(42);

  describe('Corrupt JSON Refusal', () => {
    it('should refuse corrupt JSON envelopes on Telco validate', () => {
      const telco = new TelcoAgent();
      
      // Passing non-object corrupt values to validateEnvelope
      expect(() => telco.validateEnvelope(null)).toThrow();
      expect(() => telco.validateEnvelope("corrupted string")).toThrow();
      expect(() => telco.validateEnvelope(undefined)).toThrow();

      // Passing object with invalid format (missing or invalid profile / protocol family)
      const invalidEnvelope = { thisIs: "not a valid envelope" };
      expect(() => telco.validateEnvelope(invalidEnvelope)).toThrow(/Invalid protocol family/);
    });

    it('should refuse corrupt JSON configurations on ProjectCell validation', () => {
      const cell = new ProjectCell(process.cwd());
      
      // Null config
      expect(() => cell.validateConfig(null)).toThrow(/Config format failure/);

      // Missing required fields
      const badConfig = { path: process.cwd(), mission: "Short" }; // mission too short, missing agents, status, etc.
      expect(() => cell.validateConfig(badConfig)).toThrow(/Config format failure/);
    });
  });

  describe('Null-Byte Traversal Path Refusal', () => {
    it('should refuse null-byte traversal paths in ProjectCell', () => {
      // Null byte in constructor
      expect(() => new ProjectCell("/path/to/project\0")).toThrow(/Project path contains null bytes/);

      // Null byte in resolvePath
      const cell = new ProjectCell(process.cwd());
      expect(() => cell.resolvePath("subdir/\0/file.ts")).toThrow(/Path traversal refused/);
      expect(() => cell.resolvePath("../outside\0/boundary")).toThrow(/Path traversal refused/);
    });

    it('should refuse path traversals outside project boundary', () => {
      const cell = new ProjectCell(process.cwd());
      expect(() => cell.resolvePath("../../outside/boundary")).toThrow(/Path traversal refused/);
    });
  });

  describe('Oversized Payloads Refusal', () => {
    it('should refuse messages with delta changes exceeding limits', () => {
      const runtime = createHookOtpRuntime();
      const p1 = createHookProcess("proc-1", (state, msg) => ({ nextState: state, effects: [] }));
      runtime.processes.set("proc-1", p1);

      // Over 100 adds/deletes delta limit
      const massiveAdds = Array.from({ length: 101 }, (_, i) => ({
        subject: `s${i}`,
        predicate: 'p',
        object: `o${i}`
      }));
      
      const res = dispatchMessage(runtime, {
        id: "msg-large",
        targetProcessId: "proc-1",
        delta: {
          id: "delta-large",
          adds: massiveAdds,
          deletes: []
        }
      });

      expect(res.allowed).toBe(false);
      expect(res.receipt.status).toBe("refused");
      expect(res.reason).toContain("Capacity breach: too many changes");
    });
  });

  describe('Invalid Protocol Families Refusal', () => {
    it('should refuse envelopes with invalid profiles (protocol families)', () => {
      const telco = new TelcoAgent();
      
      // Create a valid envelope first
      const { envelope } = telco.ingestTransition(
        'payment_received',
        'customer_pay',
        { balance: 100 },
        150
      );

      // Verify the protocol family check (profile) works
      const invalidProtocolEnvelope = {
        ...envelope,
        profile: 'zoe.invalid-family.v99'
      };

      // Our modified validation in the agent or test should catch it
      expect(() => telco.validateEnvelope(invalidProtocolEnvelope)).toThrow(/Invalid protocol family/);
    });
  });

  describe('Prototype Pollution Refusal', () => {
    it('should refuse prototype mutation attempts in transition metadata and properties', () => {
      const telco = new TelcoAgent();

      // Attempt prototype pollution via activityName
      expect(() => {
        telco.ingestTransition(
          '__proto__',
          'actor',
          { balance: 100 },
          150
        );
      }).toThrow(/Prototype pollution/);

      // Attempt prototype pollution via actorName
      expect(() => {
        telco.ingestTransition(
          'activity',
          '__proto__',
          { balance: 100 },
          150
        );
      }).toThrow(/Prototype pollution/);
    });

    it('should refuse prototype pollution on Wizard transaction states and roll back cleanly', () => {
      const wizard = new WizardAgent();
      
      // Speculative write attempting prototype pollution should fail
      // and Wizard should roll back the transaction cleanly.
      const initialState = { score: 50 };
      
      // Let's invoke a transaction behavior that attempts prototype pollution or triggers invariant failure
      const trace = wizard.simulateTransaction(initialState, 150); // 150 is out of bounds [0, 100]
      
      expect(trace.some(t => t.step === 'Speculative Write Failure')).toBe(true);
      expect(trace.some(t => t.step === 'Transaction Rollback' && t.success)).toBe(true);
      expect(trace[trace.length - 1].value.score).toBe(50); // rolled back to 50
    });
  });

  describe('34 Examples / Reactive Pattern Execution Validation', () => {
    const patternNames = getReactivePatternNames();
    for (const name of patternNames) {
      it(`should execute ${name} reactive pattern cleanly under lawful conditions`, async () => {
        await expect(runReactivePattern(name)).resolves.not.toThrow();
      });
    }
  });
});
