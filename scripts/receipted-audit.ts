/**
 * @module ReceiptedAudit
 * @description
 * Gall Classification: Gall S5 (Swarm Audit Lifecycle)
 * Purpose: Orchestrates the 5 Swarm Audit Agents within a Receipted Operational Calculus Lifecycle.
 * Generates GraphDeltas and verified receipts for every agent's audit, chaining them 
 * cryptographically and proving replay convergence.
 */

import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createDeterministicContext } from "../packages/membrane/src/context.js";
import { GallTruexSqliteEngine } from "../skills/replay/mutations.js";
import { verifyChain } from "../skills/receipt/invariant.js";
import {
  GovernorAgent,
  ArchitectAgent,
  OperatorAgent,
  DoctorAgent,
  AuditorAgent
} from "../agents/swarm-auditor.js";
import type { HookDefinition, Receipt } from "../packages/membrane/src/runtime-law.js";

/**
 * Main entrypoint for the receipted swarm audit.
 * Instantiates the swarm, executes audits, creates deterministic receipts,
 * verifies cryptographic chains, and asserts replay convergence.
 */
async function main() {
  console.log("=== Launching the 5 Swarm Audit Agents (Receipted Operational Calculus Lifecycle) ===\n");

  const dbPath = path.resolve(process.cwd(), 'gall_receipted_swarm_audit.db');
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  const db = new Database(dbPath);
  const ctx = createDeterministicContext(1337);

  // Define the swarm audit validation hook
  const hooks: HookDefinition[] = [
    {
      id: "swarm.audit.step",
      name: "Swarm Audit Step Ingested",
      condition: { kind: "delta-match", predicate: "schema:stepName" },
      effects: [
        { kind: "emit-event", type: "audit_step_recorded" },
        {
          kind: "add-quad",
          quad: { subject: "urn:truex:swarm", predicate: "schema:auditStatus", object: "completed" }
        }
      ]
    }
  ];

  const engine = new GallTruexSqliteEngine(db, hooks);

  // Instantiate the 5 validation agents
  const governor = new GovernorAgent();
  const architect = new ArchitectAgent();
  const operator = new OperatorAgent();
  const doctor = new DoctorAgent();
  const auditor = new AuditorAgent();

  const agents = [
    { name: "Governor", agent: governor },
    { name: "Architect", agent: architect },
    { name: "Operator", agent: operator },
    { name: "Doctor", agent: doctor },
    { name: "Auditor", agent: auditor }
  ];

  const receipts: Receipt[] = [];
  const deltas: any[] = [];

  // 1. Speculative execution of the 5 audit morphisms
  for (const [i, agent_] of agents.entries()) {
    const { name, agent } = agent_!;
    console.log(`🚀 Executing Agent morphism [${i + 1}/5]: "${name}"...`);

    const result = agent.audit();
    if (!result.passed) {
      throw new Error(`Agent ${name} audit failed! Findings: ${result.findings.join(", ")}`);
    }

    console.log(`   - Findings: ${result.findings.join("; ")}`);

    // Intake GraphDelta representing the consequence of this step
    const delta = {
      id: `delta-audit-${name.toLowerCase()}`,
      adds: [
        { subject: `urn:truex:audit:${name.toLowerCase()}`, predicate: "schema:stepName", object: name },
        { subject: `urn:truex:audit:${name.toLowerCase()}`, predicate: "schema:findings", object: result.findings[0] || "none" }
      ],
      deletes: []
    };

    deltas.push(delta);

    // Evaluate transition inside the SQLite engine (creates receipt and persists)
    const evalResult = engine.evaluate(ctx, delta);
    receipts.push(evalResult.receipt);

    console.log(`   - Receipt generated: ${evalResult.receipt.receiptHash}`);
  }

  console.log("\n=== Verifying Cryptographic Audit Lineage Chain ===");

  // 2. Chaining verification: verify each receipt chains to the next recursively
  let chainValid = true;
  for (let i = 0; i < receipts.length - 1; i++) {
    const r1 = receipts[i]!;
    const r2 = receipts[i + 1]!;
    
    // We update the previous receipt hash pointer on the next receipt before chaining!
    // Since evaluate() generated them, let's verify if the lineage is intact.
    // In our sequential loop, evaluate() uses latest() receipt from SQLite, 
    // so evaluate() automatically linked r2.previousReceiptHash = r1.receiptHash.
    
    const isLinkValid = verifyChain(r1, r2);
    console.log(`🔗 Link [${agents[i]!.name} -> ${agents[i+1]!.name}]: ${isLinkValid ? "✅ VALID" : "❌ BROKEN"}`);
    if (!isLinkValid) {
      chainValid = false;
    }
  }

  if (!chainValid) {
    throw new Error("Swarm Audit lineage chain verification failed!");
  }
  console.log("✅ Lineage Chain verified successfully.");

  console.log("\n=== Verifying Replay Convergence ===");

  // 3. Replay: Re-execute the transitions and assert convergence against receipts
  for (const [i, agent] of agents.entries()) {
    const name = agent!.name;
    const delta = deltas[i]!;
    const receipt = receipts[i]!;

    const replayed = engine.replay(delta, receipt);
    console.log(`🔄 Replay convergence for "${name}": ${replayed ? "✅ CONVERGED" : "❌ DIVERGED"}`);
    if (!replayed) {
      throw new Error(`Replay diverged for agent "${name}"!`);
    }
  }

  console.log("\n✅ All 5 Agent Audits fully receipted, chained, replayed, and converged.");

  db.close();
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
}

main().catch((error_) => {
  console.error(`\n❌ Error during receipted audit execution: ${error_.message}`);
  process.exit(1);
});
