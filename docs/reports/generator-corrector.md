# Hook OTP and Hookbench Generator Correction Report

This report documents the updates made to the Hook OTP and Hookbench generators to output real, dynamically computed counts instead of placeholder or incomplete metrics.

## 1. Hook OTP Generator Updates

The Hook OTP equivalence proof runtime in `packages/membrane/src/hook-otp.gall.ts` has been updated to output the following metrics under `runtime` in the report:
- `processesStarted`: The total number of processes started during the simulation.
- `processesAlive`: The number of processes currently active and not halted.
- `processesQuarantined`: The number of processes that had messages quarantined.
- Real message counts:
  - `messagesDispatched`
  - `messagesProcessed`
  - `messagesConfirmed`
  - `messagesRefused`
  - `messagesQuarantined`
  - `restarts` (Supervisor restarts)

### Code Mutation Diff

```diff
     runtime: {
       processes: runtime.processes.size + 1, // include nonexistent search
+      processesStarted: runtime.processes.size,
+      processesAlive: Array.from(runtime.processes.values()).filter(p => !p.isHalted).length,
+      processesQuarantined: new Set(runtime.quarantine.map(q => q.processId)).size,
       messagesDispatched: runtime.metrics.messagesDispatched,
       messagesProcessed: runtime.metrics.messagesProcessed,
       messagesConfirmed: runtime.metrics.messagesConfirmed,
```

## 2. Hookbench Generator Updates

The Hookbench suite in `packages/membrane/src/benchmark/hookbench.gall.ts` has been updated to output:
- `matches`: The number of matched hooks.
- `unmatchedEvaluations`: Evaluations that did not match any hook condition.
- `refusals`: The number of evaluations refused due to policy/structural failures.
- `stressAttempted`: The number of stress test cases executed.
- `stressSucceeded`: The number of stress test cases that passed successfully.

These metrics are now generated dynamically per-tier in both the options hash and result metrics.
