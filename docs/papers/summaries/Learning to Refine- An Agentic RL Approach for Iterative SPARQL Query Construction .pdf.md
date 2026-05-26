# Summary: Learning to Refine: An Agentic RL Approach for Iterative SPARQL Query Construction

## Thesis
This work introduces an agentic framework where an LLM learns a resilient, adaptive policy for iterative **SPARQL construction** through interaction with a Knowledge Graph (KG). It argues that "one-shot" capability execution is a brittle **State** and that true intelligence is a consequence of a "think-act-observe" loop. By leveraging Reinforcement Learning (RL), specifically Group Relative Policy Optimization (GRPO), the authors demonstrate that even compact models can master symbolic tools by treating execution feedback as a primary environmental **Event**.

## Key Findings (States, Events, Consequences)

### 1. The Brittle One-Shot State
*   **State:** Conventional LLM interaction with structured data (KGQA) relies on a single-pass query generation.
*   **Event:** Complex multi-hop questions (e.g., "Which actors starred in movies directed by the director of Inception?").
*   **Consequence:** High failure rates (syntactic and logical) and an inability to recover from intermediate execution errors, leading to a breakdown in reasoning.

### 2. The Agentic Interaction Loop (Think-Act-Observe)
*   **State:** The agent is placed in an MDP (Markov Decision Process) environment.
*   **Event:** The agent generates a `<think>` block for internal reasoning, followed by a `<query>` action.
*   **Consequence:** The KG returns a `<query_result>` (feedback), allowing the agent to enter a new state of awareness and refine its next action iteratively until an `<answer>` is reached.

### 3. The RL-Tuned Policy Consequence
*   **State:** A compact 3B-parameter model (Qwen2.5) without supervised fine-tuning.
*   **Event:** Training via GRPO with outcome-driven rewards (Accuracy, Executability, Efficiency).
*   **Consequence:** Absolute accuracy improvement of 17.5 percentage points over baselines (49.7% total) and a leap in query executability to 81%, effectively shifting failure modes from "syntactic incompetence" to high-level "incorrect logic."

### 4. Emergent Strategic Decomposition
*   **State:** A direct query to a complex question fails or returns empty results.
*   **Event:** The agent encounters a bottleneck during multi-hop reasoning.
*   **Consequence:** The agent performs "Strategic Decomposition"—pivoting to exploratory queries to find candidate entities and then using verification queries to find the correct path, mirroring human-like problem-solving.

## Relevance to Truex Post-Gall Operating Substrate
The findings in this paper provide the foundational logic for Truex agent behavior:
*   **Feedback-Driven State Transitions:** Truex agents must not rely on pre-programmed "golden paths" but must learn to navigate the capability substrate through the **Event** of real-time failure and refinement.
*   **Cognitive Scaffolding:** The `<think>` block is the architectural requirement for the **ostar-architect** skill, ensuring that every state transition in the substrate is preceded by a deliberative reasoning step that regularizes the learning process.
*   **Outcome-Driven Capability Manufacturing:** The success of GRPO suggests that the Truex **ostar-operator** can optimize manufactured capabilities based on sparse, terminal rewards (e.g., "Did the WASM module complete the task?") rather than requiring dense supervision.
*   **Symbolic/Neural Bridge:** The paper validates the Truex approach of using probabilistic LLMs to control a rigid, symbolic substrate (the capability map), treating the formal language (SPARQL or Truex Grammar) as a tool for the agent to master.
