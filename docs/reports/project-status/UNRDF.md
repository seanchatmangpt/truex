# State of the Substrate: UNRDF

*   **Current State:** Verified / Tier 3 Semantic Ontology
*   **Proven Invariants:**
    *   **ontology:** 100% Gall Mapping Coverage Verified; no files classified as Unmapped.
    *   **ontology:** All core files have cryptographic proof and observatory documentation.
*   **Combinatorial Role:** UNRDF serves as the "Lawful Vocabulary" (O*) at Tier 3. It translates static semantic triples into the dynamic OCEL 2.0 types and Rust predicates consumed by the Tier 1 Kernel.
*   **Final Execution Path:** Phase 2, Step 2 (POWL-Discovery Integration: Wiring scripts/mcp-powl-sync.ts into the doctor pipeline).
*   **Jidoka Status:** Detection of logical contradictions or unreachable states in the ontology yields a **Refused** sync, preventing the manufacture of invalid kernels.
