# Summary: CypherBench - Precise Retrieval over Knowledge Graphs

## 1. Product Thesis
CypherBench is a **Precise Retrieval Substrate** that transforms massive, unnormalized RDF knowledge graphs into domain-specific, schema-enforced property graphs. It manufactures a deterministic interface (Text-to-Cypher) that **Admits** natural language questions and **Promotes** them into formal execution plans, overcoming the context-window limitations and schema-noise of raw RDF.

## 2. Key Findings
- **RDF-to-Property Graph Transformation**: The paper introduces an engine that **Projects** RDF triples into strictly typed property graphs. It handles unit standardization and datatype enforcement, ensuring that subsequent aggregation **Attempts** do not violate numerical invariants.
- **Global Query Capacity**: Unlike standard GraphRAG which relies on local embedding neighborhoods, CypherBench **Admits** global queries (queries without named entities) by executing substrate-wide Cypher MATCH patterns.
- **Evaluation Framework**: Introduces **Execution Accuracy (EX)** and **Provenance Subgraph Jaccard Similarity (PSJS)** to measure the precision of the retrieval consequence.
- **LLM Performance Gaps**: Even top-tier models (GPT-4o, Claude 3.5 Sonnet) struggle with complex graph patterns, frequently **Refusing** correct execution due to reversed relation directions or schema violations.

## 3. Truex Post-Gall Relevance: The Grammar of Consequence
- **Deterministic Projection**: The transformation from RDF to property graphs is a canonical Truex **Projection**. It filters out "maverick" data (unnormalized units, imprecise dates) to **Conserve** a clean, queryable state.
- **Schema as Law**: In CypherBench, the graph schema acts as the **Operating Law (`μ`)**. Queries that do not conform to the schema are **Refused** by the database engine, providing a deterministic boundary for LLM-generated attempts.
- **Substrate Scaling**: By partitioning the massive Wikidata RDF into domain-specific views, the system **Conserves** LLM context efficiency while **Promoting** high-precision retrieval within bounded accounting domains (e.g., Biology, Geography).
- **Global Awareness**: The focus on "Global Queries" mirrors the Truex requirement for substrate-level proofs that go beyond local "hot" data, ensuring that the system can **Admit** and verify truths that span the entire object graph.

## 4. Refusal Conditions
- **Schema Violation**: Any query **Attempt** that references non-existent relation types or entity labels is terminal **Refused** by the Neo4j substrate.
- **Unrealistic Questions**: The benchmark pipeline **Refuses** questions that violate relationship cardinality (e.g., asking for "all mothers" in a one-to-one relationship), ensuring the consequence is logically sound.
- **Performance Timeouts**: Queries exceeding a 30-second execution window are **Refused** to **Conserve** substrate compute resources.
