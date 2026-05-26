# Summary: A Workflow for GLAM Metadata Crosswalk

**File:** A Workflow for GLAM Metadata Crosswalk.pdf

## 1. Main Thesis
The paper proposes a replicable, human-in-the-loop workflow for metadata schema crosswalks in the GLAM (Galleries, Libraries, Archives, and Museums) sector. It focuses on the systematic transformation of heterogeneous tabular data into Resource Description Framework (RDF) format to enhance Linked Open Data (LOD) and ensure the interoperability of digital twins for cultural heritage.

## 2. Key Findings
- **Human-Centric Mapping:** The interaction between digital humanists and domain experts (facilitated by surveys like LimeSurvey) is critical for abstracting and reformulating domain-specific knowledge before technical conversion.
- **Declarative Rules (RML & YARRRML):** Utilizing RDF Mapping Language (RML) and its human-readable counterpart YARRRML allows for customizable, implementation-independent mapping rules that can be stored in configuration files.
- **CHAD-AP Application Profile:** The development of a modular application profile based on CIDOC CRM and CRM Digital is essential for representing both museum objects and the digital acquisition process.
- **Provenance and Traceability:** Maintaining the traceability of source information throughout the conversion process is a fundamental requirement for FAIR data principles.

## 3. Truex Grammar of Consequence Analysis

### Substrate (The GLAM Ecosystem)
The operational field consists of the physical artifacts, their digital twins, and the vast, overlapping conceptual domains of cultural heritage metadata.

### Membrane (CHAD-AP and RML Rules)
The CHAD-AP Application Profile and the associated RML/YARRRML mapping rules act as the Active Computational Membrane. They define the "laws" of semantic transformation, ensuring that data is normalized and linked according to rigorous standards.

### Attempt (The Digitization Motion)
The initial formalization of information into tabular datasets and the subsequent attempts to map these schemas are the raw motions trying to enter the digital ecosystem.

### Admit / Refuse (The Crosswalk Validation)
Transitions are **Admitted** to the Linked Open Data substrate only if they satisfy the integrity checks of the Application Profile. The survey-based "human-in-the-loop" phase represents a formal mechanism for **Refusing** semantic loss and maverick data entries, requiring them to be reformulated before admission.

### Receipt (The RDF Serialization)
The output N-Triples RDF files and the OpenCitations-compliant provenance records serve as the proof-bearing evidence of the consequence. They document the exact causal chain from tabular source to semantic graph.

## 4. Relevance to Truex Post-Gall Operating Substrate
This workflow serves as a domain-specific implementation of the Truex **Active Computational Membrane** in a semantic context. By formalizing the relationship between raw domain knowledge (Attempt) and structured global knowledge (Substrate), it aligns with the Truex mandate of blocking invalid transitions at the semantic boundary. The emphasis on "Human-in-the-loop" as a resolution mechanism for ambiguity is a precursor to the **Authoritative Intervention** loops used in Truex to stabilize semantic trajectories.
