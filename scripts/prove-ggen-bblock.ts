import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  admitTruexControlPlaneBblock,
  type GgenBblockPlan,
  type GgenBblockReceipt,
} from '../packages/storehouse/src/ggen-bblock.js';
import { hash } from '../skills/hash/mutations.js';

function argument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = index >= 0 ? process.argv[index + 1] : undefined;
  if (!value) throw new Error(`Missing required argument ${name}`);
  return resolve(process.cwd(), value);
}

async function load<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

function deterministicFixture(): {
  plan: GgenBblockPlan;
  intent: GgenBblockReceipt;
  result: GgenBblockReceipt;
} {
  const catalogDigest = hash({
    schema: 'ggen.bblock.catalog.v1',
    version: '26.7.30',
    provider: 'aws',
    group: 'fortune5-control-plane',
  });
  const plan: GgenBblockPlan = {
    schema: 'ggen.bblock.plan.v1',
    catalog_version: '26.7.30',
    catalog_digest: catalogDigest,
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
    plan_digest: '',
  };
  plan.plan_digest = hash({
    schema: plan.schema,
    catalog_version: plan.catalog_version,
    catalog_digest: plan.catalog_digest,
    provider: plan.provider,
    requested_group: plan.requested_group,
    resolved_groups: plan.resolved_groups,
    directories: plan.directories,
    packs: plan.packs,
  });

  const planArtifact =
    '.ggen/bblocks/plans/aws/fortune5-control-plane.json';
  const intentBody = {
    schema: 'ggen.bblock.receipt.v1',
    operation: 'plan-intent',
    provider: plan.provider,
    group: plan.requested_group,
    catalog_digest: plan.catalog_digest,
    plan_digest: plan.plan_digest,
    previous_digest: 'GENESIS',
    artifacts: [planArtifact],
    digest_algorithm: 'blake3',
  };
  const intent: GgenBblockReceipt = {
    ...intentBody,
    digest: hash(intentBody),
  };

  const resultBody = {
    ...intentBody,
    operation: 'plan-result',
    previous_digest: intent.digest,
    artifacts: [
      planArtifact,
      '.ggen/bblocks/receipts/aws/fortune5-control-plane-plan-intent.json',
    ],
  };
  const result: GgenBblockReceipt = {
    ...resultBody,
    digest: hash(resultBody),
  };
  return { plan, intent, result };
}

async function inputs(): Promise<{
  plan: GgenBblockPlan;
  intent: GgenBblockReceipt;
  result: GgenBblockReceipt;
}> {
  const hasFileArguments = ['--plan', '--intent', '--result'].some((name) =>
    process.argv.includes(name),
  );
  if (!hasFileArguments) return deterministicFixture();

  const planPath = argument('--plan');
  const intentPath = argument('--intent');
  const resultPath = argument('--result');
  const [plan, intent, result] = await Promise.all([
    load<GgenBblockPlan>(planPath),
    load<GgenBblockReceipt>(intentPath),
    load<GgenBblockReceipt>(resultPath),
  ]);
  return { plan, intent, result };
}

async function main(): Promise<void> {
  const { plan, intent, result } = await inputs();
  const admission = admitTruexControlPlaneBblock(plan, intent, result);
  console.log(JSON.stringify(admission, undefined, 2));
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
