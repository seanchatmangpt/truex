/**
 * @module TruexCLI
 * @description
 * Gall Classification: Gall S5 (CLI Calculus Driver)
 * Purpose: The entrypoint for the TRUEX operational CLI calculus.
 * Commands must conform to the Gall Law sequencing, running proofs across the repository
 * to assert deterministic consequence, receipts, and replay convergence.
 */

import { defineCommand, runMain } from 'citty';
import * as fs from 'node:fs';
import * as path from 'node:path';
let _doctorAgent: any = null;
async function getDoctorAgent() {
  if (!_doctorAgent) {
    const { DoctorAgent } = await import('../agents/doctor/agent.js');
    _doctorAgent = new DoctorAgent();
  }
  return _doctorAgent;
}

let _telcoAgent: any = null;
async function getTelcoAgent() {
  if (!_telcoAgent) {
    const { TelcoAgent } = await import('../agents/telco/agent.js');
    _telcoAgent = new TelcoAgent();
  }
  return _telcoAgent;
}

let _wizardAgent: any = null;
async function getWizardAgent() {
  if (!_wizardAgent) {
    const { WizardAgent } = await import('../agents/wizard/agent.js');
    _wizardAgent = new WizardAgent();
  }
  return _wizardAgent;
}
import { ProjectCell, ProjectMapper, CheckpointPlanner, ExecutionEngine, MissionController } from '../packages/truex-core/src/project-wizard.gall.js';
import { OcelCollector } from '../skills/membrane/mutations.js';
import { OcelOtelWeaverPlugin } from '../packages/truex-core/src/plugins/otel-weaver.js';



const hashCommand = defineCommand({
  meta: {
    name: 'hash',
    description: 'Prove that hashing is an independent deterministic operational primitive.',
  },
  async run() {
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
    const report = await doctor.prove("hook-otp");
    if (!report.passed) throw new Error("Hook OTP proof failed");
  }
});

const otpBreakpointsCommand = defineCommand({
  meta: {
    name: 'otp-breakpoints',
    description: 'Prove OTP breakpoints (mailbox, supervisor, replay/topology, and existing hook-otp reports).',
  },
  async run() {
    const doctor = await getDoctorAgent();
    const report = await doctor.prove("otp-breakpoints");
    if (!report.passed) throw new Error("OTP Breakpoints proof failed");
  }
});

const capabilityBreakpointsCommand = defineCommand({
  meta: {
    name: 'capability-breakpoints',
    description: 'Prove capability breakpoints (sandbox-acl, tx-replay-sim, inv-contract-virtual, tenant-audit).',
  },
  async run() {
    const doctor = await getDoctorAgent();
    const report = await doctor.prove("capability-breakpoints");
    if (!report.passed) throw new Error("Capability Breakpoints proof failed");
  }
});

