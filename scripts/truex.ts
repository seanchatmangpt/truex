import { defineCommand, runMain } from 'citty';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { DoctorAgent } from '../agents/doctor/agent.js';
import { TelcoAgent } from '../agents/telco/agent.js';
import { WizardAgent } from '../agents/wizard/agent.js';
import { OcelCollector } from '../skills/membrane/mutations.js';


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

const telcoProveCommand = defineCommand({
  meta: {
    name: 'telco',
    description: 'Prove that the Telco Agent successfully ingests transitions and signs OCEL receipts.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("telco");
    if (!report.passed) throw new Error("Telco proof failed");
  }
});

const wizardProveCommand = defineCommand({
  meta: {
    name: 'wizard',
    description: 'Prove that the Wizard Agent counterfactual simulation, validation, and transaction rollback properties hold.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("wizard");
    if (!report.passed) throw new Error("Wizard proof failed");
  }
});

const telcoIngestCommand = defineCommand({
  meta: {
    name: 'ingest',
    description: 'Ingest raw property mutations and sign an OCEL receipt envelope.',
  },
  args: {
    activity: {
      type: 'string',
      description: 'Activity name',
      default: 'activate_subscription'
    },
    actor: {
      type: 'string',
      description: 'Actor name',
      default: 'user_1'
    },
    balance: {
      type: 'string',
      description: 'Initial balance',
      default: '100'
    },
    newBalance: {
      type: 'string',
      description: 'New balance',
      default: '120'
    }
  },
  async run({ args }) {
    const agent = new TelcoAgent();
    const balance = Number.parseFloat(args.balance);
    const newBalance = Number.parseFloat(args.newBalance);
    if (Number.isNaN(balance) || Number.isNaN(newBalance)) {
      throw new TypeError("Balance and newBalance must be valid numbers.");
    }
    const result = agent.ingestTransition(
      args.activity,
      args.actor,
      { balance },
      newBalance
    );
    console.log(JSON.stringify(result, undefined, 2));
  }
});

const telcoValidateCommand = defineCommand({
  meta: {
    name: 'validate',
    description: 'Validate an OCEL receipt envelope.',
  },
  args: {
    envelope: {
      type: 'string',
      description: 'JSON string of the OCEL envelope to validate. If omitted, a sample verification run is performed.',
    }
  },
  async run({ args }) {
    let envelopeStr = args.envelope;
    if (envelopeStr && !envelopeStr.trim().startsWith('{')) {
      const filePath = path.resolve(process.cwd(), envelopeStr.trim());
      if (fs.existsSync(filePath)) {
        envelopeStr = fs.readFileSync(filePath, 'utf8');
      } else {
        throw new Error(`File not found: ${filePath}`);
      }
    }

    if (envelopeStr) {
      try {
        const envelope = JSON.parse(envelopeStr);
        const isValid = OcelCollector.verifyEnvelope(envelope);
        console.log(JSON.stringify({ isValid }, undefined, 2));
        if (!isValid) {
          throw new Error("Envelope validation failed: Tampered or invalid envelope.");
        }
      } catch (error_: any) {
        throw new Error(`Validation error: ${error_.message}`);
      }
    } else {
      console.log("No envelope provided. Running self-contained verification demonstration...");
      const agent = new TelcoAgent();
      const sample = agent.ingestTransition(
        'sample_activity',
        'sample_actor',
        { balance: 100 },
        150
      );
      console.log("Generated sample envelope. Verifying valid envelope:");
      const isValidOriginal = OcelCollector.verifyEnvelope(sample.envelope);
      console.log(`Original Valid? ${isValidOriginal}`);

      // Now tamper with the envelope
      console.log("\nTampering with activity name in the envelope...");
      const tamperedEnvelope = structuredClone(sample.envelope);
      if (tamperedEnvelope.ocel && tamperedEnvelope.ocel.events && tamperedEnvelope.ocel.events[0]) {
        tamperedEnvelope.ocel.events[0]['ocel:type'] = 'TAMPERED_ACTIVITY';
      }
      const isValidTampered = OcelCollector.verifyEnvelope(tamperedEnvelope);
      console.log(`Tampered Valid? ${isValidTampered}`);
      console.log(JSON.stringify({
        originalValid: isValidOriginal,
        tamperedValid: isValidTampered
      }, undefined, 2));

      if (!isValidOriginal || isValidTampered) {
        throw new Error("Self-contained validation demonstration failed: Verification mechanism did not correctly detect/reject tampering.");
      }
    }
  }
});

const telcoCommand = defineCommand({
  meta: {
    name: 'telco',
    description: 'Telco agent operational commands',
  },
  subCommands: {
    ingest: telcoIngestCommand,
    validate: telcoValidateCommand
  }
});

