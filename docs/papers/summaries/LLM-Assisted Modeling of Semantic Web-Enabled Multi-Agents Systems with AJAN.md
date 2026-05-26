# LLM-Assisted Modeling of Semantic Web-Enabled Multi-Agents Systems with AJAN

## 1. Product Thesis
The AJAN-Editor manufactures a **deterministic translation membrane** that projects natural language intent into executable, RDF-compliant **SPARQL Behavior Trees (SBTs)**. By integrating Large Language Models (LLMs) into the Semantic Web engineering lifecycle, the substrate provides a mechanical bridge between human-readable instruction and the formal ontological laws governing multi-agent system (MAS) behavior.

## 2. Accounting Domains
*   **Semantic Knowledge Domain (RDF/RDFS/OWL):** Conserves the "Truth Base" of the agent, ensuring all state transitions are reflected as graph mutations.
*   **Behavioral Topology (SBTs):** Maps the logical execution path via modular tree structures (Composites, Decorators, Leaves).
*   **Linguistic Mapping (NL -> URI):** Maintains the conservation of identity between user-defined terms and formal ontological URIs.

## 3. Key Invariants
*   **Ontological Alignment:** Every generated node in the SBT must link to a valid URI defined in the agent's ontology.
*   **Syntactic Integrity:** Generated SPARQL queries must pass RDF4J/GraphDB validation before execution.
*   **Contextual Grounding:** LLM-generated responses for documentation queries must be restricted to the retrieved vector embeddings (RAG) to prevent hallucination.

## 4. Verbs / Commands (Linguistic Primitives)
*   **Attempt:** The ingestion of natural language instructions (text/voice) via the `Orchestrator`.
*   **Admit:** The `Disambiguator` and `Linker` modules verify if the instruction can be mapped to the known ontology.
*   **Project:** The `SBT Generator` and `SPARQL Generator` transform admitted intent into formal RDF/SPARQL structures.
*   **Promote:** The execution of the generated SBT via the `AJAN-Service` runtime.
*   **Refuse:** The system triggers an `Auto-Correction` attempt (via GPT-4) or prompts the user for clarification if the mapping fails or SPARQL execution returns an error.

## 5. Refusal Conditions
*   **Ontological Mismatch:** If an action or entity cannot be resolved to a URI with a similarity score > 0.5 and the user refuses disambiguation.
*   **Execution Failure:** If the generated SPARQL query remains invalid after a second-pass correction attempt by GPT-4.
*   **Ambiguity Overflow:** If the `Disambiguator` identifies multiple non-trivial interpretations and cannot resolve a single path.

## 6. Truex Post-Gall Relevance: The Grammar of Consequence
The AJAN framework provides a canonical implementation of the **Active Computational Membrane**. In the Truex substrate, this paper demonstrates how:
*   **Natural Language is an Attempt:** LLMs act as the **Inference Admission Function**, converting fuzzy human intent into a formal **Consequence Attempt**.
*   **SBTs are the Law (`μ`):** The Behavior Tree structure enforces the deterministic ordering of actions, ensuring that agent behaviors are not random but governed by strict logic.
*   **SPARQL as the Settlement Engine:** Mutations to the RDF knowledge base represent the final **Receipt of State**, where every agent action results in a verifiable change to the global graph.
*   **Deterministic ID Creation:** The system's reliance on URIs aligns with the Truex requirement for unambiguous identity across distributed agents.

---
**Verification Proof:** Verification of these behaviors is achieved through the integrated `AJAN-Editor Live View` and execution tracing against `RDF4J` endpoints.
