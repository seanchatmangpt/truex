# Runtime Hardening & Cryptographic Audit Report

## 1. Executive Summary
This report verifies and validates the cryptographic integrity, receipt chain lineage, and post-quantum digital signature mechanisms within the TRUEX runtime environment. Consistent with the constraints and axioms in `AGENTS.md` (e.g., Gall sequencing, Testing Law, Replay Law, and Entropy Law), we have conducted a security audit, introduced defensive hardening measures, and expanded the testing surface to verify both lawful state convergence and adversarial tampering failures.

All tests run across the core packages (`packages/truex-core/test`) and the low-level Gall proof suites (`src/lib/gall-truex/__tests__`) have successfully converged and passed.

---

## 2. Threat Model & Audit Goals
To establish deterministic consequence and receipted operational trust, the runtime must defend against five primary threat categories:

1. **Receipt Tampering**: Modifying the metadata or contents of an already-committed receipt.
2. **Chain Reordering**: Scrambling the execution sequence of receipts to bypass causal ordering (e.g., replay attacks, state rollbacks).
3. **Lineage Hijacking (Wrong Previous Hash)**: Inserting foreign receipts or splicing chains by specifying mismatched predecessor hashes.
4. **Signature Forgery & Tampering**: Generating false assertions or altering signatures on receipt payloads.
5. **Canonicalization Drift / Mismatched Bytes**: Non-deterministic serialization producing divergent hashes for semantically identical structures, causing false validation failures or allowing malicious evasion.

---

## 3. Hardening Controls & Implementation

### 3.1. Deterministic Canonicalization
Canonicalization is handled via `stableJson` in both the production `skills/hash/mutations.ts` and the Gall primitive `src/lib/gall-truex/hash-proof.ts`. Object keys are sorted alphabetically recursively, and arrays maintain their exact order. This prevents object representation changes due to key ordering variation, ensuring that semantically identical payloads produce identical byte buffers for hashing.

```typescript
export function stableJson(value: unknown): string {
  assertValidHashInput(value);
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(object[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
```

For reports, `canonicalizeReport` is used. If a report is valid JSON, it is parsed and normalized using `stableJson`; otherwise, it undergoes line-by-line trimming and filtering of empty lines to prevent spacing discrepancies from altering the hash.

### 3.2. Consistent Cryptographic Hashing (BLAKE3)
BLAKE3 is utilized consistently as the first-class hashing function across the codebase. All hash values are represented as a standard 64-character hexadecimal string, validated using standard format checks (`/^[0-9a-f]{64}$/i`).

### 3.3. Receipt Chain Lineage
Receipt chain validation relies on the strict relation:
$$\text{receipt}_2.\text{previousReceiptHash} = \text{receipt}_1.\text{receiptHash}$$
To prevent spoofing or splicing, `verifyChain` validates both receipts individually via `verifyReceipt` first. This enforces that both the parent and child receipts are cryptographically intact before checking their linked predecessor hash.

```typescript
export function verifyChain(r1: Receipt, r2: Receipt): boolean {
  try {
    if (!verifyReceipt(r1) || !verifyReceipt(r2)) {
      return false;
    }
    const parsed1 = parseReceipt(r1);
    const parsed2 = parseReceipt(r2);
    return parsed2.previousReceiptHash === parsed1.receiptHash;
  } catch {
    return false;
  }
}
```

### 3.4. Post-Quantum ML-DSA Signature Creation & Verification
We hardened the ML-DSA-65 post-quantum signature creation to use `{ extraEntropy: false }`. This aligns with the **Replay Law** ($same\ input + same\ law = same\ consequence$): signature generation is fully reproducible during replay, eliminating the non-deterministic random seed entropy typical of vanilla post-quantum signature schemes.

`verifyReportReceipt` was hardened to execute a self-integrity validation on the receipt payload first, ensuring that `signature` and `outputHash` properties are matched, preventing attackers from providing a valid signature alongside tampered metadata.

```typescript
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
```

---

## 4. Test Expansion & Adversarial Coverage
We expanded the test suite in `packages/truex-core/test/report-receipt.test.ts` to assert security limits explicitly:

1. **Tampered Receipt Fails**: Mutates each attribute (`id`, `eventId`, `deltaId`, `inputHash`, `outputHash`, `previousReceiptHash`, `status`) and asserts that `verifyReceipt` and `verifyReportReceipt` reject the payload.
2. **Reordered Chain Fails**: Creates a chain of three valid sequential receipts (`r1 -> r2 -> r3`) and asserts that out-of-order combinations (e.g. `r2 -> r1`, `r3 -> r2`, `r1 -> r3`) fail lineage validation.
3. **Wrong Previous Hash Fails**: Mutates `previousReceiptHash` and verifies the chain is immediately rejected.
4. **Tampered Signature Fails**: Mutates both the signature property and the `outputHash` field to verify signature mismatch checks.
5. **Mismatched Canonical Bytes Fail**: Validates that semantic changes (different JSON keys/values) alter the `inputHash` and lead to validation failures, while order-only JSON differences preserve the hash correctness.

