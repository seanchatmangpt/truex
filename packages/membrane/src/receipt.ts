/**
 * @module receipt
 * @description Gall S₀: Receipt primitives.
 * Provides verifiable, deterministic consequence records (receipts) as operational authority.
 * A receipt must prove: input lineage, output lineage, replay convergence, causal ordering, and tamper detection.
 */
export * from "../../../skills/receipt/mutations.js";
export * from "../../../skills/receipt/invariant.js";
