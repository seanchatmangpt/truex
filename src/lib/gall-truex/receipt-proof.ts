/**
 * @module receipt-proof
 * @description
 * Gall Classification: S₀ - Receipt Primitive
 * Purpose: Implements exhaustive, receiptable operations without deferred logic or stubs.
 */
import { hash } from "./hash-proof.js";
import { signReceiptHash, verifySignature } from "./signature-proof.js";
import type { KeyPair } from "./signature-proof.js";


/**
 * ReceiptPrimitive
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export type ReceiptPrimitive = {
  id: string;
  eventId: string;
  deltaId: string;
  inputHash: string;
  outputHash: string;
  previousReceiptHash: string | null;
  status: "confirmed" | "refused";
  receiptHash: string;
  signature?: string;
  publicKey?: string;
};

let seedState = 12_345;


/**
 * setReceiptProofSeed
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export function setReceiptProofSeed(seed: number): void {
  seedState = seed >>> 0;
}

const nextRand = (): number => {
  let t = (seedState += 0x6d_2b_79_f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
};

const nextBytes = (len: number): Uint8Array => {
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = Math.floor(nextRand() * 256);
  }
  return bytes;
};

const bytesToHex = (bytes: Uint8Array): string => {
  return [...bytes]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};


/**
 * deterministicUUID
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export function deterministicUUID(): string {
  const b = nextBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40; // Version 4
  b[8] = (b[8] & 0x3f) | 0x80; // Variant 10xx
  
  return [
    bytesToHex(b.subarray(0, 4)),
    bytesToHex(b.subarray(4, 6)),
    bytesToHex(b.subarray(6, 8)),
    bytesToHex(b.subarray(8, 10)),
    bytesToHex(b.subarray(10, 16))
  ].join("-");
}

// The Receipt Primitive Operations

/**
 * createReceipt
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export function createReceipt(
  eventId: string,
  deltaId: string,
  inputHash: string,
  outputHash: string,
  previousReceiptHash: string | null,
  status: "confirmed" | "refused" = "confirmed",
  ctx?: { uuid: () => string },
  keys?: KeyPair
): ReceiptPrimitive {
  const receiptWithoutHash = {
    id: ctx ? ctx.uuid() : deterministicUUID(),
    eventId,
    deltaId,
    inputHash,
    outputHash,
    previousReceiptHash,
    status,
  };

  const receiptHash = hash(receiptWithoutHash);
  let signature: string | undefined;
  let publicKey: string | undefined;

  if (keys) {
    signature = signReceiptHash(receiptHash, keys.secretKey);
    publicKey = keys.publicKey;
  }

  return {
    ...receiptWithoutHash,
    receiptHash,
    signature,
    publicKey,
  };
}


/**
 * verifyReceipt
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export function verifyReceipt(receipt: ReceiptPrimitive): boolean {
  const { receiptHash, signature, publicKey, ...receiptWithoutHash } = receipt;
  
  // 1. Verify Hash Integrity
  if (hash(receiptWithoutHash) !== receiptHash) {
    return false;
  }

  // 2. Verify Signature Integrity (if present)
  if (signature && publicKey) {
    return verifySignature(signature, receiptHash, publicKey);
  }

  return true;
}


/**
 * verifyChain
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export function verifyChain(r1: ReceiptPrimitive, r2: ReceiptPrimitive): boolean {
  // Lineage requires both receipts be internally valid AND r2 points to r1
  return verifyReceipt(r1) && verifyReceipt(r2) && r2.previousReceiptHash === r1.receiptHash;
}
