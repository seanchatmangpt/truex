/**
 * @module ggen-bblock
 * @description Admits a ggen building-block plan and its chained receipts into Truex.
 */

const PLAN_SCHEMA = 'ggen.bblock.plan.v1';
const RECEIPT_SCHEMA = 'ggen.bblock.receipt.v1';
const REQUIRED_GROUP = 'fortune5-control-plane';
const REQUIRED_GROUPS = [
  'global-network',
  'workload-identity',
  'encryption-kms',
  'observability',
  'object-storage',
  'event-fabric',
  'policy-governance',
  'evidence-ledger',
  'fortune5-foundation',
  REQUIRED_GROUP,
] as const;
const REQUIRED_PACKS = [
  'gall-core-pack',
  'fortune5-brce-contract-pack',
  'fortune5-receipt-ledger-pack',
  'fortune5-replay-pack',
  'fortune5-conservation-pack',
  'fortune5-legality-pack',
] as const;
const PROVIDERS = new Set(['aws', 'azure', 'gcp']);
const DIGEST = /^[0-9a-f]{64}$/;

export interface GgenBblockPlan {
  schema: string;
  catalog_version: string;
  catalog_digest: string;
  provider: string;
  requested_group: string;
  resolved_groups: string[];
  directories: string[];
  packs: string[];
  plan_digest: string;
}

export interface GgenBblockReceipt {
  schema: string;
  operation: string;
  provider: string;
  group: string;
  catalog_digest: string;
  plan_digest: string;
  previous_digest: string;
  artifacts: string[];
  digest_algorithm: string;
  digest: string;
}

export interface AdmittedGgenBblock {
  status: 'ADMITTED';
  provider: string;
  group: typeof REQUIRED_GROUP;
  plan_digest: string;
  receipt_digest: string;
  resolved_groups: readonly string[];
  packs: readonly string[];
}

type JsonRecord = Record<string, unknown>;

function refuse(message: string): never {
  throw new Error(`GGEN_BBLOCK_REFUSED: ${message}`);
}

function record(value: unknown, field: string): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    refuse(`${field} must be a JSON object`);
  }
  return value as JsonRecord;
}

function string(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    refuse(`${field} must be a non-empty string`);
  }
  return value;
}

function strings(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    refuse(`${field} must be an array of strings`);
  }
  return value as string[];
}

function parsePlan(value: unknown): GgenBblockPlan {
  const input = record(value, 'plan');
  return {
    schema: string(input.schema, 'plan.schema'),
    catalog_version: string(input.catalog_version, 'plan.catalog_version'),
    catalog_digest: string(input.catalog_digest, 'plan.catalog_digest'),
    provider: string(input.provider, 'plan.provider'),
    requested_group: string(input.requested_group, 'plan.requested_group'),
    resolved_groups: strings(input.resolved_groups, 'plan.resolved_groups'),
    directories: strings(input.directories, 'plan.directories'),
    packs: strings(input.packs, 'plan.packs'),
    plan_digest: string(input.plan_digest, 'plan.plan_digest'),
  };
}

function parseReceipt(value: unknown, field: string): GgenBblockReceipt {
  const input = record(value, field);
  return {
    schema: string(input.schema, `${field}.schema`),
    operation: string(input.operation, `${field}.operation`),
    provider: string(input.provider, `${field}.provider`),
    group: string(input.group, `${field}.group`),
    catalog_digest: string(input.catalog_digest, `${field}.catalog_digest`),
    plan_digest: string(input.plan_digest, `${field}.plan_digest`),
    previous_digest: string(input.previous_digest, `${field}.previous_digest`),
    artifacts: strings(input.artifacts, `${field}.artifacts`),
    digest_algorithm: string(input.digest_algorithm, `${field}.digest_algorithm`),
    digest: string(input.digest, `${field}.digest`),
  };
}

function requireDigest(value: string, field: string): void {
  if (!DIGEST.test(value)) {
    refuse(`${field} must be a 64-character lowercase hex digest`);
  }
}

function requireUnique(values: string[], field: string): void {
  if (new Set(values).size !== values.length) {
    refuse(`${field} contains duplicate values`);
  }
}

