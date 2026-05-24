# Tutorial 1: Writing Your First Truex Hook

Welcome to the first step in mastering Truex. In this tutorial, we will walk you through writing your first capability hook. Truex hooks are the fundamental units of execution that allow you to intercept, observe, and mutate operational logic within your system.

## Theoretical Context

Before we dive into the code, it's essential to understand the theoretical underpinnings of Truex:

1. **Gall Sequencing**: Truex organizes operations into a sequence known as a Gall sequence. Each hook execution represents a node in this sequence, ensuring total ordering of events. This sequential integrity allows for precise operational reconstruction.
2. **OTP Equivalence**: Truex hooks are designed to provide Erlang OTP-like fault tolerance and supervision equivalence. When you write a hook, you're writing a supervised process that can crash safely without taking down the entire system.
3. **Operational Topology**: Hooks do not exist in isolation. They form a directed acyclic graph (DAG) called the Operational Topology, defining how capabilities interact and propagate state changes across the membrane.

## Step 1: Setting up the Project

First, ensure you have Truex installed and your project initialized. A standard Node.js or TypeScript project works perfectly.

```bash
npm install @truex/core
```

Create a new file named `my-first-hook.ts`. We will use TypeScript for better type safety and self-documenting code.

## Step 2: Defining the Hook

Let's define a simple hook that intercepts an order processing capability. This hook will manage the lifecycle of an e-commerce order.

```typescript
import { Truex, HookContext } from '@truex/core';

// Define the shape of our state
interface OrderState {
  orderId: string;
  status: 'pending' | 'processing' | 'completed';
  amount: number;
}

// Define the hook
const processOrderHook = Truex.createHook<OrderState>({
  name: 'ProcessOrder',
  version: '1.0.0',
  handler: async (ctx: HookContext<OrderState>) => {
    console.log(`Starting to process order: ${ctx.state.orderId}`);
    
    // Mutate state safely using the context
    ctx.mutate(state => {
      state.status = 'processing';
    });

    // Simulate some asynchronous work (e.g., payment validation)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Finalize the state mutation
    ctx.mutate(state => {
      state.status = 'completed';
    });

    console.log(`Order ${ctx.state.orderId} processed successfully.`);
  }
});
```

## Step 3: Integrating with the Gall Sequencer

To execute the hook, we must submit it to the Gall sequencer. The sequencer acts as the supervisor for our OTP-equivalent processes.

```typescript
import { GallSequencer } from '@truex/core';

async function run() {
  const sequencer = new GallSequencer();
  
  const initialState: OrderState = {
    orderId: 'ORD-1234',
    status: 'pending',
    amount: 150.00
  };

  // The sequencer guarantees OTP-equivalent execution and state consistency
  const receipt = await sequencer.execute(processOrderHook, initialState);
  
  console.log('Execution Receipt Hash:', receipt.hash);
  console.log('Final State:', receipt.state);
}

run().catch(console.error);
```

## Step 4: Understanding the Topology

When the sequencer executes this hook, it implicitly registers it within the Operational Topology. In complex applications, you can query the topology to understand the blast radius and dependencies of your hooks:

```typescript
const topology = sequencer.getTopology();
console.log('Topology Edges:', topology.getEdges('ProcessOrder'));
console.log('Topology Nodes:', topology.getNodes());
```

## Troubleshooting

- **State Mutation Error**: If you receive a `Mutations outside context` error, ensure you are only modifying the state using `ctx.mutate()`. Direct assignments to `ctx.state` are blocked at runtime to guarantee deterministic replayability and Gall sequence integrity.
- **Sequencer Timeout**: If the sequencer times out or hangs, check if your hook contains infinite loops, unhandled promise rejections, or unresolved asynchronous calls. The OTP equivalence layer enforces strict execution timeouts to prevent resource exhaustion.
- **Missing Peer Dependencies**: If the sequencer fails to initialize, verify that you are not missing any peer dependencies required by the `@truex/core` package.

## Conclusion

You have successfully written and executed your first Truex hook. You've also learned how this ties into the core concepts of Gall sequencing, OTP equivalence, and Operational Topology. These primitives form the foundation for all advanced Truex features. In the next tutorial, we will explore deterministic replay.
