# Truex Master Connection Map (Vision 2030)

> **"Every bit-mutation is a vertical 7-tier event."**

This map provides the physical and logical links between every component in the Truex Post-Gall substrate. Use this as the primary navigation index for the ecosystem.

---

## 1. The Vertical Authority Chain (Top-to-Bottom)

| Tier | Layer Name | Physical Repository / Package | Status Report | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 6** | **Projection** | `BusinessOS`, `NAUT` | [Report](./project-status/BusinessOS.md) | Avatar-Relative Projections & Proving |
| **Tier 5** | **Manufacturing** | `GGEN`, `SOS`, `A2A` | [Report](./project-status/A2A.md) | Swarm Coordination & Simulation |
| **Tier 4** | **Execution** | `AntigravityCLI`, `ERLMCP` | [Report](./project-status/AntigravityCLI.md) | AI-to-Metal Interface & Routing |
| **Tier 3** | **Environment** | `UNRDF`, `UVMGR`, `CLNRM` | [Report](./project-status/UNRDF.md) | Ontological Law & Isolation |
| **Tier 2** | **Membrane** | `@truex/membrane`, `KNHK` | [Report](./project-status/membrane.md) | Interception, Logic & Hot-Path Memory |
| **Tier 1** | **Geometry** | `@truex/kernel`, `POWL v2` | [Report](./project-status/kernel.md) | Physics Engine & Workflow Adjudication |
| **Tier 0** | **Physics** | `BCINR`, `CNS`, `UNIBIT` | [Report](./project-status/CNS.md) | Bare-Metal Calculus & Causal Chains |

---

## 2. Horizontal Monorepo Connectivity (Packages)

Every physical package in `packages/` is now mapped to a functional role in the 7-Tier stack:

*   **Autonomics (T5):** [`@truex/agents`](./project-status/agents.md), [`@truex/swarm`](./project-status/swarm.md)
*   **Intelligence (T4/5):** [`@truex/ml`](./project-status/ml.md), [`@truex/planner`](./project-status/planner.md)
*   **Context & Logic (T2/3):** [`@truex/cognition`](./project-status/cognition.md), [`@truex/contracts`](./project-status/contracts.md), [`@truex/config`](./project-status/config.md)
*   **Enforcement (T1/2):** [`@truex/membrane`](./project-status/membrane.md), [`@truex/kernel`](./project-status/kernel.md)
*   **Persistence (T0):** [`@truex/supabase`](./project-status/supabase.md), [`@truex/testing`](./project-status/testing.md)

---

## 3. The "Connect" Logic: End-to-End Orchestration

The physical connection between these tiers is achieved through the **Autonomic Gall Loop** (`@truex/engine`):

1.  **Input:** [BusinessOS](./project-status/BusinessOS.md) (T6) proposes an intent.
2.  **Intercept:** [@truex/membrane](./project-status/membrane.md) (T2) traps the attempt.
3.  **Validate:** [Prolog8](./project-status/PROLOG8.md) (T2) checks declarative logic.
4.  **Adjudicate:** [@truex/kernel](./project-status/kernel.md) (T1) checks the [POWL-v2](./project-status/POWL-v2.md) geometry.
5.  **Execute:** [CNS](./project-status/CNS.md) (T0) fires the branchless transition.
6.  **Seal:** [UNIBIT](./project-status/UNIBIT.md) (T0) stamps the causal receipt.
7.  **Sync:** [BitStar](./project-status/BitStar.md) (T0) broadcasts to the consensus network.

---

## 4. Immediate Connection Commands

To verify the physical connection of any vertical slice, run:

```bash
# Verify the vertical path from Membrane to Kernel
npx tsx scripts/truex.ts doctor prove unified-integration

# Verify the distributed consensus connection
npx vitest packages/membrane/test/persistence/gossip-sync.test.ts

# Verify the Swarm coordination path
npx tsx scripts/truex.ts doctor prove ecosystem
```

**Truex is now a single, unbroken causal graph.**
