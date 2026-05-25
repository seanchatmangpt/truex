# State of the Substrate: cognition

*   **Current State:** Verified / Tier 4 Cognition Kernel
*   **Proven Invariants:**
    *   **doctor-wizard-telco-unified:** Wizard plan registry generated and checkpoint files forged.
    *   **doctor-wizard-telco-unified:** Failed Wizard proof successfully prevented Telco routing and transmission.
*   **Combinatorial Role:** The `cognition` package provides the Old-AI logic layer (frames, rules, constraints) at Tier 4. It adjudicates agent proposals and ensures they comply with the discovered operating law before they are handed to the Tier 1 Kernel.
*   **Final Execution Path:** Phase 2, Step 1 (A2A Activation: Requiring "Natural Language Agreement" receipts signed by Developer and Auditor agents).
*   **Jidoka Status:** Proof failure or constraint violation yields a **Refused** routing and triggers a **Quarantine** of the proposing agent's context.
