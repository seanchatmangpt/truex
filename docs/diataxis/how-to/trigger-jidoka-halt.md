# How to Trigger a Jidoka Halt in Proxyable

In the Toyota Production System (TPS), **Jidoka** means "automation with a human touch" or the ability of a system to detect an anomaly and automatically halt production. In Proxyable, a Jidoka Halt is triggered when a critical invariant is violated, immediately stopping execution to prevent corrupted state or cascading failures.

This guide will show you how to implement and trigger a Jidoka Halt within your Proxyable capabilities.

## Prerequisites

- Node.js 18+
- `truex-core` installed in your project
- Basic understanding of Proxyable Capabilities

## Step 1: Define a Haltable Capability

First, create a capability that monitors for anomalous conditions. We'll use the `createCapability` primitive from `truex-core` and implement an invariant check.

```typescript
import { createCapability, JidokaError } from 'truex-core';

export const QualityControlCapability = createCapability({
  name: 'QualityControl',
  onBefore(context) {
    const { payload } = context;
    
    // TPS Principle: Detect anomalies immediately
    if (payload.defectRate > 0.05) {
      // Trigger the Jidoka Halt
      throw new JidokaError('Defect rate exceeded 5% threshold', {
        severity: 'CRITICAL',
        code: 'ERR_DEFECT_RATE_HIGH',
        contextData: payload
      });
    }
  }
});
```

## Step 2: Implement the Andon Cord Handler

When a Jidoka Halt occurs, you need an "Andon Cord" handler to catch the error, alert the team, and safely shut down or isolate the affected process.

```typescript
import { applyCapability } from 'truex-core';
import { QualityControlCapability } from './quality-control';

async function processBatch(batchData) {
  const targetFn = async (data) => {
    console.log(`Processing batch: ${data.id}`);
    return { success: true };
  };

  const safeProcess = applyCapability(targetFn, QualityControlCapability);

  try {
    await safeProcess({ payload: batchData });
    console.log('Batch processed successfully.');
  } catch (error) {
    if (error.name === 'JidokaError') {
      triggerAndonCord(error);
    } else {
      throw error;
    }
  }
}

function triggerAndonCord(error) {
  // OCEL Principle: Log the exact context of the halt
  console.error(`🚨 ANDON CORD PULLED 🚨`);
  console.error(`Reason: ${error.message}`);
  console.error(`Severity: ${error.details.severity}`);
  console.error(`Halting further production...`);
  // Integrate with PagerDuty, Slack, or monitoring systems here
}
```

## Expected Console Output

If you run the above code with a high defect rate:

```bash
$ node index.js
🚨 ANDON CORD PULLED 🚨
Reason: Defect rate exceeded 5% threshold
Severity: CRITICAL
Halting further production...
```

## Step 3: Integrating OCEL Traces

To ensure we can audit *why* the halt occurred, we should integrate OCEL 2.0 (Object-Centric Event Logging). 

```typescript
import { OCELLogger } from 'truex-core/ocel2';

function triggerAndonCord(error) {
  OCELLogger.logEvent({
    activity: 'Jidoka Halt',
    timestamp: new Date().toISOString(),
    objects: [{ type: 'Batch', id: error.details.contextData.id }],
    attributes: {
      reason: error.message,
      errorCode: error.details.code
    }
  });
  console.error('Halt recorded in OCEL trace log.');
}
```

## Handling Edge Cases

### Edge Case 1: Cascading Halts
If multiple capabilities trigger a halt simultaneously, Proxyable guarantees that the *first* invariant violation encountered in the membrane is the one that halts execution.

### Edge Case 2: Silent Failures
Ensure that your Jidoka bounds are tight enough. If an error is caught internally and suppressed by a poorly configured `try-catch` inside the target function, the Jidoka capability will not trigger.

## Terminal Commands for Testing

Run your test suite with Vitest to simulate the halt:

```bash
# Run tests specifically for Jidoka scenarios
npx vitest run test/jidoka.test.ts
```

## Summary

By applying the TPS concept of Jidoka, your Proxyable applications become resilient to anomalies. They fail fast, loudly, and with rich contextual data via OCEL, making debugging and continuous improvement a seamless part of your development lifecycle.
