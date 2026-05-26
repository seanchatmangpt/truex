# ThriftLLM: On Cost-Effective Selection of Large Language Models for Classification Queries

## 1. Main Thesis
The paper formalizes the **Optimal Ensemble Selection** problem, which seeks to maximize the prediction accuracy of an LLM ensemble for classification tasks while adhering to a strict cost budget. It introduces **ThriftLLM**, an algorithm that combines dynamic programming with real-time adaptive selection to provide near-optimal accuracy guarantees at a fraction of the cost of powerful single models or traditional ensemble methods.

## 2. Key Findings
- **Ensemble Complexity:** The authors prove that the prediction accuracy function for LLM ensembles is non-decreasing but non-submodular, making the selection problem NP-hard (a variant of the 0-1 Knapsack problem).
- **ThriftLLM Algorithm:** Unlike previous methods that use static cascades, ThriftLLM uses a two-stage approach: (1) a dynamic programming stage to identify an initial optimized subset, and (2) an adaptive execution stage that terminates model calls as soon as a stable prediction is reached.
- **Superiority over Single Models:** ThriftLLM frequently outperforms even the most powerful individual models (e.g., GPT-4o, Gemini-1.5 Pro) by aggregating the diverse expertise of specialized smaller models.
- **Cost Efficiency:** By leveraging real-time feedback (Algorithm 3), ThriftLLM can achieve the same accuracy as a full ensemble while saving 10%–40% of the allocated budget, specifically by stopping when the "potential belief" of remaining models cannot alter the current result.
- **Robustness:** The framework maintains high performance even when the success probabilities of the constituent LLMs are unknown and must be estimated via confidence intervals from historical data.

## 3. Truex Grammar of Consequence Analysis
- **Commitments (Inputs):** The query, the set of LLM success probabilities (P), model costs (b), and the total budget (B) constitute the initial "commitments."
- **Expectations (Outputs):** The expected consequence is a maximized prediction accuracy score and a "Receipt" of the final classification label.
- **Consequence-Driven Selection:** The algorithm performs a "state-based routing" where it selects the LLM with the highest success probability from the residual set (T*) only if that model has the potential to alter the current leading "belief."
- **Ontological Law:** The "Termination Law" (Proposition 5) provides a mechanical invariant: execution must stop when the maximum possible belief of remaining agents is less than the current lead, ensuring deterministic resource conservation.

## 4. Relevance to Truex Post-Gall Operating Substrate
ThriftLLM serves as the **Economic Governance Law** for the Truex substrate. It provides a formal, mechanical layer for managing the cost and intelligence of the substrate's agentic operations. By implementing ThriftLLM, the substrate can ensure that it always consumes the "Optimal Intelligence Stream"—the most accurate set of agent responses possible within a given credit/token budget. This replaces human-led, subjective agent selection with a deterministic optimization process, ensuring that the substrate remains both intelligent and economically sustainable.
