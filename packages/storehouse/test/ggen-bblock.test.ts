import { describe, expect, it } from 'vitest';
import {
  admitTruexControlPlaneBblock,
  type GgenBblockPlan,
  type GgenBblockReceipt,
} from '../src/ggen-bblock.js';

const digest = (character: string) => character.repeat(64);

function fixture() {
  const plan: GgenBblockPlan = {
    schema: 'ggen.bblock.plan.v1',
    catalog_version: '26.7.30',
    catalog_digest: digest('a'),
    provider: 'aws',
    requested_group: 'fortune5-control-plane',
    resolved_groups: [
      'global-network',
      'workload-identity',
      'encryption-kms',
      'observability',
      'object-storage',
      'event-fabric',
      'policy-governance',
      'evidence-ledger',
      'fortune5-foundation',
      'fortune5-control-plane',
    ],
    directories: [
      'infrastructure/network',
      'infrastructure/identity',
      'infrastructure/security/kms',
      'infrastructure/observability',
      'infrastructure/data/object-storage',
      'infrastructure/integration/events',
      'infrastructure/governance',
      'infrastructure/evidence',
      'infrastructure/foundation',
      'infrastructure/control-plane',
    ],
    packs: [
      'gall-core-pack',
      'fortune5-brce-contract-pack',
      'fortune5-receipt-ledger-pack',
      'fortune5-replay-pack',
      'fortune5-conservation-pack',
      'fortune5-legality-pack',
    ],
    plan_digest: digest('b'),
  };
  const intent: GgenBblockReceipt = {
    schema: 'ggen.bblock.receipt.v1',
    operation: 'plan-intent',
    provider: plan.provider,
    group: plan.requested_group,
    catalog_digest: plan.catalog_digest,
    plan_digest: plan.plan_digest,
    previous_digest: 'GENESIS',
    artifacts: ['.ggen/bblocks/plans/aws/fortune5-control-plane.json'],
    digest_algorithm: 'blake3',
    digest: digest('c'),
  };
  const result: GgenBblockReceipt = {
    ...intent,
    operation: 'plan-result',
    previous_digest: intent.digest,
    artifacts: [
      '.ggen/bblocks/plans/aws/fortune5-control-plane.json',
      '.ggen/bblocks/receipts/aws/fortune5-control-plane-plan-intent.json',
    ],
    digest: digest('d'),
  };
  return { plan, intent, result };
}

describe('ggen bblock admission', () => {
  it('admits the control-plane plan and causal receipt chain', () => {
    const { plan, intent, result } = fixture();
    expect(admitTruexControlPlaneBblock(plan, intent, result)).toMatchObject({
      status: 'ADMITTED',
      provider: 'aws',
      group: 'fortune5-control-plane',
      plan_digest: plan.plan_digest,
      receipt_digest: result.digest,
    });
  });

  it('refuses a result receipt that bypasses the intent receipt', () => {
    const { plan, intent, result } = fixture();
    result.previous_digest = digest('e');
    expect(() => admitTruexControlPlaneBblock(plan, intent, result)).toThrow(
      'GGEN_BBLOCK_REFUSED',
    );
  });

  it('types malformed JSON as a refusal', () => {
    const { intent, result } = fixture();
    expect(() => admitTruexControlPlaneBblock({ provider: 42 }, intent, result)).toThrow(
      'GGEN_BBLOCK_REFUSED',
    );
  });

  it('refuses plans without replay and receipt-ledger packs', () => {
    const { plan, intent, result } = fixture();
    plan.packs = plan.packs.filter((pack) => pack !== 'fortune5-replay-pack');
    expect(() => admitTruexControlPlaneBblock(plan, intent, result)).toThrow(
      'missing required pack fortune5-replay-pack',
    );
  });
});
