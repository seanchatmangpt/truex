# Checkpoint Registry

Registry Hash: ba1f36ddf100a26d41b9fce198ed492da81a1d38e206bc8531c028a55eafbf5e

| ID | Name | Domain | Proof Command | Accounting Domain |
|----|------|--------|---------------|-------------------|
| `cp-cli-contract` | Wizard CLI surface and verb contracts | CLI & Routing | `npx vitest run packages/membrane/test/project-wizard/project-wizard-cli.test.ts` | Domain W1 — Wizard Command |
| `cp-project-cell` | Project Cell layout and mapping | Cell & Topology | `npx vitest run packages/membrane/test/project-wizard/project-wizard-init-map.test.ts` | Domain W2 — Project Artifact |
| `cp-checkpoint-plan` | Gall Checkpoint Planner | Planner & Registry | `npx vitest run packages/membrane/test/project-wizard/project-wizard-plan.test.ts` | Domain W3 — Gall Checkpoint |
| `cp-execution-proof` | Forge, Bind, Prove, and Harden boundaries | Execution & Proof | `npx vitest run packages/membrane/test/project-wizard/project-wizard-execution.test.ts` | Domain W4 — Proof Command |
| `cp-mission-handoff` | 12H Mission Controllers and Handoff Gates | Enforcement & Handoff | `npx vitest run packages/membrane/test/project-wizard/project-wizard-handoff.test.ts` | Domain W5 — Mission Agent |