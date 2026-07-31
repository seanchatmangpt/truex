import { hash } from '../hash/mutations.js';
import { generateKeyPair, signReceiptHash, verifySignature } from '../receipt/mutations.js';

export interface SignatureProofReport {
  readonly passed: boolean;
  readonly failures: readonly string[];
  readonly invariants: readonly string[];
  readonly receiptHash: string;
}

export function proveSignature(): SignatureProofReport {
  const failures: string[] = [];
  const seedA = new Uint8Array(32).fill(0x41);
  const seedB = new Uint8Array(32).fill(0x42);
  const keysA = generateKeyPair(seedA);
  const replayKeysA = generateKeyPair(seedA);
  const keysB = generateKeyPair(seedB);
  const message = hash({ schema: 'truex.signature.fixture.v1', consequence: 'admitted' });
  const signature = signReceiptHash(message, keysA.secretKey);
  const replaySignature = signReceiptHash(message, replayKeysA.secretKey);

  if (keysA.publicKey !== replayKeysA.publicKey || keysA.secretKey !== replayKeysA.secretKey) failures.push('seeded key generation diverged');
  if (signature !== replaySignature) failures.push('signature replay diverged');
  if (!verifySignature(signature, message, keysA.publicKey)) failures.push('valid signature was refused');
  if (verifySignature(signature, `${message}00`, keysA.publicKey)) failures.push('tampered message was admitted');
  if (verifySignature(signature, message, keysB.publicKey)) failures.push('wrong public key was admitted');

  const body = {
    schema: 'truex.signature.proof.v1',
    passed: failures.length === 0,
    message,
    publicKeyDigest: hash(keysA.publicKey),
    signatureDigest: hash(signature),
  };
  return Object.freeze({
    passed: failures.length === 0,
    failures: Object.freeze(failures),
    invariants: Object.freeze([
      'seeded ML-DSA key generation replays identically',
      'signature generation replays identically',
      'valid signature verifies',
      'tampered message is refused',
      'wrong public key is refused',
    ]),
    receiptHash: hash(body),
  });
}
