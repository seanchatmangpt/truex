# The Fractal Consequence Monorepo: Polyglot Namespace Strategy

> **Path:** `docs/vision2030/NAMESPACE-MONOREPO-STRATEGY.md`
> **Status:** Approved Strategy (Vision 2030)

## 1. Background & Motivation
The Truex ecosystem spans five distinct language environments, each handling a critical layer of the 7-Tier stack:
1. **Rust / WASM:** Sub-millisecond physics, causality, and geometry (`truex-kernel`, `truex-cns`, `truex-unibit`).
2. **TypeScript / JavaScript:** The execution boundary and membrane (`@truex/membrane`, `@truex/swarm`).
3. **Python:** Heavy analytical discovery and environment stabilization (`truex_uvmgr`, `truex_powl_miner`).
4. **Erlang / BEAM:** Massively concurrent swarm routing (`truex_erlmcp`).
5. **Turtle (.ttl) / Prolog:** Semantic ontologies and declarative laws (`truex-ontology`, `prolog8`).

Traditional monorepo tools are probabilistic—they guess what needs to be rebuilt based on file hashes. The Truex architecture demands an **autonomic, deterministic approach** where the repository itself is governed by the substrate.

---

## 2. Universal Naming Convention
To ensure absolute architectural cohesion, every component in the ecosystem will adopt a unified `truex` prefix, formatted according to the conventions of its native ecosystem:

| Ecosystem | Prefix / Namespace | Example |
| :--- | :--- | :--- |
| **Rust** | `truex-{component}` | `truex-kernel`, `truex-unibit` |
| **TypeScript** | `@truex/{component}` | `@truex/membrane`, `@truex/swarm` |
| **Python** | `truex_{component}` | `truex_uvmgr`, `truex_naut` |
| **Erlang** | `truex_{component}` | `truex_erlmcp` |
| **Ontology** | `urn:truex:ontology:{component}` | `urn:truex:ontology:wizard` |

---

## 3. Directory Structure: Language-Driven
To ensure zero friction with native tooling (Cargo, pnpm, uv, rebar3) and maintain clean IDE integration, the monorepo is organized by language ecosystem:

```text
truex-os/
├── crates/         # Rust (Kernel, Physics, Geometry)
├── packages/       # TypeScript/Node (Membrane, Swarm, CLI)
├── python/         # Python (ML Discovery, Environment stabilization)
├── erlang/         # Erlang/BEAM (High-concurrency routing)
└── ontologies/     # Semantic definitions (.ttl, .pl)
```

While this separates conceptual tiers into different folders, the **Truex Forge** ensures that architectural cohesion is mathematically enforced across these boundaries.

---

## 4. Autonomic Dependency Management (The Forge)
Instead of manually maintaining polyglot dependency graphs, the monorepo manages itself:

1. **Ontology as Root:** Cross-language dependencies (e.g., a TS membrane calling a Rust WASM kernel) are mathematically defined in the `.ttl` ontology.
2. **Generative Sync:** The `unrdf sync` command (driven by `ostar-operator`) acts as the compiler. It dynamically generates the `Cargo.toml`, `package.json`, and `pyproject.toml` files, ensuring that cross-language versions and interfaces are deterministically locked.
3. **Convergent CI/CD:** Pull requests are validated via the `SOS` (Synthetic Operations Simulator). The code is booted into an air-gapped simulation where the Erlang node routes messages, the TS membrane proxies them, and the Rust kernel adjudicates them. Only if the system reaches 100% BLAKE3 receipt parity is the code allowed to merge.

---

## 5. Verification
The "State of the Substrate" is verified by a cross-language `doctor prove ecosystem` command. 

Execution of this command must prove:
*   **Tier 0:** BCINR/CNS branchless bitmask parity.
*   **Tier 1:** POWL graph reachability in Rust.
*   **Tier 2:** Interceptor trap coverage in TypeScript.
*   **Tier 3:** Ontology-to-Code mapping consistency.
*   **Tier 4:** CLI-to-Metal command interception.

**Done is no longer a claim. It is a multi-language mathematical proof.**
