# State of the Substrate: contracts

*   **Current State:** Verified / Tier 2 Runtime Contracts
*   **Proven Invariants:**
    *   **wizard-contracts:** ProjectConsequenceCell and WizardReceipt types defined and enforced.
    *   **receipt:** tampered receipt fails signature verification; broken chain fails verification.
*   **Combinatorial Role:** The `contracts` package defines the Tier 2 runtime interfaces and receipt structures. It provides the shared types and validation logic that allow T3-T5 layers to communicate safely with the T0-T1 substrate.
*   **Final Execution Path:** Phase 1, Step 2 (L1 Cryptographic Seal: Integrating the Dual Signature mechanism into core receipt types).
*   **Jidoka Status:** Invariant breach or receipt chain discontinuity yields a **Refused** transaction and a **Halted** kernel to preserve substrate integrity.
