import { hash } from "../hash/mutations.js";
import { createReceipt } from "../receipt/mutations.js";
import { validateProposal } from "./invariant.js";
import type { AgentProposal } from "./invariant.js";
import type { TruexContext } from "../../packages/truex-core/src/context.js";
import type { GallTruexSqliteEngine } from "../replay/mutations.js";
import type { Receipt } from "../../packages/truex-core/src/runtime-law.js";
import { parseGraphDelta } from "../../packages/truex-core/src/runtime-law.js";

export class TruexAgentAdapter {
  constructor(
    private readonly engine: GallTruexSqliteEngine,
    private readonly ctx: TruexContext,
    private readonly allowedAgentsACL: Map<string, Set<string>> // agentId -> Set of allowed predicates
  ) {}

  /**
   * Submits an external agent proposal to the TRUEX operational authority.
   * If any check fails, returns a Refused Receipt and does not apply modifications.
   */
  submit(proposalInput: unknown): { receipt: Receipt; committed: boolean; reason?: string } {
    let proposal: AgentProposal;
    
    // 1. Structure Intake Validation
    try {
      proposal = validateProposal(proposalInput);
    } catch (error_: any) {
      // If validation itself fails, we cannot extract a valid delta, but we create a Refused Receipt
      const dummyId = `refusal-${this.ctx.clock()}`;
      const dummyHash = hash(proposalInput);
      const prevHash = this.engine.getStore().latest()?.receiptHash ?? null;
      const receipt = createReceipt(
        this.ctx,
        "refusal-event",
        dummyId,
        dummyHash,
        dummyHash,
        prevHash,
        "refused"
      );
      this.engine.getStore().append(receipt);
      return { receipt, committed: false, reason: `Intake Validation Failed: ${error_.message}` };
    }

    const delta = parseGraphDelta(proposal.delta);
    const inputHash = hash(delta);
    const prevHash = this.engine.getStore().latest()?.receiptHash ?? null;

    // 2. Capability ACL Gate
    const allowedPredicates = this.allowedAgentsACL.get(proposal.agentId);
    const hasWritePermission = allowedPredicates && delta.adds.every(quad => allowedPredicates.has(quad.predicate));

    if (!hasWritePermission) {
      // ACL violation yields Refused Receipt
      const receipt = createReceipt(
        this.ctx,
        `acl-refusal:${proposal.proposalId}`,
        delta.id,
        inputHash,
        inputHash,
        prevHash,
        "refused"
      );
      this.engine.getStore().append(receipt);
      return { receipt, committed: false, reason: `ACL Gate Refused: Agent "${proposal.agentId}" has no capability to write these predicates` };
    }

    // 3. Execution & Simulation (SQLite Engine)
    try {
      const evalResult = this.engine.evaluate(this.ctx, delta);

      // 4. Replay Convergence check
      const replayed = this.engine.replay(delta, evalResult.receipt);
      if (!replayed) {
        throw new Error("Simulation Replay diverged (non-deterministic output detected)");
      }

      return { receipt: evalResult.receipt, committed: true };

    } catch (error_: any) {
      // Speculative failure yields Refused Receipt
      const receipt = createReceipt(
        this.ctx,
        `execution-refusal:${proposal.proposalId}`,
        delta.id,
        inputHash,
        inputHash,
        prevHash,
        "refused"
      );
      this.engine.getStore().append(receipt);
      return { receipt, committed: false, reason: `Execution Rejected: ${error_.message}` };
    }
  }
}
