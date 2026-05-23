import { defineCommand, runMain } from 'citty';
import { DoctorAgent } from '../agents/doctor/agent.js';

const hashCommand = defineCommand({
  meta: {
    name: 'hash',
    description: 'Prove that hashing is an independent deterministic operational primitive.',
  },
  run() {
    const doctor = new DoctorAgent();
    const report = doctor.prove("hash");
    if (!report.passed) throw new Error("Hash proof failed");
  }
});

const signatureCommand = defineCommand({
  meta: {
    name: 'signature',
    description: 'Prove that ML-DSA PQC signature is an independent operational primitive.',
  },
  run() {
    const doctor = new DoctorAgent();
    const report = doctor.prove("signature");
    if (!report.passed) throw new Error("Signature proof failed");
  }
});

const receiptCommand = defineCommand({
  meta: {
    name: 'receipt',
    description: 'Prove that a receipt is an independent operational primitive for unforgeable chaining.',
  },
  run() {
    const doctor = new DoctorAgent();
    const report = doctor.prove("receipt");
    if (!report.passed) throw new Error("Receipt proof failed");
  }
});

const replayCommand = defineCommand({
  meta: {
    name: 'replay',
    description: 'Prove that replay is an independent functional convergence check.',
  },
  run() {
    const doctor = new DoctorAgent();
    const report = doctor.prove("replay");
    if (!report.passed) throw new Error("Replay proof failed");
  }
});

const engineCommand = defineCommand({
  meta: {
    name: 'engine',
    description: 'Prove the pure operational law (delta → condition → effect → deterministic output → replay → refusal).',
  },
  run() {
    const doctor = new DoctorAgent();
    const report = doctor.prove("engine");
    if (!report.passed) throw new Error("Engine proof failed");
  }
});

const sqliteCommand = defineCommand({
  meta: {
    name: 'sqlite',
    description: 'Prove the smallest SQLite-backed Gall Truex lifecycle works.',
  },
  run() {
    const doctor = new DoctorAgent();
    const report = doctor.prove("sqlite");
    if (!report.passed) throw new Error("SQLite proof failed");
  }
});

const membraneCommand = defineCommand({
  meta: {
    name: 'membrane',
    description: 'Prove that the membrane boundary successfully isolates states, refuses prototype changes, and rollbacks correctly.',
  },
  run() {
    const doctor = new DoctorAgent();
    const report = doctor.prove("membrane");
    if (!report.passed) throw new Error("Membrane proof failed");
  }
});

const adapterCommand = defineCommand({
  meta: {
    name: 'adapter',
    description: 'Prove that the TRUEX Operational Adapter successfully isolates and governs external agent proposals.',
  },
  run() {
    const doctor = new DoctorAgent();
    const report = doctor.prove("adapter");
    if (!report.passed) throw new Error("Adapter proof failed");
  }
});

const hookCommand = defineCommand({
  meta: {
    name: 'hook',
    description: 'Prove that the Hook is the fundamental Truex atom (condition + effect + receipt + replay).',
  },
  run() {
    const doctor = new DoctorAgent();
    const report = doctor.prove("hook");
    if (!report.passed) throw new Error("Hook proof failed");
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
    adapter: adapterCommand,
    hook: hookCommand
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
