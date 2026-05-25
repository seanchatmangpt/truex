import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { createDeterministicContext } from "../src/context.js";
import { createReceipt, verifyReceipt, verifyChain } from "../src/receipt.js";

describe("Receipt Primitive Properties", () => {
  it("∀ admissible receipt, verification succeeds, and tampering with any field invalidates the receipt hash", () => {
    fc.assert(
      fc.property(
        fc.nat(), // seed for context
        fc.string({ minLength: 1 }), // eventId
        fc.string({ minLength: 1 }), // deltaId
        fc.string({ minLength: 1 }), // inputHash
        fc.string({ minLength: 1 }), // outputHash
        fc.option(fc.string({ minLength: 1 })), // previousReceiptHash
        fc.constantFrom("confirmed" as const, "refused" as const), // status
        fc.constantFrom("eventId", "deltaId", "inputHash", "outputHash", "previousReceiptHash", "status"), // field to tamper
        fc.string({ minLength: 1 }), // new tampered value
        (seed, eventId, deltaId, inputHash, outputHash, prevHash, status, fieldToTamper, tamperedValue) => {
          const ctx = createDeterministicContext(seed);
          const receipt = createReceipt(ctx, eventId, deltaId, inputHash, outputHash, prevHash, status);

          // Property 1: A freshly generated receipt is valid
          expect(verifyReceipt(receipt)).toBe(true);

          // Property 2: Mutating any field invalidates the receipt hash
          const tampered = { ...receipt };

          if (fieldToTamper === "previousReceiptHash") {
            // make sure it actually changes
            const originalVal = receipt[fieldToTamper];
            const newVal = originalVal === null ? tamperedValue : null;
            (tampered as any)[fieldToTamper] = newVal;
          } else {
            const originalVal = receipt[fieldToTamper as keyof typeof receipt];
            // Ensure we don't accidentally set it to the same value
            if (originalVal === tamperedValue) {
              (tampered as any)[fieldToTamper] = originalVal + "_mutated";
            } else {
              (tampered as any)[fieldToTamper] = tamperedValue;
            }
          }

          expect(verifyReceipt(tampered)).toBe(false);
        }
      )
    );
  });

  it("∀ correct chain r1 -> r2, verifyChain returns true, and wrong previous hash returns false", () => {
    fc.assert(
      fc.property(
        fc.nat(),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (seed, inputHash1, inputHash2) => {
          const ctx = createDeterministicContext(seed);
          const r1 = createReceipt(ctx, "evt-1", "delta-1", inputHash1, "out-1", null);
          const r2 = createReceipt(ctx, "evt-2", "delta-2", inputHash2, "out-2", r1.receiptHash);

          // Valid chain
          expect(verifyChain(r1, r2)).toBe(true);

          // Tampered previous hash
          const brokenChain = { ...r2, previousReceiptHash: "wrong_previous_hash" };
          expect(verifyChain(r1, brokenChain)).toBe(false);
        }
      )
    );
  });
});
