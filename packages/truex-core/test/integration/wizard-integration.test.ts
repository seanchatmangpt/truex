import { describe, it, expect } from 'vitest';
import { WizardAgent } from '../../../../agents/wizard/agent.js';
import { execSync } from 'child_process';
import { faker } from '@faker-js/faker';

describe('Wizard Agent Integration Tests', () => {
  // Use a deterministic seed for faker to align with Entropy Law
  faker.seed(1337);

  describe('Programmatic API Pathway', () => {
    it('should successfully commit a transaction when within the admissible score range (0-100)', () => {
      const wizard = new WizardAgent();
      
      const initialScore = faker.number.int({ min: 10, max: 40 });
      const nextScore = faker.number.int({ min: 50, max: 90 });
      
      const trace = wizard.simulateTransaction({ score: initialScore }, nextScore);

      // Verify transaction setup, speculative write, and commit steps exist
      expect(trace.length).toBe(3);
      expect(trace[0].step).toBe('Initial State Setup');
      expect(trace[1].step).toBe('Speculative Write');
      expect(trace[1].success).toBe(true);
      expect(trace[2].step).toBe('Transaction Commit');
      expect(trace[2].success).toBe(true);
      expect(trace[2].value.score).toBe(nextScore);
    });

    it('should rollback a transaction when the speculative write violates score range invariants', () => {
      const wizard = new WizardAgent();
      
      const initialScore = 50;
      const invalidScore = 150; // out of range 0 to 100
      
      const trace = wizard.simulateTransaction({ score: initialScore }, invalidScore);

      // Verify setup, write failure, and rollback steps exist
      expect(trace.length).toBe(3);
      expect(trace[0].step).toBe('Initial State Setup');
      expect(trace[1].step).toBe('Speculative Write Failure');
      expect(trace[1].success).toBe(false);
      expect(trace[1].error).toContain('Invariant violation: Property "score" must be between 0 and 100');
      expect(trace[2].step).toBe('Transaction Rollback');
      expect(trace[2].success).toBe(true);
      expect(trace[2].value.score).toBe(initialScore); // Rollback to initial
    });

    it('should run a multi-step walkthrough propagating state commits and ignoring rollbacks', () => {
      const wizard = new WizardAgent();
      const initialScore = 50;
      
      // 75 (commit), 120 (rollback -> score remains 75), 40 (commit -> score becomes 40)
      const steps = [75, 120, 40];
      const trace = wizard.walkthrough({ score: initialScore }, steps);

      // Since each simulateTransaction call creates 3 trace events:
      expect(trace.length).toBe(9);

      // Verify the final commit value
      const commits = trace.filter(t => t.step === 'Transaction Commit');
      expect(commits.length).toBe(2);
      expect(commits[0].value.score).toBe(75);
      expect(commits[1].value.score).toBe(40);

      const rollbacks = trace.filter(t => t.step === 'Transaction Rollback');
      expect(rollbacks.length).toBe(1);
      expect(rollbacks[0].value.score).toBe(75); // rolled back to last committed state
    });
  });

  describe('CLI Execution Pathway', () => {
    it('should run "wizard simulate" CLI command successfully for a valid score change', () => {
      const score = '45';
      const value = '85';

      const cmd = `npx tsx scripts/truex.ts wizard simulate --score "${score}" --value "${value}"`;
      const stdout = execSync(cmd, { encoding: 'utf8' });

      const parsed = JSON.parse(stdout.trim());
      expect(parsed.length).toBe(3);
      expect(parsed[2].step).toBe('Transaction Commit');
      expect(parsed[2].success).toBe(true);
      expect(parsed[2].value.score).toBe(85);
    });

    it('should run "wizard simulate" CLI command and report rollback on an invalid score change', () => {
      const score = '50';
      const value = '150';

      const cmd = `npx tsx scripts/truex.ts wizard simulate --score "${score}" --value "${value}"`;
      
      // Expect command to fail due to invariant violation and exit with non-zero code
      expect(() => {
        execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
      }).toThrow(/Simulation Refused: speculative write of 150 failed/);
    });

    it('should run "wizard walkthrough" CLI command successfully and output commits/rollbacks log', () => {
      const score = '50';
      const values = '75,120,40,110';

      const cmd = `npx tsx scripts/truex.ts wizard walkthrough --score "${score}" --values "${values}"`;
      const stdout = execSync(cmd, { encoding: 'utf8' });

      expect(stdout).toContain('Starting Wizard walkthrough with initial score: 50');
      expect(stdout).toContain('Simulating speculative write of value: 75');
      expect(stdout).toContain('Transaction COMMITTED. New score: 75');
      expect(stdout).toContain('Simulating speculative write of value: 120');
      expect(stdout).toContain('Transaction ROLLED BACK. Score remains: 75');
      expect(stdout).toContain('Simulating speculative write of value: 40');
      expect(stdout).toContain('Transaction COMMITTED. New score: 40');
      expect(stdout).toContain('Simulating speculative write of value: 110');
      expect(stdout).toContain('Transaction ROLLED BACK. Score remains: 40');
    });
  });
});
