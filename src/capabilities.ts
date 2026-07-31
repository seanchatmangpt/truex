export type CapabilityStanding =
  | 'PARTIAL_ALIVE'
  | 'ALIVE'
  | 'BLOCKED'
  | 'BUILD_BROKEN'
  | 'UNKNOWN'
  | 'UNSUPPORTED';

export type CapabilityKind =
  | 'typescript-package'
  | 'rust-crate'
  | 'doctor-proof'
  | 'wizard-verb'
  | 'telco-verb'
  | 'process-mining-verb'
  | 'integration';

export interface TruexCapability {
  readonly id: string;
  readonly title: string;
  readonly kind: CapabilityKind;
  readonly layer: string;
  readonly implementation: string;
  readonly dependsOn: readonly string[];
  readonly buildCommand?: string;
  readonly proofCommand?: string;
  readonly declaredStanding: CapabilityStanding;
  readonly boundary?: string;
}

const capability = (
  value: Omit<TruexCapability, 'declaredStanding'> & {
    declaredStanding?: CapabilityStanding;
  },
): TruexCapability => Object.freeze({ declaredStanding: 'UNKNOWN', ...value });

const tsPackages: readonly TruexCapability[] = [
  capability({ id: 'ts:contracts', title: 'Runtime contracts and receipt schemas', kind: 'typescript-package', layer: 'S-2', implementation: 'packages/contracts/package.json', dependsOn: [], buildCommand: 'pnpm --filter @truex/contracts build', proofCommand: 'pnpm --filter @truex/contracts test' }),
  capability({ id: 'ts:membrane', title: 'Deterministic membrane and operational primitives', kind: 'typescript-package', layer: 'S0-S6', implementation: 'packages/membrane/package.json', dependsOn: ['ts:contracts'], buildCommand: 'pnpm --filter @truex/membrane build', proofCommand: 'pnpm vitest run packages/membrane/test' }),
  capability({ id: 'ts:config', title: 'Configuration admission and provenance', kind: 'typescript-package', layer: 'S0', implementation: 'packages/config/package.json', dependsOn: ['ts:contracts'], buildCommand: 'pnpm --filter @truex/config build', proofCommand: 'pnpm --filter @truex/config test' }),
  capability({ id: 'ts:kernel-wasm', title: 'Generated WebAssembly kernel binding', kind: 'typescript-package', layer: 'S1', implementation: 'packages/kernel-wasm/package.json', dependsOn: ['rust:truex-kernel'], buildCommand: 'pnpm --filter @truex/kernel-wasm build', proofCommand: 'pnpm --filter @truex/kernel-wasm test', boundary: 'Generated pkg output must be produced by wasm-pack, never hand edited.' }),
  capability({ id: 'ts:ml', title: 'Native process-mining ML facade', kind: 'typescript-package', layer: 'S2', implementation: 'packages/ml/package.json', dependsOn: ['ts:contracts'], buildCommand: 'pnpm --filter @truex/ml build', proofCommand: 'pnpm --filter @truex/ml test' }),
  capability({ id: 'ts:planner', title: 'Planning and optimization', kind: 'typescript-package', layer: 'S2', implementation: 'packages/planner/package.json', dependsOn: ['ts:contracts'], buildCommand: 'pnpm --filter @truex/planner build', proofCommand: 'pnpm --filter @truex/planner test' }),
  capability({ id: 'ts:kernel', title: 'Process-mining kernel facade', kind: 'typescript-package', layer: 'S3', implementation: 'packages/kernel/package.json', dependsOn: ['ts:contracts', 'ts:membrane', 'ts:kernel-wasm', 'ts:ml', 'ts:planner'], buildCommand: 'pnpm --filter @truex/kernel build', proofCommand: 'pnpm --filter @truex/kernel test' }),
  capability({ id: 'ts:observability', title: 'Non-blocking OTEL projection', kind: 'typescript-package', layer: 'S3', implementation: 'packages/observability/package.json', dependsOn: ['ts:contracts'], buildCommand: 'pnpm --filter @truex/observability build', proofCommand: 'pnpm --filter @truex/observability test' }),
  capability({ id: 'ts:storehouse', title: 'Deterministic stewardship receipting', kind: 'typescript-package', layer: 'S4', implementation: 'packages/storehouse/package.json', dependsOn: ['ts:membrane'], buildCommand: 'pnpm --filter @truex/storehouse build', proofCommand: 'pnpm --filter @truex/storehouse test' }),
  capability({ id: 'ts:vow', title: 'Eight-state closure membrane', kind: 'typescript-package', layer: 'S4', implementation: 'packages/vow/package.json', dependsOn: ['ts:membrane'], buildCommand: 'pnpm --filter @truex/vow build', proofCommand: 'pnpm --filter @truex/vow test' }),
  capability({ id: 'ts:engine', title: 'Receipted lifecycle engine', kind: 'typescript-package', layer: 'S5', implementation: 'packages/engine/package.json', dependsOn: ['ts:config', 'ts:contracts', 'ts:observability', 'ts:storehouse'], buildCommand: 'pnpm --filter @truex/engine build', proofCommand: 'pnpm --filter @truex/engine test' }),
  capability({ id: 'ts:agents', title: 'Eight adversarial process-mining agents', kind: 'typescript-package', layer: 'S6', implementation: 'packages/agents/package.json', dependsOn: ['ts:contracts', 'ts:kernel', 'ts:engine'], buildCommand: 'pnpm --filter @truex/agents build', proofCommand: 'pnpm --filter @truex/agents test' }),
  capability({ id: 'ts:cognition', title: 'Rust-backed cognition facade', kind: 'typescript-package', layer: 'S6', implementation: 'packages/cognition/package.json', dependsOn: ['ts:contracts', 'rust:truex-kernel-cognition'], buildCommand: 'pnpm --filter @truex/cognition build', proofCommand: 'pnpm --filter @truex/cognition test' }),
  capability({ id: 'ts:swarm', title: 'Autonomic swarm coordinator', kind: 'typescript-package', layer: 'S7', implementation: 'packages/swarm/package.json', dependsOn: ['ts:contracts', 'ts:kernel', 'ts:observability'], buildCommand: 'pnpm --filter @truex/swarm build', proofCommand: 'pnpm --filter @truex/swarm test', boundary: 'Network/model providers are downstream effects and cannot establish core standing.' }),
  capability({ id: 'ts:testing', title: 'Fixtures and CLI verification harness', kind: 'typescript-package', layer: 'S-2', implementation: 'packages/testing/package.json', dependsOn: ['ts:contracts', 'ts:swarm'], buildCommand: 'pnpm --filter @truex/testing build', proofCommand: 'pnpm --filter @truex/testing test' }),
  capability({ id: 'ts:supabase', title: 'Optional Supabase receipt projection', kind: 'typescript-package', layer: 'S8', implementation: 'packages/supabase/package.json', dependsOn: ['ts:contracts'], buildCommand: 'pnpm --filter @truex/supabase build', proofCommand: 'pnpm --filter @truex/supabase test', boundary: 'Optional downstream projection; forbidden from owning admission or receipt truth.' }),
  capability({ id: 'ts:examples-zoe-la', title: 'ZOE LA integration example', kind: 'typescript-package', layer: 'S9', implementation: 'packages/examples-zoe-la/package.json', dependsOn: ['ts:cognition', 'ts:kernel'], buildCommand: 'pnpm --filter @truex/examples-zoe-la build', proofCommand: 'pnpm --filter @truex/examples-zoe-la test' }),
];