---

## 5. Test Verification Output
Below is the verification trace showing 36 test files and 210 test cases passing successfully:

```
 RUN  v2.1.8 /Users/sac/truex

 ✓ packages/truex-core/test/hook-interceptor.test.ts (15 tests) 5ms
 ✓ packages/truex-core/test/skill-sandbox.test.ts (17 tests) 5ms
 ✓ packages/truex-core/test/integration/env-actuator.test.ts (11 tests) 15ms
 ✓ packages/truex-core/test/integration/consequence-actuator.test.ts (21 tests) 16ms
 ✓ packages/truex-core/test/integration/swarm-controller.test.ts (14 tests) 14ms
 ✓ packages/truex-core/test/persistence/membrane-link.test.ts (6 tests) 13ms
 ✓ packages/truex-core/test/doctor-diagnostics.test.ts (10 tests) 28ms
 ✓ packages/truex-core/test/persistence/journal.test.ts (7 tests) 123ms
 ✓ packages/truex-core/test/primitives.test.ts (5 tests) 71ms
 ✓ packages/truex-core/test/integration-surface.test.ts (6 tests) 90ms
 ✓ packages/truex-core/test/adapter.test.ts (4 tests) 10ms
 ✓ packages/truex-core/test/integration/trajectory-replay.test.ts (4 tests) 6ms
 ✓ packages/truex-core/test/persistence/lock.test.ts (5 tests) 18ms
 ✓ packages/truex-core/test/kaizen.test.ts (3 tests) 17ms
 ✓ packages/truex-core/test/membrane.test.ts (3 tests) 259ms
 ✓ packages/truex-core/test/integration/task-delta.test.ts (7 tests) 7ms
 ✓ packages/truex-core/test/manufacturing/swarm-actuator.test.ts (3 tests) 5ms
 ✓ src/lib/gall-truex/__tests__/sqlite-proof.test.ts (2 tests) 35ms
 ✓ packages/truex-core/test/manufacturing/visual.test.ts (4 tests) 15ms
 ✓ packages/truex-core/test/integration/autonomic-loop.test.ts (5 tests) 32ms
 ✓ packages/truex-core/test/receipt.property.test.ts (2 tests) 104ms
 ✓ packages/truex-core/test/manufacturing/line.test.ts (4 tests) 6ms
 ✓ packages/truex-core/test/s3-integration.test.ts (2 tests) 112ms
 ✓ packages/truex-core/test/manufacturing.test.ts (7 tests) 100ms
 ✓ packages/truex-core/test/manufacturing/lean.test.ts (3 tests) 2ms
 ✓ packages/truex-core/test/integration/closed-loop-convergence.test.ts (5 tests) 188ms
 ✓ packages/truex-core/test/replay.property.test.ts (1 test) 25ms
 ✓ src/lib/gall-truex/__tests__/engine-proof.test.ts (2 tests) 108ms
 ✓ packages/truex-core/test/persistence.test.ts (3 tests) 10ms
 ✓ src/lib/gall-truex/__tests__/replay-proof.test.ts (3 tests) 20ms
 ✓ packages/truex-core/test/jit.test.ts (2 tests) 168ms
 ✓ src/lib/gall-truex/__tests__/hash-proof.test.ts (3 tests) 64ms
 ✓ packages/truex-core/test/report-receipt.test.ts (10 tests) 789ms
 ✓ packages/truex-core/test/heijunka.test.ts (3 tests) 942ms
 ✓ src/lib/gall-truex/__tests__/receipt-proof.test.ts (5 tests) 3851ms
 ✓ src/lib/gall-truex/__tests__/signature-proof.test.ts (3 tests) 5459ms

 Test Files  36 passed (36)
      Tests  210 passed (210)
   Start at  16:21:25
   Duration  6.68s
```

---

## 6. Compliance Certification
We certify that this runtime hardening meets the criteria laid out in `AGENTS.md`:
* **Testing Law Compliance**: Tests successfully prove both lawful state convergence and unlawful adversarial tampering failures.
* **Entropy Law Compliance**: Seeded deterministic inputs are utilized correctly, leaving no dependence on unseeded randomness.
* **Replay Law Compliance**: Deterministic ML-DSA signatures ensure identical consequence is achieved upon replay.
