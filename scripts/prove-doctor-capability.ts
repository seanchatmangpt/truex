import { hash } from '../skills/hash/mutations.js';
import { proveSignature } from '../skills/signature/proofs.js';
import {
  proveOperationalCapabilityBreakpoints,
  proveOperationalDoctorWizardTelcoUnified,
  proveOperationalTelemetryIntegration,
  proveOperationalUnifiedIntegration,
} from '../skills/integration/operational-proofs.js';
import { DoctorAgent, type TruexProofReport } from '../agents/doctor/agent.js';

const primitive = process.argv[2];
if (!primitive) throw new Error('Doctor capability ID is required');

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
  if (id === 'doctor-wizard-telco-unified') return proveOperationalDoctorWizardTelcoUnified();
  if (id === 'telemetry-integration') return proveOperationalTelemetryIntegration();
  if (id === 'unified-integration') return proveOperationalUnifiedIntegration();
  if (id === 'capability-breakpoints') return proveOperationalCapabilityBreakpoints();
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
  const unified = await runOne('unified-integration');
  const breakpoints = await runOne('capability-breakpoints');
  const dependencies = [ecosystem, mailbox, architecture, unified, breakpoints];
  const failures = dependencies.flatMap((item) => item.passed ? [] : item.failures.map((failure) => `${item.primitive}: ${failure}`));
  const body = {
    schema: 'truex.finalization.receipt.v1',
    dependencies: dependencies.map((item) => ({ primitive: item.primitive, passed: item.passed, receiptHash: item.receiptHash ?? null })),
  };
  report = {
    primitive: 'finalization',
    passed: failures.length === 0,
    failures,
    invariants: dependencies.flatMap((item) => item.invariants.map((invariant) => `${item.primitive}: ${invariant}`)),
    timings: {},
    receiptHash: hash(body),
  };
} else {
  report = await runOne(primitive);
}

console.log(JSON.stringify(report, null, 2));
if (!report.passed) process.exitCode = 1;