const rustCrates: readonly TruexCapability[] = [
  ['truex-kernel-types', 'Canonical event-log and process-model types', []],
  ['truex-kernel-utils', 'Kernel utility primitives', ['rust:truex-kernel-types']],
  ['truex-kernel-macros', 'Kernel procedural macros', []],
  ['truex-kernel-algos', 'Deterministic process-mining algorithms', ['rust:truex-kernel-types']],
  ['tps-metrics', 'Toyota Production System metrics', ['rust:truex-kernel-types']],
  ['miniml-core', 'Minimal native ML kernel', ['rust:truex-kernel-types']],
  ['prolog8', 'Bounded logic engine', ['rust:truex-kernel-types']],
  ['insa-replaw', 'Eight-state closure law', ['rust:truex-kernel-types']],
  ['truex-kernel-cognition', 'Cognition kernel', ['rust:truex-kernel-types', 'rust:prolog8', 'rust:miniml-core']],
  ['truex-kernel', 'WASM process-mining kernel', ['rust:truex-kernel-types', 'rust:truex-kernel-algos', 'rust:truex-kernel-utils']],
  ['truex-kernel-cli', 'Native wpm process-mining CLI', ['rust:truex-kernel', 'rust:truex-kernel-algos', 'rust:truex-kernel-types']],
].map(([name, title, dependsOn]) => capability({
  id: `rust:${name}`,
  title: title as string,
  kind: 'rust-crate',
  layer: name === 'truex-kernel-cli' ? 'S5' : 'S0-S4',
  implementation: `crates/${name}/Cargo.toml`,
  dependsOn: dependsOn as string[],
  buildCommand: `cargo build -p ${name}`,
  proofCommand: `cargo test -p ${name}`,
}));

