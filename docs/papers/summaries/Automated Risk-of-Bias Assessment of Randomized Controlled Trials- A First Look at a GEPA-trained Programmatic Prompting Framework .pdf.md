# Automated Risk-of-Bias Assessment of Randomized Controlled Trials: A GEPA-trained Programmatic Prompting Framework

## 1. Main Thesis
This research introduces a programmable pipeline for automating the Risk-of-Bias (RoB) assessment of Randomized Controlled Trials (RCTs). By utilizing the **DSPy** framework and its **GEPA** (Genetic-Pareto) module, the study replaces subjective, ad-hoc prompt engineering with a structured, data-driven optimization process. The framework formalizes RoB assessment as an auditable computational task, ensuring that LLM-driven reasoning is reproducible, transparent, and aligned with established clinical standards (Cochrane RoB 1).

## 2. Key Findings
- **Programmatic Optimization:** The GEPA module uses natural language reflection and Pareto-guided search to iteratively refine reasoning instructions, significantly outperforming handcrafted prompts by 30%–40% in key domains like Random Sequence Generation.
- **Auditable Execution Traces:** Every step of the optimization and inference process generates inspectable traces, enabling full scientific replication and model-to-model comparison.
- **Textual Literalism & Conservatism:** The study identifies a "conservatism bias" in LLMs, where the model demands explicit procedural detail (e.g., "computer-generated sequence") and defaults to "unclear" risk when reports use formulaic or vague language that human reviewers might implicitly accept.
- **Scalability and Efficiency:** The pipeline demonstrates high computational efficiency, with training costs averaging as low as $0.04 per domain and inference times within minutes, supporting the transition to "living" evidence syntheses.
- **Model Agnosticism:** Optimized prompts transfer effectively across different model families (Mistral, GPT-5, Claude), suggesting that GEPA captures task-level regularities rather than model-specific quirks.

## 3. Truex Grammar of Consequence Analysis
- **Attempt (Intake):** The input RCT text represents a high-entropy **Attempt** to be classified within the methodological framework.
- **Law (μ):** The GEPA-optimized reasoning templates define the **Operating Law** for assessment. The Pareto optimization process acts as the **Manufacturing Operator** for this law.
- **Admission:** The system functions as a **Deterministic Admission Function**; a study is only **Admitted** as "Low Risk" if it satisfies the explicit procedural invariants defined in the optimized prompt.
- **Receipt:** The generated execution logs and reasoning justifications serve as the **Receipt** of the assessment, proving the lineage from raw evidence to final risk judgment.
- **Invariant Enforcement:** By demanding explicit textual confirmation, the framework enforces a "text-bound" invariant that eliminates the "maverick" subjectivity of human rater variability.

## 4. Relevance to Truex Post-Gall Operating Substrate
The GEPA-based RoB framework serves as a specialized **Active Computational Membrane** for clinical evidence.
- **Runtime Ambiguity Elimination:** By replacing ad-hoc prompts with a principled optimization pipeline, the system removes the human bottleneck in evidence synthesis and ensures that assessments are governed by mechanical enforcement rather than qualitative intuition.
- **Deterministic Replay:** The focus on structured XML/YAML outputs and logged reasoning paths ensures that `same input + same optimized law = same risk judgment`, fulfilling the Truex requirement for replay convergence.
- **Verification of Law Closure:** The student-teacher interaction model used in GEPA mirrors the Truex approach to **Lawful Closure** (O*), where the system's "Operating Law" is continuously verified and refined against a gold-standard reference.
- **Infrastructural Trust:** This research demonstrates how high-stakes domains (like medicine or law) can be integrated into a post-Gall substrate by converting expert knowledge into a machine-executable "Grammar of Consequence."
