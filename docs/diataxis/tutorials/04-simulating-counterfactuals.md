# Tutorial 4: Simulating Counterfactuals

Sometimes you want to test what *would* happen to a state if certain operations occurred, without actually mutating the real state.

## Step 1: Initialize Simulation
```javascript
import { createProxy, createSimulationContext, registerSimulationInterceptors } from 'truex-core';

const dbRow = { status: 'pending', retryCount: 0 };
const { proxy, ...proxyInterface } = createProxy(dbRow);
const simCtx = createSimulationContext(dbRow);
registerSimulationInterceptors(proxyInterface, simCtx);
```

## Step 2: Speculate
Run code that mutates the proxy inside `simCtx.speculate()`.

```javascript
simCtx.speculate(() => {
  proxy.status = 'processing';
  proxy.retryCount = 1;
  
  if (proxy.retryCount > 0) {
    proxy.status = 'failed';
  }
});
```

## Step 3: Inspect Changes and Commit/Abort
The real `dbRow` is completely unchanged during speculation.

```javascript
console.log(dbRow.status); // Still 'pending'

const changeset = simCtx.getChangeSet();
console.log(changeset.modified.status.to); // 'failed'

// If we like the result:
simCtx.commit();
console.log(dbRow.status); // 'failed'
```