# State of the Substrate: agents

*   **Current State:** Verified / Tier 4 Autonomic Agents
*   **Proven Invariants:**
    *   **adapter:** valid agent proposal admitted; unauthorized proposal refused by ACL gate.
    *   **adapter:** admitted receipt validates cryptographically against the agent public key.
*   **Combinatorial Role:** The `agents` package implements Van der Aalst process mining agents for autonomous adversarial validation. It operates at Tier 4, coordinating with the Tier 1 Engine to generate and verify effects.
*   **Final Execution Path:** Phase 2, Step 1 (A2A Activation: Finalizing the SwarmActuator for formal Agent-to-Agent coordination).
*   **Jidoka Status:** Speculative or structural failure in an agent proposal yields a **Refused** receipt and prevents the consequence from being promoted to the substrate.
