# Summary: Which Combination of Test Metrics Can Predict Success of a Software Project? A Case Study in a Year-Long Project Course

## 1. Main Thesis
The paper investigates the predictive power of various software testing metrics—specifically unit testing, automated acceptance testing (BDD), and manual testing—on the "Functional Suitability" (success) of a software project. It concludes that while no single metric is a silver bullet, a high level of combined coverage across the entire "testing pyramid" is the strongest predictor of project success and functional correctness.

## 2. Key Findings
- **Combined Predictive Power:** The most accurate prediction of successful product delivery comes from a combination of all coverage metrics (unit, automated acceptance, and manual) rather than any single technique.
- **User-Centric Metrics:** Front-end unit testing (FEUT) and manual acceptance testing (MAT) showed the strongest individual statistical correlation with passed story points (PSP).
- **Back-end Preemption:** Increased back-end unit testing (BEUT) was found to lower the probability of story deferrals, as it enabled developers to more accurately assess their ability to deliver complex business logic.
- **BDD Adoption Barrier:** Junior developers struggled with the complexity of Behavior-Driven Development (BDD/Cucumber), often disengaging from automated acceptance testing in favor of manual testing as project complexity grew.
- **Effort vs. Results:** There was no statistically significant relationship between the *time effort* logged for testing and the actual quality of the product, highlighting the unreliability of manual work-logs as a quality indicator.

## 3. Truex Grammar of Consequence Analysis

### Substrate
The Scrum-based software development process and the CI/CD infrastructure (GitLab, SonarQube) form the substrate where developmental "Attempts" occur.

### Membrane
The **Acceptance Criteria (AC)** defined for each user story serve as the Membrane. This membrane acts as the "Operating Law" that filters out buggy or incomplete code during the sprint review.

### Attempt
Each developer commit and the associated work-log entry represents a formal **Attempt** to register a functional state change in the software substrate.

### Admit / Refuse
The sprint review process (conducted by the Product Owner) **Admits** story points into the "passed" state only if the software satisfies the deterministic rules of the AC; otherwise, the Attempt is **Refused** and must be re-worked.

### Receipt
The **Passed Story Points (PSP)** and the final SonarQube coverage metrics serve as the **Receipt**, providing a cryptographic-like proof of the software's functional integrity and its adherence to the project's law.

## 4. Relevance to Truex Post-Gall Operating Substrate
- **Deterministic Success:** The paper’s conclusion that success can be predicted through a combination of "Law-Compliance" metrics (testing coverage) reinforces the Truex mandate for replacing subjective evaluations with mechanical enforcement.
- **Multi-Layered Verification:** The study validates the Truex architectural pattern of multi-layered membranes (Unit -> Acceptance -> Manual), ensuring that "admission" to the final product state is cross-verified at different levels of abstraction.
- **Audit-Log Integrity:** The discovery that manual work-logs (subjective receipts) are unreliable compared to automated coverage reports (mechanical receipts) supports the Truex preference for system-generated, immutable receipts of operation.
