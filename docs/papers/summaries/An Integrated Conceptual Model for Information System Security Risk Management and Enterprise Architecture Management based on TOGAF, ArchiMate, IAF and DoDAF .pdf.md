# Paper Summary: An Integrated Conceptual Model for Information System Security Risk Management and Enterprise Architecture Management

## Main Thesis
This technical report defines a formal alignment between Information System Security Risk Management (ISSRM) and established Enterprise Architecture Management (EAM) frameworks (TOGAF, ArchiMate, IAF, DoDAF) to create a unified conceptual model that integrates security risk assessment into the core architectural design of an organization.

## Key Findings
- **Semantic Mapping:** The report establishes precise semantic correspondences (Equivalence, Generalization, Specialization, etc.) between ISSRM concepts (Assets, Threats, Vulnerabilities, Controls) and EAM architectural elements.
- **Framework Integration:** 
    - **ArchiMate:** Maps "Value" to "Business asset::worth" and "Driver" to "Security criterion".
    - **TOGAF:** Identifies "Organization Units" and "Actors" as "IS assets" subject to risk.
    - **DoDAF:** Equates "Capability" to a composite of "IS and Business assets".
- **Unified Governance:** The integrated model allows for the consistent definition of security requirements and controls across different layers of the enterprise architecture (Business, Application, Technology).

## Truex Post-Gall Operating Substrate Relevance
The integrated model provides the structural blueprint for "secure-by-design" state transitions within the Truex substrate.

- **Given** an enterprise architecture defined by multiple heterogeneous frameworks;
- **When** the substrate maps organizational "Drivers" to technical "Security Criteria";
- **Then** every state transition (Event) must satisfy the derived "Security Requirements" before achieving finality (Consequence).
- **Therefore**, the substrate's constitutional laws must be derived from a unified conceptual model that binds enterprise-level risk management directly to technical execution invariants.
