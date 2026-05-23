import { parseGraphDelta } from "../../packages/truex-core/src/runtime-law.js";

export type AgentProposal = {
  agentId: string;
  proposalId: string;
  delta: any;
};

/**
 * Validates the structure and typing of an incoming AgentProposal.
 */
export function validateProposal(input: unknown): AgentProposal {
  if (!input || typeof input !== "object") {
    throw new TypeError("AgentProposal must be a non-null object");
  }
  const p = input as Record<string, unknown>;
  if (typeof p.agentId !== "string" || !p.agentId) {
    throw new Error("AgentProposal.agentId must be a non-empty string");
  }
  if (typeof p.proposalId !== "string" || !p.proposalId) {
    throw new Error("AgentProposal.proposalId must be a non-empty string");
  }
  if (!p.delta) {
    throw new Error("AgentProposal.delta is required");
  }
  
  // Validate delta syntax using core runtime-law parser
  parseGraphDelta(p.delta);

  return {
    agentId: p.agentId,
    proposalId: p.proposalId,
    delta: p.delta
  };
}
