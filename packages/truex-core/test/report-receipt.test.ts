/* eslint-disable unicorn/no-null */
import { describe, it, expect } from "vitest";
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { createDeterministicContext } from "../src/context.js";
import { verifyReceipt, verifyChain } from "../src/receipt.js";
import {
  envelopeReport,
  verifyReportReceipt,
  canonicalizeReport,
} from "../src/integration/report-receipt.js";

describe("Report Receipt Integration", () => {
  const seed = new Uint8Array(32);
  seed.fill(42); // Seed for reproducible key generation
  const keys = ml_dsa65.keygen(seed);

  it("should canonicalize reports correctly", () => {
    // 1. Plain text canonicalization (trim and newline normalization)
    const rawText = "   Hello World!   \r\nNewline testing.  \n";
    const canonicalText = canonicalizeReport(rawText);
    expect(canonicalText).toBe("Hello World!\nNewline testing.");

    // 2. JSON canonicalization (key sorting and spacing)
    const json1 = ' { "b": 2, "a": { "z": 9, "y": 8 } } ';
    const json2 = '{"a":{"y":8,"z":9},"b":2}';
    expect(canonicalizeReport(json1)).toBe(canonicalizeReport(json2));
    expect(canonicalizeReport(json1)).toBe('{"a":{"y":8,"z":9},"b":2}');

    // 3. Invalid JSON falls back to plain string trim/normalization
    const invalidJson = ' { "unclosed: json ';
    expect(canonicalizeReport(invalidJson)).toBe('{ "unclosed: json');
  });

  it("should envelope a report, sign it with ML-DSA, and return a valid Receipt", async () => {
    const report = "System Audit: All systems nominal.";
    const receipt = await envelopeReport(report, keys.secretKey, null);

    // 1. Structural validity
    expect(receipt.id).toBeDefined();
    expect(receipt.eventId).toBeDefined();
    expect(receipt.deltaId).toBeDefined();
    expect(receipt.inputHash).toBeDefined();
    expect(receipt.outputHash).toBeDefined();
    expect(receipt.status).toBe("confirmed");

    // 2. Self-cryptographic integrity check using verifyReceipt
    expect(verifyReceipt(receipt)).toBe(true);

    // 3. Signature validation against public key
    const isValidSignature = verifyReportReceipt(receipt, keys.publicKey);
    expect(isValidSignature).toBe(true);
  });

  it("should fail validation if signature is tampered with", async () => {
    const report = "Sensitive financial report data.";
    const receipt = await envelopeReport(report, keys.secretKey, null);

    // Verify it passes initially
    expect(verifyReportReceipt(receipt, keys.publicKey)).toBe(true);

    // Mutate signature
    const tamperedOutput = receipt.outputHash.replace(/^[0-9a-f]/, (char) => (char === "0" ? "1" : "0"));
    const tamperedReceipt = {
      ...receipt,
      outputHash: tamperedOutput,
      signature: tamperedOutput,
    };

    // Signature verification should fail
    expect(verifyReportReceipt(tamperedReceipt, keys.publicKey)).toBe(false);
  });

  it("should support chaining reports via previousHash", async () => {
    const report1 = "Report Part 1";
    const report2 = "Report Part 2";

    const r1 = await envelopeReport(report1, keys.secretKey, null);
    const r2 = await envelopeReport(report2, keys.secretKey, r1.receiptHash);

    // Check individual receipts are valid
    expect(verifyReceipt(r1)).toBe(true);
    expect(verifyReceipt(r2)).toBe(true);

    // Check signature verification
    expect(verifyReportReceipt(r1, keys.publicKey)).toBe(true);
    expect(verifyReportReceipt(r2, keys.publicKey)).toBe(true);

    // Check chain verification
    expect(verifyChain(r1, r2)).toBe(true);
  });

  it("should behave deterministically when provided with a TruexContext", async () => {
    const report = "Deterministic execution report.";
    const ctx1 = createDeterministicContext(101);
    const ctx2 = createDeterministicContext(101);

    const r1 = await envelopeReport(report, keys.secretKey, null, ctx1);
    const r2 = await envelopeReport(report, keys.secretKey, null, ctx2);

    expect(r1).toEqual(r2);
  });
});
