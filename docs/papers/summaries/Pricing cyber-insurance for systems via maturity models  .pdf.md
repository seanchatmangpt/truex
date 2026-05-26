# Summary: Pricing cyber-insurance for systems via maturity models

## Main Thesis
This paper proposes a comprehensive socioeconomic framework for pricing cyber-insurance by integrating **Entity Relationship Diagrams (ERDs)**, **Security Maturity Models (SMMs)**, and **Economic Utility Models**. It addresses the challenge of insufficient historical data in cyber-risk by replacing traditional actuarial methods with a structural analysis of an organization's maturity and its relationship to potential financial loss.

## Key Findings
- **Layered Organizational Mapping:** The framework decomposes an organization into three layers: **Management/Operations**, **Services**, and **Systems**. This allows for a granular assessment of how technical failures impact business revenue.
- **Criticality and Sensitivity:** The standard CIA triad (Confidentiality, Integrity, Availability) is simplified into two primary metrics: **Criticality** (mapping to availability/integrity) and **Sensitivity** (mapping to confidentiality/integrity). These serve as the foundational risk parameters.
- **Maturity as a Proxy for Risk:** Security maturity—defined by **Practices**, **Domains**, and **Objectives**—is used to parameterize the probability of a breach (using the Gordon-Loeb model) and the magnitude of potential losses.
- **Economic Utility Alignment:** The insurer's utility function (e.g., Constant Absolute Risk Aversion - CARA) is used to derive premia that are proportional to the maturity level of the insured system, providing a rational basis for discounts or surcharges.
- **Compositional Scalability:** The use of ERDs allows for a compositional approach where complex system models can be built from simpler primitives, supporting the assessment of large, multi-faceted organizations.

## Truex Grammar of Consequence Analysis
1. **Consequence as Admissible Risk:** In this framework, the "Consequence" is the calculated **Premium (P)**—the financial artifact that represents the lawful operational closure of the system's risk state.
2. **Ontological Law (ERD):** The ERD serves as the **Ontology (O)** for the substrate. It defines the entities (Nouns), relationships (Verbs), and attributes (Adjectives) that constitute the lawful state of the organization.
3. **Receipt of Insurability:** An insurance policy acts as a **Receipt (R)**. It proves that the system's consequence (operation) has been verified against a maturity law and is "admissible" for financial coverage.
4. **Lawful Variability:** The utility function accounts for "admissible variability" in security practices, allowing the substrate to maintain deterministic financial consequences even when operational entropy exists.

## Relevance to Truex Post-Gall Operating Substrate
- **Deterministic Consequence:** The paper provides the mathematical foundation (A = μ(O*)) for turning subjective security posture into a deterministic financial artifact (the premium).
- **Doctor Agent Integration:** The substrate's 'Doctor' can utilize the maturity assessment (µi) as a diagnostic tool. A drop in maturity level is a 'Divergence' that invalidates the 'Receipt' of insurance, triggering immediate remediation.
- **Gall Persistence:** By using ERDs as the "membrane" for persistence (mapping to the SQLite law), the substrate can store and replay the risk state of the system, ensuring that every financial consequence is rooted in a replayable structural assessment.
