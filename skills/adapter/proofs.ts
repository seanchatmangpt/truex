import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createDeterministicContext } from "../../packages/truex-core/src/context.js";
import { GallTruexSqliteEngine } from "../replay/mutations.js";
import { TruexAgentAdapter } from "./mutations.js";
import type { HookDefinition } from "../../packages/truex-core/src/runtime-law.js";
import { verifyReceipt } from "../receipt/invariant.js";

export type AdapterProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
};

export function proveAdapter(): AdapterProofReport {
  const failures: string[] = [];
  const invariants = [
    "valid agent proposal admitted",
    "unauthorized proposal refused by ACL gate",
    "speculative failure yields Refused receipt",
    "structural failure yields Refused receipt",
    "admitted receipt validates cryptographically"
  ];

  const dbPath = path.resolve(process.cwd(), 'gall_adapter_proof.db');
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  let db: Database.Database | null = null;
  try {
    db = new Database(dbPath);
    const ctx = createDeterministicContext(100);

    const hooks: HookDefinition[] = [
      {
        id: "audit.log",
        name: "Audit Log Hook",
        condition: { kind: "delta-match", predicate: "schema:stepName" },
        effects: [
          { kind: "emit-event", type: "audit_recorded" }
        ]
      }
    ];

    const engine = new GallTruexSqliteEngine(db, hooks);

    // Setup ACL boundaries
    const allowedAgentsACL = new Map<string, Set<string>>();
    allowedAgentsACL.set("GovernorAgent", new Set(["schema:stepName"])); // Governor is authorized
    allowedAgentsACL.set("MaliciousAgent", new Set()); // Malicious agent has no writes

    const adapter = new TruexAgentAdapter(engine, ctx, allowedAgentsACL);

    // 1. Test Valid Admission
    const validProposal = {
      agentId: "GovernorAgent",
      proposalId: "prop-001",
      delta: {
        id: "delta-valid",
        adds: [{ subject: "urn:audit", predicate: "schema:stepName", object: "Intake" }],
        deletes: []
      }
    };

    const res1 = adapter.submit(validProposal);
    if (res1.committed) {
      console.log("✅ valid agent proposal admitted");
    } else {
      failures.push(`Valid proposal was rejected: ${res1.reason}`);
    }

    if (!verifyReceipt(res1.receipt) || res1.receipt.status !== "confirmed") {
      failures.push("Admitted receipt failed cryptographic self-verification or has incorrect status");
    } else {
      console.log("✅ admitted receipt validates cryptographically");
    }

    // 2. Test ACL Refusal
    const maliciousProposal = {
      agentId: "MaliciousAgent",
      proposalId: "prop-002",
      delta: {
        id: "delta-malicious",
        adds: [{ subject: "urn:audit", predicate: "schema:stepName", object: "Hack" }],
        deletes: []
      }
    };

    const res2 = adapter.submit(maliciousProposal);
    if (res2.committed) {
      failures.push("Malicious proposal was admitted unexpectedly");
    } else {
      if (res2.receipt.status !== "refused" || !res2.reason?.includes("ACL Gate Refused")) {
        failures.push(`ACL rejection generated incorrect receipt: ${JSON.stringify(res2.receipt)}`);
      } else {
        console.log("✅ unauthorized proposal refused by ACL gate");
      }
    }

    // 3. Test Structural Refusal
    const badDeltaProposal = {
      agentId: "GovernorAgent",
      proposalId: "prop-003",
      delta: {
        id: "delta-bad",
        adds: [{ subject: "", predicate: "schema:stepName", object: "EmptySubject" }], // empty subject is structural error
        deletes: []
      }
    };

    const res3 = adapter.submit(badDeltaProposal);
    if (res3.committed) {
      failures.push("Structurally invalid proposal was admitted unexpectedly");
    } else {
      if (res3.receipt.status !== "refused" || !res3.reason?.includes("Intake Validation Failed")) {
        failures.push(`Structural rejection generated incorrect receipt: ${JSON.stringify(res3.receipt)}`);
      } else {
        console.log("✅ structural failure yields Refused receipt");
      }
    }

    // 4. Test Speculative/Execution Refusal
    // We will trigger a UNIQUE constraint failure by pre-populating gall_events with a deterministic UUID
    const ctxMock = createDeterministicContext(321);
    const duplicateEventId = ctxMock.uuid();
    db.prepare("INSERT INTO gall_events (id, hookId, type, deltaId) VALUES (?, ?, ?, ?)")
      .run(duplicateEventId, "pre-existing", "old-type", "old-delta");

    const ctxSpec = createDeterministicContext(321);
    const adapterSpec = new TruexAgentAdapter(engine, ctxSpec, allowedAgentsACL);

    const speculativeProposal = {
      agentId: "GovernorAgent",
      proposalId: "prop-004",
      delta: {
        id: "delta-speculative",
        adds: [{ subject: "urn:audit", predicate: "schema:stepName", object: "Speculate" }],
        deletes: []
      }
    };

    const res4 = adapterSpec.submit(speculativeProposal);
    if (res4.committed) {
      failures.push("Speculatively failing proposal was admitted unexpectedly");
    } else {
      if (res4.receipt.status !== "refused" || !res4.reason?.includes("UNIQUE constraint failed")) {
        failures.push(`Speculative rejection generated incorrect receipt: ${JSON.stringify(res4.receipt)}`);
      } else {
        console.log("✅ speculative failure yields Refused receipt");
      }
    }

  } catch (error_: any) {
    failures.push(`Execution error: ${error_.message}`);
  } finally {
    if (db) db.close();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  }

  return {
    passed: failures.length === 0,
    failures,
    invariants
  };
}
