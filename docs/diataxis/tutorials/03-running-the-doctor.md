# Tutorial 3: Running the Doctor Agent

When complex distributed systems fail, finding the root cause across microservices, databases, and network boundaries can be overwhelming. Truex solves this with an AI-powered diagnostic agent known as the **Doctor**. The Doctor analyzes execution receipts, Gall sequences, and Operational Topologies to diagnose issues automatically and propose actionable fixes.

## Theoretical Context

The Doctor relies on the core pillars of the Truex framework to perform its analysis:

1. **Gall Sequencing**: The Doctor reads the Gall sequence like a flight data recorder. It analyzes the exact chronological flow of operations to identify the precise moment where state divergence or unexpected errors occurred.
2. **OTP Equivalence**: By understanding the supervision tree, the Doctor can determine whether a failure was isolated to a single worker (a localized crash) or if it cascaded up the hierarchy, violating fault-tolerance boundaries.
3. **Operational Topology**: The Doctor visualizes the blast radius of a failure by analyzing the graph of interconnected capabilities. It knows which upstream services caused the bad input and which downstream services were impacted by the crash.

## Step 1: Generating a Failing Receipt

Let's deliberately create a failing hook to give the Doctor something to analyze. We'll introduce a classic divide-by-zero error.

```typescript
import { Truex, GallSequencer } from '@truex/core';

const divisionHook = Truex.createHook({
  name: 'DivisionCapability',
  version: '1.0.0',
  handler: async (ctx) => {
    const { a, b } = ctx.state;
    
    ctx.log('Starting division operation');
    
    if (b === 0) {
      ctx.log('Encountered zero divisor');
      throw new Error("Division by zero in critical path");
    }
    
    ctx.mutate(state => { 
      state.result = a / b; 
    });
  }
});

async function runFailing() {
  const sequencer = new GallSequencer();
  try {
    await sequencer.execute(divisionHook, { a: 10, b: 0 });
  } catch (err) {
    // The Sequencer catches the error, isolates it (OTP behavior), 
    // and generates a failure receipt.
    console.log('Captured failure receipt:', err.receipt.hash);
    return err.receipt;
  }
}
```

## Step 2: Initializing the Doctor

Once you have a failure receipt, you can pass it directly to the Doctor agent for analysis.

```typescript
import { DoctorAgent } from '@truex/core/agents';

async function diagnose() {
  const failingReceipt = await runFailing();
  
  // Initialize the Doctor. You can choose different LLM backends.
  const doctor = new DoctorAgent({
    model: 'claude-3-5-sonnet', // Alternatively: 'gemini-2.5-pro'
    verbosity: 'high',
    includeTopologyAnalysis: true
  });

  console.log('Doctor is analyzing the failure receipt...');
  
  const report = await doctor.analyzeReceipt(failingReceipt);
  
  console.log('\n=== Doctor Diagnosis Report ===');
  console.log('Summary:', report.summary);
  console.log('Root Cause:', report.rootCause);
  console.log('Suggested Fix:\n', report.suggestedFix);
}

diagnose();
```

## Step 3: Understanding the Doctor's Output

The Doctor's report will typically include detailed forensic analysis:
- **Gall Sequence Anomaly**: Identifying the exact operation in the sequence that threw the error (e.g., "Failure occurred at sequence index 2 during state mutation").
- **Topology Impact**: What other systems would have been affected if this hook wasn't isolated.
- **OTP Supervision Trace**: How the supervisor handled the crash, noting if the capability was restarted or terminated.

For example, the doctor might report: `"Root Cause: The 'b' parameter in the state was 0, triggering an unhandled exception. The OTP supervisor caught the exception and isolated the failure, preventing cascading crashes in the Operational Topology."`

## Troubleshooting the Doctor

- **Doctor Cannot Determine Cause**: If the Doctor returns "Insufficient context", ensure your hooks are emitting sufficient trace events using `ctx.log()`. The Doctor relies heavily on these internal hook logs to understand business logic intent.
- **LLM Rate Limits / Authentication**: Ensure your API keys are correctly configured in your environment (`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY`) as the Doctor uses an LLM backend to synthesize the diagnostic report.
- **Missing Source Maps**: If the Doctor's suggested fix points to compiled JavaScript instead of TypeScript, ensure source maps are enabled in your compilation step and accessible to the agent.

## Conclusion

The Truex Doctor agent serves as a highly intelligent automated Site Reliability Engineer (SRE), leveraging the deterministic nature of Gall sequencing and Operational Topology to provide actionable fixes. By automating root cause analysis, you drastically reduce mean time to resolution (MTTR). In the next tutorial, we will explore simulating counterfactual scenarios.
