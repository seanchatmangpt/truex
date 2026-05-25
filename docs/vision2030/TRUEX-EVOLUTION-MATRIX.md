# Truex System Evolution Matrix

> **Path:** `docs/vision2030/TRUEX-EVOLUTION-MATRIX.md`
> **Status:** Unified Evolutionary Trajectory
> **Derived From:** Individual `TRUEX-REBRAND-*.md` documents

In accordance with the Truex Rebrand Migration Plan, this matrix consolidates the explicit "Future Evolution" paths of all 21 historic repositories. It serves as the master blueprint for transitioning these components from their legacy states into the deterministic Truex Operating Substrate.

## Tier 6: The Projection & Proving Surfaces
*   **BusinessOS:** BusinessOS will cease to have a "backend." It will be purely a frontend that connects via a websocket to a `truex-kernel` running `unibit` logic.
*   **NAUT (Nautilus Trader):** Will serve as the benchmark template for how Truex handles mission-critical, regulated environments (finance, healthcare, aviation).

## Tier 5: Autonomic Manufacturing & Simulation
*   **GGEN:** Will evolve from generating "code" to generating strict Truex "Admissibility Functions." It will compile plain English laws directly into WASM predicates.
*   **DSPyGen:** Will become the "Compiler" for AI. Instead of writing prompts, developers will write YAWL/POWL process geometries, and DSPyGen will automatically compile the exact few-shot prompts needed to guide an LLM through that specific geometry.
*   **SOS (Synthetic Operations Simulator):** `sos` will evolve into the "Operational Digital Twin." Every Truex enterprise will have a permanently running `sos` instance executing 10 seconds ahead of reality, predicting constraint violations before they occur.
*   **A2A:** Will transition from "chatting" to "negotiating transitions." Agents will propose speculative OCEL geometries to each other, mathematically validating consensus rather than relying on natural language agreement.

## Tier 4: Execution Interfaces & High-Throughput Routing
*   **DesktopCommanderMCP:** It will be wrapped entirely inside the Truex Membrane. It will no longer execute raw bash commands; it will submit "Speculative Operations" to the local Truex kernel, which will admit or deny the agent's intent based on strict process geometry.
*   **ERLMCP:** Will become the standard high-throughput communication bus for enterprise-scale Truex swarms, replacing naive Node.js MCP servers for heavy workloads.

## Tier 3: Isolation, Semantics, & Environments
*   **CLNRM (Cryptographic Cleanroom):** Will become the default execution context for all FFI and Agentic code execution, structurally preventing any autonomous operator from altering the host system without a Truex receipt.
*   **UNRDF:** The `unrdf` repositories will largely be archived or heavily refactored. The valuable semantic definitions will be converted into OCEL 2.0 Object Types and Event Types to feed the Truex Membrane, rather than living as raw RDF databases.
*   **UVMGR:** `uvmgr` logic will be absorbed into `truex-forge` as the default Python substrate preparation protocol.

## Tier 2: The Consequence Membrane & Logic Engines
*   **KNHK:** Will become the backing store for the Virtual Knowledge Graph Runtime (VKG-HR), calculating avatar-relative projections dynamically in nanoseconds.
*   **PROLOG8:** Will serve as the translation target for `dspygen`. LLMs will translate natural language business policies into `prolog8` rules, which will then be strictly enforced at runtime.

## Tier 1: Process Geometry & Concurrency
*   **wasm4pm:** Will evolve from an "analysis" tool into a strict "compiler." Organizations will compile their operational law into a WASM binary using this kernel, and that binary will physically dictate what the database is allowed to store.
*   **BitActor:** Will become the standard compilation target for all POWL-defined operational geometries. Agents won't interact with "services"; they will interact with "Truex Actors."
*   **PICTL:** Will act as the static analyzer for Truex. Just as a compiler checks types, `pictl` will check organizational law for deadlocks before allowing deployment.

## Tier 0: The Truex Physics Layer (Zero-Variance Substrate)
*   **BCINR:** Will become the mathematical standard library for all Truex generated code. When `ggen` manufactures an admissibility function, it will compile it targeting `bcinr` primitives.
*   **CNS:** CNS will evolve into the default embedded kernel for all Truex operations, effectively becoming the "bare metal" that `BusinessOS` compiles down to, completely bypassing traditional operating system schedulers for critical business logic.
*   **UNIBIT:** `unibit` will become the "Truex Hypervisor." A specialized runtime that sits below the OS, allowing Truex organizational applications to run in verifiable enclaves.
*   **GITVAN:** `gitvan` proves the *concept* of version-controlled state. It will evolve into a dedicated BLAKE3-backed operational datastore specifically optimized for reading/writing OCEL 2.0 receipts.
*   **BitStar:** Will serve as the network protocol for federated Truex organizations, allowing different companies to execute shared, mathematically proven workflows without relying on a centralized clearinghouse.
