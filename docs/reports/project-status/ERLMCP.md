# State of the Substrate: ERLMCP

*   **Current State:** Prototype (Tier 4 - Execution Interface)
*   **Proven Invariants:**
    - BEAM-based routing provides 1:1 agent-to-process failure containment (Proven via `hook-otp` supervisor restart validation)
    - High-concurrency transport stabilizes swarm coordination without dropping context (Proven via `unified-benchmarks` concurrent cell execution)
*   **Combinatorial Role:** Tier 4 high-concurrency bridge. Acts as the autonomic transport gateway between massive LLM swarms and the local Truex host. Translates intents to `DesktopCommander` or `cns`.
*   **Final Execution Path:** Phase 2, Step 4: Physically implement the `truex_erlmcp` routing layer to handle swarm coordination, moving A2A dialogue off the single-threaded Node.js event loop.
*   **Jidoka Status:** Triggers an instant `SecurityViolation` event and drops the connection if an unhandshaken or unauthorized signature is detected during agent message routing.
