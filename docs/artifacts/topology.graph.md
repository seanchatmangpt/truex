# Antigravity Artifact: Topology.graph

> **Generated:** 2026-05-24T03:21:32.982Z
> **Version:** 2.0.0

## Data Summary

```json
{
  "version": "2.0.0",
  "graphHash": "bf6f40f29bdceb9f2c5b4fca5d92d5e3e018679693acc6507fac8092adac15f5",
  "nodes": [
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
      "id": "scripts/receipted-audit.ts",
      "type": "CLI",
      "layer": "Governance",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "skills/replay/mutations.ts",
        "skills/receipt/invariant.ts",
        "agents/swarm-auditor.ts",
        "packages/truex-core/src/runtime-law.ts"
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
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/manufacturing/registry.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/index.ts",
        "packages/truex-core/src/persistence/journal.ts",
        "packages/truex-core/src/persistence/receipt-store.ts",
        "packages/truex-core/src/persistence/ontology.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
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
        "agents/doctor/agent.ts",
        "agents/telco/agent.ts",
        "agents/wizard/agent.ts",
        "skills/membrane/mutations.ts"
      ],
      "provedBy": [
        "scripts/truex.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "skills/repository-proof.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/integration/skill-sandbox.ts",
        "packages/truex-core/src/integration/task-delta.ts",
        "packages/truex-core/src/persistence/ontology.ts",
        "scripts/observatory/lib/emit-topology-graph.ts",
        "packages/truex-core/src/index.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration-surface.test.ts"
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
        "packages/truex-core/src/concurrency.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/index.ts"
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
        "packages/truex-core/src/index.ts"
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
        "packages/truex-core/src/index.ts"
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
        "packages/truex-core/src/index.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "test/tps.property.test.ts"
      ],
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
      "type": "Integration",
      "layer": "AGY",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "skills/adapter/mutations.ts",
      "type": "Integration",
      "layer": "AGY",
      "dependencies": [
        "skills/hash/mutations.ts",
        "skills/receipt/mutations.ts",
        "skills/adapter/invariant.ts",
        "skills/adapter/invariant.ts",
        "packages/truex-core/src/context.ts",
        "skills/replay/mutations.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/adapter/proofs.ts",
        "packages/truex-core/test/adapter.test.ts"
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
        "packages/truex-core/src/context.ts",
        "skills/hash/mutations.ts",
        "skills/replay/mutations.ts",
        "skills/adapter/mutations.ts",
        "packages/truex-core/src/runtime-law.ts",
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
      "id": "skills/hash/invariant.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
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
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/index.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/hook/proofs.ts"
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
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/receipt.ts",
        "packages/truex-core/src/membrane-replay.gall.ts"
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
        "packages/truex-core/src/context.ts"
      ],
      "provedBy": [
        "skills/membrane/proofs.ts",
        "skills/telco/proofs.ts",
        "skills/telco/telco-proof.ts"
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
      "id": "skills/receipt/invariant.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/runtime-law.ts",
        "skills/hash/mutations.ts",
        "skills/receipt/mutations.ts"
      ],
      "provedBy": [
        "skills/adapter/proofs.ts",
        "skills/receipt/proofs.ts",
        "packages/truex-core/test/adapter.test.ts"
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
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/runtime-law.ts",
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
        "packages/truex-core/src/context.ts",
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
        "packages/truex-core/test/ontology-genesis.test.ts"
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
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/adapter/proofs.ts",
        "skills/replay/proofs.ts",
        "packages/truex-core/test/adapter.test.ts"
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
        "packages/truex-core/src/context.ts",
        "skills/replay/mutations.ts",
        "packages/truex-core/src/runtime-law.ts"
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
        "packages/truex-core/src/topology.gall.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/index.ts",
        "packages/truex-core/src/runtime-law.ts"
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
        "agents/wizard/agent.ts"
      ],
      "provedBy": [
        "skills/wizard/proofs.ts"
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
        "agents/wizard/agent.ts"
      ],
      "provedBy": [
        "skills/wizard/wizard-proof.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "test/utils/helpers.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/utils/type.ts/index.ts",
        "packages/truex-core/src/utils/object.ts/index.ts",
        "packages/truex-core/src/utils/array.ts/index.ts",
        "packages/truex-core/src/utils/string.ts/index.ts"
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
        "packages/truex-core/src/utils/proxy-log.ts/index.ts",
        "packages/truex-core/src/utils/log-format.ts/index.ts",
        "packages/truex-core/src/utils/error-log.ts/index.ts",
        "packages/truex-core/src/utils/timing.ts/index.ts"
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
        "packages/truex-core/src/utils/proxy-overhead.ts/index.ts",
        "packages/truex-core/src/utils/timing.ts/index.ts",
        "packages/truex-core/src/utils/memory.ts/index.ts"
      ],
      "provedBy": [
        "test/utils/performance.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/concurrency.ts",
      "type": "Topology",
      "layer": "S5",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hash.ts"
      ],
      "provedBy": [
        "test/concurrency.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/context.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "skills/adapter/proofs.ts",
        "skills/hook/proofs.ts",
        "skills/membrane/membrane-replay-proof.ts",
        "skills/receipt/proofs.ts",
        "skills/replay/proofs.ts",
        "skills/topology/proofs.ts",
        "packages/truex-core/test/adapter.test.ts",
        "packages/truex-core/test/cascading-rollback.test.ts",
        "packages/truex-core/test/doctor-diagnostics.test.ts",
        "packages/truex-core/test/heijunka.test.ts",
        "packages/truex-core/test/integration-surface.test.ts",
        "packages/truex-core/test/primitives.test.ts",
        "packages/truex-core/test/receipt.property.test.ts",
        "packages/truex-core/test/report-receipt.test.ts",
        "packages/truex-core/test/s3-integration.test.ts",
        "packages/truex-core/test/integration/closed-loop-convergence.test.ts",
        "packages/truex-core/test/integration/swarm-controller.test.ts",
        "packages/truex-core/test/manufacturing/line.test.ts",
        "packages/truex-core/test/manufacturing/swarm-actuator.test.ts",
        "packages/truex-core/test/membrane-replay/membrane-partial-order-vkg.test.ts",
        "packages/truex-core/test/membrane-replay/membrane-reconstruction.test.ts",
        "packages/truex-core/test/topology/topology-chain-replay.test.ts",
        "packages/truex-core/test/topology/topology-partial-order-vkg.test.ts",
        "packages/truex-core/test/topology/topology-rollback-storm.test.ts",
        "packages/truex-core/test/topology/topology.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/hash.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "skills/membrane/membrane-replay-proof.ts",
        "packages/truex-core/test/adapter.test.ts",
        "packages/truex-core/test/benchmark-entropy.test.ts",
        "packages/truex-core/test/doctor-diagnostics.test.ts",
        "packages/truex-core/test/primitives.test.ts",
        "packages/truex-core/test/replay.property.test.ts",
        "packages/truex-core/test/integration/closed-loop-convergence.test.ts",
        "packages/truex-core/test/membrane-replay/membrane-crash-rollback.test.ts",
        "packages/truex-core/test/membrane-replay/membrane-partial-order-vkg.test.ts",
        "packages/truex-core/test/membrane-replay/membrane-reconstruction.test.ts",
        "packages/truex-core/test/topology/topology-chain-replay.test.ts",
        "packages/truex-core/test/topology/topology-partial-order-vkg.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/hook-otp.gall.ts",
      "type": "Topology",
      "layer": "S5",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/index.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/hook-otp/hook-otp-mailbox.test.ts",
        "packages/truex-core/test/hook-otp/hook-otp-nonmockable-stress.test.ts",
        "packages/truex-core/test/hook-otp/hook-otp-receipt-replay.test.ts",
        "packages/truex-core/test/hook-otp/hook-otp-runtime.test.ts",
        "packages/truex-core/test/hook-otp/hook-otp-supervisor.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/hook.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/index.ts",
        "packages/truex-core/src/context.ts"
      ],
      "provedBy": [
        "test/concurrency.test.ts",
        "skills/hook/proofs.ts",
        "packages/truex-core/test/cascading-rollback.test.ts",
        "packages/truex-core/test/benchmark/generator.test.ts",
        "packages/truex-core/test/benchmark/million-hook-church.test.ts",
        "packages/truex-core/test/integration/closed-loop-convergence.test.ts",
        "packages/truex-core/test/manufacturing/lean.test.ts",
        "packages/truex-core/test/manufacturing/line.test.ts",
        "packages/truex-core/test/topology/topology-chain-replay.test.ts",
        "packages/truex-core/test/topology/topology-partial-order-vkg.test.ts",
        "packages/truex-core/test/topology/topology-rollback-storm.test.ts",
        "packages/truex-core/test/topology/topology.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/index.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "skills/repository-proof.ts",
        "test/concurrency.test.ts",
        "test/entropy.test.ts",
        "test/index.test.ts",
        "test/tps.property.test.ts",
        "skills/hook/proofs.ts",
        "skills/topology/proofs.ts",
        "packages/truex-core/test/s3-integration.test.ts",
        "packages/truex-core/test/benchmark/million-hook-church.test.ts",
        "packages/truex-core/test/hook-otp/hook-otp-nonmockable-stress.test.ts",
        "packages/truex-core/test/hook-otp/hook-otp-receipt-replay.test.ts",
        "packages/truex-core/test/membrane-replay/membrane-reconstruction.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/membrane-replay.gall.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/index.ts"
      ],
      "provedBy": [
        "skills/membrane/membrane-replay-proof.ts",
        "packages/truex-core/test/membrane-replay/membrane-crash-rollback.test.ts",
        "packages/truex-core/test/membrane-replay/membrane-partial-order-vkg.test.ts",
        "packages/truex-core/test/membrane-replay/membrane-reconstruction.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/membrane.ts",
      "type": "Integration",
      "layer": "S2",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/membrane.test.ts",
        "packages/truex-core/test/persistence/membrane-link.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/receipt.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "skills/membrane/membrane-replay-proof.ts",
        "packages/truex-core/test/doctor-diagnostics.test.ts",
        "packages/truex-core/test/receipt.property.test.ts",
        "packages/truex-core/test/report-receipt.test.ts",
        "packages/truex-core/test/integration/autonomic-loop.test.ts",
        "packages/truex-core/test/integration/closed-loop-convergence.test.ts",
        "packages/truex-core/test/membrane-replay/membrane-partial-order-vkg.test.ts",
        "packages/truex-core/test/topology/topology-chain-replay.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/replay.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/doctor-diagnostics.test.ts",
        "packages/truex-core/test/primitives.test.ts",
        "packages/truex-core/test/replay.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/runtime-law.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "test/concurrency.test.ts",
        "test/tps.property.test.ts",
        "skills/adapter/proofs.ts",
        "skills/hook/proofs.ts",
        "skills/replay/proofs.ts",
        "skills/topology/proofs.ts",
        "packages/truex-core/test/adapter.test.ts",
        "packages/truex-core/test/doctor-diagnostics.test.ts",
        "packages/truex-core/test/hook-interceptor.test.ts",
        "packages/truex-core/test/integration-surface.test.ts",
        "packages/truex-core/test/kaizen.test.ts",
        "packages/truex-core/test/primitives.test.ts",
        "packages/truex-core/test/s3-integration.test.ts",
        "packages/truex-core/test/integration/autonomic-loop.test.ts",
        "packages/truex-core/test/integration/closed-loop-convergence.test.ts",
        "packages/truex-core/test/integration/consequence-actuator.test.ts",
        "packages/truex-core/test/integration/env-actuator.test.ts",
        "packages/truex-core/test/integration/task-delta.test.ts",
        "packages/truex-core/test/manufacturing/line.test.ts",
        "packages/truex-core/test/manufacturing/visual.test.ts",
        "packages/truex-core/test/persistence/journal.test.ts",
        "packages/truex-core/test/topology/topology-chain-replay.test.ts",
        "packages/truex-core/test/topology/topology-partial-order-vkg.test.ts",
        "packages/truex-core/test/topology/topology-rollback-storm.test.ts",
        "packages/truex-core/test/topology/topology.gall.test.ts",
        "packages/truex-core/test/topology/topology.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/signature.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/primitives.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/topology.gall.ts",
      "type": "Topology",
      "layer": "S5",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/index.ts"
      ],
      "provedBy": [
        "skills/topology/proofs.ts",
        "packages/truex-core/test/topology/topology.gall.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/adapter.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hash.ts",
        "skills/replay/mutations.ts",
        "skills/adapter/mutations.ts",
        "packages/truex-core/src/runtime-law.ts",
        "skills/receipt/invariant.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/adapter.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/benchmark-entropy.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/benchmark/million-hook-church.ts",
        "packages/truex-core/src/hash.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/benchmark-entropy.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/cascading-rollback.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/persistence/transactions.ts",
        "packages/truex-core/src/manufacturing/jidoka.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/persistence/schema.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/cascading-rollback.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/doctor-diagnostics.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/receipt.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/replay.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/doctor-diagnostics.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/heijunka.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/manufacturing/heijunka.ts",
        "packages/truex-core/src/manufacturing/jit.ts",
        "packages/truex-core/test/utils/arbitraries.ts",
        "packages/truex-core/src/context.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/heijunka.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/hook-interceptor.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/integration/hook-interceptor.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/hook-interceptor.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/integration-surface.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/integration/task-delta.ts",
        "packages/truex-core/src/integration/report-receipt.ts",
        "packages/truex-core/src/integration/hook-interceptor.ts",
        "packages/truex-core/src/integration/trajectory-replay.ts",
        "packages/truex-core/src/integration/skill-sandbox.ts",
        "skills/repository-proof.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration-surface.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/jit.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/manufacturing/jit.ts",
        "packages/truex-core/test/utils/arbitraries.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/jit.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/kaizen.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/manufacturing/kaizen.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/kaizen.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/manufacturing.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/manufacturing/standardization.ts",
        "packages/truex-core/test/utils/arbitraries.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/manufacturing.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/membrane.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/membrane.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/membrane.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/ontology-genesis.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "scripts/truex-agy-bridge.ts",
        "skills/hash/invariant.ts",
        "skills/replay/invariant.ts",
        "packages/truex-core/src/manufacturing/collaboration.ts",
        "packages/truex-core/src/manufacturing/gemba.ts",
        "packages/truex-core/src/manufacturing/registry.ts",
        "packages/truex-core/src/persistence/audit-engine.ts",
        "packages/truex-core/src/persistence/replay.ts",
        "packages/truex-core/src/utils/array.ts",
        "packages/truex-core/src/utils/error-log.ts",
        "packages/truex-core/src/utils/log-format.ts",
        "packages/truex-core/src/utils/memory.ts",
        "packages/truex-core/src/utils/object.ts",
        "packages/truex-core/src/utils/proxy-log.ts",
        "packages/truex-core/src/utils/proxy-overhead.ts",
        "packages/truex-core/src/utils/string.ts",
        "packages/truex-core/src/utils/timing.ts",
        "packages/truex-core/src/utils/type.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/persistence.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/persistence/schema.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/persistence.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/primitives.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/signature.ts",
        "packages/truex-core/src/replay.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/primitives.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/receipt.property.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/receipt.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/receipt.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/replay.property.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/replay.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/replay.property.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/report-receipt.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/receipt.ts",
        "packages/truex-core/src/integration/report-receipt.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/report-receipt.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/s3-integration.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/index.ts",
        "packages/truex-core/src/persistence/index.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/s3-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/skill-sandbox.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/integration/skill-sandbox.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/skill-sandbox.test.ts"
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
        "packages/truex-core/src/manufacturing/registry.ts",
        "packages/truex-core/src/manufacturing/standardization.ts",
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
      "id": "scripts/observatory/lib/emit-receipt.ts",
      "type": "Governance",
      "layer": "S4",
      "dependencies": [
        "scripts/observatory/lib/fact-emitter.ts",
        "packages/truex-core/src/signature.ts",
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
        "scripts/observatory/lib/emit-s8-diagram.ts"
      ],
      "provedBy": [
        "scripts/observatory/lib/registry.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/benchmark/hookbench.gall.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/index.ts",
        "packages/truex-core/src/manufacturing/jidoka.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/persistence/journal.ts",
        "packages/truex-core/src/persistence/schema.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/benchmark/hookbench.gall.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/benchmark/million-hook-church.ts",
      "type": "Benchmark",
      "layer": "S4",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/context.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/benchmark-entropy.test.ts",
        "packages/truex-core/test/benchmark/generator.test.ts",
        "packages/truex-core/test/benchmark/million-hook-church.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/benchmark/runner.ts",
      "type": "Benchmark",
      "layer": "S4",
      "dependencies": [
        "packages/truex-core/src/benchmark/hookbench.gall.ts"
      ],
      "provedBy": [],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/benchmark/stress-tests.ts",
      "type": "Benchmark",
      "layer": "S4",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/receipt.ts",
        "packages/truex-core/src/manufacturing/jidoka.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/benchmark/million-hook-church.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/integration/autonomic-loop.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/persistence/journal.ts",
        "packages/truex-core/src/persistence/receipt-store.ts",
        "packages/truex-core/src/index.ts",
        "packages/truex-core/src/integration/hook-interceptor.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/autonomic-loop.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/integration/consequence-actuator.ts",
      "type": "Integration",
      "layer": "AGY",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/consequence-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/integration/env-actuator.ts",
      "type": "Integration",
      "layer": "AGY",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/env-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/integration/hook-interceptor.ts",
      "type": "Integration",
      "layer": "AGY",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/hook-interceptor.test.ts",
        "packages/truex-core/test/integration-surface.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/integration/report-receipt.ts",
      "type": "Integration",
      "layer": "AGY",
      "dependencies": [
        "packages/truex-core/src/receipt.ts",
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration-surface.test.ts",
        "packages/truex-core/test/report-receipt.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/integration/skill-sandbox.ts",
      "type": "Integration",
      "layer": "AGY",
      "dependencies": [],
      "provedBy": [
        "skills/repository-proof.ts",
        "packages/truex-core/test/integration-surface.test.ts",
        "packages/truex-core/test/skill-sandbox.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/integration/swarm-controller.ts",
      "type": "Integration",
      "layer": "AGY",
      "dependencies": [
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/context.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/swarm-controller.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/integration/task-delta.ts",
      "type": "Integration",
      "layer": "AGY",
      "dependencies": [
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "skills/repository-proof.ts",
        "packages/truex-core/test/integration-surface.test.ts",
        "packages/truex-core/test/integration/task-delta.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/integration/trajectory-replay.ts",
      "type": "Integration",
      "layer": "AGY",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/integration-surface.test.ts",
        "packages/truex-core/test/integration/trajectory-replay.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/collaboration.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/receipt.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/gemba.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/runtime-law.ts",
        "src/ocel2/index/index.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/heijunka.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/manufacturing/jit.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/heijunka.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/jidoka.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/manufacturing/standardization.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/cascading-rollback.test.ts",
        "packages/truex-core/test/benchmark/million-hook-church.test.ts",
        "packages/truex-core/test/integration/closed-loop-convergence.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/jit.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/hook.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/heijunka.test.ts",
        "packages/truex-core/test/jit.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/kaizen.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/kaizen.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/lean.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/hook.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/manufacturing/lean.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/line.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/manufacturing/jit.ts",
        "packages/truex-core/src/manufacturing/jidoka.ts",
        "packages/truex-core/src/manufacturing/heijunka.ts",
        "packages/truex-core/src/manufacturing/kaizen.ts",
        "packages/truex-core/src/manufacturing/topology.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/hook.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/s3-integration.test.ts",
        "packages/truex-core/test/manufacturing/line.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/registry.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/manufacturing/line.ts",
        "packages/truex-core/src/manufacturing/jit.ts",
        "packages/truex-core/src/index.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/standardization.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/manufacturing.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/swarm-actuator.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/manufacturing/visual.ts",
        "packages/truex-core/src/context.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/manufacturing/swarm-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/topology.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/receipt.ts",
        "packages/truex-core/src/hash.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/topology/topology-chain-replay.test.ts",
        "packages/truex-core/test/topology/topology-rollback-storm.test.ts",
        "packages/truex-core/test/topology/topology.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/manufacturing/visual.ts",
      "type": "Manufacturing",
      "layer": "S2",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/manufacturing/swarm-actuator.test.ts",
        "packages/truex-core/test/manufacturing/visual.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/persistence/audit-engine.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/persistence/receipt-store.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/persistence/index.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/persistence/journal.ts",
        "packages/truex-core/src/persistence/receipt-store.ts",
        "packages/truex-core/src/persistence/snapshot.ts",
        "packages/truex-core/src/manufacturing/line.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/context.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/s3-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/persistence/journal.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/s3-integration.test.ts",
        "packages/truex-core/test/persistence/journal.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/persistence/lock.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/persistence/lock.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/persistence/membrane-link.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/membrane.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/persistence/membrane-link.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/persistence/ontology.ts",
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
      "id": "packages/truex-core/src/persistence/receipt-store.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/receipt.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/s3-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/persistence/replay.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/persistence/journal.ts",
        "packages/truex-core/src/persistence/receipt-store.ts",
        "packages/truex-core/src/persistence/snapshot.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/receipt.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/persistence/schema.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/cascading-rollback.test.ts",
        "packages/truex-core/test/persistence.test.ts",
        "packages/truex-core/test/persistence/journal.test.ts",
        "packages/truex-core/test/topology/topology-rollback-storm.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/persistence/snapshot.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hash.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/s3-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/persistence/transactions.ts",
      "type": "Persistence",
      "layer": "S3",
      "dependencies": [
        "packages/truex-core/src/membrane.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/cascading-rollback.test.ts",
        "packages/truex-core/test/topology/topology-rollback-storm.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/utils/array.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/utils/error-log.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/utils/log-format.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/utils/memory.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/utils/object.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/utils/proxy-log.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [
        "packages/truex-core/src/utils/log-format.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/utils/proxy-overhead.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [
        "packages/truex-core/src/membrane.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/utils/string.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/utils/timing.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/src/utils/type.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [],
      "provedBy": [
        "packages/truex-core/test/ontology-genesis.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/benchmark/generator.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/benchmark/million-hook-church.ts",
        "packages/truex-core/src/hook.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/benchmark/generator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/benchmark/hookbench.gall.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/benchmark/hookbench.gall.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/benchmark/hookbench.gall.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/benchmark/million-hook-church.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/benchmark/million-hook-church.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/index.ts",
        "packages/truex-core/src/manufacturing/jidoka.ts",
        "packages/truex-core/src/benchmark/stress-tests.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/benchmark/million-hook-church.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-benchmark-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/hook-otp/hook-otp-mailbox.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/hook-otp.gall.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/hook-otp/hook-otp-mailbox.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/hook-otp/hook-otp-nonmockable-stress.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/hook-otp.gall.ts",
        "packages/truex-core/src/index.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/hook-otp/hook-otp-nonmockable-stress.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/hook-otp/hook-otp-receipt-replay.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/hook-otp.gall.ts",
        "packages/truex-core/src/index.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/hook-otp/hook-otp-receipt-replay.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/hook-otp/hook-otp-runtime.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/hook-otp.gall.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/hook-otp/hook-otp-runtime.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/hook-otp/hook-otp-supervisor.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/hook-otp.gall.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/hook-otp/hook-otp-supervisor.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/integration/autonomic-loop.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/integration/autonomic-loop.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/receipt.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/autonomic-loop.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/integration/closed-loop-convergence.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/receipt.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/manufacturing/jidoka.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/closed-loop-convergence.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/integration/consequence-actuator.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/integration/consequence-actuator.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/consequence-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/integration/env-actuator.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/integration/env-actuator.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/env-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/integration/swarm-controller.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/integration/swarm-controller.ts",
        "packages/truex-core/src/context.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/swarm-controller.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/integration/task-delta.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/integration/task-delta.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/task-delta.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/integration/telco-integration.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/telco/agent.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/telco-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/integration/trajectory-replay.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/integration/trajectory-replay.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/trajectory-replay.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/integration/wizard-integration.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "agents/wizard/agent.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/integration/wizard-integration.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-agy-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/manufacturing/lean.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/manufacturing/lean.ts",
        "packages/truex-core/src/hook.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/manufacturing/lean.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/manufacturing/line.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/manufacturing/line.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/hook.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/manufacturing/line.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/manufacturing/swarm-actuator.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/manufacturing/swarm-actuator.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/manufacturing/visual.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/manufacturing/swarm-actuator.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/manufacturing/visual.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/manufacturing/visual.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/manufacturing/visual.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-manufacturing-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/membrane-replay/membrane-crash-rollback.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/membrane-replay.gall.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/membrane-replay/membrane-crash-rollback.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/membrane-replay/membrane-partial-order-vkg.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/receipt.ts",
        "packages/truex-core/src/membrane-replay.gall.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/membrane-replay/membrane-partial-order-vkg.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/membrane-replay/membrane-reconstruction.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/membrane-replay.gall.ts",
        "packages/truex-core/src/index.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/membrane-replay/membrane-reconstruction.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/persistence/journal.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/persistence/journal.ts",
        "packages/truex-core/src/persistence/schema.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/persistence/journal.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/persistence/lock.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/persistence/lock.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/persistence/lock.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/persistence/membrane-link.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/membrane.ts",
        "packages/truex-core/src/persistence/membrane-link.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/persistence/membrane-link.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-persistence-facts.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/topology/topology-chain-replay.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/receipt.ts",
        "packages/truex-core/src/manufacturing/topology.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/topology/topology-chain-replay.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/topology/topology-partial-order-vkg.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hash.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/runtime-law.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/topology/topology-partial-order-vkg.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/topology/topology-rollback-storm.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/manufacturing/topology.ts",
        "packages/truex-core/src/persistence/transactions.ts",
        "packages/truex-core/src/persistence/schema.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/topology/topology-rollback-storm.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/topology/topology.gall.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/topology.gall.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/topology/topology.gall.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/topology/topology.test.ts",
      "type": "Test",
      "layer": "Verification",
      "dependencies": [
        "packages/truex-core/src/manufacturing/topology.ts",
        "packages/truex-core/src/context.ts",
        "packages/truex-core/src/hook.ts",
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/topology/topology.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-topology-graph.ts"
      ]
    },
    {
      "id": "packages/truex-core/test/utils/arbitraries.ts",
      "type": "Primitive",
      "layer": "S0-S1",
      "dependencies": [
        "packages/truex-core/src/runtime-law.ts"
      ],
      "provedBy": [
        "packages/truex-core/test/heijunka.test.ts",
        "packages/truex-core/test/jit.test.ts",
        "packages/truex-core/test/manufacturing.test.ts"
      ],
      "documentedBy": [
        "scripts/observatory/lib/emit-core-facts.ts"
      ]
    }
  ],
  "_metadata": {
    "emitter": "Topology Graph Emitter",
    "description": "Live AST-grounded graph of the Truex operational ontology",
    "timestamp": "2026-05-24T03:21:32.982Z"
  }
}
```

---
*Artifact generated by Truex Observatory.*