import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  TRUEX_CAPABILITIES,
  capabilityMapDigestInput,
  findDuplicateJsonKeys,
  getCapability,
  resolveCapabilityClosure,
  validateCapabilityRegistry,
  type CapabilityStanding,
  type TruexCapability,
} from '../src/capabilities.js';
import { hash } from '../skills/hash/mutations.js';

interface ProofReceipt {
  readonly schema: 'truex.capability.receipt.v1';
  readonly capability: string;
  readonly command: string;
  readonly exitCode: number | null;
  readonly standing: CapabilityStanding;
  readonly stdoutDigest: string;
  readonly stderrDigest: string;
  readonly receiptDigest: string;
  readonly observedAt: string;
}

interface PackageManifest {
  readonly scripts?: Record<string, string>;
  readonly repository?: string;
}

const root = process.cwd();

function effectiveProofCommand(item: TruexCapability): string | undefined {
  return item.kind === 'doctor-proof'
    ? `pnpm doctor:capability -- ${item.id.slice('doctor:'.length)}`
    : item.proofCommand;
}

function verifyRepository(): string[] {
  const validation = validateCapabilityRegistry();
  const errors = [...validation.errors];
  for (const item of TRUEX_CAPABILITIES) {
    if (!fs.existsSync(path.resolve(root, item.implementation))) errors.push(`${item.id} implementation missing: ${item.implementation}`);
  }
  const manifests = new Set(TRUEX_CAPABILITIES.filter((item) => item.implementation.endsWith('package.json')).map((item) => item.implementation));
  manifests.add('package.json');
  for (const manifest of manifests) {
    const absolute = path.resolve(root, manifest);
    if (!fs.existsSync(absolute)) continue;
    const source = fs.readFileSync(absolute, 'utf8');
    for (const duplicate of findDuplicateJsonKeys(source)) errors.push(`${manifest} duplicate key: ${duplicate}`);
    const parsed = JSON.parse(source) as PackageManifest;
    const capability = TRUEX_CAPABILITIES.find((item) => item.implementation === manifest && item.kind === 'typescript-package');
    if (capability?.buildCommand && !parsed.scripts?.build) errors.push(`${capability.id} has no build script`);
    if (capability?.proofCommand && !parsed.scripts?.test) errors.push(`${capability.id} has no test script`);
    if (parsed.scripts?.test?.includes('no test specified') || parsed.scripts?.test?.includes('exit 1')) errors.push(`${manifest} contains an intentionally failing test script`);
  }
  const rootPackage = JSON.parse(fs.readFileSync(path.resolve(root, 'package.json'), 'utf8')) as PackageManifest;
  if (!rootPackage.repository?.includes('seanchatmangpt/truex')) errors.push('root package repository metadata is stale');
  if (!rootPackage.scripts?.['doctor:capability']) errors.push('generic Doctor capability broker is not exposed');
  const rootIndex = fs.readFileSync(path.resolve(root, 'src/index.ts'), 'utf8');
  if (rootIndex.includes('return "works!"') || rootIndex.includes("return 'works!'")) errors.push('root public API is still the placeholder implementation');
  const workflow = fs.readFileSync(path.resolve(root, '.github/workflows/ci.yml'), 'utf8');
  if (workflow.indexOf('actions/setup-node') > workflow.indexOf('corepack enable')) errors.push('CI enables Corepack before setup-node');
  const mining = fs.readFileSync(path.resolve(root, 'crates/truex-kernel-cli/src/commands/mining.rs'), 'utf8');
  for (const forbidden of ['Mock model load', 'Simple mock parser', 'not yet supported in CLI']) {
    if (mining.includes(forbidden)) errors.push(`native process-mining CLI contains forbidden stub: ${forbidden}`);
  }
  return errors;
}

