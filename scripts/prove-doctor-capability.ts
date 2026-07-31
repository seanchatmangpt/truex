import { hash } from '../skills/hash/mutations.js';
import { proveSignature } from '../skills/signature/proofs.js';
import { DoctorAgent, type TruexProofReport } from '../agents/doctor/agent.js';

const primitive = process.argv[2];
if (!primitive) throw new Error('Doctor capability ID is required');

const blockedLegacy = new Map<string, string>([
  ['doctor-wizard-telco-unified', 'legacy proof mutates elapsed time and writes mock agent reports'],
  ['telemetry-integration', 'proof requires an admitted operations-and-receipts fixture'],
  ['unified-integration', 'legacy integration delegates through the mocked unified flow'],
  ['capability-breakpoints', 'legacy proof can continue after a failed Vitest execution by reading stale reports'],
]);

const doctor = new DoctorAgent();

async function runOne(id: string): Promise<TruexProofReport> {
  if (id === 'signature') {
    const report = proveSignature();
    return {
      primitive: id,
      passed: report.passed,
      invariants: [...report.invariants],
      failures: [...report.failures],
      timings: {},
      receiptHash: report.receiptHash,
    };
  }
  const reason = blockedLegacy.get(id);
  if (reason) {
    return {
      primitive: id,
      passed: false,
      invariants: [],
      failures: [`BLOCKED: ${reason}`],
      timings: {},
      receiptHash: hash({ primitive: id, standing: 'BLOCKED', reason }),
    };
  }
  return doctor.prove(id, { skipWrite: true });
}

async function compose(id: string, dependencies: readonly string[]): Promise<TruexProofReport> {
  const reports: TruexProofReport[] = [];
  for (const dependency of dependencies) reports.push(await runOne(dependency));
  const failures = reports.flatMap((report) => report.passed ? [] : report.failures.map((failure) => `${report.primitive}: ${failure}`));
  const body = {
    schema: 'truex.doctor.composition.v1',
    primitive: id,
    dependencies: reports.map((report) => ({
      primitive: report.primitive,
      passed: report.passed,
      receiptHash: report.receiptHash ?? null,
    })),
  };
  return {
    primitive: id,
    passed: failures.length === 0,
    failures,
    invariants: reports.flatMap((report) => report.invariants.map((invariant) => `${report.primitive}: ${invariant}`)),
    timings: {},
    receiptHash: hash(body),
  };
}

let report: TruexProofReport;
if (primitive === 'ecosystem') {
  report = await compose('ecosystem', ['hash', 'signature', 'receipt', 'replay', 'engine', 'sqlite', 'membrane', 'hook', 'topology']);
} else if (primitive === 'finalization') {
  const ecosystem = await compose('ecosystem', ['hash', 'signature', 'receipt', 'replay', 'engine', 'sqlite', 'membrane', 'hook', 'topology']);
  const mailbox = await runOne('mailbox');
  const architecture = await runOne('architecture');
  const failures = [ecosystem, mailbox, architecture].flatMap((item) => item.passed ? [] : item.failures.map((failure) => `${item.primitive}: ${failure}`));
  const body = {
    schema: 'truex.finalization.receipt.v1',
    dependencies: [ecosystem, mailbox, architecture].map((item) => ({ primitive: item.primitive, passed: item.passed, receiptHash: item.receiptHash ?? null })),
  };
  report = {
    primitive: 'finalization',
    passed: failures.length === 0,
    failures,
    invariants: [
      ...ecosystem.invariants,
      ...mailbox.invariants.map((item) => `mailbox: ${item}`),
      ...architecture.invariants.map((item) => `architecture: ${item}`),
    ],
    timings: {},
    receiptHash: hash(body),
  };
} else {
  report = await runOne(primitive);
}

console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = report.failures.some((failure) => failure.startsWith('BLOCKED:')) ? 2 : 1;
