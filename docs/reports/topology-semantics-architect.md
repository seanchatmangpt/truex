# Causal Topology Semantics Architect Report

This document outlines the architectural specification and implementation of the cross-hook causal topology model in the Truex Core substrate (`packages/truex-core/src/topology.gall.ts`).

## 1. Core Paradigm: Cross-Hook Causal Topology

The topology engine enforces mathematical and operational structure on cascading hook activations. In Truex, a single root GraphDelta may trigger one or more hooks, whose post-conditions emit downstream deltas, triggering further hooks recursively. This cascading execution forms a directed causal graph (topology) of computation.

Rather than running in an untracked, side-effectful manner, the causal topology model explicitly reifies:
- **Compute Boundaries (Topology Nodes):** Hook execution blocks containing behavior and state.
- **Data Flow (Topology Deltas):** The graph deltas flowing through the causal paths.
- **Causal Relationships (Topology Edges):** Traced dependency paths linking a parent hook's output to a child hook's trigger.
- **Operational Lineage (Receipt Chains):** Receipt hashes chained together so that any step's output is cryptographically bound to its parent and inputs.

---

## 2. Reified Types Specification

The implementation defines the following core structures:

1. **`TopologyNode`**: Represents a registered hook node. Includes behavior, partition-isolated state, and its `lastReceiptHash`.
2. **`TopologyEdge`**: Traces the directed, causal relationship between a parent source node and child target node.
3. **`TopologyDelta`**: Extends the `GraphDelta` format with causal metadata linking it to its parent delta (`parentDeltaId`).
4. **`TopologyChain`**: A reified sequence/tree of deltas produced and consumed within a causal run.
5. **`TopologyRun`**: The execution history of a chain containing step receipts and a status indicating successful convergence or cascading rollback.
6. **`TopologyReceipt`**: Extends the cryptographic `Receipt` structure with execution depth, node context, and pre/post-state snapshots.
7. **`TopologyRollback`**: Encapsulates the results of a cascading state restoration, showing rollback receipts and restored node states.
8. **`TopologyStorm`**: Records detected cyclic hook storms (infinite recursion paths) for auditing.
9. **`TopologyReplayReport`**: Standardized verification report containing convergence checks, accounting statistics, and a deterministic report hash.
10. **`TopologyAccounting`**: Metrics tracking the success, refusal, and rollback rates.

---

## 3. Core Functions & Lifecycle Algorithms

### A. Runtime Configuration & Registration
- **`createTopologyRuntime(parentSeed)`**: Initializes a deterministic runtime memory partition.
- **`registerTopologyHook(runtime, id, name, condition, behavior, initialState)`**: Registers a behavior block and state box as a node in the runtime topology.
- **`emitTopologyDelta(runtime, delta)`**: Validates the input delta and prepares a `TopologyChain` tracking graph delta lineage.

### B. Cascading Execution (`runTopologyChain`)
The runtime executes deltas recursively:
1. **Depth Breach Guard:** Halts the cascade if depth meets `maxDepth` to prevent stack overflows.
2. **Causal Entropy Normalization:** Step seeds are deterministically derived from:
   $$\text{Step Seed} = \text{hash}(\text{NodeId} + \text{Delta} + \text{Node.lastReceiptHash} + \text{Runtime.parentSeed})$$
   This guarantees that execution order does not contaminate entropy, maintaining absolute closure convergence.
3. **Storm Detection:** Invokes `detectHookStorm` to inspect the causal path list. If a cycle is detected, the run aborts and rolls back.
4. **Edge Tracing:** Dynamically records `TopologyEdge` entries when a node behavior emits new `add-quad` effects triggering downstream nodes.
5. **Rollback Triggering:** If any behavior throws or a boundary check fails, it stops execution and calls `rollbackTopologyChain` to reset all mutated node states.

### C. State Recovery & Rollback (`rollbackTopologyChain`)
When rollback is triggered:
1. Restores all registered nodes' states and `lastReceiptHash` properties to their pre-run snapshots.
2. Appends corresponding `evt_rollback_...` receipts in reverse topological order, indicating that the consequences of earlier steps have been revoked.

### D. Replay Validation (`replayTopologyChain`)
- Restores the initial node states based on the run's `stateBefore` receipts.
- Reruns the entire chain deterministically with the same parent seed.
- Asserts that all computed receipt hashes, post-states, and statuses match the expected run values.
- Computes `TopologyAccounting` and a signed `reportHash` for tamper-resistance.
