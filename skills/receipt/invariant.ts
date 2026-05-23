import { parseReceipt } from "../../packages/truex-core/src/runtime-law.js";
import type { Receipt } from "../../packages/truex-core/src/runtime-law.js";
import { hash } from "../hash/mutations.js";

/**
 * Verifies the cryptographic self-integrity of a receipt by re-hashing its fields.
 */
export function verifyReceipt(receipt: Receipt): boolean {
  try {
    const parsed = parseReceipt(receipt);
    const { receiptHash, ...receiptWithoutHash } = parsed;
    // Strip potential signature property from the hash source
    const { signature, ...canonicalForm } = receiptWithoutHash as any;
    return hash(canonicalForm) === receiptHash;
  } catch {
    return false;
  }
}

/**
 * Verifies that r2 is correctly chained to r1.
 * Performs a recursive verification check on both receipts first.
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