const ecosystemCommand = defineCommand({
  meta: {
    name: 'ecosystem',
    description: 'Prove ecosystem convergence and generate full report.',
  },
  async run() {
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const agent = await getTelcoAgent();
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
      const agent = await getTelcoAgent();
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
    const agent = await getWizardAgent();
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
    const agent = await getWizardAgent();
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

const wizardInitCommand = defineCommand({
  meta: {
    name: 'init',
    description: 'Create a new project cell with repo law, folders, package setup, baseline config'
  },
  args: {
    mission: {
      type: 'string',
      description: 'Mission statement',
      default: 'Build a durable project using Truex project manufacturing discipline'
    },
    'duration-hours': {
      type: 'string',
      description: 'Duration in hours',
      default: '12'
    },
    agents: {
      type: 'string',
      description: 'Number of agents',
      default: '5'
    }
  },
  async run({ args }) {
    const startedAt = new Date().toISOString();
    const projectPath = args._?.[0];
    if (!projectPath) {
      const cell = new ProjectCell(process.cwd());
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('init', 'refused', startedAt, completedAt, { details: 'Missing project path' });
      console.log(JSON.stringify(receipt, null, 2));
      throw new Error("Missing project path");
    }

    try {
      if (typeof projectPath !== 'string' || !projectPath.trim()) {
        throw new Error("Project path must be a non-empty string");
      }
      if (projectPath.includes('\0')) {
        throw new Error("Project path contains null bytes");
      }

      const durationHours = Number.parseFloat(args['duration-hours'] || args.durationHours || '12');
      if (Number.isNaN(durationHours) || durationHours < 12) {
        throw new Error("Config format failure: 'durationHours' must be a number greater than or equal to 12");
      }

      const agents = Number.parseInt(args.agents || '5', 10);
      if (Number.isNaN(agents) || !Number.isInteger(agents) || agents < 1) {
        throw new Error("Config format failure: 'agents' must be a positive integer");
      }

      const cell = new ProjectCell(projectPath);
      const receipt = cell.init({
        path: projectPath,
        mission: args.mission,
        durationHours,
        agents,
        status: 'initialized'
      });
      console.log(JSON.stringify(receipt, null, 2));
    } catch (e: any) {
      try {
        const cell = new ProjectCell(projectPath);
        const completedAt = new Date().toISOString();
        const receipt = cell.emitReceipt('init', 'refused', startedAt, completedAt, {
          details: `Init validation failure: ${e.message}`
        });
        console.log(JSON.stringify(receipt, null, 2));
      } catch (e2) {
        const completedAt = new Date().toISOString();
        console.log(JSON.stringify({
          receiptHash: '',
          projectPath,
          verb: 'init',
          status: 'refused',
          startedAt,
          completedAt,
          details: `Init validation failure (unable to write receipt): ${e.message}`
        }, null, 2));
      }
      throw e;
    }
  }
});

const wizardMapCommand = defineCommand({
  meta: {
    name: 'map',
    description: 'Inspect source/docs/deps and build the project topology'
  },
  async run({ args }) {
    const startedAt = new Date().toISOString();
    const projectPath = args._?.[0];
    if (!projectPath) {
      const cell = new ProjectCell(process.cwd());
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('map', 'refused', startedAt, completedAt, { details: 'Missing project path' });
      console.log(JSON.stringify(receipt, null, 2));
      throw new Error("Missing project path");
    }

    try {
      const cell = new ProjectCell(projectPath);
      if (!cell.isInitialized()) {
        throw new Error("Project cell not initialized");
      }

      cell.updateHeartbeat();
      const mapper = new ProjectMapper(cell);
      const { hash } = mapper.map();
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('map', 'succeeded', startedAt, completedAt, {
        reportPath: '.truex/reports/project-topology.json',
        details: `Topology mapped. Hash: ${hash}`
      });
      console.log(JSON.stringify(receipt, null, 2));
    } catch (e: any) {
      try {
        const cell = new ProjectCell(projectPath);
        const completedAt = new Date().toISOString();
        const isRefused = e.message.includes('not initialized');
        const receipt = cell.emitReceipt('map', isRefused ? 'refused' : 'failed', startedAt, completedAt, {
          details: `Map execution failure: ${e.message}`
        });
        console.log(JSON.stringify(receipt, null, 2));
      } catch {}
      throw e;
    }
  }
});

const wizardPlanCommand = defineCommand({
  meta: {
    name: 'plan',
    description: 'Ask agents to propose their own Gall checkpoints'
  },
  args: {
    'checkpoint-mode': {
      type: 'string',
      description: 'Checkpoint mode',
      default: 'agent-proposed'
    },
    'require-doctor': {
      type: 'boolean',
      description: 'Require doctor checks'
    },
    'require-observatory': {
      type: 'boolean',
      description: 'Require observatory checks'
    },
    'require-accounting': {
      type: 'boolean',
      description: 'Require accounting validation'
    },
    'require-handoff': {
      type: 'boolean',
      description: 'Require handoff verification'
    }
  },
  async run({ args }) {
    const startedAt = new Date().toISOString();
    const projectPath = args._?.[0];
    if (!projectPath) {
      const cell = new ProjectCell(process.cwd());
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('plan', 'refused', startedAt, completedAt, { details: 'Missing project path' });
      console.log(JSON.stringify(receipt, null, 2));
      throw new Error("Missing project path");
    }

    try {
      const cell = new ProjectCell(projectPath);
      if (!cell.isInitialized()) {
        throw new Error("Project cell not initialized");
      }

      cell.updateHeartbeat();

      const mode = args['checkpoint-mode'] || args.checkpointMode;
      if (mode && mode !== 'agent-proposed') {
        throw new Error("Plan refused: unsupported checkpoint-mode. Must be 'agent-proposed'.");
      }

      const topoPath = cell.resolvePath('.truex/reports/project-topology.json');
      if (!fs.existsSync(topoPath)) {
        throw new Error("Project topology map missing. Run wizard map first.");
      }

      const topology = JSON.parse(fs.readFileSync(topoPath, 'utf8'));

      const planner = new CheckpointPlanner(cell);
      const { hash: regHash } = planner.plan(topology);

      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('plan', 'succeeded', startedAt, completedAt, {
        reportPath: '.truex/checkpoints/checkpoint-registry.json',
        details: `Checkpoint registry generated. Hash: ${regHash}`
      });
      console.log(JSON.stringify(receipt, null, 2));
    } catch (e: any) {
      try {
        const cell = new ProjectCell(projectPath);
        const completedAt = new Date().toISOString();
        const isRefused = e.message.includes('not initialized') || e.message.includes('missing') || e.message.includes('refused');
        const receipt = cell.emitReceipt('plan', isRefused ? 'refused' : 'failed', startedAt, completedAt, {
          details: `Plan failed: ${e.message}`
        });
        console.log(JSON.stringify(receipt, null, 2));
      } catch {}
      throw e;
    }
  }
});

const wizardForgeCommand = defineCommand({
  meta: {
    name: 'forge',
    description: 'Materialize code/docs/tests/artifacts for the next checkpoint'
  },
  args: {
    checkpoint: {
      type: 'string',
      description: 'Checkpoint ID'
    }
  },
  async run({ args }) {
    const startedAt = new Date().toISOString();
    const projectPath = args._?.[0];
    if (!projectPath) {
      const cell = new ProjectCell(process.cwd());
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('forge', 'refused', startedAt, completedAt, { details: 'Missing project path' });
      console.log(JSON.stringify(receipt, null, 2));
      throw new Error("Missing project path");
    }

    try {
      const cell = new ProjectCell(projectPath);
      if (!cell.isInitialized()) {
        throw new Error("Project cell not initialized");
      }

      cell.updateHeartbeat();
      const checkpointId = args.checkpoint;
      if (!checkpointId || !checkpointId.trim()) {
        throw new Error("Forge refused: checkpoint ID option is required.");
      }

      const engine = new ExecutionEngine(cell);
      engine.forge(checkpointId);
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('forge', 'succeeded', startedAt, completedAt, {
        details: `Forged checkpoint: ${checkpointId}`
      });
      console.log(JSON.stringify(receipt, null, 2));
    } catch (e: any) {
      try {
        const cell = new ProjectCell(projectPath);
        const completedAt = new Date().toISOString();
        const isRefused = e.message.includes('not initialized') || e.message.includes('refused') || e.message.includes('violation');
        const receipt = cell.emitReceipt('forge', isRefused ? 'refused' : 'failed', startedAt, completedAt, {
          details: `Forge failed: ${e.message}`
        });
        console.log(JSON.stringify(receipt, null, 2));
      } catch {}
      throw e;
    }
  }
});

const wizardBindCommand = defineCommand({
  meta: {
    name: 'bind',
    description: 'Connect project surfaces: CLI, tests, docs, observatory, mailbox, reports'
  },
  args: {
    checkpoint: {
      type: 'string',
      description: 'Checkpoint ID'
    }
  },
  async run({ args }) {
    const startedAt = new Date().toISOString();
    const projectPath = args._?.[0];
    if (!projectPath) {
      const cell = new ProjectCell(process.cwd());
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('bind', 'refused', startedAt, completedAt, { details: 'Missing project path' });
      console.log(JSON.stringify(receipt, null, 2));
      throw new Error("Missing project path");
    }

    try {
      const cell = new ProjectCell(projectPath);
      if (!cell.isInitialized()) {
        throw new Error("Project cell not initialized");
      }

      cell.updateHeartbeat();
      const checkpointId = args.checkpoint;
      if (!checkpointId || !checkpointId.trim()) {
        throw new Error("Bind refused: checkpoint ID option is required.");
      }

      const engine = new ExecutionEngine(cell);
      engine.bind(checkpointId);
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('bind', 'succeeded', startedAt, completedAt, {
        details: `Bound checkpoint components: ${checkpointId}`
      });
      console.log(JSON.stringify(receipt, null, 2));
    } catch (e: any) {
      try {
        const cell = new ProjectCell(projectPath);
        const completedAt = new Date().toISOString();
        const isRefused = e.message.includes('not initialized') || e.message.includes('refused') || e.message.includes('not found');
        const receipt = cell.emitReceipt('bind', isRefused ? 'refused' : 'failed', startedAt, completedAt, {
          details: `Bind failed: ${e.message}`
        });
        console.log(JSON.stringify(receipt, null, 2));
      } catch {}
      throw e;
    }
  }
});

const wizardProveVerbCommand = defineCommand({
  meta: {
    name: 'prove',
    description: 'Run doctor/tests/accounting/conservation/replay checks'
  },
  args: {
    checkpoint: {
      type: 'string',
      description: 'Checkpoint ID'
    }
  },
  async run({ args }) {
    const startedAt = new Date().toISOString();
    const projectPath = args._?.[0];
    if (!projectPath) {
      const cell = new ProjectCell(process.cwd());
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('prove', 'refused', startedAt, completedAt, { details: 'Missing project path' });
      console.log(JSON.stringify(receipt, null, 2));
      throw new Error("Missing project path");
    }

    try {
      const cell = new ProjectCell(projectPath);
      if (!cell.isInitialized()) {
        throw new Error("Project cell not initialized");
      }

      cell.updateHeartbeat();
      const checkpointId = args.checkpoint;
      if (!checkpointId || !checkpointId.trim()) {
        throw new Error("Prove refused: checkpoint ID option is required.");
      }

      const engine = new ExecutionEngine(cell);
      const res = engine.prove(checkpointId);
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('prove', 'succeeded', startedAt, completedAt, {
        reportPath: `.truex/reports/proof-${checkpointId}.json`,
        details: `Proven checkpoint: ${checkpointId}. Duration: ${res.durationMs}ms`
      });
      console.log(JSON.stringify(receipt, null, 2));
    } catch (e: any) {
      try {
        const cell = new ProjectCell(projectPath);
        const completedAt = new Date().toISOString();
        const isRefused = e.message.includes('not initialized') || e.message.includes('refused');
        const receipt = cell.emitReceipt('prove', isRefused ? 'refused' : 'failed', startedAt, completedAt, {
          details: `Proof failed: ${e.message}`
        });
        console.log(JSON.stringify(receipt, null, 2));
      } catch {}
      throw e;
    }
  }
});

const wizardHardenCommand = defineCommand({
  meta: {
    name: 'harden',
    description: 'Run breakpoint/adversarial/stress/membrane/resource checks'
  },
  args: {
    checkpoint: {
      type: 'string',
      description: 'Checkpoint ID'
    }
  },
  async run({ args }) {
    const startedAt = new Date().toISOString();
    const projectPath = args._?.[0];
    if (!projectPath) {
      const cell = new ProjectCell(process.cwd());
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('harden', 'refused', startedAt, completedAt, { details: 'Missing project path' });
      console.log(JSON.stringify(receipt, null, 2));
      throw new Error("Missing project path");
    }

    try {
      const cell = new ProjectCell(projectPath);
      if (!cell.isInitialized()) {
        throw new Error("Project cell not initialized");
      }

      cell.updateHeartbeat();
      const checkpointId = args.checkpoint;
      if (!checkpointId || !checkpointId.trim()) {
        throw new Error("Harden refused: checkpoint ID option is required.");
      }

      const engine = new ExecutionEngine(cell);
      const res = engine.harden(checkpointId);
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('harden', 'succeeded', startedAt, completedAt, {
        reportPath: `.truex/reports/harden-${checkpointId}.json`,
        details: `Hardened checkpoint: ${checkpointId}`
      });
      console.log(JSON.stringify(receipt, null, 2));
    } catch (e: any) {
      try {
        const cell = new ProjectCell(projectPath);
        const completedAt = new Date().toISOString();
        const isRefused = e.message.includes('not initialized') || e.message.includes('refused');
        const receipt = cell.emitReceipt('harden', isRefused ? 'refused' : 'failed', startedAt, completedAt, {
          details: `Hardening failed: ${e.message}`
        });
        console.log(JSON.stringify(receipt, null, 2));
      } catch {}
      throw e;
    }
  }
});

const wizardHandoffCommand = defineCommand({
  meta: {
    name: 'handoff',
    description: 'Produce final project evidence package'
  },
  args: {
    'duration-hours': {
      type: 'string',
      description: 'Duration in hours',
      default: '12'
    },
    'require-elapsed': {
      type: 'boolean',
      description: 'Enforce elapsed time'
    },
    'require-agent-reports': {
      type: 'string',
      description: 'Number of expected agent reports',
      default: '5'
    },
    'require-gall-checkpoints': {
      type: 'boolean',
      description: 'Require checkpoints in registry'
    },
    'require-finalization-receipt': {
      type: 'boolean',
      description: 'Require finalization receipt'
    }
  },
  async run({ args }) {
    const startedAt = new Date().toISOString();
    const projectPath = args._?.[0];
    if (!projectPath) {
      const cell = new ProjectCell(process.cwd());
      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('handoff', 'refused', startedAt, completedAt, { details: 'Missing project path' });
      console.log(JSON.stringify(receipt, null, 2));
      throw new Error("Missing project path");
    }

    try {
      const cell = new ProjectCell(projectPath);
      if (!cell.isInitialized()) {
        throw new Error("Project cell not initialized");
      }

      cell.updateHeartbeat();
      const controller = new MissionController(cell);

      const reqElapsed = args['require-elapsed'] ?? args.requireElapsed ?? false;
      const reqGallCp = args['require-gall-checkpoints'] ?? args.requireGallCheckpoints ?? false;
      const rawCountReports = args['require-agent-reports'] || args.requireAgentReports || '5';
      const countReports = Number.parseInt(rawCountReports, 10);
      if (Number.isNaN(countReports) || countReports < 0) {
        throw new Error("Handoff refused: require-agent-reports must be a non-negative integer.");
      }

      controller.verifyHandoff({
        requireElapsed: reqElapsed,
        requireGallCheckpoints: reqGallCp,
        requireAgentReports: countReports
      });

      const accPath = cell.resolvePath('.truex/reports/accounting.json');
      const acc = JSON.parse(fs.readFileSync(accPath, 'utf8'));

      controller.finalize({
        W1: 'Conserved',
        W2: 'Conserved',
        W3: 'Conserved',
        W4: 'Conserved',
        W5: 'Conserved',
        counts: acc
      });

      const completedAt = new Date().toISOString();
      const receipt = cell.emitReceipt('handoff', 'succeeded', startedAt, completedAt, {
        reportPath: 'docs/reports/PROJECT-WIZARD-S11-SYNTHESIS.md',
        details: 'Handoff evidence package successfully finalized.'
      });
      console.log(JSON.stringify(receipt, null, 2));
    } catch (e: any) {
      try {
        const cell = new ProjectCell(projectPath);
        const completedAt = new Date().toISOString();
        const isRefused = e.message.includes('not initialized') || e.message.includes('refused') || e.message.includes('Refused') || e.message.includes('missing') || e.message.includes('not found');
        const receipt = cell.emitReceipt('handoff', isRefused ? 'refused' : 'failed', startedAt, completedAt, {
          details: `Handoff verification failed: ${e.message}`
        });
        console.log(JSON.stringify(receipt, null, 2));
      } catch {}
      throw e;
    }
  }
});

const wizardCommand = defineCommand({
  meta: {
    name: 'wizard',
    description: 'Wizard agent operational commands',
  },
  subCommands: {
    init: wizardInitCommand,
    map: wizardMapCommand,
    plan: wizardPlanCommand,
    forge: wizardForgeCommand,
    bind: wizardBindCommand,
    prove: wizardProveVerbCommand,
    harden: wizardHardenCommand,
    handoff: wizardHandoffCommand,
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
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
    const doctor = await getDoctorAgent();
    const report = await doctor.prove("wizard-walkthrough");
    if (!report.passed) throw new Error("Wizard walkthrough proof failed");
  }
});

const doctestProveCommand = defineCommand({
  meta: {
    name: 'doctest',
    description: 'Prove that all external doctests in the documentation pass.',
  },
  async run() {
    const doctor = await getDoctorAgent();
    const report = await doctor.prove("doctest");
    if (!report.passed) throw new Error("Doctest proof failed");
  }
});

const architectureCommand = defineCommand({
  meta: {
    name: 'architecture',
    description: 'Prove the generated C4 architectural maps are grounded in AST, runtime evidence, and receipts.',
  },
  async run() {
    const doctor = await getDoctorAgent();
    const report = await doctor.prove("architecture");
    if (!report.passed) throw new Error("Architecture proof failed");
  }
});

const mailboxCommand = defineCommand({
  meta: {
    name: 'mailbox',
    description: 'Prove the persistent mailbox S10 queue-state discipline, duplicate prevention, and crash recovery.',
  },
  async run() {
    const doctor = await getDoctorAgent();
    const report = await doctor.prove("mailbox");
    if (!report.passed) throw new Error("Mailbox proof failed");
  }
});

const finalizationCommand = defineCommand({
  meta: {
    name: 'finalization',
    description: 'Prove the final 12H release gate finalization (vitest, ecosystem, mailbox, and observatory).',
  },
  async run() {
    const doctor = await getDoctorAgent();
    const report = await doctor.prove("finalization");
    if (!report.passed) throw new Error("Finalization proof failed");
  }
});

const projectEvidenceTypesCommand = defineCommand({
  meta: {
    name: 'project-evidence-types',
    description: 'Prove the Object-Centric Project Evidence Type System (S12).'
  },
  async run() {
    const doctor = await getDoctorAgent();
    const report = await doctor.prove("project-evidence-types");
    if (!report.passed) throw new Error("Project evidence types proof failed");
  }
});

const projectEvidenceGapcloseCommand = defineCommand({
  meta: {
    name: 'project-evidence-gapclose',
    description: 'Prove the Object-Centric Project Evidence Gap Discovery & Repair (S12G).'
  },
  async run() {
    const doctor = await getDoctorAgent();
    const report = await doctor.prove("project-evidence-gapclose");
    if (!report.passed) throw new Error("Project evidence gapclose proof failed");
  }
});

const projectWizardCompleteCommand = defineCommand({
  meta: {
    name: 'project-wizard-complete',
    description: 'Prove the complete S11G Project Wizard verification suite.'
  },
  async run() {
    const doctor = await getDoctorAgent();
    const report = await doctor.prove("project-wizard-complete");
    if (!report.passed) throw new Error("Project wizard complete proof failed");
  }
});

const proveCommand = defineCommand({
  meta: {
    name: 'prove',
    description: 'Prove Truex concepts',
  },
  subCommands: {
    doctest: doctestProveCommand,
    mailbox: mailboxCommand,
    finalization: finalizationCommand,
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
    "otp-breakpoints": otpBreakpointsCommand,
    "capability-breakpoints": capabilityBreakpointsCommand,
    ecosystem: ecosystemCommand,
    topology: topologyCommand,
    ontology: ontologyCommand,
    architecture: architectureCommand,
    telco: telcoProveCommand,
    wizard: wizardProveCommand,
    "telco-ingest": telcoIngestProveCommand,
    "telco-validate": telcoValidateProveCommand,
    "wizard-simulate": wizardSimulateProveCommand,
    "wizard-walkthrough": wizardWalkthroughProveCommand,
    "project-evidence-types": projectEvidenceTypesCommand,
    "project-evidence-gapclose": projectEvidenceGapcloseCommand,
    "project-wizard-complete": projectWizardCompleteCommand
  }
});


const doctorCommand = defineCommand({
  meta: {
    name: 'doctor',
    description: 'Diagnose and verify the truex architecture',
  },
  plugins: [OcelOtelWeaverPlugin],
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
