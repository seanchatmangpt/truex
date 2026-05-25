# State of the Substrate: BitActor

*   **Current State:** Prototype (Tier 1 Concurrency)
*   **Proven Invariants:**
    *   OTP FIFO Mailbox ordering verified for sequential settlement (Proven via `hook-otp`)
    *   Supervisor restart on transient crash verified under fuzzed inputs (Proven via `hook-otp`)
*   **Combinatorial Role:** Tier 1 - Concurrency Geometry. Implements a lock-free, zero-variance actor model where state transitions are projected via receipted causal chains in bit-native memory arenas.
*   **Final Execution Path:** Porting of the `vendors/ReactiveMessagingPatterns_ActorModel` patterns to Rust and integration with the `truex-kernel` to manage parallel autonomic swarms. (Phase 1 Porting)
*   **Jidoka Status:** BitActor refuses a message attempt if the target actor's mailbox has exceeded its depth budget or if the sending agent lacks the capability to interact with the target actor.
