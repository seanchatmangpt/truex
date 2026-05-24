# Tutorial 4: Simulating Counterfactuals

Counterfactual simulation allows you to answer the ultimate engineering question: *"What would have happened if...?"* Truex allows you to take an existing execution receipt, modify the initial state, environmental conditions, or underlying logic, and simulate the outcome safely—without touching your production systems or writing complex integration tests.

## Theoretical Context

To understand how counterfactuals work, we look back to our three core pillars:

1. **Gall Sequencing**: Truex forks the historical Gall sequence at a specific point in time, creating an alternative timeline for the simulation. It replays the past up to the fork point, then executes the new scenario.
2. **OTP Equivalence**: The simulation runs in an isolated, lightweight process sandbox, completely separate from the main supervision tree. This OTP-style isolation guarantees zero side effects on the running system.
3. **Operational Topology**: During a counterfactual simulation, you can selectively mock, disable, or inject faults into nodes in the Operational Topology. This lets you see how your system handles degraded downstream dependencies.

## Step 1: Loading a Baseline Receipt

Counterfactuals require a baseline to compare against. Let's load a standard execution receipt that represents a "normal" historical run.

```typescript
import { SimulatorEngine } from '@truex/core/simulation';
import fs from 'fs';

// Load a historical receipt from disk or database
const baselineReceipt = JSON.parse(fs.readFileSync('receipt.json', 'utf8'));
```

## Step 2: Defining the Counterfactual Scenario

A scenario defines exactly what aspects of the past we are changing. In this example, imagine a standard checkout hook. We want to simulate what would have happened if the user had a VIP status, which might trigger a different discount logic path.

```typescript
const scenario = {
  name: 'VIP Status Upgrade Simulation',
  description: 'Testing if VIP users get the correct 20% discount',
  mutations: [
    {
      path: 'state.user.status',
      newValue: 'VIP'
    }
  ],
  // We can also disable parts of the topology to speed up simulation
  // or prevent simulated emails from actually sending
  topologyOverrides: {
    mockNodes: ['EmailNotificationService', 'AnalyticsTracker'] 
  }
};
```

## Step 3: Running the Simulation

Initialize the simulator and run the scenario against the baseline receipt.

```typescript
async function runSimulation() {
  const simulator = new SimulatorEngine();
  
  console.log(`Running simulation scenario: ${scenario.name}`);
  const result = await simulator.simulate(baselineReceipt, scenario);
  
  console.log('\n--- Simulation Complete ---');
  console.log('Original Final Price:', baselineReceipt.state.totalPrice);
  console.log('Simulated Final Price:', result.state.totalPrice);
  
  // We can compare the Gall Sequences to see exactly where logic diverged
  const divergencePoint = simulator.findDivergence(baselineReceipt, result);
  if (divergencePoint) {
    console.log(`Execution diverged at sequence index: ${divergencePoint.index}`);
    console.log(`Reason: ${divergencePoint.reason}`);
  } else {
    console.log('No divergence found. The state change had no impact on execution flow.');
  }
}

runSimulation();
```

## Advanced: Topology Fault Injection

During a counterfactual simulation, you might want to test resilience. What happens if a critical downstream service fails during processing? You can inject faults directly into the Operational Topology.

```typescript
const faultInjectionScenario = {
  name: 'Payment Gateway Outage Simulation',
  topologyOverrides: {
    injectFaults: {
      'PaymentGatewayNode': new Error('Connection Timeout (Simulated)')
    }
  }
};
```

By running this, you can verify that your OTP equivalence layer correctly handles the supervisor restart logic, or correctly triggers a fallback capability, without breaking overall system consistency.

## Troubleshooting

- **State Path Not Found**: If your scenario mutation fails, verify that the JSON path provided (e.g., `path: 'state.user.status'`) exactly matches the state structure in the baseline receipt.
- **Side Effects Occurring**: If you notice external APIs being hit during simulation, ensure you have correctly configured `topologyOverrides` to mock external boundaries. Simulations must remain purely functional.
- **Simulation Timeout**: Complex simulations with deep topologies can take time. Increase the `timeoutMs` parameter on the `SimulatorEngine` if necessary.

## Conclusion

Counterfactual simulations are a superpower for testing edge cases, validating hotfixes before deploying them to production, and exploring complex business "what-ifs." By utilizing Truex's isolated Gall sequences and topology manipulation, you ensure both safety and accuracy. In our final tutorial, we will set up the Observatory to monitor all of this in real-time.
