/* eslint-disable unicorn/no-null */
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { utf8ToBytes, bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import type { TruexContext } from "../../packages/truex-core/src/context.js";
import { parseReceipt } from "../../packages/truex-core/src/runtime-law.js";
import type { Receipt } from "../../packages/truex-core/src/runtime-law.js";
import { hash } from "../hash/mutations.js";

export type KeyPair = {
  publicKey: string;
  secretKey: string;
};

/**
 * Generates an ML-DSA-65 post-quantum keypair.
 */
export function generateKeyPair(seed?: Uint8Array): KeyPair {
  const keys = ml_dsa65.keygen(seed);
  return {
    publicKey: bytesToHex(keys.publicKey),
    secretKey: bytesToHex(keys.secretKey),
  };
}

/**
 * Signs a receipt hash using ML-DSA.
 */
export function signReceiptHash(receiptHash: string, secretKeyHex: string): string {
  const messageBytes = utf8ToBytes(receiptHash);
  const secretKeyBytes = hexToBytes(secretKeyHex);
  const signatureBytes = ml_dsa65.sign(messageBytes, secretKeyBytes);
  return bytesToHex(signatureBytes);
}

/**
 * Verifies a signature against a receipt hash and public key.
 */
export function verifySignature(signatureHex: string, receiptHash: string, publicKeyHex: string): boolean {
  try {
    const signatureBytes = hexToBytes(signatureHex);
    const messageBytes = utf8ToBytes(receiptHash);
    const publicKeyBytes = hexToBytes(publicKeyHex);
    return ml_dsa65.verify(signatureBytes, messageBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

/**
 * Creates a receipt using explicit TruexContext.
 */
export function createReceipt(
  ctx: TruexContext,
  eventId: string,
  deltaId: string,
  inputHash: string,
  outputHash: string,
  previousReceiptHash: string | null | undefined,
  status: "confirmed" | "refused" = "confirmed"
): Receipt {
  const normalizedPrevHash = (previousReceiptHash === undefined || previousReceiptHash === null) ? null : previousReceiptHash;
  const receiptWithoutHash = {
    id: ctx.uuid(),
    eventId,
    deltaId,
    inputHash,
    outputHash,
    previousReceiptHash: normalizedPrevHash,
    status,
  };

  const fullReceipt = {
    ...receiptWithoutHash,
    receiptHash: hash(receiptWithoutHash),
  };

  return parseReceipt(fullReceipt);
}