const doctorDefinitions: readonly [string, string, string[]][] = [
  ['hash', 'BLAKE3 deterministic hashing', []],
  ['signature', 'ML-DSA signature generation and verification', ['doctor:hash']],
  ['receipt', 'Receipt integrity and lineage', ['doctor:hash', 'doctor:signature']],
  ['replay', 'Replay convergence and divergence refusal', ['doctor:receipt']],
  ['engine', 'GraphDelta to effect operational law', ['doctor:replay']],
  ['sqlite', 'SQLite transactional consequence', ['doctor:engine']],
  ['membrane', 'State isolation and rollback membrane', ['doctor:engine']],
  ['membrane-replay', 'WAL reconstruction and replay', ['doctor:membrane', 'doctor:sqlite']],
  ['adapter', 'External proposal admission adapter', ['doctor:membrane']],
  ['hook', 'Condition-effect-receipt-replay atom', ['doctor:engine', 'doctor:receipt', 'doctor:replay']],
  ['repository', 'Repository doctrine and task validation', ['doctor:hash']],
  ['ontology', 'Physical-file to operational-ontology mapping', ['doctor:repository']],
  ['architecture', 'Grounded architecture projection', ['doctor:ontology']],
  ['benchmark', 'Tiered hook runtime benchmark', ['doctor:hook']],
  ['hook-otp', 'Local mailbox and supervision equivalence', ['doctor:hook', 'doctor:sqlite']],
  ['topology', 'Causal hook topology and storm refusal', ['doctor:hook', 'doctor:replay']],
  ['otp-breakpoints', 'Mailbox, supervision, quarantine and replay breakpoints', ['doctor:hook-otp', 'doctor:topology']],
  ['capability-breakpoints', 'ACL, transaction, tenant and audit breakpoints', ['doctor:membrane', 'doctor:replay']],
  ['mailbox', 'Persistent mailbox queue-state discipline', ['doctor:sqlite', 'doctor:receipt']],
  ['wasm', 'WASM kernel reachability', ['ts:kernel-wasm']],
  ['ledger', 'Concurrent WASM-to-SQLite ledger', ['doctor:wasm', 'doctor:sqlite']],
  ['telco', 'OCEL transition ingestion and receipt envelope', ['doctor:receipt']],
  ['telco-ingest', 'Telco ingestion path', ['doctor:telco']],
  ['telco-validate', 'Telco tamper detection', ['doctor:telco-ingest']],
  ['wizard-contracts', 'Wizard command contracts', ['doctor:repository']],
  ['wizard-map', 'Wizard project topology mapping', ['doctor:wizard-contracts']],
  ['wizard-plan', 'Wizard checkpoint planning', ['doctor:wizard-map']],
  ['wizard', 'Wizard transaction simulation', ['doctor:membrane']],
  ['wizard-simulate', 'Wizard counterfactual rollback', ['doctor:wizard']],
  ['wizard-walkthrough', 'Wizard sequential commit and rollback', ['doctor:wizard-simulate']],
  ['project-evidence-types', 'Object-centric project evidence types', ['doctor:ontology']],
  ['project-evidence-gapclose', 'Project evidence gap discovery and repair', ['doctor:project-evidence-types']],
  ['project-wizard-complete', 'Complete project wizard proof', ['doctor:wizard-plan', 'doctor:wizard-walkthrough']],
  ['doctest', 'Documentation executable examples', ['doctor:repository']],
  ['reactive-lifecycle', 'Reactive lifecycle', ['doctor:hook-otp', 'doctor:mailbox']],
  ['lifecycle-benchmarks', 'Wizard and telco lifecycle benchmarks', ['doctor:reactive-lifecycle']],
  ['telemetry-integration', 'Wizard, telco and Doctor telemetry lineage', ['doctor:telco', 'doctor:wizard']],
  ['doctor-wizard-telco-unified', 'Doctor-Wizard-Telco unified flow', ['doctor:telemetry-integration']],
  ['unified-integration', 'Unified integration proof', ['doctor:doctor-wizard-telco-unified']],
  ['unified-benchmarks', 'Unified benchmark proof', ['doctor:lifecycle-benchmarks']],
  ['ecosystem', 'Dependency-closed ecosystem proof', ['doctor:hash', 'doctor:signature', 'doctor:receipt', 'doctor:replay', 'doctor:engine', 'doctor:sqlite', 'doctor:membrane', 'doctor:hook', 'doctor:topology']],
  ['finalization', 'Release finalization gate', ['doctor:ecosystem', 'doctor:mailbox', 'doctor:architecture']],
];

