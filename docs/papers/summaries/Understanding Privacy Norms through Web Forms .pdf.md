# Summary: Understanding Privacy Norms through Web Forms (Understanding Privacy Norms through Web Forms .pdf)

## 1. Main Thesis
The paper presents a large-scale measurement study of personal information (PI) collection through web forms on 11,500 popular websites. By leveraging LLM-assisted classification (GPT-3.5) and a specialized crawler, the authors extract implicit "privacy norms"—the standards for what is considered appropriate data collection in specific contexts (form types and website categories). The study reveals a significant misalignment between actual collection practices, the disclosures made in legal privacy policies, and the expectations of users, highlighting the prevalence of unnecessary data collection and "dark patterns."

## 2. Key Findings
- **Annotated Dataset Creation:** Developed a cost-efficient methodology using LLM-based knowledge distillation and active learning to annotate 293K web forms with form types (e.g., account registration, payment) and 16 PI types.
- **Contextual Privacy Patterns:** Identified that PI collection is largely driven by functional necessity (e.g., email for contact) and legal obligations (e.g., identity verification in finance/health), establishing contextual norms.
- **Privacy Disconnect:** Found a weak association (𝜙-coefficient < 0.20) between what websites actually collect on forms and what they disclose in their privacy policies, which are often overly broad or omit collected PI.
- **Dark Patterns and Excessive Collection:** Uncommon PI collection practices (e.g., asking for birth date in an email subscription form) often indicate "dark patterns" designed to trick users into providing unnecessary sensitive information.
- **Ubiquity vs. Sensitivity:** Email addresses are collected by over 85% of websites and perceived as less sensitive, while phone numbers and addresses are more restricted to real-world service categories.
- **Policy Inaccessibility:** Fewer than half of the analyzed web forms provide direct links to privacy policies in context, questioning the effectiveness of "notice and consent" models.

## 3. Truex Grammar of Consequence Analysis

### Substrate
The global web ecosystem and the various website infrastructures where web forms serve as the primary interface for user-to-substrate data ingestion.

### Membrane
The **Contextual Integrity (CI)** framework and the **Privacy Norms** identified in the study act as the **Membrane**. They define the criteria for what constitutes "appropriate" and "admissible" information flow for a given agent interaction.

### Attempt
A user filling out and submitting a web form represents an **Attempt** to mutate the informational state of the website's database (substrate).

### Admit / Refuse
The system (as envisioned by the authors' risk assessment tool) should **Admit** PI that aligns with the established contextual norms. Deviations that signal excessive collection or lack of legal disclosure should be **Refused** or flagged as "high-entropy" violations of the **Operating Law**.

### Receipt
The **Annotated Form Dataset** and the **Privacy Policy Analysis**, characterizing the lineage and purpose of each PI request, serve as the **Receipt** documenting the privacy posture of the interaction.

## 4. Relevance to Truex Post-Gall Operating Substrate
- **Contextual Admission Logic:** The use of Contextual Integrity (CI) provides a robust architectural model for the Truex **Membrane**, where "Admission" is a function of the social and functional context of the agent.
- **Knowledge Distillation for Controllers:** The LLM-to-student-model distillation process is a blueprint for building lightweight, high-precision **Admission Controllers** that can be deployed across the substrate without high API costs.
- **Operating Law for Privacy:** The identified privacy norms provide a set of "Deterministic Invariants" that the Truex substrate can mechanically enforce to prevent "entropy smuggling" through unnecessary data collection.
- **Agentic Risk Assessment:** The proposed user-facing warning tool is a form of a Truex agent that monitors transitions for compliance with privacy laws and normative standards.
- **Receipted Compliance:** By mapping form fields to legal categories (e.g., CCPA, GDPR), the paper enables the creation of verifiable **Receipts** for data minimization compliance.
