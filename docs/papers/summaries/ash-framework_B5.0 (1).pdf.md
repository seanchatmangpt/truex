# Ash Framework: Create Declarative Elixir Web Apps

## 1. Main Thesis
The Ash Framework operates on the core axiom: **"Model your domain, derive the rest."** It is not a web framework but an application framework that leverages a Domain Specific Language (DSL) to encode business logic into introspectible data structures. By shifting the focus from imperative procedural code to declarative resource modeling, Ash enables the automatic derivation of APIs (REST, GraphQL), UIs (Phoenix LiveView), and database schemas, ensuring that the application remains a single source of truth.

## 2. Key Findings
- **Resource-Oriented Architecture:** Applications are composed of "Resources" (nouns) and "Actions" (verbs), providing a structured, resource-oriented design that replaces the "wild west" of traditional context-based architectures.
- **Declarative Primitives:** Built on three fundamental principles:
    - **Data > Code:** Modeling application components as data structures.
    - **Derive > Hand-write:** Reducing conceptual overhead and functionality drift by generating boilerplate.
    - **What > How:** Describing the desired target rather than the step-by-step implementation.
- **Operational Stabilization:**
    - **Policies:** Deterministic authorization rules evaluated by a SAT solver.
    - **Changes & Validations:** Formalizing the 'Attempt → Consequence' lifecycle through atomic transformations and pre-persistence checks.
    - **Atomics:** Enforcing data consistency directly in the data layer to eliminate race conditions.
- **Extensibility:** Support for multiple data layers (PostgreSQL, SQLite, Mnesia) and a rich extension ecosystem (AshAuthentication, AshJsonApi, AshGraphql).

## 3. Truex Grammar of Consequence Analysis
- **Commitment (Input):** Ash 'Actions' and their arguments define the formal intent or **Attempt** within the Truex lifecycle.
- **Law (μ):** Ash resources act as the **Ontological Law**. The SAT-solver-driven policies serve as the **Deterministic Admission Function**, either **Admitting** or **Refusing** a transition based on the actor's state and the resource's invariants.
- **Consequence (Output):** The execution of an action results in a state transition (mutated record) and potentially a **Receipt** of the operation.
- **Invariant Enforcement:** Validations and global changes ensure that the system converges on lawful states, preventing "maverick" behaviors.

## 4. Relevance to Truex Post-Gall Operating Substrate
The Ash Framework serves as the **Pre-Gall precursor** to the Truex Post-Gall Operating Substrate. While Ash provides the *runtime* for declarative logic, Truex provides the *law* for consequence conservation.
- **Active Computational Membrane:** Ash’s policy and authorizer layers provide the blueprint for the Truex **Membrane**, which physically prevents memory mutations that violate organizational geometry.
- **Deterministic Replay:** Ash’s focus on data-layer atomicity and structured changes aligns with the Truex requirement that `same input + same law = same consequence`.
- **OCEL Evidence:** By standardizing the 'Attempt → Action → Consequence' flow, Ash simplifies the capture of operational motion required for **OCEL 2.0** evidence emission.
- **Runtime Ambiguity Elimination:** Ash replaces probabilistic software management with mechanical enforcement, a foundational requirement for the Truex substrate's goal of "No Humans in Runtime Actuation."
