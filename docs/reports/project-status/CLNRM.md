# State of the Substrate: CLNRM

*   **Current State:** Prototype (Tier 3 Isolation)
*   **Proven Invariants:**
    *   All skills pass sandbox validation with no clock or randomness dependencies (Proven via `repository`)
    *   Cryptographic replay validation converges under tested mutations (Proven via `otp-breakpoints`)
*   **Combinatorial Role:** Tier 3 - Isolation Boundary. Functions as the Cryptographic Cleanroom Membrane, providing a zero-side-effect containment boundary for untrusted agent-written code.
*   **Final Execution Path:** Physically implement the `truex_erlmcp` routing layer to move A2A dialogue and CLNRM execution off the single-threaded Node.js event loop. (Phase 2, Step 4)
*   **Jidoka Status:** CLNRM refuses an execution attempt if the code attempt is to import a forbidden native module or if the execution duration exceeds the allocated temporal budget.
