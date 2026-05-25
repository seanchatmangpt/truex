/**
 * @module skills/telco/telco-proof
 * @description
 * Gall Classification: Proof Layer
 * Purpose: Proves the Telco agent's operational integrity, verifying that valid state transitions
 * produce conforming OCEL envelopes, and that any tampering of the payload, batch hash, or receipt hash
 * is reliably detected and refused.
 */

import { TelcoAgent } from "../../agents/telco/agent.js";
import { OcelCollector } from "../membrane/mutations.js";

/**
 * Report structure for Telco proofs.
 */
export type TelcoProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
};

/**
 * Executes tests to prove the Telco agent boundaries and tamper resistance.
 * @returns {TelcoProofReport} The proof results.
 */
export function proveTelco(): TelcoProofReport {
  const failures: string[] = [];
  const invariants: string[] = [];
  const telco = new TelcoAgent();

  try {
    // 1. Ingest a valid transition and verify the envelope
    const state = { balance: 1000 };
    const { envelope, isValid } = telco.ingestTransition(
      "Deposit",
      "Alice",
      state,
      1500
    );

    if (isValid && OcelCollector.verifyEnvelope(envelope)) {
      invariants.push("valid ingested transition creates conforming signed envelope");
    } else {
      failures.push("failed to verify valid signed envelope");
    }

    // 2. Tamper the envelope ocel payload
    const tamperedOcelEnvelope = JSON.parse(JSON.stringify(envelope));
    tamperedOcelEnvelope.ocel.objects[0]['ocel:attributes'].balance = 999_999; // modify balance unlawfully
    
    if (OcelCollector.verifyEnvelope(tamperedOcelEnvelope)) {
      failures.push("failed to reject tampered ocel payload");
    } else {
      invariants.push("tampered ocel payload fails validation (tamper resistance proof)");
    }

    // 3. Tamper the batch hash
    const tamperedHashEnvelope = JSON.parse(JSON.stringify(envelope));
    tamperedHashEnvelope.ocelBatchHash = "corrupted_hash";
    
    if (OcelCollector.verifyEnvelope(tamperedHashEnvelope)) {
      failures.push("failed to reject tampered ocelBatchHash");
    } else {
      invariants.push("tampered ocelBatchHash fails validation (tamper resistance proof)");
    }

    // 4. Tamper the receipt hash
    const tamperedReceiptEnvelope = JSON.parse(JSON.stringify(envelope));
    tamperedReceiptEnvelope.receiptHash = "corrupted_receipt_hash";
    
    if (OcelCollector.verifyEnvelope(tamperedReceiptEnvelope)) {
      failures.push("failed to reject tampered receiptHash");
    } else {
      invariants.push("tampered receiptHash fails validation (tamper resistance proof)");
    }

  } catch (error: any) {
    failures.push(`Unexpected error during telco proof: ${error.message}`);
  }

  return {
    passed: failures.length === 0,
    invariants,
    failures
  };
}