const doctorProofs = doctorDefinitions.map(([id, title, dependsOn]) => capability({
  id: `doctor:${id}`,
  title,
  kind: 'doctor-proof',
  layer: id === 'finalization' ? 'CROWN' : 'S0-S13',
  implementation: 'agents/doctor/agent.ts',
  dependsOn,
  proofCommand: `pnpm truex doctor prove ${id}`,
}));

const wizardVerbs = ['init', 'map', 'plan', 'forge', 'bind', 'prove', 'harden', 'handoff', 'simulate', 'walkthrough'].map((verb, index) => capability({
  id: `wizard:${verb}`,
  title: `Wizard ${verb}`,
  kind: 'wizard-verb',
  layer: `W${Math.min(index + 1, 8)}`,
  implementation: 'scripts/truex.ts',
  dependsOn: index === 0 ? ['doctor:repository'] : [`wizard:${['init', 'map', 'plan', 'forge', 'bind', 'prove', 'harden', 'handoff', 'simulate'][index - 1]}`],
  proofCommand: 'pnpm vitest run packages/membrane/test/project-wizard',
}));

const operationalVerbs: readonly TruexCapability[] = [
  capability({ id: 'telco:ingest', title: 'Telco OCEL ingestion', kind: 'telco-verb', layer: 'S8', implementation: 'scripts/truex.ts', dependsOn: ['doctor:telco-ingest'], proofCommand: 'pnpm truex telco ingest' }),
  capability({ id: 'telco:validate', title: 'Telco OCEL validation', kind: 'telco-verb', layer: 'S8', implementation: 'scripts/truex.ts', dependsOn: ['telco:ingest', 'doctor:telco-validate'], proofCommand: 'pnpm truex telco validate' }),
  capability({ id: 'pm:discover', title: 'Process discovery CLI', kind: 'process-mining-verb', layer: 'S5', implementation: 'crates/truex-kernel-cli/src/commands/mining.rs', dependsOn: ['rust:truex-kernel-cli'], proofCommand: 'cargo test -p truex-kernel-cli --test mining_cli' }),
  capability({ id: 'pm:conform', title: 'Conformance checking CLI', kind: 'process-mining-verb', layer: 'S5', implementation: 'crates/truex-kernel-cli/src/commands/mining.rs', dependsOn: ['pm:discover'], proofCommand: 'cargo test -p truex-kernel-cli --test mining_cli' }),
  capability({ id: 'integration:ggen-bblock', title: 'ggen control-plane bblock admission', kind: 'integration', layer: 'S4', implementation: 'packages/storehouse/src/ggen-bblock.ts', dependsOn: ['ts:storehouse'], proofCommand: 'pnpm doctor:ggen-bblock' }),
  capability({ id: 'integration:genesis', title: 'Genesis Foundry replay proof', kind: 'integration', layer: 'S5', implementation: 'examples/genesis-foundry.ts', dependsOn: ['ts:storehouse', 'ts:vow', 'integration:ggen-bblock'], proofCommand: 'pnpm proof:genesis' }),
];

export const TRUEX_CAPABILITIES: readonly TruexCapability[] = Object.freeze([
  ...tsPackages,
  ...rustCrates,
  ...doctorProofs,
  ...wizardVerbs,
  ...operationalVerbs,
]);

export interface CapabilityValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly counts: Readonly<Record<CapabilityKind, number>>;
}

