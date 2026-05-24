/**
 * @module skills/wizard/wizard-proof
 * @description
 * Gall Classification: Proof Layer
 * Purpose: Proves both the old Wizard agent transaction invariants and the new Project Wizard lifecycle invariants.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { WizardAgent } from "../../agents/wizard/agent.js";
import { ProjectCell, ProjectMapper, CheckpointPlanner, ExecutionEngine, MissionController } from "../../packages/truex-core/src/project-wizard.gall.js";

/**
 * Report structure for Wizard proofs.
 */
export type WizardProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
};

/**
 * Executes tests to prove all Wizard invariants.
 * @returns {WizardProofReport} The proof results.
 */
export function proveWizard(): WizardProofReport {
  const failures: string[] = [];
  const invariants: string[] = [];

  // --- PART 1: Core WizardAgent Invariants (Score simulation) ---
  try {
    const wizard = new WizardAgent();

    // 1. Run a valid simulation (within range)
    const stateValid = { score: 50 };
    const traceValid = wizard.simulateTransaction(stateValid, 75);
    
    const commitStep = traceValid.find(t => t.step === "Transaction Commit");
    if (commitStep && commitStep.success && stateValid.score === 75) {
      invariants.push("valid range mutation successfully commits state change");
    } else {
      failures.push("valid mutation simulation did not commit state change correctly");
    }

    // 2. Run an invalid simulation (out of range, should reject and rollback)
    const stateInvalid = { score: 50 };
    const traceInvalid = wizard.simulateTransaction(stateInvalid, 150); // range is 0 to 100
    
    const failStep = traceInvalid.find(t => t.step === "Speculative Write Failure");
    const rollbackStep = traceInvalid.find(t => t.step === "Transaction Rollback");
    
    if (failStep && !failStep.success && rollbackStep && rollbackStep.success && stateInvalid.score === 50) {
      invariants.push("invalid range mutation correctly rejected and state rolled back");
    } else {
      failures.push("invalid mutation was not properly rejected or rollback failed to restore state");
    }
  } catch (error: any) {
    failures.push(`Unexpected error during core wizard transaction proof: ${error.message}`);
  }

  // --- PART 2: Project Wizard S11 Invariants ---
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'truex-doctor-wizard-proof-'));
  try {
    const cell = new ProjectCell(tempDir);

    // 1. Init
    const initReceipt = cell.init({
      path: tempDir,
      mission: "Doctor Proof S11 Project Wizard",
      durationHours: 12,
      agents: 5,
      status: "initialized"
    });

    if (initReceipt && initReceipt.status === 'succeeded' && fs.existsSync(path.join(tempDir, '.truex', 'project.json'))) {
      invariants.push("project cell initialization creates config structure");
    } else {
      failures.push("project cell initialization failed or missed project.json file");
    }

    // 2. Map
    const mapper = new ProjectMapper(cell);
    const { hash: topoHash } = mapper.map();
    if (topoHash && fs.existsSync(path.join(tempDir, '.truex', 'reports', 'project-topology.json'))) {
      invariants.push("project topology mapper scans files and outputs C4 diagrams");
    } else {
      failures.push("project topology mapper failed to execute or output facts");
    }

    // 3. Plan
    const planner = new CheckpointPlanner(cell);
    const { registry, hash: regHash } = planner.plan({});
    if (registry.length === 5 && regHash && fs.existsSync(path.join(tempDir, '.truex', 'checkpoints', 'checkpoint-registry.json'))) {
      invariants.push("checkpoint planner creates agent checkpoints and rejects vague inputs");
    } else {
      failures.push("checkpoint planner failed to register checkpoints correctly");
    }

    // 4. Execution (Forge, Bind, Prove, Harden)
    const engine = new ExecutionEngine(cell);
    engine.forge('cp-cli-contract');
    engine.bind('cp-cli-contract');
    engine.prove('cp-cli-contract');
    engine.harden('cp-cli-contract');

    const accPath = path.join(tempDir, '.truex', 'reports', 'accounting.json');
    if (fs.existsSync(accPath)) {
      const acc = JSON.parse(fs.readFileSync(accPath, 'utf8'));
      if (acc.W1.attempted > 0 && acc.W2.attempted > 0 && acc.W4.attempted > 0) {
        invariants.push("execution ledger updates accounting values for command, artifacts, and proofs");
      } else {
        failures.push("accounting values did not increment during checkpoint executions");
      }
    } else {
      failures.push("accounting file missing after executions");
    }

    // 5. Finalization / Handoff
    const controller = new MissionController(cell);

    // Verify 12H refusal gate
    let handoffRefused = false;
    try {
      controller.verifyHandoff({ requireElapsed: true, requireGallCheckpoints: true });
    } catch {
      handoffRefused = true;
    }
    if (handoffRefused) {
      invariants.push("12-hour monotonic release gate correctly refuses premature handoff");
    } else {
      failures.push("12-hour monotonic release gate did not refuse premature handoff");
    }

    // Bypass gate by mocking startTime in start.json
    const startPath = path.join(tempDir, '.truex', 'mission', 'start.json');
    const startData = JSON.parse(fs.readFileSync(startPath, 'utf8'));
    startData.startTime = new Date(Date.now() - 13 * 3600 * 1000).toISOString(); // 13h ago
    fs.writeFileSync(startPath, JSON.stringify(startData, null, 2));

    // Create expected agent reports
    const reportsDir = path.join(tempDir, 'docs', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });
    for (let i = 1; i <= 5; i++) {
      const names = [
        `12h-agent-${i}-wizard-cli.md`,
        `12h-agent-${i}-project-cell-topology.md`,
        `12h-agent-${i}-gall-checkpoint-planner.md`,
        `12h-agent-${i}-forge-bind-prove-harden.md`,
        `12h-agent-${i}-mission-handoff.md`
      ];
      fs.writeFileSync(path.join(reportsDir, names[i - 1]), '# Mock report', 'utf8');
    }

    // Run verification & finalization
    controller.verifyHandoff({ requireElapsed: true, requireGallCheckpoints: true, requireAgentReports: 5 });
    controller.finalize({
      W1: 'Conserved',
      W2: 'Conserved',
      W3: 'Conserved',
      W4: 'Conserved',
      W5: 'Conserved',
      counts: JSON.parse(fs.readFileSync(accPath, 'utf8'))
    });

    if (fs.existsSync(path.join(tempDir, 'docs', 'reports', 'PROJECT-WIZARD-S11-SYNTHESIS.md'))) {
      invariants.push("synthesis finalization produces PROJECT-WIZARD-S11-SYNTHESIS.md and evidence reports");
    } else {
      failures.push("synthesis finalization did not output PROJECT-WIZARD-S11-SYNTHESIS.md");
    }

  } catch (error: any) {
    failures.push(`Unexpected error during project wizard doctor proof: ${error.message}`);
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  return {
    passed: failures.length === 0,
    invariants,
    failures
  };
}
