# How to Implement OCEL 2.0 Receipts

In the context of the Proxyable architecture, **Receipts** are immutable, cryptographically verifiable records of execution. By combining these receipts with the **OCEL 2.0 (Object-Centric Event Logging)** standard, you create a perfect, tamper-evident audit trail of your system's behavior, aligning with Toyota Production System (TPS) principles of absolute transparency and traceability.

This guide explains how to generate, store, and verify OCEL 2.0 compliant receipts.

## Prerequisites

- Node.js 18+
- `truex-core` installed
- `@truex/receipts` installed

## Step 1: Configure the OCEL Receipt Generator

First, we need to initialize the receipt generator with a cryptographic key. In production, this key should be securely managed via KMS or environment variables.

```typescript
import { ReceiptGenerator } from '@truex/receipts';
import { OCELLogger } from 'truex-core/ocel2';

const generator = new ReceiptGenerator({
  algorithm: 'sha256',
  secret: process.env.RECEIPT_SECRET || 'super-secret-tps-key'
});

const ocel = new OCELLogger({ target: 'file', path: './audit-trail.jsonl' });
```

## Step 2: Create a Receipt-Aware Capability

We will create a Proxyable capability that automatically generates a receipt after a function successfully executes, and then logs that receipt as an OCEL event.

```typescript
import { createCapability, applyCapability } from 'truex-core';

export const OcelReceiptCapability = createCapability({
  name: 'OcelReceipt',
  async onAfter(context, result) {
    // 1. Generate the cryptographic receipt
    const payload = {
      operation: context.operationName,
      args: context.args,
      timestamp: Date.now(),
      status: 'SUCCESS'
    };
    
    const receipt = await generator.sign(payload);

    // 2. Log to OCEL 2.0 format
    ocel.logEvent({
      activity: `Execute_${context.operationName}`,
      timestamp: new Date(payload.timestamp).toISOString(),
      objects: [
        { type: 'Receipt', id: receipt.hash },
        { type: 'Operation', id: context.operationName }
      ],
      attributes: {
        signature: receipt.signature,
        status: payload.status
      }
    });

    // 3. Attach the receipt to the result for the caller
    return {
      data: result,
      _receipt: receipt
    };
  }
});
```

## Step 3: Apply and Execute

Wrap a critical business function with the capability.

```typescript
const transferFunds = async (fromId: string, toId: string, amount: number) => {
  console.log(`Transferring $${amount} from ${fromId} to ${toId}`);
  return { transactionId: 'TXN-88192' };
};

const secureTransfer = applyCapability(transferFunds, OcelReceiptCapability);

async function run() {
  const result = await secureTransfer('ACCT-A', 'ACCT-B', 500);
  console.log('\nResult with Receipt attached:');
  console.log(JSON.stringify(result, null, 2));
}

run();
```

## Terminal Commands

Run the implementation:

```bash
npx tsx transfer.ts
```

### Expected Console Output

```bash
Transferring $500 from ACCT-A to ACCT-B

Result with Receipt attached:
{
  "data": {
    "transactionId": "TXN-88192"
  },
  "_receipt": {
    "hash": "a1b2c3d4e5f6...",
    "signature": "x9y8z7...",
    "timestamp": 1698765432100
  }
}
```

Check the generated OCEL file (`audit-trail.jsonl`):

```bash
cat audit-trail.jsonl
```

*(Output will be a JSON line matching the OCEL 2.0 specification, linking the `Receipt` object to the `Execute_transferFunds` event).*

## Step 4: Verifying the Receipt

To prove that the execution happened exactly as recorded, you can verify the receipt signature against the payload.

```typescript
const isValid = await generator.verify(result._receipt.signature, {
  operation: 'transferFunds',
  args: ['ACCT-A', 'ACCT-B', 500],
  timestamp: result._receipt.timestamp,
  status: 'SUCCESS'
});

console.log(`Receipt is valid: ${isValid}`); // Expected: true
```

## Handling Edge Cases

### Edge Case 1: Tampered Payloads
If an auditor attempts to verify a receipt with altered arguments (e.g., claiming the amount was 5000 instead of 500), `generator.verify()` will strictly return `false`.

### Edge Case 2: Failed Executions
If the target function throws an error, `onAfter` is skipped. To record receipts for failed transactions, you must implement the `onError` hook in your capability and log an OCEL event with a `FAILED` status and the error details.

## TPS Connection
In a manufacturing context, parts are tracked using kanban cards and serial numbers. OCEL Receipts bring this rigorous **Parts Traceability** to software. By inextricably linking cryptographic proof of execution to an Object-Centric Event Log, you guarantee the integrity of your digital supply chain.
