# Antigravity Artifact: Topology.graph

> **Generated:** 2026-05-25T18:57:23.645Z
> **Version:** 2.0.0

## Data Summary

```json
{
  "version": "2.0.0",
  "graphHash": "42dc26cf26ceeef5102286b86e85041565826eafaa418c8ff45ed969c8ad511f",
  "nodes": [
    {
      "id": "agents/swarm-auditor.ts",
      "type": "Agent",
      "layer": "AGY",
      "dependencies": [
        "skills/hash/mutations.ts",
        "skills/receipt/invariant.ts",
        "skills/membrane/mutations.ts",
        "skills/membrane/invariant.ts",
        "packages/membrane/src/runtime-law.ts",
        "skills/receipt/proofs.ts",
        "skills/membrane/proofs.ts"
      ],
      "provedBy": [
        "agents/swarm-auditor.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "scripts/after-tool-hook.ts",
      "type": "CLI",
      "layer": "Governance",
      "dependencies": [],
      "provedBy": [
        "scripts/after-tool-hook.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/decouple-hookbench.ts",
      "type": "CLI",
      "layer": "Governance",
      "dependencies": [],
      "provedBy": [
        "scripts/decouple-hookbench.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "scripts/fix-imports.ts",
      "type": "Unknown",
      "layer": "Unmapped",
      "dependencies": [],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/receipted-audit.ts",
      "type": "CLI",
      "layer": "Governance",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "skills/replay/mutations.ts",
        "skills/receipt/invariant.ts",
        "agents/swarm-auditor.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "scripts/receipted-audit.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/truex-agy-bridge.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/manufacturing/registry.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/index.ts",
        "packages/membrane/src/persistence/journal.ts",
        "packages/membrane/src/persistence/receipt-store.ts",
        "packages/membrane/src/persistence/ontology.ts"
      ],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "scripts/truex.ts",
      "type": "CLI",
      "layer": "Governance",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "skills/membrane/mutations.ts",
        "packages/membrane/src/plugins/otel-weaver.ts"
      ],
      "provedBy": [
        "scripts/truex.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "skills/architecture-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [],
      "provedBy": [
        "skills/architecture-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/repository-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/integration/skill-sandbox.ts",
        "packages/membrane/src/integration/task-delta.ts",
        "packages/membrane/src/persistence/ontology.ts",
        "scripts/observatory/lib/emit-topology-graph.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration-surface.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/unified-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/project-wizard.gall.ts",
        "skills/membrane/mutations.ts",
        "packages/membrane/src/telco.gall.ts"
      ],
      "provedBy": [
        "skills/unified-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/wasm-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/kernel-wasm/pkg/wasm4pm/index.ts",
        "packages/membrane/src/concurrency/wasm-worker-pool.ts",
        "packages/membrane/src/concurrency/truex-wasm-bridge.ts/index.ts"
      ],
      "provedBy": [
        "skills/wasm-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "test/concurrency.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/concurrency.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "test/concurrency.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/entropy.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "src/lib/entropy.ts",
        "agents/entropy/agent.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "test/entropy.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/index.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "test/index.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/tps.property.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/index.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "test/tps.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "agents/doctor/agent.ts",
      "type": "Agent",
      "layer": "AGY",
      "dependencies": [
        "packages/membrane/src/index.ts",
        "skills/unified-proof.ts",
        "skills/integration/unified-proof.ts",
        "skills/hash/proofs.ts",
        "skills/receipt/proofs.ts",
        "skills/replay/proofs.ts",
        "skills/membrane/proofs.ts",
        "skills/adapter/proofs.ts",
        "skills/hook/proofs.ts",
        "skills/repository-proof.ts",
        "skills/wizard/wizard-contracts-proof.ts",
        "skills/wizard/wizard-map-proof.ts",
        "skills/wizard/wizard-plan-proof.ts",
        "skills/architecture-proof.ts",
        "packages/membrane/src/benchmark/runner.ts",
        "packages/membrane/src/benchmark/hookbench.gall.ts",
        "packages/membrane/src/benchmark/stress-tests.ts",
        "packages/membrane/src/hook-otp.gall.ts",
        "packages/membrane/src/runtime-law.ts",
        "skills/topology/proofs.ts",
        "skills/membrane/membrane-replay-proof.ts",
        "agents/telco/agent.ts",
        "agents/wizard/agent.ts",
        "skills/membrane/mutations.ts",
        "skills/telco/telco-proof.ts",
        "skills/wizard/proofs.ts",
        "skills/mailbox/proofs.ts",
        "skills/finalization/proofs.ts",
        "skills/project-evidence/proofs.ts",
        "skills/wasm-proof.ts"
      ],
      "provedBy": [
        "packages/membrane/test/reactive-lifecycle.test.ts",
        "packages/membrane/test/unified-benchmarks.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-adversarial.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-fuzz.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-resource-leak.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-telemetry.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-timing.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-unified.test.ts",
        "packages/membrane/test/project-evidence/project-evidence-gapclose.integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "agents/entropy/agent.ts",
      "type": "Agent",
      "layer": "AGY",
      "dependencies": [
        "src/lib/entropy.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "test/entropy.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "agents/telco/agent.ts",
      "type": "Agent",
      "layer": "AGY",
      "dependencies": [
        "skills/membrane/mutations.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "skills/telco/proofs.ts",
        "skills/telco/telco-proof.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-adversarial.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-extreme-stress.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-fuzz.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-resource-leak.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-telemetry.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-unified.test.ts",
        "packages/membrane/test/integration/lifecycle-fuzz-recovery.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-fuzz.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-stress.test.ts",
        "packages/membrane/test/integration/telco-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-s8-facts.ts"
      ]
    },
    {
      "id": "agents/wizard/agent.ts",
      "type": "Agent",
      "layer": "AGY",
      "dependencies": [
        "skills/membrane/mutations.ts",
        "skills/membrane/invariant.ts"
      ],
      "provedBy": [
        "skills/wizard/proofs.ts",
        "skills/wizard/wizard-proof.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-fuzz.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-resource-leak.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-fuzz.test.ts",
        "packages/membrane/test/integration/wizard-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-s8-facts.ts"
      ]
    },
    {
      "id": "scripts/docs/verify-doctests.ts",
      "type": "CLI",
      "layer": "Governance",
      "dependencies": [],
      "provedBy": [
        "scripts/docs/verify-doctests.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/mission/project-12h-finalization.ts",
      "type": "Unknown",
      "layer": "Unmapped",
      "dependencies": [],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/index.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/registry.ts"
      ],
      "provedBy": [
        "scripts/observatory/index.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "skills/adapter/invariant.ts",
      "type": "Agent",
      "layer": "AGY",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/adapter/invariant.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "skills/adapter/mutations.ts",
      "type": "Agent",
      "layer": "AGY",
      "dependencies": [
        "skills/hash/mutations.ts",
        "skills/receipt/mutations.ts",
        "skills/adapter/invariant.ts",
        "skills/adapter/invariant.ts",
        "packages/membrane/src/context.ts",
        "skills/replay/mutations.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/adapter/proofs.ts",
        "packages/membrane/test/adapter.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "skills/adapter/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "skills/hash/mutations.ts",
        "skills/replay/mutations.ts",
        "skills/adapter/mutations.ts",
        "packages/membrane/src/runtime-law.ts",
        "skills/receipt/invariant.ts"
      ],
      "provedBy": [
        "skills/adapter/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "skills/finalization/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "skills/finalization/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/hash/invariant.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/hash/mutations.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [
        "skills/hash/invariant.ts"
      ],
      "provedBy": [
        "skills/adapter/proofs.ts",
        "skills/hash/proofs.ts",
        "skills/receipt/proofs.ts",
        "skills/replay/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/hash/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "skills/hash/mutations.ts"
      ],
      "provedBy": [
        "skills/hash/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/hook/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/index.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/hook/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/integration/unified-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "packages/membrane/test/unified-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "skills/mailbox/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/persistence/schema.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "skills/mailbox/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/membrane/invariant.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "skills/membrane/mutations.ts"
      ],
      "provedBy": [
        "skills/membrane/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/membrane/membrane-replay-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/membrane-replay.gall.ts"
      ],
      "provedBy": [
        "skills/membrane/membrane-replay-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/membrane/mutations.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "skills/hash/mutations.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "skills/unified-proof.ts",
        "skills/membrane/proofs.ts",
        "skills/telco/proofs.ts",
        "skills/telco/telco-proof.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-fuzz.test.ts",
        "packages/membrane/test/integration/lifecycle-fuzz-recovery.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-fuzz.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-stress.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/membrane/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "skills/membrane/mutations.ts",
        "skills/membrane/invariant.ts"
      ],
      "provedBy": [
        "skills/membrane/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/project-evidence/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/ocel2-project-projection.gall.ts",
        "packages/membrane/src/ocpq-project-constraints.gall.ts",
        "packages/membrane/src/powl-project-workflow.gall.ts",
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "skills/project-evidence/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/receipt/invariant.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/runtime-law.ts",
        "skills/hash/mutations.ts",
        "skills/receipt/mutations.ts"
      ],
      "provedBy": [
        "skills/adapter/proofs.ts",
        "skills/receipt/proofs.ts",
        "packages/membrane/test/adapter.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/receipt/mutations.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/runtime-law.ts",
        "skills/hash/mutations.ts"
      ],
      "provedBy": [
        "skills/receipt/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/receipt/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "skills/receipt/mutations.ts",
        "skills/receipt/invariant.ts",
        "packages/membrane/src/context.ts",
        "skills/hash/mutations.ts"
      ],
      "provedBy": [
        "skills/receipt/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/replay/invariant.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [
        "skills/hash/mutations.ts"
      ],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/replay/mutations.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "skills/hash/mutations.ts",
        "skills/receipt/mutations.ts",
        "skills/receipt/invariant.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/adapter/proofs.ts",
        "skills/replay/proofs.ts",
        "packages/membrane/test/adapter.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/replay/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "skills/hash/mutations.ts",
        "packages/membrane/src/context.ts",
        "skills/replay/mutations.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/replay/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/telco/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/telco/agent.ts",
        "skills/membrane/mutations.ts"
      ],
      "provedBy": [
        "skills/telco/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/telco/telco-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/telco/agent.ts",
        "skills/membrane/mutations.ts"
      ],
      "provedBy": [
        "skills/telco/telco-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/topology/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/topology.gall.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/index.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/topology/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/wizard/proofs.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "agents/wizard/agent.ts",
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "skills/wizard/proofs.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/wizard/wizard-contracts-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [],
      "provedBy": [
        "skills/wizard/wizard-contracts-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/wizard/wizard-map-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/wizard/verbs/init.ts",
        "packages/membrane/src/wizard/verbs/map.ts",
        "packages/membrane/src/wizard/project-cell.ts"
      ],
      "provedBy": [
        "skills/wizard/wizard-map-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/wizard/wizard-plan-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/wizard/verbs/init.ts",
        "packages/membrane/src/wizard/verbs/map.ts",
        "packages/membrane/src/wizard/verbs/plan.ts",
        "packages/membrane/src/wizard/project-cell.ts"
      ],
      "provedBy": [
        "skills/wizard/wizard-plan-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "skills/wizard/wizard-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/wizard/agent.ts",
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "skills/wizard/wizard-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "test/invariants/cap-inv-contract-virtual-breakpoint.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "src/proxy/create-proxy/index.ts",
        "src/invariants/invariant-context/index.ts",
        "src/virtualization/virtual-context/index.ts",
        "src/contracts/contract-context/index.ts",
        "src/transactions/transaction-context/index.ts",
        "src/simulation/simulation-context/index.ts"
      ],
      "provedBy": [
        "test/invariants/cap-inv-contract-virtual-breakpoint.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/invariants/runaway-recursion.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "src/proxy/create-proxy/index.ts",
        "src/invariants/invariant-context/index.ts",
        "src/virtualization/virtual-context/index.ts",
        "src/transactions/transaction-context/index.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "test/invariants/runaway-recursion.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/multitenancy/cap-tenant-audit-breakpoint.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "src/multitenancy/tenant-context/index.ts",
        "src/proxy/create-proxy/index.ts",
        "src/observability/audit-logger/index.ts"
      ],
      "provedBy": [
        "test/multitenancy/cap-tenant-audit-breakpoint.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/multitenancy/tenant-lifecycle.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "src/multitenancy/tenant-context/index.ts"
      ],
      "provedBy": [
        "test/multitenancy/tenant-lifecycle.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/observability/audit-bounds.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "src/proxy/create-proxy/index.ts",
        "src/observability/audit-logger/index.ts"
      ],
      "provedBy": [
        "test/observability/audit-bounds.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/sandbox/cap-sandbox-acl-breakpoint.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "src/proxy/create-proxy/index.ts",
        "src/sandbox/sandbox-context/index.ts",
        "src/security/capability-acl/index.ts"
      ],
      "provedBy": [
        "test/sandbox/cap-sandbox-acl-breakpoint.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/security/hardening.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "src/lib/gall-truex/receipt-proof.ts",
        "src/lib/gall-truex/signature-proof.ts",
        "src/lib/gall-truex/sqlite-proof.ts",
        "packages/membrane/src/integration/skill-sandbox.ts",
        "src/proxy/create-proxy/index.ts"
      ],
      "provedBy": [
        "test/security/hardening.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/transactions/cap-tx-replay-sim-breakpoint.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/membrane.ts",
        "packages/membrane/src/membrane-replay.gall.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/index.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "test/transactions/cap-tx-replay-sim-breakpoint.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/utils/helpers.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/utils/type.ts/index.ts",
        "packages/membrane/src/utils/object.ts/index.ts",
        "packages/membrane/src/utils/array.ts/index.ts",
        "packages/membrane/src/utils/string.ts/index.ts"
      ],
      "provedBy": [
        "test/utils/helpers.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/utils/logging.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/utils/proxy-log.ts/index.ts",
        "packages/membrane/src/utils/log-format.ts/index.ts",
        "packages/membrane/src/utils/error-log.ts/index.ts",
        "packages/membrane/src/utils/timing.ts/index.ts"
      ],
      "provedBy": [
        "test/utils/logging.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/utils/performance.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/utils/proxy-overhead.ts/index.ts",
        "packages/membrane/src/utils/timing.ts/index.ts",
        "packages/membrane/src/utils/memory.ts/index.ts"
      ],
      "provedBy": [
        "test/utils/performance.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "test/utils/variance.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/concurrency.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "test/concurrency.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/context.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "skills/adapter/proofs.ts",
        "skills/hook/proofs.ts",
        "skills/mailbox/proofs.ts",
        "skills/membrane/membrane-replay-proof.ts",
        "skills/receipt/proofs.ts",
        "skills/replay/proofs.ts",
        "skills/topology/proofs.ts",
        "skills/wizard/wizard-map-proof.ts",
        "skills/wizard/wizard-plan-proof.ts",
        "test/invariants/runaway-recursion.test.ts",
        "test/transactions/cap-tx-replay-sim-breakpoint.test.ts",
        "packages/membrane/test/adapter.test.ts",
        "packages/membrane/test/cascading-rollback.test.ts",
        "packages/membrane/test/doctor-diagnostics.test.ts",
        "packages/membrane/test/entropy-replay.test.ts",
        "packages/membrane/test/heijunka.test.ts",
        "packages/membrane/test/integration-surface.test.ts",
        "packages/membrane/test/primitives.test.ts",
        "packages/membrane/test/receipt.property.test.ts",
        "packages/membrane/test/report-receipt.test.ts",
        "packages/membrane/test/s3-integration.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-mailbox-breakpoint.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-replay-topology-breakpoint.test.ts",
        "packages/membrane/test/integration/closed-loop-convergence.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-fuzz.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-stress.test.ts",
        "packages/membrane/test/integration/swarm-controller.test.ts",
        "packages/membrane/test/manufacturing/line.test.ts",
        "packages/membrane/test/manufacturing/swarm-actuator.test.ts",
        "packages/membrane/test/membrane-replay/membrane-partial-order-vkg.test.ts",
        "packages/membrane/test/membrane-replay/membrane-reconstruction.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-graceful-shutdown-rescue.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-observatory.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-queue-isolation.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-replay-lineage.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-retry-backoff.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-state-machine.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-tamper.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-transactional-enqueue.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-unique-consequence.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-stress.test.ts",
        "packages/membrane/test/topology/topology-chain-replay.test.ts",
        "packages/membrane/test/topology/topology-partial-order-vkg.test.ts",
        "packages/membrane/test/topology/topology-rollback-storm.test.ts",
        "packages/membrane/test/topology/topology.test.ts",
        "packages/membrane/test/validation/conformance-fuzz.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/hash.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "skills/unified-proof.ts",
        "skills/integration/unified-proof.ts",
        "skills/mailbox/proofs.ts",
        "skills/membrane/membrane-replay-proof.ts",
        "skills/project-evidence/proofs.ts",
        "skills/wizard/proofs.ts",
        "test/transactions/cap-tx-replay-sim-breakpoint.test.ts",
        "packages/membrane/test/adapter.test.ts",
        "packages/membrane/test/benchmark-entropy.test.ts",
        "packages/membrane/test/doctor-diagnostics.test.ts",
        "packages/membrane/test/entropy-replay.test.ts",
        "packages/membrane/test/primitives.test.ts",
        "packages/membrane/test/replay.property.test.ts",
        "packages/membrane/test/unified-lifecycle.test.ts",
        "packages/membrane/test/integration/closed-loop-convergence.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-concurrent.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-telemetry.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-unified.test.ts",
        "packages/membrane/test/integration/lifecycle-concurrency.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-e2e.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-leak.test.ts",
        "packages/membrane/test/membrane-replay/membrane-crash-rollback.test.ts",
        "packages/membrane/test/membrane-replay/membrane-partial-order-vkg.test.ts",
        "packages/membrane/test/membrane-replay/membrane-reconstruction.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-replay-lineage.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-retry-backoff.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-tamper.test.ts",
        "packages/membrane/test/project-evidence/project-evidence-types.integration.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-benchmark.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-stress.test.ts",
        "packages/membrane/test/topology/topology-chain-replay.test.ts",
        "packages/membrane/test/topology/topology-partial-order-vkg.test.ts",
        "packages/membrane/test/validation/conformance-fuzz.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/hook-otp.gall.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-otp/hook-otp-mailbox-breakpoint.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-mailbox.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-nonmockable-stress.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-receipt-replay.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-replay-topology-breakpoint.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-runtime.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-supervisor-breakpoint.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-supervisor.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-fuzz.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/hook.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/index.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "test/concurrency.test.ts",
        "skills/hook/proofs.ts",
        "packages/membrane/test/cascading-rollback.test.ts",
        "packages/membrane/test/benchmark/generator.test.ts",
        "packages/membrane/test/benchmark/million-hook-church.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-replay-topology-breakpoint.test.ts",
        "packages/membrane/test/integration/closed-loop-convergence.test.ts",
        "packages/membrane/test/manufacturing/lean.test.ts",
        "packages/membrane/test/manufacturing/line.test.ts",
        "packages/membrane/test/topology/topology-chain-replay.test.ts",
        "packages/membrane/test/topology/topology-partial-order-vkg.test.ts",
        "packages/membrane/test/topology/topology-rollback-storm.test.ts",
        "packages/membrane/test/topology/topology.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/index.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "skills/repository-proof.ts",
        "test/concurrency.test.ts",
        "test/entropy.test.ts",
        "test/index.test.ts",
        "test/tps.property.test.ts",
        "skills/hook/proofs.ts",
        "skills/topology/proofs.ts",
        "test/transactions/cap-tx-replay-sim-breakpoint.test.ts",
        "packages/membrane/test/s3-integration.test.ts",
        "packages/membrane/test/benchmark/million-hook-church.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-mailbox-breakpoint.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-nonmockable-stress.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-receipt-replay.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-replay-topology-breakpoint.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-supervisor-breakpoint.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-extreme-stress.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-telemetry.test.ts",
        "packages/membrane/test/membrane-replay/membrane-reconstruction.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/membrane-replay.gall.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "skills/membrane/membrane-replay-proof.ts",
        "test/transactions/cap-tx-replay-sim-breakpoint.test.ts",
        "packages/membrane/test/membrane-replay/membrane-crash-rollback.test.ts",
        "packages/membrane/test/membrane-replay/membrane-partial-order-vkg.test.ts",
        "packages/membrane/test/membrane-replay/membrane-reconstruction.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/membrane.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "test/transactions/cap-tx-replay-sim-breakpoint.test.ts",
        "packages/membrane/test/membrane.test.ts",
        "packages/membrane/test/persistence/membrane-link.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/ocel2-project-projection.gall.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "skills/project-evidence/proofs.ts",
        "packages/membrane/test/project-evidence/ocel2-project-projection.test.ts",
        "packages/membrane/test/project-evidence/ocel2-projection-gap.test.ts",
        "packages/membrane/test/project-evidence/project-evidence-types.integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/ocel2-project-types.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "skills/project-evidence/proofs.ts",
        "packages/membrane/test/project-evidence/ocel2-project-projection.test.ts",
        "packages/membrane/test/project-evidence/ocel2-project-types.test.ts",
        "packages/membrane/test/project-evidence/ocel2-projection-gap.test.ts",
        "packages/membrane/test/project-evidence/ocel2-type-boundary-gap.test.ts",
        "packages/membrane/test/project-evidence/ocpq-constraint-gap.test.ts",
        "packages/membrane/test/project-evidence/ocpq-project-constraints.test.ts",
        "packages/membrane/test/project-evidence/project-evidence-types.integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/ocpq-project-constraints.gall.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "skills/project-evidence/proofs.ts",
        "packages/membrane/test/project-evidence/ocpq-constraint-gap.test.ts",
        "packages/membrane/test/project-evidence/ocpq-project-constraints.test.ts",
        "packages/membrane/test/project-evidence/project-evidence-types.integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistent-mailbox.gall.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "skills/mailbox/proofs.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-graceful-shutdown-rescue.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-observatory.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-queue-isolation.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-replay-lineage.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-retry-backoff.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-state-machine.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-tamper.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-transactional-enqueue.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-unique-consequence.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-stress.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/powl-project-workflow.gall.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "skills/project-evidence/proofs.ts",
        "packages/membrane/test/powl-fuzz.test.ts",
        "packages/membrane/test/project-evidence/powl-project-workflow.test.ts",
        "packages/membrane/test/project-evidence/project-evidence-gapclose.integration.test.ts",
        "packages/membrane/test/project-evidence/project-evidence-types.integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/project-wizard.gall.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/unified-proof.ts",
        "skills/finalization/proofs.ts",
        "skills/integration/unified-proof.ts",
        "skills/wizard/proofs.ts",
        "skills/wizard/wizard-proof.ts",
        "packages/membrane/test/unified-lifecycle.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-adversarial.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-concurrent.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-fuzz.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-unified.test.ts",
        "packages/membrane/test/integration/lifecycle-concurrency.test.ts",
        "packages/membrane/test/integration/lifecycle-e2e-path.test.ts",
        "packages/membrane/test/integration/lifecycle-fuzz-recovery.test.ts",
        "packages/membrane/test/integration/lifecycle-leak-bench.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-e2e.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-fuzz.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-leak.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-stress.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-benchmark.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-bind.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-cli.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-execution.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-functional.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-handoff.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-init-map.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-plan.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-stress.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-validation.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/receipt.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "skills/membrane/membrane-replay-proof.ts",
        "test/invariants/runaway-recursion.test.ts",
        "packages/membrane/test/doctor-diagnostics.test.ts",
        "packages/membrane/test/receipt.property.test.ts",
        "packages/membrane/test/report-receipt.test.ts",
        "packages/membrane/test/integration/autonomic-loop.test.ts",
        "packages/membrane/test/integration/closed-loop-convergence.test.ts",
        "packages/membrane/test/membrane-replay/membrane-partial-order-vkg.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-replay-lineage.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-tamper.test.ts",
        "packages/membrane/test/topology/topology-chain-replay.test.ts",
        "packages/membrane/test/validation/conformance-fuzz.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/replay.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/doctor-diagnostics.test.ts",
        "packages/membrane/test/primitives.test.ts",
        "packages/membrane/test/replay.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/runtime-law.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "test/concurrency.test.ts",
        "test/tps.property.test.ts",
        "skills/adapter/proofs.ts",
        "skills/hook/proofs.ts",
        "skills/mailbox/proofs.ts",
        "skills/project-evidence/proofs.ts",
        "skills/replay/proofs.ts",
        "skills/topology/proofs.ts",
        "packages/membrane/test/adapter.test.ts",
        "packages/membrane/test/doctor-diagnostics.test.ts",
        "packages/membrane/test/hook-interceptor.test.ts",
        "packages/membrane/test/integration-surface.test.ts",
        "packages/membrane/test/kaizen.test.ts",
        "packages/membrane/test/primitives.test.ts",
        "packages/membrane/test/s3-integration.test.ts",
        "packages/membrane/test/hook-otp/hook-otp-replay-topology-breakpoint.test.ts",
        "packages/membrane/test/integration/autonomic-loop.test.ts",
        "packages/membrane/test/integration/closed-loop-convergence.test.ts",
        "packages/membrane/test/integration/consequence-actuator.test.ts",
        "packages/membrane/test/integration/env-actuator.test.ts",
        "packages/membrane/test/integration/task-delta.test.ts",
        "packages/membrane/test/manufacturing/line.test.ts",
        "packages/membrane/test/manufacturing/visual.test.ts",
        "packages/membrane/test/persistence/journal.test.ts",
        "packages/membrane/test/project-evidence/project-evidence-gapclose.integration.test.ts",
        "packages/membrane/test/project-evidence/project-evidence-types.integration.test.ts",
        "packages/membrane/test/topology/topology-chain-replay.test.ts",
        "packages/membrane/test/topology/topology-partial-order-vkg.test.ts",
        "packages/membrane/test/topology/topology-rollback-storm.test.ts",
        "packages/membrane/test/topology/topology.gall.test.ts",
        "packages/membrane/test/topology/topology.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/signature.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/primitives.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/telco.gall.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "skills/unified-proof.ts",
        "packages/membrane/test/unified-lifecycle.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-adversarial.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-telemetry.test.ts",
        "packages/membrane/test/integration/doctor-wizard-telco-unified.test.ts",
        "packages/membrane/test/integration/lifecycle-concurrency.test.ts",
        "packages/membrane/test/integration/lifecycle-e2e-path.test.ts",
        "packages/membrane/test/integration/lifecycle-leak-bench.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-e2e.test.ts",
        "packages/membrane/test/telco/telco.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/topology.gall.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "skills/topology/proofs.ts",
        "packages/membrane/test/topology/topology.gall.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/adapter.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hash.ts",
        "skills/replay/mutations.ts",
        "skills/adapter/mutations.ts",
        "packages/membrane/src/runtime-law.ts",
        "skills/receipt/invariant.ts"
      ],
      "provedBy": [
        "packages/membrane/test/adapter.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/benchmark-entropy.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/benchmark/million-hook-church.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "packages/membrane/test/benchmark-entropy.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/cascading-rollback.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/persistence/transactions.ts",
        "packages/membrane/src/manufacturing/jidoka.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/persistence/schema.ts"
      ],
      "provedBy": [
        "packages/membrane/test/cascading-rollback.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/doctor-diagnostics.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/replay.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/doctor-diagnostics.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/entropy-replay.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/lib/entropy.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "packages/membrane/test/entropy-replay.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/heijunka.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/manufacturing/heijunka.ts",
        "packages/membrane/src/manufacturing/jit.ts",
        "packages/membrane/test/utils/arbitraries.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "packages/membrane/test/heijunka.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/hook-interceptor.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/integration/hook-interceptor.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-interceptor.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration-surface.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/integration/task-delta.ts",
        "packages/membrane/src/integration/report-receipt.ts",
        "packages/membrane/src/integration/hook-interceptor.ts",
        "packages/membrane/src/integration/trajectory-replay.ts",
        "packages/membrane/src/integration/skill-sandbox.ts",
        "skills/repository-proof.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration-surface.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/jit.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/manufacturing/jit.ts",
        "packages/membrane/test/utils/arbitraries.ts"
      ],
      "provedBy": [
        "packages/membrane/test/jit.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/kaizen.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/manufacturing/kaizen.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/kaizen.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/logic-engine-integration.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/lib/logic-engine.ts",
        "src/proxy/create-proxy/index.ts",
        "src/security/capability-acl/index.ts"
      ],
      "provedBy": [
        "packages/membrane/test/logic-engine-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/manufacturing.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/manufacturing/standardization.ts",
        "packages/membrane/test/utils/arbitraries.ts"
      ],
      "provedBy": [
        "packages/membrane/test/manufacturing.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/membrane.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/membrane.ts"
      ],
      "provedBy": [
        "packages/membrane/test/membrane.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/ontology-genesis.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "scripts/truex-agy-bridge.ts",
        "skills/hash/invariant.ts",
        "skills/replay/invariant.ts",
        "packages/membrane/src/manufacturing/collaboration.ts",
        "packages/membrane/src/manufacturing/gemba.ts",
        "packages/membrane/src/manufacturing/registry.ts",
        "packages/membrane/src/persistence/audit-engine.ts",
        "packages/membrane/src/persistence/replay.ts",
        "packages/membrane/src/utils/array.ts",
        "packages/membrane/src/utils/error-log.ts",
        "packages/membrane/src/utils/log-format.ts",
        "packages/membrane/src/utils/memory.ts",
        "packages/membrane/src/utils/object.ts",
        "packages/membrane/src/utils/proxy-log.ts",
        "packages/membrane/src/utils/proxy-overhead.ts",
        "packages/membrane/src/utils/string.ts",
        "packages/membrane/src/utils/timing.ts",
        "packages/membrane/src/utils/type.ts"
      ],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistence.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/persistence/schema.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistence.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/powl-fuzz.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/powl-project-workflow.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/powl-fuzz.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/primitives.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/signature.ts",
        "packages/membrane/src/replay.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/primitives.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/reactive-lifecycle.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/doctor/agent.ts"
      ],
      "provedBy": [
        "packages/membrane/test/reactive-lifecycle.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/receipt.property.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/receipt.ts"
      ],
      "provedBy": [
        "packages/membrane/test/receipt.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/replay.property.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/replay.ts"
      ],
      "provedBy": [
        "packages/membrane/test/replay.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/report-receipt.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/integration/report-receipt.ts"
      ],
      "provedBy": [
        "packages/membrane/test/report-receipt.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/s3-integration.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/index.ts",
        "packages/membrane/src/persistence/index.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/s3-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/skill-sandbox.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/integration/skill-sandbox.ts"
      ],
      "provedBy": [
        "packages/membrane/test/skill-sandbox.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/unified-benchmarks.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/doctor/agent.ts"
      ],
      "provedBy": [
        "packages/membrane/test/unified-benchmarks.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/unified-integration.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "skills/integration/unified-proof.ts"
      ],
      "provedBy": [
        "packages/membrane/test/unified-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/unified-lifecycle.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/telco.gall.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "packages/membrane/test/unified-lifecycle.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/diagnostics.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/diagnostics.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/docs-link.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/docs-link.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-agy-facts.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-artifacts.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [],
      "provedBy": [
        "scripts/observatory/lib/emit-artifacts.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-benchmark-diagram.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-benchmark-diagram.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-benchmark-facts.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-c4-diagrams.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [],
      "provedBy": [
        "scripts/observatory/lib/emit-c4-diagrams.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-core-facts.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-governance-actuator.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-governance-actuator.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-manufacturing-facts.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "packages/membrane/src/manufacturing/registry.ts",
        "packages/membrane/src/manufacturing/standardization.ts",
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-membrane-replay-diagram.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-membrane-replay-diagram.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-membrane-replay-facts.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-membrane-replay-facts.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-otp-breakpoints.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-otp-breakpoints.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-persistence-diagram.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-persistence-diagram.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-persistence-facts.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-project-evidence-gapclose-facts.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-project-evidence-gapclose-facts.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-receipt.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts",
        "packages/membrane/src/signature.ts",
        "skills/hash/mutations.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-receipt.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-refinement-rules.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts",
        "scripts/observatory/lib/emit-core-facts.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-refinement-rules.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-refusal-analysis.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-refusal-analysis.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-s8-diagram.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-s8-diagram.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-s8-facts.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-s8-facts.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-topology-diagram.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-topology-diagram.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-topology-facts.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-topology-facts.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-topology-graph.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [],
      "provedBy": [
        "skills/repository-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/emit-wal-reconstruction-visualization.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/emit-wal-reconstruction-visualization.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/fact-emitter.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [],
      "provedBy": [
        "scripts/observatory/lib/fact-emitter.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "scripts/observatory/lib/registry.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/emit-c4-diagrams.ts",
        "scripts/observatory/lib/emit-topology-graph.ts",
        "scripts/observatory/lib/emit-core-facts.ts",
        "scripts/observatory/lib/emit-agy-facts.ts",
        "scripts/observatory/lib/emit-manufacturing-facts.ts",
        "scripts/observatory/lib/emit-persistence-facts.ts",
        "scripts/observatory/lib/emit-benchmark-facts.ts",
        "scripts/observatory/lib/emit-refinement-rules.ts",
        "scripts/observatory/lib/emit-persistence-diagram.ts",
        "scripts/observatory/lib/emit-topology-diagram.ts",
        "scripts/observatory/lib/emit-topology-facts.ts",
        "scripts/observatory/lib/emit-benchmark-diagram.ts",
        "scripts/observatory/lib/emit-receipt.ts",
        "scripts/observatory/lib/diagnostics.ts",
        "scripts/observatory/lib/emit-refusal-analysis.ts",
        "scripts/observatory/lib/docs-link.ts",
        "scripts/observatory/lib/emit-governance-actuator.ts",
        "scripts/observatory/lib/emit-artifacts.ts",
        "scripts/observatory/lib/emit-membrane-replay-facts.ts",
        "scripts/observatory/lib/emit-membrane-replay-diagram.ts",
        "scripts/observatory/lib/emit-wal-reconstruction-visualization.ts",
        "scripts/observatory/lib/emit-s8-facts.ts",
        "scripts/observatory/lib/emit-s8-diagram.ts",
        "scripts/observatory/lib/emit-project-evidence-gapclose-facts.ts",
        "scripts/observatory/lib/emit-otp-breakpoints.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/registry.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/benchmark/hookbench.gall.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/index.ts",
        "packages/membrane/src/manufacturing/jidoka.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/persistence/journal.ts",
        "packages/membrane/src/persistence/schema.ts"
      ],
      "provedBy": [
        "packages/membrane/test/benchmark/hookbench.gall.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/benchmark/million-hook-church.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "packages/membrane/test/benchmark-entropy.test.ts",
        "packages/membrane/test/benchmark/generator.test.ts",
        "packages/membrane/test/benchmark/million-hook-church.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/benchmark/runner.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/benchmark/hookbench.gall.ts"
      ],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/benchmark/stress-tests.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/manufacturing/jidoka.ts"
      ],
      "provedBy": [
        "packages/membrane/test/benchmark/million-hook-church.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/concurrency/truex-wasm-bridge.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/persistence/lock.ts",
        "packages/membrane/src/persistence/receipt-store.ts",
        "packages/membrane/src/concurrency/wasm-worker-pool.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/concurrency/wasm-worker-pool.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "skills/wasm-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/concurrency/wasm-worker.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/kernel-wasm/pkg/wasm4pm/index.ts"
      ],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/integration/autonomic-loop.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/persistence/journal.ts",
        "packages/membrane/src/persistence/receipt-store.ts",
        "packages/membrane/src/index.ts",
        "packages/membrane/src/integration/hook-interceptor.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/autonomic-loop.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/integration/consequence-actuator.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/consequence-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/integration/env-actuator.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/env-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/integration/hook-interceptor.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-interceptor.test.ts",
        "packages/membrane/test/integration-surface.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/integration/report-receipt.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration-surface.test.ts",
        "packages/membrane/test/report-receipt.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/integration/skill-sandbox.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "skills/repository-proof.ts",
        "test/security/hardening.test.ts",
        "packages/membrane/test/integration-surface.test.ts",
        "packages/membrane/test/skill-sandbox.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/integration/swarm-controller.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/swarm-controller.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/integration/task-delta.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/repository-proof.ts",
        "packages/membrane/test/integration-surface.test.ts",
        "packages/membrane/test/integration/task-delta.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/integration/trajectory-replay.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/integration-surface.test.ts",
        "packages/membrane/test/integration/trajectory-replay.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/lib/entropy.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "packages/membrane/test/entropy-replay.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/lib/logic-engine.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/logic-engine-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/collaboration.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/receipt.ts"
      ],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/gemba.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/runtime-law.ts",
        "src/ocel2/index/index.ts"
      ],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/heijunka.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/manufacturing/jit.ts"
      ],
      "provedBy": [
        "packages/membrane/test/heijunka.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/jidoka.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/manufacturing/standardization.ts"
      ],
      "provedBy": [
        "packages/membrane/test/cascading-rollback.test.ts",
        "packages/membrane/test/benchmark/million-hook-church.test.ts",
        "packages/membrane/test/integration/closed-loop-convergence.test.ts",
        "packages/membrane/test/validation/conformance-fuzz.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/jit.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/hook.ts"
      ],
      "provedBy": [
        "packages/membrane/test/heijunka.test.ts",
        "packages/membrane/test/jit.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/kaizen.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/kaizen.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/lean.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/hook.ts"
      ],
      "provedBy": [
        "packages/membrane/test/manufacturing/lean.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/line.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/manufacturing/jit.ts",
        "packages/membrane/src/manufacturing/jidoka.ts",
        "packages/membrane/src/manufacturing/heijunka.ts",
        "packages/membrane/src/manufacturing/kaizen.ts",
        "packages/membrane/src/manufacturing/topology.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/hook.ts"
      ],
      "provedBy": [
        "packages/membrane/test/s3-integration.test.ts",
        "packages/membrane/test/manufacturing/line.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/registry.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/manufacturing/line.ts",
        "packages/membrane/src/manufacturing/jit.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/remediator.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/standardization.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/manufacturing.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/swarm-actuator.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/manufacturing/visual.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/manufacturing/swarm-receipt.ts",
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "packages/membrane/test/manufacturing/swarm-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/swarm-receipt.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/topology.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-otp/hook-otp-replay-topology-breakpoint.test.ts",
        "packages/membrane/test/topology/topology-chain-replay.test.ts",
        "packages/membrane/test/topology/topology-rollback-storm.test.ts",
        "packages/membrane/test/topology/topology.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/manufacturing/visual.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/manufacturing/swarm-actuator.test.ts",
        "packages/membrane/test/manufacturing/visual.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/audit-engine.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/persistence/receipt-store.ts"
      ],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/gossip-sync.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/s3-integration.test.ts",
        "packages/membrane/test/persistence/gossip-sync.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/index.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/persistence/journal.ts",
        "packages/membrane/src/persistence/receipt-store.ts",
        "packages/membrane/src/persistence/snapshot.ts",
        "packages/membrane/src/persistence/gossip-sync.ts",
        "packages/membrane/src/manufacturing/line.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "packages/membrane/test/s3-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/journal.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/s3-integration.test.ts",
        "packages/membrane/test/persistence/journal.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/lock.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/integration/lifecycle-concurrency.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-stress.test.ts",
        "packages/membrane/test/persistence/lock.test.ts",
        "packages/membrane/test/project-wizard/project-wizard-stress.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/membrane-link.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/membrane.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistence/membrane-link.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/ontology.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [],
      "provedBy": [
        "skills/repository-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/receipt-store.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/persistence/gossip-sync.ts"
      ],
      "provedBy": [
        "packages/membrane/test/s3-integration.test.ts",
        "packages/membrane/test/persistence/gossip-sync.test.ts",
        "packages/membrane/test/validation/conformance-fuzz.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/replay.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/persistence/journal.ts",
        "packages/membrane/src/persistence/receipt-store.ts",
        "packages/membrane/src/persistence/snapshot.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/receipt.ts"
      ],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/schema.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [],
      "provedBy": [
        "skills/mailbox/proofs.ts",
        "packages/membrane/test/cascading-rollback.test.ts",
        "packages/membrane/test/persistence.test.ts",
        "packages/membrane/test/persistence/journal.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-state-machine.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-transactional-enqueue.test.ts",
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-unique-consequence.test.ts",
        "packages/membrane/test/topology/topology-rollback-storm.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/snapshot.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "packages/membrane/test/s3-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/persistence/transactions.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/membrane.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/cascading-rollback.test.ts",
        "packages/membrane/test/topology/topology-rollback-storm.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/src/plugins/otel-weaver.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/array.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/error-log.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/log-format.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/memory.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/object.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/proxy-log.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/utils/log-format.ts"
      ],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/proxy-overhead.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/membrane.ts"
      ],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/reactive-patterns.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/integration/reactive-lifecycle-e2e.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-fuzz.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-leak.test.ts",
        "packages/membrane/test/integration/reactive-lifecycle-stress.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/string.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/timing.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/type.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/utils/wasm-resource.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/validation/jidoka-controller.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/membrane/src/persistence/receipt-store.ts",
        "packages/membrane/src/manufacturing/jidoka.ts"
      ],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/wizard/project-cell.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "skills/wizard/wizard-map-proof.ts",
        "skills/wizard/wizard-plan-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/wizard/project-receipts.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/wizard/project-route.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/wizard/project-cell.ts"
      ],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/benchmark/generator.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/benchmark/million-hook-church.ts",
        "packages/membrane/src/hook.ts"
      ],
      "provedBy": [
        "packages/membrane/test/benchmark/generator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/benchmark/hookbench.gall.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/benchmark/hookbench.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/benchmark/hookbench.gall.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/benchmark/million-hook-church.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/benchmark/million-hook-church.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/index.ts",
        "packages/membrane/src/manufacturing/jidoka.ts",
        "packages/membrane/src/benchmark/stress-tests.ts"
      ],
      "provedBy": [
        "packages/membrane/test/benchmark/million-hook-church.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/hook-otp/hook-otp-mailbox-breakpoint.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hook-otp.gall.ts",
        "packages/membrane/src/index.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-otp/hook-otp-mailbox-breakpoint.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/hook-otp/hook-otp-mailbox.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hook-otp.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-otp/hook-otp-mailbox.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/hook-otp/hook-otp-nonmockable-stress.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hook-otp.gall.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-otp/hook-otp-nonmockable-stress.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/hook-otp/hook-otp-receipt-replay.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hook-otp.gall.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-otp/hook-otp-receipt-replay.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/hook-otp/hook-otp-replay-topology-breakpoint.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hook-otp.gall.ts",
        "packages/membrane/src/manufacturing/topology.ts",
        "packages/membrane/src/manufacturing/topology.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/index.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-otp/hook-otp-replay-topology-breakpoint.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/hook-otp/hook-otp-runtime.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hook-otp.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-otp/hook-otp-runtime.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/hook-otp/hook-otp-supervisor-breakpoint.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hook-otp.gall.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-otp/hook-otp-supervisor-breakpoint.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/hook-otp/hook-otp-supervisor.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hook-otp.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/hook-otp/hook-otp-supervisor.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/autonomic-loop.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/integration/autonomic-loop.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/receipt.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/autonomic-loop.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/closed-loop-convergence.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/manufacturing/jidoka.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/closed-loop-convergence.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/consequence-actuator.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/integration/consequence-actuator.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/consequence-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/doctor-wizard-telco-adversarial.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "agents/telco/agent.ts",
        "agents/doctor/agent.ts",
        "packages/membrane/src/telco.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/doctor-wizard-telco-adversarial.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/doctor-wizard-telco-concurrent.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/doctor-wizard-telco-concurrent.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/doctor-wizard-telco-extreme-stress.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/index.ts",
        "agents/telco/agent.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/doctor-wizard-telco-extreme-stress.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/doctor-wizard-telco-fuzz.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/wizard/agent.ts",
        "agents/telco/agent.ts",
        "agents/doctor/agent.ts",
        "packages/membrane/src/project-wizard.gall.ts",
        "skills/membrane/mutations.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/doctor-wizard-telco-fuzz.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/doctor-wizard-telco-resource-leak.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/wizard/agent.ts",
        "agents/telco/agent.ts",
        "agents/doctor/agent.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/doctor-wizard-telco-resource-leak.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/doctor-wizard-telco-telemetry.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/index.ts",
        "agents/telco/agent.ts",
        "agents/doctor/agent.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/telco.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/doctor-wizard-telco-telemetry.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/doctor-wizard-telco-timing.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/doctor/agent.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/doctor-wizard-telco-timing.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/doctor-wizard-telco-unified.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "agents/telco/agent.ts",
        "agents/doctor/agent.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/telco.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/doctor-wizard-telco-unified.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/env-actuator.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/integration/env-actuator.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/env-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/lifecycle-concurrency.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/persistence/lock.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/telco.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/lifecycle-concurrency.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/lifecycle-e2e-path.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/telco.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/lifecycle-e2e-path.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/lifecycle-fuzz-recovery.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/project-wizard.gall.ts",
        "agents/telco/agent.ts",
        "skills/membrane/mutations.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/lifecycle-fuzz-recovery.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/lifecycle-leak-bench.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/telco.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/lifecycle-leak-bench.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/reactive-lifecycle-e2e.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/utils/reactive-patterns.ts",
        "packages/membrane/src/telco.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/reactive-lifecycle-e2e.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/reactive-lifecycle-fuzz.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/telco/agent.ts",
        "agents/wizard/agent.ts",
        "packages/membrane/src/hook-otp.gall.ts",
        "skills/membrane/mutations.ts",
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/utils/reactive-patterns.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/reactive-lifecycle-fuzz.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/reactive-lifecycle-leak.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/utils/reactive-patterns.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/reactive-lifecycle-leak.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/reactive-lifecycle-stress.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/persistence/lock.ts",
        "packages/membrane/src/context.ts",
        "agents/telco/agent.ts",
        "skills/membrane/mutations.ts",
        "packages/membrane/src/utils/reactive-patterns.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/reactive-lifecycle-stress.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/swarm-controller.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/integration/swarm-controller.ts",
        "packages/membrane/src/context.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/swarm-controller.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/task-delta.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/integration/task-delta.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/task-delta.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/telco-integration.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/telco/agent.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/telco-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/trajectory-replay.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/integration/trajectory-replay.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/trajectory-replay.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/integration/wizard-integration.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/wizard/agent.ts"
      ],
      "provedBy": [
        "packages/membrane/test/integration/wizard-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/manufacturing/lean.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/manufacturing/lean.ts",
        "packages/membrane/src/hook.ts"
      ],
      "provedBy": [
        "packages/membrane/test/manufacturing/lean.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/manufacturing/line.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/manufacturing/line.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/hook.ts"
      ],
      "provedBy": [
        "packages/membrane/test/manufacturing/line.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/manufacturing/swarm-actuator.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/manufacturing/swarm-actuator.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/manufacturing/visual.ts"
      ],
      "provedBy": [
        "packages/membrane/test/manufacturing/swarm-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/manufacturing/visual.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/manufacturing/visual.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/manufacturing/visual.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/membrane-replay/membrane-crash-rollback.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/membrane-replay.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/membrane-replay/membrane-crash-rollback.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/membrane-replay/membrane-partial-order-vkg.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/membrane-replay.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/membrane-replay/membrane-partial-order-vkg.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/membrane-replay/membrane-reconstruction.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/membrane-replay.gall.ts",
        "packages/membrane/src/index.ts"
      ],
      "provedBy": [
        "packages/membrane/test/membrane-replay/membrane-reconstruction.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistence/gossip-sync.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/persistence/receipt-store.ts",
        "packages/membrane/src/persistence/gossip-sync.ts",
        "skills/receipt/mutations.ts/index.ts",
        "packages/membrane/src/context.ts/index.ts",
        "packages/membrane/src/persistence/schema.ts/index.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistence/gossip-sync.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistence/journal.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/persistence/journal.ts",
        "packages/membrane/src/persistence/schema.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistence/journal.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistence/lock.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/persistence/lock.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistence/lock.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistence/membrane-link.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/membrane.ts",
        "packages/membrane/src/persistence/membrane-link.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistence/membrane-link.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistent-mailbox/persistent-mailbox-graceful-shutdown-rescue.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-graceful-shutdown-rescue.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistent-mailbox/persistent-mailbox-observatory.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-observatory.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistent-mailbox/persistent-mailbox-queue-isolation.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-queue-isolation.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistent-mailbox/persistent-mailbox-replay-lineage.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-replay-lineage.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistent-mailbox/persistent-mailbox-retry-backoff.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-retry-backoff.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistent-mailbox/persistent-mailbox-state-machine.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/persistence/schema.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-state-machine.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistent-mailbox/persistent-mailbox-tamper.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/receipt.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-tamper.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistent-mailbox/persistent-mailbox-transactional-enqueue.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/persistence/schema.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-transactional-enqueue.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/persistent-mailbox/persistent-mailbox-unique-consequence.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/persistence/schema.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/persistent-mailbox/persistent-mailbox-unique-consequence.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-evidence/ocel2-project-projection.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/ocel2-project-projection.gall.ts",
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-evidence/ocel2-project-projection.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-evidence/ocel2-project-types.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/ocel2-project-types.ts",
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-evidence/ocel2-project-types.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-evidence/ocel2-projection-gap.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/ocel2-project-projection.gall.ts",
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-evidence/ocel2-projection-gap.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-evidence/ocel2-type-boundary-gap.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/ocel2-project-types.ts",
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-evidence/ocel2-type-boundary-gap.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-evidence/ocpq-constraint-gap.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/ocpq-project-constraints.gall.ts",
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-evidence/ocpq-constraint-gap.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-evidence/ocpq-project-constraints.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/ocpq-project-constraints.gall.ts",
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-evidence/ocpq-project-constraints.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-evidence/powl-project-workflow.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/powl-project-workflow.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-evidence/powl-project-workflow.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-evidence/project-evidence-gapclose.integration.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/powl-project-workflow.gall.ts",
        "agents/doctor/agent.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-evidence/project-evidence-gapclose.integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-evidence/project-evidence-regression-boundary.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [],
      "provedBy": [
        "packages/membrane/test/project-evidence/project-evidence-regression-boundary.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-evidence/project-evidence-types.integration.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/ocel2-project-projection.gall.ts",
        "packages/membrane/src/ocpq-project-constraints.gall.ts",
        "packages/membrane/src/powl-project-workflow.gall.ts",
        "packages/membrane/src/ocel2-project-types.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-evidence/project-evidence-types.integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-wizard/project-wizard-benchmark.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-wizard/project-wizard-benchmark.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-wizard/project-wizard-bind.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-wizard/project-wizard-bind.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-wizard/project-wizard-cli.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-wizard/project-wizard-cli.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-wizard/project-wizard-execution.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-wizard/project-wizard-execution.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-wizard/project-wizard-functional.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-wizard/project-wizard-functional.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-wizard/project-wizard-handoff.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-wizard/project-wizard-handoff.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-wizard/project-wizard-init-map.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-wizard/project-wizard-init-map.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-wizard/project-wizard-plan.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-wizard/project-wizard-plan.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-wizard/project-wizard-stress.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/persistence/lock.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/persistent-mailbox.gall.ts",
        "packages/membrane/src/hash.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-wizard/project-wizard-stress.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/project-wizard/project-wizard-validation.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/project-wizard.gall.ts",
        "packages/membrane/src/project-wizard.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/project-wizard/project-wizard-validation.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/telco/telco.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/telco.gall.ts"
      ],
      "provedBy": [
        "packages/membrane/test/telco/telco.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/topology/topology-chain-replay.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/receipt.ts",
        "packages/membrane/src/manufacturing/topology.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/topology/topology-chain-replay.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/topology/topology-partial-order-vkg.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/runtime-law.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/topology/topology-partial-order-vkg.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/topology/topology-rollback-storm.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/manufacturing/topology.ts",
        "packages/membrane/src/persistence/transactions.ts",
        "packages/membrane/src/persistence/schema.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/topology/topology-rollback-storm.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/topology/topology.gall.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/topology.gall.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/topology/topology.gall.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/topology/topology.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/manufacturing/topology.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/hook.ts",
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/topology/topology.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/utils/arbitraries.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/membrane/test/heijunka.test.ts",
        "packages/membrane/test/jit.test.ts",
        "packages/membrane/test/manufacturing.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/test/validation/conformance-fuzz.property.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/membrane/src/persistence/receipt-store.ts",
        "packages/membrane/src/manufacturing/jidoka.ts",
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/context.ts",
        "packages/membrane/src/receipt.ts",
        "packages/kernel-wasm/pkg/wasm4pm/index.ts"
      ],
      "provedBy": [
        "packages/membrane/test/validation/conformance-fuzz.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/wizard/verbs/init.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/wizard/project-cell.ts"
      ],
      "provedBy": [
        "skills/wizard/wizard-map-proof.ts",
        "skills/wizard/wizard-plan-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/wizard/verbs/map.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/wizard/project-cell.ts"
      ],
      "provedBy": [
        "skills/wizard/wizard-map-proof.ts",
        "skills/wizard/wizard-plan-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/membrane/src/wizard/verbs/plan.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [
        "packages/membrane/src/hash.ts",
        "packages/membrane/src/wizard/project-cell.ts",
        "packages/membrane/src/wizard/project-route.ts"
      ],
      "provedBy": [
        "skills/wizard/wizard-plan-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    }
  ],
  "_metadata": {
    "emitter": "Topology Graph Emitter",
    "description": "Live AST-grounded graph of the Truex operational ontology",
    "timestamp": "2026-05-25T18:57:23.645Z"
  }
}
```

---
*Artifact generated by Truex Observatory.*