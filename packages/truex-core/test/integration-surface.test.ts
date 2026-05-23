import { describe, it, expect } from "vitest";
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { createDeterministicContext } from "../src/context.js";
import { compileTaskToDelta } from "../src/integration/task-delta.js";
import { envelopeReport, verifyReportReceipt } from "../src/integration/report-receipt.js";
import { interceptAgyExecution } from "../src/integration/hook-interceptor.js";
import { replayTrajectory } from "../src/integration/trajectory-replay.js";
import { validateSkillMarkdown } from "../src/integration/skill-sandbox.js";
import type { HookDefinition } from "../src/runtime-law.js";

describe("AGY-Truex Integration Surface Tests", () => {
  // Test 1: Task to GraphDelta Compiler
  it("compiles markdown checklist to GraphDelta quads", () => {
    const taskMarkdown = `
# Tasks
- [x] Fix the type import SyntaxError
- [ ] Implement Task to GraphDelta Compiler
- [x] Implement Subagent Report Signer
    `;
    const delta = compileTaskToDelta(taskMarkdown);
    expect(delta.id).toBeDefined();
    expect(delta.adds.length).toBe(3);
    expect(delta.adds[0].subject).toBe("urn:agy:task:fix_the_type_import_syntaxerror");
    expect(delta.adds[0].object).toBe("confirmed");
    expect(delta.adds[1].subject).toBe("urn:agy:task:implement_task_to_graphdelta_compiler");
    expect(delta.adds[1].object).toBe("unconfirmed");
    expect(delta.adds[2].subject).toBe("urn:agy:task:implement_subagent_report_signer");
    expect(delta.adds[2].object).toBe("confirmed");
  });

  // Test 2: Subagent Report Signer & Receipt Enveloper
  it("signatures and verifies subagent report markdown receipts", async () => {
    const reportText = "VERDICT: DIVERGENT\nSuspected Cause: SyntaxError in receipt-store.ts";
    const seed = new Uint8Array(32);
    seed.fill(42);
    const keys = ml_dsa65.keygen(seed);
    const ctx = createDeterministicContext(100);

    const receipt = await envelopeReport(reportText, keys.secretKey, null, ctx);
    expect(receipt.id).toBeDefined();
    expect(receipt.inputHash).toBeDefined();
    expect(receipt.status).toBe("confirmed");

    const verified = verifyReportReceipt(receipt, keys.publicKey);
    expect(verified).toBe(true);

    const tamperedReceipt = { ...receipt, inputHash: "tampered-hash-value" };
    expect(verifyReportReceipt(tamperedReceipt, keys.publicKey)).toBe(false);
  });

  // Test 3: AGY Hook Interceptor Membrane
  it("intercepts run_command and write_file actions based on Hook laws", () => {
    const hooks: HookDefinition[] = [
      {
        id: "block-rm-rf",
        name: "Block Dangerous Commands",
        condition: { kind: "delta-match", predicate: "run_command" },
        effects: [{ kind: "emit-event", type: "deny-prefix:rm -rf" }]
      }
    ];

    const allowedAction = interceptAgyExecution({ type: "run_command", target: "git status" }, hooks);
    expect(allowedAction.allowed).toBe(true);

    const deniedAction = interceptAgyExecution({ type: "run_command", target: "rm -rf /" }, hooks);
    expect(deniedAction.allowed).toBe(false);
    expect(deniedAction.reason).toContain("forbidden prefix");
  });

  // Test 4: Agent Trajectory Replayer
  it("deterministic-replays flat and nested state mutation trajectory logs", () => {
    const initialState = {
      config: { active: false, count: 0 },
      status: "pending"
    };
    const journal = [
      { trap: "set" as const, property: "status", value: "active" },
      { trap: "set" as const, property: "config.active", value: true },
      { trap: "set" as const, property: "config.count", value: 10 }
    ];

    const finalState = replayTrajectory(initialState, journal);
    expect(finalState.status).toBe("active");
    expect(finalState.config.active).toBe(true);
    expect(finalState.config.count).toBe(10);
    // Ensure original state remains untouched
    expect(initialState.status).toBe("pending");
  });

  // Test 5: SKILL.md Sandbox Validator
  it("validates SKILL.md instructions and rejects law violations", () => {
    const validSkill = `
# Stable Skill
This skill performs deterministic calculations.
\`\`\`javascript
const hash = blake3("hello");
\`\`\`
    `;
    const invalidSkill = `
# Unstable Skill
\`\`\`javascript
const randomValue = Math.random();
const now = Date.now();
\`\`\`
    `;

    const validResult = validateSkillMarkdown(validSkill);
    expect(validResult.valid).toBe(true);

    const invalidResult = validateSkillMarkdown(invalidSkill);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.violations.length).toBeGreaterThanOrEqual(2);
  });
});
