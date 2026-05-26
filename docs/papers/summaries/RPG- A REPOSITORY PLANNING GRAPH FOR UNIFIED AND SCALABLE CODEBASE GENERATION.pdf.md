# Summary: RPG: A Repository Planning Graph for Unified and Scalable Codebase Generation (RPG.pdf)

## 1. Main Thesis
The paper introduces the **Repository Planning Graph (RPG)**, a structured representational framework designed to overcome the limitations of natural language in large-scale codebase generation. By replacing ambiguous natural language plans with an explicit, persistent, and evolvable graph that encodes capabilities, file structures, data flows, and function designs, RPG enables Large Language Models (LLMs) to perform consistent long-horizon planning and generate coherent, scalable repositories from scratch.

## 2. Key Findings
- **Dual Semantic Nodes:** RPG nodes represent both functional capabilities (progressively refined from high-level modules to concrete functions) and structural repository organization (files, classes, folders).
- **Execution Dependency Edges:** Edges capture inter-module data flows and intra-module file-level orderings, imposing a topological order that aligns functional decomposition with code organization.
- **ZeroRepo Framework:** A graph-driven framework that operates in three stages: proposal-level construction (via a 1.5M feature tree), implementation-level construction (encoding skeletons and interfaces), and graph-guided code generation with test-driven validation.
- **Near-Linear Scalability:** Unlike natural language plans which degrade in coherence over time, RPG supports near-linear scaling of functionality and code size, enabling the generation of repositories 3.9x larger than current baselines (e.g., Claude Code).
- **Accelerated Localization:** The RPG provides a global structural representation that reduces agent effort in localization (bug fixing, incremental development) by 30-50% compared to ad-hoc probing.

## 3. Truex Grammar of Consequence Analysis

### Substrate
The **Substrate** is the target software repository and the distributed environment (e.g., Docker) where the code is generated, tested, and stored.

### Membrane
The **RPG (Repository Planning Graph)** itself acts as the **Membrane**. It defines the "Operating Law" of the repository: what modules are admitted, how they are structured, and what data-flow contracts they must satisfy. The **RepoCraft Benchmark** serves as an external validation membrane for assessing adherence to this law.

### Attempt
An **Attempt** is the LLM-generated code for a specific leaf node (function or class) within the RPG.

### Admit / Refuse
The **Graph-Guided Test Validation** step acts as the admission function. A code patch is **Admitted** only if it passes both unit tests (derived from its docstring) and integration tests (ensuring consistent data flows across the RPG). Non-conforming code is **Refused** and returned for iterative repair.

### Receipt
The **Validated Code Artifacts** committed to the repository and the successful **Test Execution Logs** serve as the **Receipt**, providing proof of the realized functional consequence.

## 4. Relevance to Truex Post-Gall Operating Substrate
- **Deterministic Scaffolding:** RPG provides the structural "law" for ggen-like tools to manufacture codebases, ensuring that the manufactured output is not just a collection of files but a coherent, lawful system.
- **Mechanical Planning:** The shift from "ad-hoc natural language plans" to "graph-guided execution" directly supports the Truex mandate for replacing probabilistic agent behavior with deterministic, law-enforced transitions.
- **Topological Integrity:** The use of topological traversal for generation ensures that every dependency is resolved before its dependent is admitted, mirroring the Truex requirement for stable state transitions.
- **Scaling Complexity:** The paper's evidence of near-linear scaling demonstrates how the Truex substrate can manage arbitrarily complex systems by grounding them in explicit, graph-based invariants rather than qualitative process descriptions.
