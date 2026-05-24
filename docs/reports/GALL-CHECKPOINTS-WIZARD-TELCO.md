# TRUEX BOUNDARY LAW: WIZARD & TELCO GALL CHECKPOINTS

The Truex architecture rests on three frozen top-level nouns: **Doctor**, **Wizard**, and **Telco**.
This document formally defines the **Gall Checkpoints** for the Wizard (Project Consequence Manufacture) and Telco (Interop / Boundary Communication).

---

## 1. GALL CHECKPOINT S11: WIZARD (Project Manufacture)

**Product Thesis:** The Wizard manufactures project consequence. It prevents unreceipted side-effects by forcing all workspace mutations through an 8-verb bounded discipline, tracked by a 5-domain accounting ledger.

### The 8 Wizard Verbs
1. `init` - Create bounded project cell (`.truex` envelope).
2. `map` - Discover topology (files, ASTs, orphans).
3. `plan` - Propose Gall Checkpoint evidence.
4. `forge` - Materialize file content within the bounded cell.
5. `bind` - Register evidence to the checkpoint registry.
6. `prove` - Run bounded doctor commands.
7. `harden` - Enforce refusal/degradation constraints (failure envelope).
8. `handoff` - Verify the 12-hour monotonic gate and seal accounting.

### Wizard Accounting Domains (W1 - W5)
The **Wizard Ledger** must perfectly conserve across 5 domains before `handoff` is admitted:
* **W1 (Command Conservation):** `attempted == succeeded + failed + refused`
* **W2 (Artifact Conservation):** `attempted == created + updated + unchanged + refused + failed`
* **W3 (Checkpoint Conservation):** `proposed == accepted + refused` AND `proposed <= executed + failed`
* **W4 (Proof Conservation):** `attempted == succeeded + failed + skipped + refused`
* **W5 (Mission Conservation):** `expected == reported + missing + failed + refused`

### Key Invariants (S11 Law)
* **W-I1 (Path Traversal Block):** No `forge` or `init` can mutate outside the root `project.cell`.
* **W-I2 (No Silent Failures):** A `harden` step must actively prove what the system *refuses* to do.
* **W-I3 (Monotonic Gate):** No `handoff` can succeed before the 12-hour tick window expires.
* **W-I4 (Receipt Continuity):** Every verb must emit a hashed receipt linking back to the `genesisHash`.

---

## 2. GALL CHECKPOINT S13: TELCO (Interop Membrane)

**Product Thesis:** Telco is the communication membrane for Truex. It proves one bounded cell can communicate with an external cell/system without smuggling in unreceipted state or granting external reality write-authority. 

### The 8 Telco Verbs
1. `listen` - Declare and inspect an inbound communication surface and its mailbox.
2. `dial` - Attempt outbound communication with a discoverable peer.
3. `handshake` - Bind peer, protocol, epoch, capability, and freshness window.
4. `encode` - Project internal objects into canonical boundary packets.
5. `route` - Select an admissible communication path and retry policy.
6. `transmit` - Move the packet across the boundary via durable mailbox discipline.
7. `verify` - Verify acknowledgment, remote response, hash, and replay.
8. `settle` - Close session, conserve accounting, and declare consequence promotability.

### Telco Accounting Domains (T1 - T6)
The **Telco Ledger** strictly conserves motion. Every attempt must reach terminality.
* **T1 (Session Bound):** `attempted_dials == sessions_handshaken + refused_dials`
* **T2 (Packet Projection):** `encode_attempts == packets_projected + refused_projections`
* **T3 (Route Admission):** `packets_projected == routes_admitted + routes_refused`
* **T4 (Transmission Terminality):** `routes_admitted == transmitted_acked + timeout + failed_exhausted`
* **T5 (Verification Closure):** `transmitted_acked == verified_valid + verified_invalid`
* **T6 (Settlement Closure):** `sessions_handshaken == sessions_settled_promotable + sessions_settled_blocked`

### Key Invariants (S13 Law)
* **T-I1 (No Unhandshaken Transmissions):** `transmit` panics if no valid epoch/capability exists.
* **T-I2 (Protocol Honesty):** `handshake` drops connections offering unsupported protocol shapes.
* **T-I3 (No External Authority Smuggling):** Remote output (`transmit` response) is never treated as local truth until `verify` and `settle`.
* **T-I4 (Durable Replay):** Every packet sent/received is hash-linked and deterministic for `telco-replay`.
* **T-I5 (Accounting Handoff):** `settle` must prove all T1-T5 conservations sum to zero unhandled packets.