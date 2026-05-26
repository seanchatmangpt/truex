# Summary: SBOM FAQ 2024 (SBOM FAQ 2024.pdf)

## 1. Main Thesis
The document serves as a foundational guide for the adoption and implementation of Software Bills of Materials (SBOMs). It positions the SBOM as a "formal record containing the details and supply chain relationships of various components used in building software," essential for vulnerability management, license compliance, and overall supply chain transparency in modern software development.

## 2. Key Findings
- **Definition & Composition:** An SBOM must include baseline information: author name, supplier name, component name, version string, component hash, unique identifier, and relationship.
- **Industry Standard Formats:** Three primary machine-readable formats are recognized: SWID (Software Identification) tagging, SPDX (Software Package Data Exchange), and CycloneDX.
- **Dynamic Lifecycle:** SBOMs should be generated at multiple points in the development lifecycle and updated for every new release or component change.
- **VEX Integration:** The Vulnerability Exploitability eXchange (VEX) complements SBOMs by providing context on whether a specific vulnerability actually affects a product, reducing "false positive" triage effort.
- **Defensive Advantage:** While theoretically a roadmap for attackers, the document argues that the defensive benefits of transparency far outweigh the risks, leveling the playing field through standard, machine-readable decision support.
- **Cross-Sector Utility:** Derived from proven manufacturing principles (e.g., Toyota's Bill of Materials), the SBOM framework is now being applied to software to ensure "knowledge of source, quality, and how to address defects efficiently."

## 3. Truex Grammar of Consequence Analysis

### Substrate
The **Substrate** is the global software supply chain and the specific CI/CD pipelines where software components are assembled and deployed.

### Membrane
The **Minimum Requirements for SBOM** (as defined by NTIA/CISA) act as the **Membrane**. This defines the "Law of Admission" for any third-party or internal component seeking entry into a secure production environment. If a component lacks a valid, hash-verified SBOM, it is a "foreign object" to the substrate.

### Attempt
An **Attempt** is the introduction of a new library, module, or container image into a project or runtime environment.

### Admit / Refuse
The admission system **Admits** a component only if its SBOM matches the actual binary (verified via hashes) and its license/vulnerability profile satisfies the organizational operating law. A component with a "High" CVE listed in its SBOM (without a corresponding "not_affected" VEX statement) is **Refused**.

### Receipt
The **SBOM** itself, along with any associated **VEX** documents and **hashes**, serves as the **Receipt**. It is a cryptographic proof of the component's lineage and its adherence to the substrate's security laws.

## 4. Relevance to Truex Post-Gall Operating Substrate
- **Receipt-First Architecture:** The SBOM is the canonical implementation of the "Receipt" primitive in the Truex grammar, ensuring that no software consequence is realized without a verifiable record of its constituent parts.
- **Deterministic Compliance:** By replacing qualitative "vendor trust" with machine-readable SBOM/VEX data, the Truex substrate can mechanically enforce security and license compliance.
- **Supply Chain Law:** The SBOM provides the structured data necessary for ggen to manufacture "lawful" software receipts that comply with federal and industry transparency mandates (e.g., FDA medical device guidance).
- **Hierarchical Verification:** The "multi-level BOM" concept aligns with the Truex requirement for hierarchical state verification, where every admitted state must be supported by the admitted states of its dependencies.
