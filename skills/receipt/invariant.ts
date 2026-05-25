/**
 * @module skills/receipt/invariant
 * @description
 * Gall Classification: S0 Receipt Primitives
 * Purpose: Validates cryptographic self-integrity of a receipt.
 * Ensures hashes correctly map to payloads and recursively validates receipt chains.
 */

import { parseReceipt } from "../../packages/membrane/src/runtime-law.js";
import type { Receipt } from "../../packages/membrane/src/runtime-law.js";
import { hash } from "../hash/mutations.js";
import { verifySignature } from "./mutations.js";

/**
 * Verifies the cryptographic self-integrity of a receipt by re-hashing its fields.
 * If a signature is present, it also verifies the ML-DSA signature.
 * @param {Receipt} receipt - The receipt to verify.
 * @returns {boolean} True if the receipt is valid, false otherwise.
 */
export function verifyReceipt(receipt: Receipt): boolean {
  try {
    const parsed = parseReceipt(receipt);
    const { receiptHash, signature, publicKey, ...receiptWithoutHash } = parsed;
    
    // 1. Verify Hash Integrity
    const cleanReceiptWithoutHash = { ...receiptWithoutHash };
    for (const key of Object.keys(cleanReceiptWithoutHash)) {
      if ((cleanReceiptWithoutHash as any)[key] === undefined) {
        delete (cleanReceiptWithoutHash as any)[key];
      }
    }

    if (hash(cleanReceiptWithoutHash) !== receiptHash) {
      return false;
    }

    // 2. Verify Signature Integrity (if present)
    if (signature && publicKey) {
      return verifySignature(signature, receiptHash, publicKey);
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies that r2 is correctly chained to r1.
 * Performs a recursive verification check on both receipts first.
 * @param {Receipt} r1 - The parent receipt.
 * @param {Receipt} r2 - The child receipt.
 * @returns {boolean} True if chained correctly, false otherwise.
 */
export function verifyChain(r1: Receipt, r2: Receipt): boolean {
  try {
    if (!verifyReceipt(r1) || !verifyReceipt(r2)) {
      return false;
    }
    const parsed1 = parseReceipt(r1);
    const parsed2 = parseReceipt(r2);
    return parsed2.previousReceiptHash === parsed1.receiptHash;
  } catch {
    return false;
  }
}
