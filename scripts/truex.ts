import { defineCommand, runMain } from 'citty';
import { DoctorAgent } from '../agents/doctor/agent.js';

const hashCommand = defineCommand({
  meta: {
    name: 'hash',
    description: 'Prove that hashing is an independent deterministic operational primitive.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove(
"hash");
    if (!report.passed) throw new Error("Hash proof failed");
  }
});

const signatureCommand = defineCommand({
  meta: {
    name: 'signature',
    description: 'Prove that ML-DSA PQC signature is an independent operational primitive.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove(
"signature");
    if (!report.passed) throw new Error("Signature proof failed");
  }
});

const receiptCommand = defineCommand({
  meta: {
    name: 'receipt',
    description: 'Prove that a receipt is an independent operational primitive for unforgeable chaining.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove(
"receipt");
    if (!report.passed) throw new Error("Receipt proof failed");
  }
});

const replayCommand = defineCommand({
  meta: {
    name: 'replay',
    description: 'Prove that replay is an independent functional convergence check.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove(
"replay");
    if (!report.passed) throw new Error("Replay proof failed");
  }
});

const engineCommand = defineCommand({
  meta: {
    name: 'engine',
    description: 'Prove the pure operational law (delta → condition → effect → deterministic output → replay → refusal).',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove(
"engine");
    if (!report.passed) throw new Error("Engine proof failed");
  }
});

const sqliteCommand = defineCommand({
  meta: {
    name: 'sqlite',
    description: 'Prove the smallest SQLite-backed Gall Truex lifecycle works.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove(
"sqlite");
    if (!report.passed) throw new Error("SQLite proof failed");
  }
});

const membraneCommand = defineCommand({
  meta: {
    name: 'membrane',
    description: 'Prove that the membrane boundary successfully isolates states, refuses prototype changes, and rollbacks correctly.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove(
"membrane");
    if (!report.passed) throw new Error("Membrane proof failed");
  }
});

const membraneReplayCommand = defineCommand({
  meta: {
    name: 'membrane-replay',
    description: 'Prove membrane WAL persistence and transactional journal replay.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("membrane-replay");
    if (!report.passed) throw new Error("Membrane replay proof failed");
  }
});

const adapterCommand = defineCommand({
  meta: {
    name: 'adapter',
    description: 'Prove that the TRUEX Operational Adapter successfully isolates and governs external agent proposals.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove(
"adapter");
    if (!report.passed) throw new Error("Adapter proof failed");
  }
});

const hookCommand = defineCommand({
  meta: {
    name: 'hook',
    description: 'Prove that the Hook is the fundamental Truex atom (condition + effect + receipt + replay).',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove(
"hook");
    if (!report.passed) throw new Error("Hook proof failed");
  }
});

const repositoryCommand = defineCommand({
  meta: {
    name: 'repository',
    description: 'Enforce correct agent behavior by validating repository skills and task files.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove(
"repository");
    if (!report.passed) throw new Error("Repository proof failed");
  }
});

const benchmarkCommand = defineCommand({
  meta: {
    name: 'benchmark',
    description: 'Run tiered runtime benchmarks (T0-T3).',
  },
  args: {
    case: {
      type: 'string',
      description: 'The benchmark case study to execute',
      default: 'million-hook-church'
    }
  },
  async run({ args }) {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("benchmark", { case: args.case });
    if (!report.passed) throw new Error("Benchmark failed");
  }
});

const hookOtpCommand = defineCommand({
  meta: {
    name: 'hook-otp',
    description: 'Prove local OTP-equivalent properties (actor isolation, mailbox FIFO, supervisor restarts, and quarantine).',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("hook-otp");
    if (!report.passed) throw new Error("Hook OTP proof failed");
  }
});

const ecosystemCommand = defineCommand({
  meta: {
    name: 'ecosystem',
    description: 'Prove ecosystem convergence and generate full report.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("ecosystem");
    if (!report.passed) throw new Error("Ecosystem proof failed");
  }
});

const topologyCommand = defineCommand({
  meta: {
    name: 'topology',
    description: 'Prove the recursive cascading hook topology, causal receipt chain lineage, and storm mitigation limits.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("topology");
    if (!report.passed) throw new Error("Topology proof failed");
  }
});

const ontologyCommand = defineCommand({
  meta: {
    name: 'ontology',
    description: 'Prove 100% mapping of physical files to Gall Operational Ontology.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("ontology");
    if (!report.passed) throw new Error("Ontology proof failed");
  }
});

const proveCommand = defineCommand({
  meta: {
    name: 'prove',
    description: 'Prove Truex concepts',
  },
  subCommands: {
    hash: hashCommand,
    signature: signatureCommand,
    sqlite: sqliteCommand,
    engine: engineCommand,
    receipt: receiptCommand,
    replay: replayCommand,
    membrane: membraneCommand,
    "membrane-replay": membraneReplayCommand,
    adapter: adapterCommand,
    hook: hookCommand,
    repository: repositoryCommand,
    benchmark: benchmarkCommand,
    "hook-otp": hookOtpCommand,
    ecosystem: ecosystemCommand,
    topology: topologyCommand,
    ontology: ontologyCommand
  }
});

const doctorCommand = defineCommand({
  meta: {
    name: 'doctor',
    description: 'Diagnose and verify the truex architecture',
  },
  subCommands: {
    prove: proveCommand
  }
});

const mainCommand = defineCommand({
  meta: {
    name: 'truex',
    description: 'Truex CLI',
  },
  subCommands: {
    doctor: doctorCommand
  }
});

runMain(mainCommand);
