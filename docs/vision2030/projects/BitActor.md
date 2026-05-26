# Project: BitActor (Tier 1)

> **Gall Classification:** Tier 1 — Concurrency Geometry
> **Truex Role:** Lock-free Deterministic Actor Substrate

## 1. Product Thesis

BitActor provides the **Concurrency Substrate** for Truex. It implements a lock-free, zero-variance actor model where every agent, project cell, and operational module operates in an isolated, bit-native memory arena. It eliminates the risks of deadlocks and race conditions by enforcing that state transitions occur exclusively via asynchronous mailbox exchanges, which are then sequentially settled by the WASM kernel. It is the engine that allows Truex to manage thousands of parallel autonomic swarms with 100% deterministic convergence.

## 2. Key Invariants

* **BIT-1 (Mailbox Conservation):** No message is processed without being enqueued and receipted in the actor's mailbox.
* **BIT-2 (Isolation-by-Memory):** Actors are forbidden from sharing raw memory; all state sync must occur via receipted causal chains.

## 3. Verbs / Commands

* `bitactor.spawn(behavior)`: Initializes a new isolated memory arena.
* `bitactor.send(target, message)`: Appends a receipted intent to a target actor's mailbox.

## 4. Refusal Conditions

BitActor refuses a message if:
* The target actor's mailbox has exceeded its depth budget.
* The sending agent lacks the capability to interact with the target actor.

## 5. Implementation Path

Porting of the `vendors/ReactiveMessagingPatterns_ActorModel` patterns to Rust and integration with `truex-kernel`.