function requireSafePaths(paths: string[], field: string): void {
  for (const path of paths) {
    if (
      path.length === 0 ||
      path.startsWith('/') ||
      path.includes('\\') ||
      path.split('/').includes('..')
    ) {
      refuse(`unsafe ${field} path ${path}`);
    }
  }
}

function requireReceiptMatches(
  receipt: GgenBblockReceipt,
  operation: 'plan-intent' | 'plan-result',
  plan: GgenBblockPlan,
): void {
  if (receipt.schema !== RECEIPT_SCHEMA) {
    refuse(`${operation} receipt schema is invalid`);
  }
  if (receipt.operation !== operation) refuse(`expected ${operation} receipt`);
  if (receipt.provider !== plan.provider) {
    refuse(`${operation} provider diverges from plan`);
  }
  if (receipt.group !== plan.requested_group) {
    refuse(`${operation} group diverges from plan`);
  }
  if (receipt.catalog_digest !== plan.catalog_digest) {
    refuse(`${operation} catalog digest diverges from plan`);
  }
  if (receipt.plan_digest !== plan.plan_digest) {
    refuse(`${operation} plan digest diverges from plan`);
  }
  if (receipt.digest_algorithm !== 'blake3') refuse(`${operation} must use BLAKE3`);
  if (receipt.artifacts.length === 0) refuse(`${operation} receipt has no artifacts`);
  requireUnique(receipt.artifacts, `${operation}.artifacts`);
  requireSafePaths(receipt.artifacts, `${operation} artifact`);
  requireDigest(receipt.digest, `${operation}.digest`);
}

export function admitTruexControlPlaneBblock(
  planValue: unknown,
  intentValue: unknown,
  resultValue: unknown,
): AdmittedGgenBblock {
  const plan = parsePlan(planValue);
  const intent = parseReceipt(intentValue, 'intent');
  const result = parseReceipt(resultValue, 'result');

  if (plan.schema !== PLAN_SCHEMA) refuse('plan schema is invalid');
  if (plan.requested_group !== REQUIRED_GROUP) {
    refuse(`requested group must be ${REQUIRED_GROUP}`);
  }
  if (!PROVIDERS.has(plan.provider)) refuse(`unsupported provider ${plan.provider}`);

  requireDigest(plan.catalog_digest, 'catalog_digest');
  requireDigest(plan.plan_digest, 'plan_digest');
  requireUnique(plan.resolved_groups, 'resolved_groups');
  requireUnique(plan.directories, 'directories');
  requireUnique(plan.packs, 'packs');
  requireSafePaths(plan.directories, 'output directory');

  for (const group of REQUIRED_GROUPS) {
    if (!plan.resolved_groups.includes(group)) {
      refuse(`missing required group ${group}`);
    }
  }
  for (const pack of REQUIRED_PACKS) {
    if (!plan.packs.includes(pack)) refuse(`missing required pack ${pack}`);
  }

  requireReceiptMatches(intent, 'plan-intent', plan);
  requireReceiptMatches(result, 'plan-result', plan);
  if (intent.previous_digest !== 'GENESIS' && !DIGEST.test(intent.previous_digest)) {
    refuse('intent previous digest is neither GENESIS nor a BLAKE3 digest');
  }
  if (result.previous_digest !== intent.digest) {
    refuse('result receipt does not causally follow the intent receipt');
  }

  const expectedPlan = `.ggen/bblocks/plans/${plan.provider}/${REQUIRED_GROUP}.json`;
  const expectedIntent = `.ggen/bblocks/receipts/${plan.provider}/${REQUIRED_GROUP}-plan-intent.json`;
  if (!intent.artifacts.includes(expectedPlan)) {
    refuse('intent receipt does not name the canonical ggen plan artifact');
  }
  if (!result.artifacts.includes(expectedPlan) || !result.artifacts.includes(expectedIntent)) {
    refuse('result receipt does not name the canonical plan and intent artifacts');
  }

  return Object.freeze({
    status: 'ADMITTED',
    provider: plan.provider,
    group: REQUIRED_GROUP,
    plan_digest: plan.plan_digest,
    receipt_digest: result.digest,
    resolved_groups: Object.freeze([...plan.resolved_groups]),
    packs: Object.freeze([...plan.packs]),
  });
}
