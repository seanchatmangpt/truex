/**
 * @module signature-proof
 * @description
 * Gall Classification: S₋₁ - Hash/Signature Primitive
 * Purpose: Implements exhaustive, receiptable operations without deferred logic or stubs.
 */
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { utf8ToBytes, bytesToHex, hexToBytes } from '@noble/hashes/utils.js';


/**
 * KeyPair
 * @remarks Complies with Gall Law by executing exhaustive logic.
 */
export type KeyPair = {
  publicKey: string;
  secretKey: string;
};

/**
 * Generates an ML-DSA-65 post-quantum keypair.
 * Returns the keys encoded as hex strings.
 */
export function generateKeyPair(seed?: Uint8Array): KeyPair {
  // Noble's ML-DSA keygen optionally takes a 32-byte seed. 
  // If not provided, it generates one internally.
  // The module we import expects standard operation.
  const keys = ml_dsa65.keygen(seed);
  return {
    publicKey: bytesToHex(keys.publicKey),
    secretKey: bytesToHex(keys.secretKey),
  };
}

/**
 * Signs a receipt hash using ML-DSA.
 * The receipt hash is expected to be a hex string.
 * Returns the signature as a hex string.
 */
export function signReceiptHash(receiptHash: string, secretKeyHex: string): string {
  const messageBytes = utf8ToBytes(receiptHash);
  const secretKeyBytes = hexToBytes(secretKeyHex);
  const signatureBytes = ml_dsa65.sign(messageBytes, secretKeyBytes, { extraEntropy: false });
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
    // noble throws on invalid format, which means invalid verification
    return false;
  }
}

