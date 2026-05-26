# Data Driven Automatic Electrical Machine Preliminary Design with Artificial Intelligence Expert Guidance

## 1. Thesis/Overview
This paper proposes a data-driven electrical machine design (EMD) framework that leverages an AI expert database and surrogate models to automate the preliminary design of Wound-Rotor Synchronous Generators (WRSG). The framework replaces time-consuming manual trial-and-error processes with a deterministic, AI-guided lookup system, achieving higher power density designs in seconds.

## 2. Key Findings
- **AI Expert Guide Framework:** Implements a four-stage process: Data Generation (FEA simulation), MOP-based Surrogate Model Training, AI Expert Database Generation, and AI Expert Guide Realization.
- **Metamodel of Optimal Prognosis (MOP):** Utilizes a metamodel that automatically selects and optimizes surrogate algorithms (PLS, MLS, Kriging) based on the Coefficient of Prognosis (CoP).
- **Efficiency Gains:** Generated 9,900 designs in 10 minutes and retrieved an optimal design (No.1138) in 5 seconds.
- **Performance Superiority:** The AI-guided design achieved a power density of 2.21 kVA/kg, exceeding the traditional design's 2.02 kVA/kg.
- **Validated Accuracy:** FEA verification showed that the surrogate model predicts performance with over 93% accuracy (CoP).

## 3. Truex Grammar of Consequence Analysis
- **Attempt:** A designer's specification input is an *Attempt* to identify a geometric configuration that satisfies physical and performance invariants.
- **Admit/Refuse:** The framework's "Scaling Rules" (boundaries and correlation functions) *Refuse* non-physical or unachievable machine geometries. The surrogate model *Admits* only those configurations that occupy the Pareto Front of power-weight-efficiency.
- **Conserve:** The AI expert database *Conserves* the cumulative intelligence of thousands of verified Finite Element Analysis (FEA) runs, eliminating the need for redundant computation.
- **Promote:** Metaheuristic algorithms *Promote* machine designs with maximized power density and minimized mass, driving the system toward the optimal physical consequence.

## 4. Relevance to Truex Post-Gall Operating Substrate
This framework serves as a canonical **Active Design Membrane** for industrial automation within the Truex substrate. It transitions the system from a "pre-Gall" state of probabilistic experimentation to a "post-Gall" state of deterministic lookup. The MOP-based surrogate model acts as a high-fidelity **Digital Twin**, allowing the Truex substrate to verify the physical consequences of an agent's design intent with mathematical certainty before committing to physical manufacturing. This aligns with the Truex mandate for mechanical law enforcement over qualitative human expertise.
