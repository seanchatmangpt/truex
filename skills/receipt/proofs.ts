/**
 * @module skills/receipt/proofs
 * @description
 * Gall Classification: Proof Layer (S0)
 * Purpose: Proves cryptographic receipt invariants including ML-DSA-65 signature generation,
 * signature verification, tamper resistance, and the lineage of chained receipts.
 */

import { generateKeyPair, signReceiptHash, verifySignature, createReceipt } from "./mutations.js";
import { verifyReceipt, verifyChain } from "./invariant.js";
import { createDeterministicContext } from "../../packages/membrane/src/context.js";
import { hash } from "../hash/mutations.js";

/**
 * Report structure for Receipt proofs.
 */
export type ReceiptProofReport = {
  passed: boolean;
  failures: string[];
  invariants: string[];
};

/**
 * Executes tests to prove cryptographic receipt invariants.
 * @returns {ReceiptProofReport} The proof results.
 */
export function proveReceipt(): ReceiptProofReport {
  const failures: string[] = [];
  const invariants = [
    "receipt signs",
    "signature verifies",
    "tampered receipt fails signature verification",
    "wrong public key fails signature verification",
    "receipt generated with valid hash",
    "receipt chaining verified",
    "tampered receipt fails verification",
    "broken chain fails verification"
  ];

  try {
    // 1. Signature Tests
    const keys1 = generateKeyPair();
    const keys2 = generateKeyPair();
    const receiptHash = hash({ action: "Approve Payment", id: "123" });

    const signature = signReceiptHash(receiptHash, keys1.secretKey);
    if (!signature || signature.length === 0) failures.push("receipt signs failed");

    const isValid = verifySignature(signature, receiptHash, keys1.publicKey);
    if (!isValid) failures.push("signature verifies failed");

    const tamperedHash = hash({ action: "Approve Payment", id: "999" });
    if (verifySignature(signature, tamperedHash, keys1.publicKey)) {
      failures.push("tampered receipt validation succeeded unexpectedly");
    }

    if (verifySignature(signature, receiptHash, keys2.publicKey)) {
      failures.push("wrong public key validation succeeded unexpectedly");
    }

    // 2. Receipt Lineage & Chaining Tests
    const ctx = createDeterministicContext(42);
    const r1 = createReceipt(ctx, "evt-1", "delta-1", "hashIn1", "hashOut1", null);
    if (!verifyReceipt(r1)) failures.push("receipt verification failed");

    const r2 = createReceipt(ctx, "evt-2", "delta-2", "hashIn2", "hashOut2", r1.receiptHash);
    if (!verifyChain(r1, r2)) failures.push("receipt chaining failed");

    const tampered = { ...r1, inputHash: "hackedHash" };
    if (verifyReceipt(tampered)) failures.push("tampered receipt verification succeeded unexpectedly");

    const brokenChain = { ...r2, previousReceiptHash: "wrongHash" };
    if (verifyChain(r1, brokenChain)) failures.push("broken chain validation succeeded unexpectedly");

    // Adversarial testing of verifyChain recursive logic:
    // If r1 is tampered, verifyChain(r1, r2) MUST fail even if r2's link is intact
    const tamperedR1 = { ...r1, outputHash: "FORGED" };
    if (verifyChain(tamperedR1, r2)) {
      failures.push("verifyChain succeeded on a chain with a tampered parent receipt (missing recursive check)");
    }

  } catch (error_: any) {
    failures.push(`Execution error: ${error_.message}`);
  }

  return {
    passed: failures.length === 0,
    failures,
    invariants
  };
}