function map(): void {
  const validation = validateCapabilityRegistry();
  console.log(JSON.stringify({
    schema: 'truex.capability.map.v1',
    digest: hash(capabilityMapDigestInput()),
    total: TRUEX_CAPABILITIES.length,
    counts: validation.counts,
    capabilities: TRUEX_CAPABILITIES.map((item) => ({ ...item, effectiveProofCommand: effectiveProofCommand(item) })),
  }, null, 2));
}

function verify(): void {
  const errors = verifyRepository();
  if (errors.length > 0) {
    console.error(JSON.stringify({ status: 'BUILD_BROKEN', errors }, null, 2));
    process.exitCode = 1;
    return;
  }
  const validation = validateCapabilityRegistry();
  console.log(JSON.stringify({ status: 'ALIVE', total: TRUEX_CAPABILITIES.length, counts: validation.counts, mapDigest: hash(capabilityMapDigestInput()) }, null, 2));
}

function selectedCapabilities(args: readonly string[]): readonly TruexCapability[] {
  const ids = args.flatMap((arg, index) => arg === '--id' && args[index + 1] ? [args[index + 1]!] : []);
  if (args.includes('--all')) return TRUEX_CAPABILITIES.filter((item) => effectiveProofCommand(item));
  if (ids.length > 0) {
    const selected = new Map<string, TruexCapability>();
    for (const id of ids) for (const item of resolveCapabilityClosure(id)) selected.set(item.id, item);
    return [...selected.values()].filter((item) => effectiveProofCommand(item));
  }
  return ['doctor:hash', 'doctor:signature', 'doctor:receipt', 'doctor:replay', 'doctor:engine', 'doctor:sqlite']
    .flatMap((id) => resolveCapabilityClosure(id))
    .filter((item, index, all) => effectiveProofCommand(item) && all.findIndex((candidate) => candidate.id === item.id) === index);
}

function issueReceipt(item: TruexCapability, command: string, exitCode: number | null, stdout: string, stderr: string): ProofReceipt {
  const standing: CapabilityStanding = exitCode === 0 ? 'ALIVE' : exitCode === 2 ? 'BLOCKED' : exitCode === null ? 'BLOCKED' : 'BUILD_BROKEN';
  const body = { schema: 'truex.capability.receipt.v1' as const, capability: item.id, command, exitCode, standing, stdoutDigest: hash(stdout), stderrDigest: hash(stderr) };
  return Object.freeze({ ...body, receiptDigest: hash(body), observedAt: new Date().toISOString() });
}

function prove(args: readonly string[]): void {
  const errors = verifyRepository();
  if (errors.length > 0) throw new Error(`CAPABILITY_MAP_REFUSED: ${errors.join('; ')}`);
  const receipts: ProofReceipt[] = [];
  for (const item of selectedCapabilities(args)) {
    const command = effectiveProofCommand(item)!;
    const result = spawnSync(command, { cwd: root, shell: true, encoding: 'utf8', env: { ...process.env, TSX_DISABLE_CACHE: '1' }, timeout: 10 * 60 * 1000, maxBuffer: 16 * 1024 * 1024 });
    const receipt = issueReceipt(item, command, result.status, result.stdout ?? '', result.stderr ?? result.error?.message ?? '');
    receipts.push(receipt);
    console.log(JSON.stringify(receipt));
  }
  const body = { schema: 'truex.capability.run.v1', mapDigest: hash(capabilityMapDigestInput()), receipts: receipts.map(({ observedAt: _observedAt, ...receipt }) => receipt) };
  const run = { ...body, runDigest: hash(body), observedAt: new Date().toISOString() };
  const directory = path.resolve(root, '.truex/capabilities');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, `${run.runDigest}.json`), `${JSON.stringify(run, null, 2)}\n`);
  if (receipts.some((receipt) => receipt.standing !== 'ALIVE')) process.exitCode = 1;
}

const [command = 'verify', ...args] = process.argv.slice(2);
switch (command) {
  case 'map': map(); break;
  case 'verify': verify(); break;
  case 'prove': prove(args); break;
  default:
    getCapability(command);
    throw new Error(`Unknown capabilities command: ${command}`);
}
