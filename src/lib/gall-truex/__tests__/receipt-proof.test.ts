import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { createReceipt, verifyReceipt, verifyChain } from '../receipt-proof.js';

describe('Receipt Primitive', () => {
  const hashArb = fc.string({ minLength: 64, maxLength: 64 });
  const idArb = fc.uuid();

  it('Validates pristine receipts', () => {
    fc.assert(
      fc.property(
        idArb, idArb, hashArb, hashArb, fc.option(hashArb),
        (eventId, deltaId, inputHash, outputHash, prevHash) => {
          const r = createReceipt(eventId, deltaId, inputHash, outputHash, prevHash);
          expect(verifyReceipt(r)).toBe(true);
        }
      )
    );
  });

  it('Fails on any tampered field', () => {
    fc.assert(
      fc.property(
        idArb, idArb, hashArb, hashArb, fc.option(hashArb),
        (eventId, deltaId, inputHash, outputHash, prevHash) => {
          const r = createReceipt(eventId, deltaId, inputHash, outputHash, prevHash);
          
          const tamperedInput = { ...r, inputHash: 'bad' };
          expect(verifyReceipt(tamperedInput)).toBe(false);

          const tamperedOutput = { ...r, outputHash: 'bad' };
          expect(verifyReceipt(tamperedOutput)).toBe(false);
          
          const tamperedPrev = { ...r, previousReceiptHash: 'bad' };
          expect(verifyReceipt(tamperedPrev)).toBe(false);
        }
      )
    );
  });

  it('Validates unbroken chains and fails broken ones', () => {
    fc.assert(
      fc.property(
        idArb, idArb, hashArb, hashArb, fc.option(hashArb),
        idArb, idArb, hashArb, hashArb, hashArb,
        (e1, d1, i1, o1, p1, e2, d2, i2, o2, badHash) => {
          const r1 = createReceipt(e1, d1, i1, o1, p1);
          const r2 = createReceipt(e2, d2, i2, o2, r1.receiptHash);
          
          expect(verifyChain(r1, r2)).toBe(true);

          const brokenR2 = { ...r2, previousReceiptHash: badHash };
          expect(verifyChain(r1, brokenR2)).toBe(false);
        }
      )
    );
  });
});
