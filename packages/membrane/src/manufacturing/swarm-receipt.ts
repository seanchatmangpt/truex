import * as crypto from 'node:crypto';
import type { ISODateTime, ReceiptHash } from '../ocel2-project-types.js';

/**
 * SwarmReceipt represents a cryptographically linked record of agent-to-agent delegation.
 * This ensures causal accountability within the autonomic swarm.
 */
export interface SwarmReceipt {
  /** Unique receipt identifier */
  readonly id: string;
  /** Hash of the previous receipt in the chain, establishing causality */
  readonly parentReceiptHash?: ReceiptHash;
  /** The agent initiating the delegation */
  readonly delegator: string;
  /** The agent being invoked */
  readonly delegatee: string;
  /** The specific command or action requested */
  readonly action: string;
  /** The confidence level of the delegating agent in this action (0.0 to 1.0) */
  readonly confidence: number;
  /** ISO timestamp of the receipt emission */
  readonly timestamp: ISODateTime;
  /** Optional structured metadata describing the context of the delegation */
  readonly metadata?: Record<string, any>;
  /** Cryptographic hash of the receipt content (excluding this field) */
  readonly receiptHash: ReceiptHash;
}

/**
 * Generates a new SwarmReceipt, linking it to a previous receipt if provided.
 */
export function generateSwarmReceipt(
  delegator: string,
  delegatee: string,
  action: string,
  confidence: number,
  parentReceiptHash?: ReceiptHash,
  metadata?: Record<string, any>
): SwarmReceipt {
  const timestamp = new Date().toISOString() as ISODateTime;
  const id = `srcpt-${crypto.randomUUID().slice(0, 8)}`;
  
  // Construct a stable object for hashing
  const hashableContent = {
    parentReceiptHash,
    delegator,
    delegatee,
    action,
    confidence,
    timestamp,
    metadata: metadata || {}
  };

  const contentStr = JSON.stringify(hashableContent, Object.keys(hashableContent).sort());
  const receiptHash = crypto.createHash('sha256').update(contentStr).digest('hex') as ReceiptHash;

  return {
    id,
    parentReceiptHash,
    delegator,
    delegatee,
    action,
    confidence,
    timestamp,
    metadata,
    receiptHash
  };
}
