import { describe, it, expect } from 'vitest';
import { TelcoAgent } from '../../../../agents/telco/agent.js';
import { execSync } from 'node:child_process';
import { faker } from '@faker-js/faker';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Telco Agent Integration Tests', () => {
  // Use a deterministic seed for faker to align with Entropy Law
  faker.seed(1337);

  describe('Programmatic API Pathway', () => {
    it('should successfully ingest state transitions, generate OCEL receipt envelope, and validate it', () => {
      const telco = new TelcoAgent();

      const activity = faker.helpers.arrayElement(['activate_subscription', 'upgrade_tier', 'deactivate_service']);
      const actor = faker.person.fullName();
      const initialBalance = faker.number.int({ min: 50, max: 200 });
      const addedBalance = faker.number.int({ min: 10, max: 50 });
      const newBalance = initialBalance + addedBalance;

      const targetState = { balance: initialBalance };

      // Ingest the transition
      const result = telco.ingestTransition(activity, actor, targetState, newBalance);

      // Verify structure and correctness
      expect(result.isValid).toBe(true);
      expect(result.envelope).toBeDefined();
      expect(result.envelope.profile).toBe('zoe.ocel2.v1');
      expect(result.envelope.ocel).toBeDefined();

      const events = result.envelope.ocel.events;
      expect(events.length).toBe(1);
      expect(events[0]['ocel:type']).toBe(activity);
      expect(events[0]['ocel:attributes'].actor).toBe(actor);

      const objectChanges = result.envelope.ocel.objectChanges;
      expect(objectChanges.length).toBe(1);
      expect(objectChanges[0]['ocel:value']).toBe(newBalance);

      // Verify validating using the agent validateEnvelope method
      const isEnvelopeValid = telco.validateEnvelope(result.envelope);
      expect(isEnvelopeValid).toBe(true);
    });

    it('should refuse validation when an envelope is tampered with', () => {
      const telco = new TelcoAgent();
      const initialState = { balance: 100 };
      const result = telco.ingestTransition('payment_processed', 'system_gateway', initialState, 150);

      expect(telco.validateEnvelope(result.envelope)).toBe(true);

      // Create a tampered deep copy of the envelope
      const tamperedEnvelope = JSON.parse(JSON.stringify(result.envelope));
      
      // Tamper with the new value of balance in objectChanges
      if (tamperedEnvelope.ocel && tamperedEnvelope.ocel.objectChanges && tamperedEnvelope.ocel.objectChanges[0]) {
        tamperedEnvelope.ocel.objectChanges[0]['ocel:value'] = 9999;
      }

      // Validation should fail because hash/signatures will no longer match
      const isTamperedValid = telco.validateEnvelope(tamperedEnvelope);
      expect(isTamperedValid).toBe(false);
    });
  });

  describe('CLI Execution Pathway', () => {
    it('should run "telco ingest" CLI command successfully and return valid JSON result', () => {
      const activity = 'call_started';
      const actor = 'customer_404';
      const balance = '100';
      const newBalance = '80';

      const cmd = `npx tsx scripts/truex.ts telco ingest --activity "${activity}" --actor "${actor}" --balance "${balance}" --newBalance "${newBalance}"`;
      const stdout = execSync(cmd, { encoding: 'utf8' });

      // Verify CLI parses and outputs a JSON object with isValid and envelope fields
      const parsed = JSON.parse(stdout.trim());
      expect(parsed.isValid).toBe(true);
      expect(parsed.envelope).toBeDefined();
      expect(parsed.envelope.ocel.events[0]['ocel:type']).toBe(activity);
      expect(parsed.envelope.ocel.events[0]['ocel:attributes'].actor).toBe(actor);
    });

    it('should run "telco validate" CLI command with generated envelope and report validation status', () => {
      // 1. Ingest to get a valid envelope
      const telco = new TelcoAgent();
      const { envelope } = telco.ingestTransition('session_closed', 'user_beta', { balance: 50 }, 30);
      const envelopeStr = JSON.stringify(envelope);

      // 2. Validate using the CLI via a temp file to avoid shell escaping issues
      const tempFilePath = path.join(process.cwd(), 'temp_envelope_test.json');
      fs.writeFileSync(tempFilePath, envelopeStr, 'utf8');

      try {
        const cmd = `npx tsx scripts/truex.ts telco validate --envelope "${tempFilePath}"`;
        const stdout = execSync(cmd, { encoding: 'utf8' });

        const parsed = JSON.parse(stdout.trim());
        expect(parsed.isValid).toBe(true);
      } finally {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    it('should run "telco validate" with no arguments, running demonstration mode', () => {
      const cmd = `npx tsx scripts/truex.ts telco validate`;
      const stdout = execSync(cmd, { encoding: 'utf8' });

      expect(stdout).toContain('Running self-contained verification demonstration...');
      expect(stdout).toContain('Original Valid? true');
      expect(stdout).toContain('Tampered Valid? false');
    });
  });
});
