# POWL v2 + VKG Hooks: The Internal Workflow Engine

> **Path:** `docs/vision2030/POWL-VKG-INTEGRATION.md`
> **Status:** Vendor Integrated (`vendors/POWL/`)

## 1. The Architectural Limitation of S0 Contracts

Currently, Truex governs execution sequencing via `src/contracts/contract-context.js`. The `sequence` constraint is implemented as a strict, linear array (e.g., `sequence: ['listen', 'dial', 'handshake']`).

This imperative approach breaks down under the realities of the Truex Reactive Substrate (e.g., `examples/reactive/`). Linear arrays cannot natively model:
*   **Implicit Concurrency:** (e.g., `map` and `plan` can happen in parallel, but both must finish before `forge`).
*   **Choices & Branching:** (e.g., routing a packet via `channel_A` vs `channel_B`).
*   **Loops:** (e.g., retrying `transmit` under a specific failure policy).

## 2. The POWL v2 Integration

By integrating **POWL v2** (Partially Ordered Workflow Language) as the internal workflow engine sitting directly on top of the **VKG (Variable Knowledge Graph) Hooks**, we replace rigid linear arrays with mathematical graph traversal.

### The New Consequence Lifecycle:

1. **The Model (Law):** We define the 8-verb lifecycles (Wizard and Telco) as strict POWL models. These models map the exact partial order of execution, inclusive of concurrency and silent transitions.
2. **The Attempt:** An agent or system attempts an operation (e.g., `membrane.forge()`).
3. **The VKG Hook (Interception):** The proxy's `apply` interceptor traps the execution attempt before it reaches the substrate.
4. **The POWL Governor (Admission/Refusal):** The hook passes the current process trace and the requested activity (`forge`) to the POWL engine. It asks: *"Is this transition mathematically admissible in the current partial order?"*
5. **The Consequence:** 
    * If **Admitted**, the hook executes the operation, appends the delta to the local `wal_deltas`, and steps the POWL state machine forward.
    * If **Refused**, the hook triggers a terminal `[JIDOKA FATAL ERROR]`, stopping the line.

## 3. The Discovery Loop (MCP Synergy)

The most powerful aspect of this integration is the closed-loop synergy with the Antigravity CLI's hidden **PM4PY MCP tools**.

We do not have to hand-write POWL models.

1. **Run Exploratory Simulations:** We use Truex's `Simulation Context` to run thousands of randomized variations of an agent performing a task, capturing the outputs using the `OCEL2 Membrane`.
2. **Discover the Law:** We pipe those `OCEL2` envelopes into the CLI's `mcp_pm4py_discover_powl` tool. The native C++ process mining engine mathematically extracts the optimal POWL v2 model from the successful traces.
3. **Freeze the Law:** We save that discovered POWL graph as the immutable artifact for the project.
4. **Enforce the Law:** The VKG Hooks load that frozen POWL graph. From that moment on, no agent can deviate from the mathematically proven partial order. 

## 4. Implementation Next Steps

To activate POWL as the primary governor:
1. Create `src/contracts/powl-context.js` as an S1 primitive that wraps the `vendors/POWL/` execution logic.
2. Refactor the `Wizard` and `Telco` S11/S13 checkpoints from loose TypeScript arrays into formal JSON-serialized POWL graphs.
3. Deprecate the legacy linear `sequence` array in the base Contract Context.