const wizardSimulateCommand = defineCommand({
  meta: {
    name: 'simulate',
    description: 'Simulate a speculative transaction on a mutable state, running range validations.',
  },
  args: {
    score: {
      type: 'string',
      description: 'Initial score (0-100)',
      default: '50'
    },
    value: {
      type: 'string',
      description: 'Speculative score value to write',
      default: '75'
    }
  },
  async run({ args }) {
    const agent = new WizardAgent();
    const score = Number.parseInt(args.score, 10);
    const value = Number.parseInt(args.value, 10);
    if (Number.isNaN(score) || Number.isNaN(value)) {
      throw new TypeError("Initial score and speculative value must be valid numbers.");
    }
    const trace = agent.simulateTransaction({ score }, value);
    console.log(JSON.stringify(trace, undefined, 2));

    const writeFailure = trace.find(t => t.step === "Speculative Write Failure");
    if (writeFailure) {
      throw new Error(`Simulation Refused: speculative write of ${value} failed. Reason: ${writeFailure.error}`);
    }
  }
});

const wizardWalkthroughCommand = defineCommand({
  meta: {
    name: 'walkthrough',
    description: 'Execute a sequence of speculative transaction simulations showing commits and rollbacks.',
  },
  args: {
    score: {
      type: 'string',
      description: 'Initial score (0-100)',
      default: '50'
    },
    values: {
      type: 'string',
      description: 'Comma-separated list of speculative score values to try sequentially',
      default: '75,120,40,110'
    }
  },
  async run({ args }) {
    const agent = new WizardAgent();
    const initialScore = Number.parseInt(args.score, 10);
    if (Number.isNaN(initialScore)) {
      throw new TypeError("Initial score must be a valid number.");
    }
    const vals = args.values.split(',').map((v: string) => Number.parseInt(v.trim(), 10));
    console.log(`Starting Wizard walkthrough with initial score: ${initialScore}`);
    
    let currentScore = initialScore;
    for (const val of vals) {
      if (Number.isNaN(val)) continue;
      console.log(`\n--- Simulating speculative write of value: ${val} ---`);
      const steps = agent.simulateTransaction({ score: currentScore }, val);
      console.log(JSON.stringify(steps, undefined, 2));
      
      const hasCommit = steps.some(step => step.step === "Transaction Commit" && step.success);
      if (hasCommit) {
        currentScore = val;
        console.log(`>>> Transaction COMMITTED. New score: ${currentScore}`);
      } else {
        console.log(`>>> Transaction ROLLED BACK. Score remains: ${currentScore}`);
      }
    }
  }
});

const wizardCommand = defineCommand({
  meta: {
    name: 'wizard',
    description: 'Wizard agent operational commands',
  },
  subCommands: {
    simulate: wizardSimulateCommand,
    walkthrough: wizardWalkthroughCommand
  }
});

const telcoIngestProveCommand = defineCommand({
  meta: {
    name: 'telco-ingest',
    description: 'Prove Telco transition ingestion and OCEL receipt generation.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("telco-ingest");
    if (!report.passed) throw new Error("Telco ingest proof failed");
  }
});

const telcoValidateProveCommand = defineCommand({
  meta: {
    name: 'telco-validate',
    description: 'Prove Telco OCEL receipt validation and tamper detection.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("telco-validate");
    if (!report.passed) throw new Error("Telco validate proof failed");
  }
});

const wizardSimulateProveCommand = defineCommand({
  meta: {
    name: 'wizard-simulate',
    description: 'Prove Wizard counterfactual transaction simulation and invariant checking.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("wizard-simulate");
    if (!report.passed) throw new Error("Wizard simulate proof failed");
  }
});

const wizardWalkthroughProveCommand = defineCommand({
  meta: {
    name: 'wizard-walkthrough',
    description: 'Prove Wizard sequence walkthrough with commit and rollback validation.',
  },
  async run() {
    const doctor = new DoctorAgent();
    const report = await doctor.prove("wizard-walkthrough");
    if (!report.passed) throw new Error("Wizard walkthrough proof failed");
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
    ontology: ontologyCommand,
    telco: telcoProveCommand,
    wizard: wizardProveCommand,
    "telco-ingest": telcoIngestProveCommand,
    "telco-validate": telcoValidateProveCommand,
    "wizard-simulate": wizardSimulateProveCommand,
    "wizard-walkthrough": wizardWalkthroughProveCommand
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
    doctor: doctorCommand,
    telco: telcoCommand,
    wizard: wizardCommand
  }
});

runMain(mainCommand);
