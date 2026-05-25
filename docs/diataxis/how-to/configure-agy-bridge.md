# How to Configure the AGY Bridge

The **AGY Bridge** (Anti-Gravity Bridge) is a crucial component in the Proxyable ecosystem. It facilitates seamless, receipt-verified communication between isolated execution environments, ensuring that cross-boundary invocations comply with your defined TPS (Toyota Production System) governance models and OCEL tracking requirements.

This guide details how to set up, configure, and verify the AGY Bridge.

## Prerequisites

- `membrane` and `@truex/agy-bridge` installed.
- Network access between your microservices or isolated contexts.
- Node.js environment.

## Step 1: Initialize the Bridge

The bridge requires configuration for both the sending (client) and receiving (server) sides. In a local environment, these can run in the same process for testing.

```typescript
import { AGYBridge, BridgeConfig } from '@truex/agy-bridge';
import { OCELLogger } from 'membrane/ocel2';

const config: BridgeConfig = {
  endpoint: 'tcp://127.0.0.1:9090',
  timeoutMs: 5000,
  security: {
    enableSignatures: true,
    secret: process.env.AGY_SECRET || 'dev-secret-key'
  },
  // Connect to OCEL for TPS flow tracking
  logger: new OCELLogger({ target: 'stdout' })
};

const bridge = new AGYBridge(config);
```

## Step 2: Bind Capabilities to the Bridge

You expose local functions across the bridge by wrapping them in Proxyable capabilities. This ensures that incoming requests are validated before execution.

```typescript
import { createCapability, applyCapability } from 'membrane';

// Define a capability that logs receipts
const ReceiptCapability = createCapability({
  name: 'ReceiptGenerator',
  onAfter(context, result) {
    console.log(`Generated cryptographic receipt for operation: ${context.operationName}`);
    return result;
  }
});

// The actual target function
const processOrder = async (orderId: string) => {
  return { status: 'PROCESSED', orderId };
};

// Wrap it
const safeProcessOrder = applyCapability(processOrder, ReceiptCapability);

// Bind to bridge
bridge.expose('processOrder', safeProcessOrder);
```

## Step 3: Start the Bridge Server

To accept incoming connections, start the bridge listener:

```typescript
async function start() {
  try {
    await bridge.listen();
    console.log(`🚀 AGY Bridge listening on ${config.endpoint}`);
  } catch (err) {
    console.error('Failed to start bridge:', err);
  }
}

start();
```

## Step 4: Invoke Across the Bridge

From a client context, you can now invoke the remote capability. The AGY Bridge will automatically negotiate the cryptographic receipt and record the OCEL trace.

```typescript
async function clientRun() {
  const clientBridge = new AGYBridge({ endpoint: 'tcp://127.0.0.1:9090' });
  await clientBridge.connect();

  console.log('Sending request across AGY Bridge...');
  const result = await clientBridge.invoke('processOrder', 'ORD-999');
  
  console.log('Received result:', result);
  await clientBridge.disconnect();
}

// Run client after a delay
setTimeout(clientRun, 1000);
```

## Terminal Commands

Run the combined server/client script:

```bash
$ npx tsx agy-demo.ts
```

### Expected Console Output

```bash
🚀 AGY Bridge listening on tcp://127.0.0.1:9090
Sending request across AGY Bridge...
Generated cryptographic receipt for operation: processOrder
Received result: { status: 'PROCESSED', orderId: 'ORD-999' }
```

## Edge Cases to Handle

### Edge Case 1: Network Timeouts
If the remote capability takes longer than `timeoutMs`, the bridge will throw an `AGYTimeoutError`. You must handle this in the client and consider implementing a retry mechanism with exponential backoff.

### Edge Case 2: Signature Mismatch
If `security.enableSignatures` is true and the client uses a different secret, the server will instantly drop the connection and log a `SecurityViolation` event to the OCEL logger. This acts as a Poka-Yoke to prevent unauthorized executions.

## Connecting to TPS

The AGY Bridge embodies the TPS principle of **Just-In-Time (JIT)** processing. It ensures that data flows between systems exactly when needed, with built-in quality checks (signatures and capabilities) preventing defects from passing down the line. Every crossing of the bridge is tracked via OCEL, creating a perfect value stream map of your distributed application.
