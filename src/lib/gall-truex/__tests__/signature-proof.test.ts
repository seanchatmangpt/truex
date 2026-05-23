import { describe, it, expect, beforeAll } from 'vitest';
import fc from 'fast-check';
import { generateKeyPair, signReceiptHash, verifySignature } from '../signature-proof.js';
import type { KeyPair } from '../signature-proof.js';


describe('Signature Primitive (ML-DSA PQC)', () => {
  let keys1: KeyPair;
  let keys2: KeyPair;

  beforeAll(() => {
    keys1 = generateKeyPair();
    keys2 = generateKeyPair();
  });

  it('Validates correctly signed hashes', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 64, maxLength: 64 }), (receiptHash) => {
        const signature = signReceiptHash(receiptHash, keys1.secretKey);
        expect(verifySignature(signature, receiptHash, keys1.publicKey)).toBe(true);
      })
    );
  });

  it('Fails on tampered receipt hashes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 64, maxLength: 64 }),
        fc.string({ minLength: 64, maxLength: 64 }),
        (receiptHash, tamperedHash) => {
          fc.pre(receiptHash !== tamperedHash);
          const signature = signReceiptHash(receiptHash, keys1.secretKey);
          expect(verifySignature(signature, tamperedHash, keys1.publicKey)).toBe(false);
        }
      )
    );
  });

  it('Fails on wrong public key', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 64, maxLength: 64 }), (receiptHash) => {
        const signature = signReceiptHash(receiptHash, keys1.secretKey);
        expect(verifySignature(signature, receiptHash, keys2.publicKey)).toBe(false);
      })
    );
  });
});
