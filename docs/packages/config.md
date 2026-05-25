# Package: @truex/config

> **Path:** `packages/config/`
> **Gall Classification:** S₀ - Operational Primitive

## 1. Product Thesis

The Config package is the **Provenance-Tracked Configuration System**. It manages the system settings and ontologies using strict Zod schemas and TOML parsing. Every configuration change is hashed and tracked, ensuring that the system's operational parameters themselves are part of the receipted consequence substrate.

## 2. Key Invariants

* **CFG-1 (Immutable Provenance):** Any mutation to the system configuration must generate a receipt proving the old vs new state.
* **CFG-2 (Schema Enforcement):** No configuration is admitted unless it perfectly matches the registered Zod schema.

## 3. Verbs / Commands

* `config.resolve(path)`: Retrieves a validated configuration value.
* `config.hash()`: Generates a BLAKE3 digest of the current active configuration.

## 4. Refusal Conditions

The Config system refuses a load if:
* The TOML file contains syntax errors.
* The configuration values violate the Zod schema constraints.
* The configuration provenance check detects an unauthorized or untracked change.

## 5. Proof Command

```bash
pnpm --filter @truex/config test
```