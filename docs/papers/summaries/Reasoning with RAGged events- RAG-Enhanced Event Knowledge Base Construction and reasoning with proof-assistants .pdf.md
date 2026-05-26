# Summary: Reasoning with RAGged events: RAG-Enhanced Event Knowledge Base Construction and reasoning with proof-assistants

## Main Thesis
This paper investigates the automated construction of historical event knowledge bases using Large Language Models (LLMs) and **Retrieval-Augmented Generation (RAG)**. It challenges the assumption that RAG always improves performance, identifying an **"inverse calibration principle"** where stronger models (GPT-4o, Claude 3.5) perform optimally with base generation, while weaker models require carefully bounded augmentation. Crucially, it proposes a pipeline to translate extracted RDF data into **Coq proof assistant** specifications to enable higher-order temporal and causal reasoning beyond the limits of first-order logic.

## Key Findings
- **Inverse Calibration Principle:** Enhancement effectiveness inversely correlates with model capability. For GPT-4o and Claude 3.5, RAG often introduced hallucinations and temporal conflations, whereas Llama 3.2 showed extreme sensitivity to RAG implementation quality.
- **Ontological Discovery:** RAG-enhanced extraction often discovers domain-specific event types (e.g., *ET_MigrationEvent*, *ET_WarEvent*) that exceed the granularity of general-purpose ontologies like DBpedia, representing legitimate semantic innovations rather than errors.
- **RAG for Precision vs. Base for Coverage:** Base generation provides broader historical coverage and narrative richness, while RAG trades this breadth for technical precision in coordinates and metadata.
- **Higher-Order Reasoning Gap:** Traditional RDF/OWL reasoners cannot handle the complex temporal arithmetic (e.g., BC dates) and multi-step causal verification required for historical analysis.
- **Formal Verification via Coq:** Translating extracted events into Coq allows for formal mathematical proofs of historical causation and temporal consistency, validating the "discovered" ontology against rigorous logical laws.

## Truex Grammar of Consequence Analysis
1. **Consequence as Formal Specification:** In this framework, the **Consequence (A)** is the Coq specification—a machine-verifiable representation of historical intelligence.
2. **Ontological Law Closure (O*):** The use of Coq provides the **Lawful Operational Closure** required by the Truex substrate. It moves knowledge from a probabilistic graph (RDF) to a deterministic logical system.
3. **Receipted Reasoning:** Every causal claim in the knowledge base is backed by a **Coq Proof**, acting as a high-integrity **Receipt (R)** that proves the admissibility of the extracted consequence.
4. **GraphDelta to Logic:** The RDF parsing module treats each extracted event as a **GraphDelta**, which is then manufactured (μ) into a higher-order logical primitive.

## Relevance to Truex Post-Gall Operating Substrate
- **Doctor Agent Archetype:** The translation pipeline to Coq is a foundational tool for the substrate's **'Doctor'**. It enables the automated audit of agent-generated knowledge, ensuring that "Architecture Drift" (hallucination) is identified as an "Unlawful State."
- **Receipted Operational Manufacturing:** This paper provides the mechanism for the substrate to transition from **Probabilistic Software** (LLM narrative extraction) to **Receipted Operational Manufacturing** (formally proven causal models).
- **Gall Law (S₀ to S₂):** The two-phase pipeline respects Gall sequencing: extracting simple event primitives (S₀) and receipting them (S₁) before attempting higher-order reasoning and formal verification (S₂).
- **Deterministic Variability:** By grounding "Admissible Variability" (narrative interpretation) in Coq's formal type system, the substrate can maintain operational convergence even when dealing with complex, multi-source historical data.
