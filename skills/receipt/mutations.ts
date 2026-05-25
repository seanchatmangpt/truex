/**
 * @module skills/receipt/mutations
 * @description
 * Gall Classification: S0 Receipt Primitives
 * Purpose: Provides functions for generating post-quantum keys (ML-DSA-65), signing, verifying,
 * and creating receipt objects over causal actions.
 */

/* eslint-disable unicorn/no-null */
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { utf8ToBytes, bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import type { TruexContext } from "../../packages/membrane/src/context.js";
import { parseReceipt } from "../../packages/membrane/src/runtime-law.js";
import type { Receipt } from "../../packages/membrane/src/runtime-law.js";
import { hash } from "../hash/mutations.js";

/**
 * Cryptographic keypair for ML-DSA-65.
 */
export type KeyPair = {
  publicKey: string;
  secretKey: string;
};

/**
 * Generates an ML-DSA-65 post-quantum keypair.
 * @param {Uint8Array} [seed] - Optional seed for deterministic generation.
 * @returns {KeyPair} The generated keypair.
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
 * @param {string} receiptHash - The hash to sign.
 * @param {string} secretKeyHex - The secret key in hex format.
 * @returns {string} The signature in hex format.
 */
export function signReceiptHash(receiptHash: string, secretKeyHex: string): string {
  const messageBytes = utf8ToBytes(receiptHash);
  const secretKeyBytes = hexToBytes(secretKeyHex);
  const signatureBytes = ml_dsa65.sign(messageBytes, secretKeyBytes, { extraEntropy: false });
  return bytesToHex(signatureBytes);
}

/**
 * Verifies a signature against a receipt hash and public key.
 * @param {string} signatureHex - The signature in hex format.
 * @param {string} receiptHash - The hash that was signed.
 * @param {string} publicKeyHex - The public key in hex format.
 * @returns {boolean} True if the signature is valid, false otherwise.
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
 * @param {TruexContext} ctx - The deterministic context.
 * @param {string} eventId - The event ID.
 * @param {string} deltaId - The delta ID.
 * @param {string} inputHash - The input hash.
 * @param {string} outputHash - The output hash.
 * @param {string | null | undefined} previousReceiptHash - The previous receipt hash.
 * @param {"confirmed" | "refused"} [status="confirmed"] - The receipt status.
 * @param {KeyPair} [keys] - Optional keys for signing.
 * @param {object} [extra] - Extra metadata.
 * @returns {Receipt} The created receipt.
 */
export function createReceipt(
  ctx: TruexContext,
  eventId: string,
  deltaId: string,
  inputHash: string,
  outputHash: string,
  previousReceiptHash: string | null | undefined,
  status: "confirmed" | "refused" = "confirmed",
  keys?: KeyPair,
  extra?: { rollbackOf?: string; failedChildId?: string; reason?: string }
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
    ...extra,
  };

  const receiptHash = hash(receiptWithoutHash);
  let signature: string | undefined;
  let publicKey: string | undefined;

  if (keys) {
    signature = signReceiptHash(receiptHash, keys.secretKey);
    publicKey = keys.publicKey;
  }

  const fullReceipt = {
    ...receiptWithoutHash,
    receiptHash,
    signature,
    publicKey,
  };

  return parseReceipt(fullReceipt);
}