export function validateCapabilityRegistry(capabilities: readonly TruexCapability[] = TRUEX_CAPABILITIES): CapabilityValidation {
  const errors: string[] = [];
  const ids = new Set<string>();
  const byId = new Map<string, TruexCapability>();
  for (const item of capabilities) {
    if (!/^[a-z][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/.test(item.id)) errors.push(`invalid capability id: ${item.id}`);
    if (ids.has(item.id)) errors.push(`duplicate capability id: ${item.id}`);
    ids.add(item.id);
    byId.set(item.id, item);
    if (!item.title.trim()) errors.push(`empty title: ${item.id}`);
    if (!item.implementation.trim() || item.implementation.startsWith('/') || item.implementation.split('/').includes('..')) errors.push(`unsafe implementation path: ${item.id}`);
    if (item.declaredStanding === 'ALIVE' && !item.proofCommand) errors.push(`ALIVE capability has no proof command: ${item.id}`);
  }
  for (const item of capabilities) for (const dependency of item.dependsOn) {
    if (!byId.has(dependency)) errors.push(`${item.id} depends on unknown ${dependency}`);
    if (dependency === item.id) errors.push(`${item.id} depends on itself`);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string, route: string[]): void => {
    if (visited.has(id)) return;
    if (visiting.has(id)) { errors.push(`capability dependency cycle: ${[...route, id].join(' -> ')}`); return; }
    visiting.add(id);
    for (const dependency of byId.get(id)?.dependsOn ?? []) visit(dependency, [...route, id]);
    visiting.delete(id);
    visited.add(id);
  };
  for (const item of capabilities) visit(item.id, []);
  const kinds: CapabilityKind[] = ['typescript-package', 'rust-crate', 'doctor-proof', 'wizard-verb', 'telco-verb', 'process-mining-verb', 'integration'];
  const counts = Object.fromEntries(kinds.map((kind) => [kind, capabilities.filter((item) => item.kind === kind).length])) as Record<CapabilityKind, number>;
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze(counts) });
}

export function getCapability(id: string): TruexCapability {
  const item = TRUEX_CAPABILITIES.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`UNKNOWN_CAPABILITY: ${id}`);
  return item;
}

export function resolveCapabilityClosure(id: string): readonly TruexCapability[] {
  const ordered: TruexCapability[] = [];
  const visited = new Set<string>();
  const visit = (current: string): void => {
    if (visited.has(current)) return;
    const item = getCapability(current);
    for (const dependency of item.dependsOn) visit(dependency);
    visited.add(current);
    ordered.push(item);
  };
  visit(id);
  return Object.freeze(ordered);
}

export function capabilityMapDigestInput(): readonly object[] {
  return Object.freeze(TRUEX_CAPABILITIES.map(({ declaredStanding: _standing, ...item }) => Object.freeze(item)));
}

export function findDuplicateJsonKeys(source: string): readonly string[] {
  let index = 0;
  const duplicates: string[] = [];
  const whitespace = (): void => { while (/\s/.test(source[index] ?? '')) index += 1; };
  const parseString = (): string => {
    const start = index;
    index += 1;
    while (index < source.length) {
      if (source[index] === '\\') index += 2;
      else if (source[index] === '"') { index += 1; return JSON.parse(source.slice(start, index)); }
      else index += 1;
    }
    throw new Error('unterminated JSON string');
  };
  const skipPrimitive = (): void => { while (index < source.length && !/[\s,}\]]/.test(source[index]!)) index += 1; };
  const parseValue = (path: string): void => {
    whitespace();
    if (source[index] === '{') parseObject(path);
    else if (source[index] === '[') parseArray(path);
    else if (source[index] === '"') void parseString();
    else skipPrimitive();
  };
  const parseArray = (path: string): void => {
    index += 1;
    let position = 0;
    while (index < source.length) {
      whitespace();
      if (source[index] === ']') { index += 1; return; }
      parseValue(`${path}[${position}]`);
      position += 1;
      whitespace();
      if (source[index] === ',') index += 1;
    }
  };
  const parseObject = (path: string): void => {
    index += 1;
    const keys = new Set<string>();
    while (index < source.length) {
      whitespace();
      if (source[index] === '}') { index += 1; return; }
      if (source[index] !== '"') throw new Error(`expected JSON key at ${index}`);
      const key = parseString();
      const qualified = path ? `${path}.${key}` : key;
      if (keys.has(key)) duplicates.push(qualified);
      keys.add(key);
      whitespace();
      if (source[index] !== ':') throw new Error(`expected ':' after ${qualified}`);
      index += 1;
      parseValue(qualified);
      whitespace();
      if (source[index] === ',') index += 1;
    }
  };
  whitespace();
  parseValue('');
  whitespace();
  if (index !== source.length) throw new Error(`unexpected JSON suffix at ${index}`);
  return Object.freeze(duplicates);
}
