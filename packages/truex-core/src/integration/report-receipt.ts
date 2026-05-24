/**
 * @module report-receipt
 * @description Cryptographic receipts for operational reports using ML-DSA.
 * Gall Classification: S0 (receipt primitives).
 */
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { utf8ToBytes, bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { blake3 } from '@noble/hashes/blake3.js';
import { randomUUID } from 'node:crypto';
import { createReceipt, verifyReceipt } from '../receipt.js';
import { stableJson } from '../hash.js';
import { type TruexContext, createDeterministicContext } from '../context.js';
import type { Receipt } from '../runtime-law.js';

export interface SignedReceipt extends Receipt {
  signature?: string;
}

/**
 * Canonicalizes a report string.
 * If the string is a valid JSON document, it parses it and sorts object keys,
 * formatting it using stableJson. Otherwise, it trims whitespace from each line
 * and joins them back with newlines.
 */
export function canonicalizeReport(reportText: string): string {
  const trimmed = reportText.trim().replace(/\r\n/g, '\n');
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed !== null && typeof parsed === 'object') {
      return stableJson(parsed);
    }
  } catch {
    // Return trimmed and newline-normalized string if not JSON
  }
  
  // Trim each line, filter out empty lines to ensure canonical structure
  return reportText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

/**
 * Envelopes a report string by canonicalizing it, computing its BLAKE3 hash,
 * signing the hash using the ML-DSA post-quantum signature algorithm (ML-DSA-65)
 * in a deterministic manner, and returning a valid Receipt object containing the signature in outputHash.
 */
export async function envelopeReport(
  reportText: string,
  privateKey: Uint8Array,
  previousHash: string | null,
  ctx?: TruexContext
): Promise<Receipt> {
  const canonical = canonicalizeReport(reportText);
  const inputHashBytes = blake3(utf8ToBytes(canonical));
  const inputHash = bytesToHex(inputHashBytes);

  const messageBytes = utf8ToBytes(inputHash);
  // Using extraEntropy: false guarantees deterministic, reproducible post-quantum signatures
  const signatureBytes = ml_dsa65.sign(messageBytes, privateKey, { extraEntropy: false });
  const signatureHex = bytesToHex(signatureBytes);

  const activeCtx: TruexContext = ctx || createDeterministicContext(0);

  const eventId = `evt_${activeCtx.clock()}`;
  const deltaId = `delta_${activeCtx.uuid()}`;

  const receipt = createReceipt(
    activeCtx,
    eventId,
    deltaId,
    inputHash,
    signatureHex,
    previousHash
  );

  return {
    ...receipt,
    signature: signatureHex,
  } as SignedReceipt;
}

/**
 * Verifies the post-quantum signature on a report receipt.
 */
export function verifyReportReceipt(receipt: Receipt & { signature?: string }, publicKey: Uint8Array): boolean {
  try {
    if (!verifyReceipt(receipt)) {
      return false;
    }
    const signatureHex = receipt.signature || receipt.outputHash;
    if (!signatureHex) {
      return false;
    }
    if (receipt.signature && receipt.outputHash && receipt.signature !== receipt.outputHash) {
      return false;
    }
    const signatureBytes = hexToBytes(signatureHex);
    const messageBytes = utf8ToBytes(receipt.inputHash);
    return ml_dsa65.verify(signatureBytes, messageBytes, publicKey);
  } catch {
    return false;
  }
}
