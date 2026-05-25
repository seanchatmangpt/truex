# State of the Substrate: UNIBIT

*   **Current State:** Stable / Tier 0 Deterministic Substrate
*   **Proven Invariants:**
    *   **hash:** same input = same hash; different input = different hash.
    *   **hash:** stable ordering (JSON keys sorted) ensures deterministic receipt generation.
*   **Combinatorial Role:** UNIBIT is the bit-native causal receipt layer. It sits at Tier 0, binding the current state and proposed delta into a BLAKE3 digest that forms the unforgeable chain of authority for all higher tiers.
*   **Final Execution Path:** Phase 1, Step 2 (L1 Cryptographic Seal: Integration of BLAKE3 + ML-DSA into the receipt-store).
*   **Jidoka Status:** Hash mismatch or bit-level corruption yields an immediate **Refused** link and a **Quarantined** branch to prevent causal leakage.
