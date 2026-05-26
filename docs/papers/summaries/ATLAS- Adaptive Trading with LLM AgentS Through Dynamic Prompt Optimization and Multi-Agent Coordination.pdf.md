# ATLAS: Adaptive Trading with LLM AgentS Through Dynamic Prompt Optimization and Multi-Agent Coordination

## 1. Main Thesis
The paper introduces **ATLAS** (Adaptive Trading with LLM AgentS), a multi-agent framework designed to solve the challenges of synthesizing heterogeneous information and adapting agent behavior in high-stakes, stochastic financial environments. Central to ATLAS is **Adaptive-OPRO**, a novel prompt optimization method that treats instruction text as an evolvable object, dynamically refined through rolling-window performance feedback while maintaining architectural stability through strict template separation.

## 2. Key Findings
- **Adaptive-OPRO Mechanism:** Unlike standard prompt engineering, Adaptive-OPRO uses an "Optimizer LLM" to diagnose failure modes and propose revised instruction prompts based on scalar performance scores (ROI).
- **Interface Stability:** The framework enforces **Edit Locality** by separating static instructions (policy/constraints) from dynamic run-time content (market state/news). This prevents prompt updates from breaking the execution interface.
- **Hierarchical Intelligence:** A Market Intelligence Pipeline—consisting of Market, News, and Fundamental Analysts—converts high-entropy data into structured, low-noise summaries for a Central Trading Agent (CTA).
- **Order-Level Precision:** By operating in an order-level action space (specifying type, size, price), the system enforces execution feasibility and generates a complete audit trail of fills and portfolio states.
- **The Reflection Paradox:** The study identifies that free-form reflection can often *degrade* performance in noisy environments by inducing policy drift and overreaction, whereas structured prompt optimization (Adaptive-OPRO) yields consistent improvements.

## 3. Truex Grammar of Consequence Analysis
- **Attempt (Intake):** The CTA's generation of order-level outputs represents a formal **Attempt** to transition the portfolio state.
- **Law (μ):** The static instruction block, evolved via Adaptive-OPRO, defines the **Operating Law** for the agent. The 'Optimizer LLM' acts as a manufacturing operator for the law itself.
- **Admission:** The requirement to preserve placeholders and output schemas during prompt optimization serves as a **Deterministic Admission Function** for new law variants.
- **Receipt:** The integration with `StockSim` ensures that every action results in a **Receipt** (fills, positions, cash balance), which is then used as evidence for further law optimization.
- **Consequence:** Success is measured by the convergence of the portfolio state toward risk-adjusted performance goals, proving that consequence is conserved across sequential decisions.

## 4. Relevance to Truex Post-Gall Operating Substrate
ATLAS provides a high-fidelity blueprint for implementing **Active Computational Membranes** in specialized domains like trading.
- **Runtime Ambiguity Elimination:** The move from directional scores to order-level execution mimics the Truex shift from probabilistic intent to deterministic consequence.
- **Conserved Consequence:** The feedback loop in Adaptive-OPRO is a canonical example of using **Receipted Consequence** to iteratively refine the **Ontological Law** (`O*`) of an autonomous system.
- **Active Computational Membrane:** The framework's ability to "physically" prevent invalid orders (via StockSim semantics) and "lawfully" evolve instructions (via template-preserving OPRO) validates the Truex vision of an autonomous substrate where work is conserved rather than just claimed.
- **Gall Law Alignment:** ATLAS follows Gall sequencing by establishing a working simulation primitive (S₀: StockSim) before layering complex multi-agent coordination and prompt evolution (S₁) on top.
