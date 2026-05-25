# Checkpoint Registry

Registry Hash: b1bbc0bf3841ca41f273ae97dfeda3295c07e6457830c7aa59b9026ba2004f3b

| ID | Name | Domain | Proof Command | Accounting Domain |
|----|------|--------|---------------|-------------------|
| `cp-cli-contract` | Wizard CLI surface and verb contracts | CLI & Routing | `npx vitest run packages/membrane/test/project-wizard/project-wizard-cli.test.ts` | Domain W1 — Wizard Command |
| `cp-project-cell` | Project Cell layout and mapping | Cell & Topology | `npx vitest run packages/membrane/test/project-wizard/project-wizard-init-map.test.ts` | Domain W2 — Project Artifact |
| `cp-checkpoint-plan` | Gall Checkpoint Planner | Planner & Registry | `npx vitest run packages/membrane/test/project-wizard/project-wizard-plan.test.ts` | Domain W3 — Gall Checkpoint |
| `cp-execution-proof` | Forge, Bind, Prove, and Harden boundaries | Execution & Proof | `npx vitest run packages/membrane/test/project-wizard/project-wizard-execution.test.ts` | Domain W4 — Proof Command |
| `cp-mission-handoff` | 12H Mission Controllers and Handoff Gates | Enforcement & Handoff | `npx vitest run packages/membrane/test/project-wizard/project-wizard-handoff.test.ts` | Domain W5 — Mission Agent |