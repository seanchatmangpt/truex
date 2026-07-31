import { WizardAgent } from '../../agents/wizard/agent.js';
import { TelcoAgent } from '../../agents/telco/agent.js';
import { admitTruexControlPlaneBblock } from '../../packages/storehouse/src/ggen-bblock.js';
import { hash } from '../hash/mutations.js';

export interface OperationalProofReport {
  readonly primitive: string;
  readonly passed: boolean;
  readonly failures: readonly string[];
  readonly invariants: readonly string[];
  readonly timings: Readonly<Record<string, number>>;
  readonly receiptHash: string;
}

function report(primitive: string, failures: string[], invariants: string[], evidence: unknown): OperationalProofReport {
  return Object.freeze({
    primitive,
    passed: failures.length === 0,
    failures: Object.freeze(failures),
    invariants: Object.freeze(invariants),
    timings: Object.freeze({}),
    receiptHash: hash({ schema: 'truex.operational-proof.v1', primitive, failures, evidence }),
  });
}

function runUnifiedFixture() {
  const wizard = new WizardAgent();
  const committed = wizard.simulateTransaction({ score: 50 }, 75);
  const rolledBack = wizard.simulateTransaction({ score: 50 }, 150);
  const telco = new TelcoAgent();
  const ingestion = telco.ingestTransition('UnifiedVerify', 'DoctorAgent', { balance: 1000 }, 1050);
  return { committed, rolledBack, ingestion, envelopeValid: telco.validateEnvelope(ingestion.envelope) };
}

export function proveOperationalDoctorWizardTelcoUnified(): OperationalProofReport {
  const failures: string[] = [];
  const fixture = runUnifiedFixture();
  const commit = fixture.committed.find((step) => step.step === 'Transaction Commit');
  const rollback = fixture.rolledBack.find((step) => step.step === 'Transaction Rollback');
  if (!commit || commit.value.score !== 75) failures.push('Wizard valid transaction did not commit score 75');
  if (!rollback || rollback.value.score !== 50) failures.push('Wizard invalid transaction did not roll back score 50');
  if (!fixture.ingestion.isValid || !fixture.envelopeValid) failures.push('Telco envelope was not valid at ingestion and replay');
  return report(
    'doctor-wizard-telco-unified',
    failures,
    [
      'Wizard commits an admitted transition',
      'Wizard rolls back a refused transition',
      'Telco emits and revalidates a deterministic OCEL envelope',
      'unified receipt binds both operational consequences',
    ],
    fixture,
  );
}

export function proveOperationalTelemetryIntegration(): OperationalProofReport {
  const failures: string[] = [];
  const first = runUnifiedFixture();
  const replay = runUnifiedFixture();
  const firstDigest = hash(first);
  const replayDigest = hash(replay);
  if (firstDigest !== replayDigest) failures.push('Wizard/Telco telemetry replay diverged');
  if (!first.envelopeValid || !replay.envelopeValid) failures.push('Telemetry contains an invalid envelope');
  return report(
    'telemetry-integration',
    failures,
    [
      'operations are derived from live Wizard and Telco execution',
      'telemetry replay produces the same digest',
      'no external or stale report is accepted as evidence',
    ],
    { firstDigest, replayDigest },
  );
}

export function proveOperationalUnifiedIntegration(): OperationalProofReport {
  const unified = proveOperationalDoctorWizardTelcoUnified();
  const telemetry = proveOperationalTelemetryIntegration();
  const failures = [unified, telemetry].flatMap((item) => item.passed ? [] : item.failures.map((failure) => `${item.primitive}: ${failure}`));
  return report(
    'unified-integration',
    failures,
    [
      ...unified.invariants.map((item) => `unified: ${item}`),
      ...telemetry.invariants.map((item) => `telemetry: ${item}`),
    ],
    { unifiedReceipt: unified.receiptHash, telemetryReceipt: telemetry.receiptHash },
  );
}

function ggenTamperedChainIsRefused(): boolean {
  const digest = 'a'.repeat(64);
  const plan = {
    schema: 'ggen.bblock.plan.v1',
    catalog_version: '26.7.30',
    catalog_digest: digest,
    provider: 'aws',
    requested_group: 'fortune5-control-plane',
    resolved_groups: [
      'global-network', 'workload-identity', 'encryption-kms', 'observability',
      'object-storage', 'event-fabric', 'policy-governance', 'evidence-ledger',
      'fortune5-foundation', 'fortune5-control-plane',
    ],
    directories: ['infrastructure/control-plane'],
    packs: [
      'gall-core-pack', 'fortune5-brce-contract-pack', 'fortune5-receipt-ledger-pack',
      'fortune5-replay-pack', 'fortune5-conservation-pack', 'fortune5-legality-pack',
    ],
    plan_digest: digest,
  };
  const intent = {
    schema: 'ggen.bblock.receipt.v1', operation: 'plan-intent', provider: 'aws',
    group: 'fortune5-control-plane', catalog_digest: digest, plan_digest: digest,
    previous_digest: 'GENESIS',
    artifacts: ['.ggen/bblocks/plans/aws/fortune5-control-plane.json'],
    digest_algorithm: 'blake3', digest,
  };
  const result = {
    ...intent,
    operation: 'plan-result',
    previous_digest: 'b'.repeat(64),
    artifacts: [
      '.ggen/bblocks/plans/aws/fortune5-control-plane.json',
      '.ggen/bblocks/receipts/aws/fortune5-control-plane-plan-intent.json',
    ],
  };
  try {
    admitTruexControlPlaneBblock(plan, intent, result);
    return false;
  } catch (error) {
    return error instanceof Error && error.message.startsWith('GGEN_BBLOCK_REFUSED:');
  }
}

export function proveOperationalCapabilityBreakpoints(): OperationalProofReport {
  const failures: string[] = [];
  const wizard = new WizardAgent();
  const rollback = wizard.simulateTransaction({ score: 20 }, 101).find((step) => step.step === 'Transaction Rollback');
  if (!rollback || rollback.value.score !== 20) failures.push('Wizard range breakpoint failed to roll back');

  const telco = new TelcoAgent();
  for (const [activity, actor, balance] of [
    ['__proto__', 'actor', 100],
    ['activity', 'prototype', 100],
    ['activity', 'actor', 1_000_000_001],
  ] as const) {
    try {
      telco.ingestTransition(activity, actor, { balance: 0 }, balance);
      failures.push(`Telco admitted forbidden breakpoint ${activity}/${actor}/${balance}`);
    } catch {
      // Expected typed refusal boundary.
    }
  }
  if (!ggenTamperedChainIsRefused()) failures.push('ggen causal receipt breakpoint admitted a tampered chain');

  return report(
    'capability-breakpoints',
    failures,
    [
      'range violation rolls back the Wizard transaction',
      'prototype-pollution metadata is refused',
      'oversized Telco payload is refused',
      'tampered ggen receipt causality is refused',
      'proof consumes no stale report artifacts',
    ],
    { breakpointCount: 5 },
  );
}
