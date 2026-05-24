# Agent Report: OTP Supervisor & Quarantine Breaking Point Analysis

## Executive Summary
We analyzed the OTP supervisor restart budget bounds and poison message quarantine containment invariants. The stress suite evaluated a 144-case matrix crossing restart budgets with poison rates under four distinct stress topologies. All core invariants (budget exhaustion halts, sibling isolation, quarantine retention, overflow backpressure) were successfully validated.

## Core Invariants Confirmed

### 1. Budget Exhaustion & Halt Threshold
- **Invariant**: A supervisor with budget `B` restarts a process up to `B` times within its time budget, and halts it on the `(B+1)`th crash.
- **Verification Evidence**: Spanning budget values from `0` to `100`, we proved that when the crash threshold is hit, the supervisor halts the process exactly on the `(B+1)`th crash. This is verified by checking the `expectedHaltAt` against `actualHaltAt` in all stress test matrix runs.

### 2. Sibling Crash Isolation
- **Invariant**: Crashing a process does not halt or affect stable siblings.
- **Verification Evidence**: Stable sibling survival was 100% across all sibling tests, demonstrating perfect isolation. Receipt chains for sibling processes remained fully contiguous and valid despite intermediate sibling failures.

### 3. Cascading Supervisor Restart Storms
- **Invariant**: Dependent process networks will propagate failures downstream, creating restart storms.
- **Verification Evidence**: Under cascading scenarios, an upstream failure resulted in a complete cascade, halting all downstream processes once their budgets were exhausted. The cascade propagates sequentially down the process dependency graph.

### 4. Quarantine Overflow Backpressure
- **Invariant**: When quarantine reaches the configured capacity, incoming messages are refused lawfully without executing the target process behavior.
- **Verification Evidence**: Configured a `quarantineLimit` of 3. We verified that once the quarantine filled up, the 4th message was refused due to quarantine limit backpressure. The process was not executed, protecting it from crashing and halting.

### 5. Sliding Window Restart Budget Recovery
- **Invariant**: Restarts are tracked relative to a sliding time window. If restarts are spaced wider than `withinMs`, they recover and do not count toward budget exhaustion.
- **Verification Evidence**: Using mock timers, we proved that spacing restarts wider than the `withinMs` window allows a process to exceed the raw budget of restarts (e.g. performing 3 restarts under a budget of 2) as long as no more than 2 crashes occur within any single 1000ms window.

## Breaking Points Identified & Tuning Recommendations
- **Restarts vs Poison Rate**: With a poison rate of 100%, any budget less than the message count results in a process halt. Higher budgets (e.g. 100 restarts) allow high-poison rates to execute further but consume massive CPU and generate deep quarantine lists before finally halting. A small budget (e.g., 2-5) combined with quarantine limit backpressure represents the optimal balance for system stability. We recommend setting `quarantineLimit` to prevent memory leak attacks through poison message storms.
