import { emitTopologyGraph } from './emit-topology-graph.js';
import { FactEmitter } from './fact-emitter.js';
import { CoreFactsEmitter } from './emit-core-facts.js';
import { AgyFactsEmitter } from './emit-agy-facts.js';
import { ManufacturingFactsEmitter } from './emit-manufacturing-facts.js';
import { PersistenceFactsEmitter } from './emit-persistence-facts.js';
import { BenchmarkFactsEmitter } from './emit-benchmark-facts.js';
import { RefinementRulesEmitter } from './emit-refinement-rules.js';
import { PersistenceDiagramEmitter } from './emit-persistence-diagram.js';
import { TopologyDiagramEmitter } from './emit-topology-diagram.js';
import { TopologyFactsEmitter } from './emit-topology-facts.js';
import { BenchmarkDiagramEmitter } from './emit-benchmark-diagram.js';
import { ReceiptEmitter } from './emit-receipt.js';
import { DiagnosticsEmitter } from './diagnostics.js';
import { RefusalAnalysisEmitter } from './emit-refusal-analysis.js';
import { DocsLinkEmitter } from './docs-link.js';
import { GovernanceActuatorEmitter } from './emit-governance-actuator.js';
import { emitArtifacts } from './emit-artifacts.js';
import { MembraneReplayFactsEmitter } from './emit-membrane-replay-facts.js';
import { MembraneReplayDiagramEmitter } from './emit-membrane-replay-diagram.js';
import { WalReconstructionVisualizationEmitter } from './emit-wal-reconstruction-visualization.js';

export interface RegisteredEmitter {
  name: string;
  run: () => Promise<any>;
  priority: number;
}

export const Registry: RegisteredEmitter[] = [
  {
    name: 'Topology Graph',
    run: async () => emitTopologyGraph(),
    priority: 5
  },
  {
    name: 'Core Facts',
    run: () => new CoreFactsEmitter().emit(),
    priority: 10
  },
  {
    name: 'AGY Facts',
    run: () => new AgyFactsEmitter().emit(),
    priority: 20
  },
  {
    name: 'Manufacturing Facts',
    run: () => new ManufacturingFactsEmitter().emit(),
    priority: 30
  },
  {
    name: 'Persistence Facts',
    run: () => new PersistenceFactsEmitter().emit(),
    priority: 40
  },
  {
    name: 'Benchmark Facts',
    run: () => new BenchmarkFactsEmitter().emit(),
    priority: 42
  },
  {
    name: 'Refinement Rules',
    run: () => new RefinementRulesEmitter().emit(),
    priority: 45
  },
  {
    name: 'Diagnostics',
    run: () => new DiagnosticsEmitter().emit(),
    priority: 50
  },
  {
    name: 'Refusal Analysis',
    run: () => new RefusalAnalysisEmitter().emit(),
    priority: 60
  },
  {
    name: 'Persistence Diagram',
    run: () => new PersistenceDiagramEmitter().emit(),
    priority: 70
  },
  {
    name: 'Membrane Replay Facts',
    run: () => new MembraneReplayFactsEmitter().emit(),
    priority: 72
  },
  {
    name: 'Topology Facts',
    run: () => new TopologyFactsEmitter().emit(),
    priority: 75
  },
  {
    name: 'Topology Diagram',
    run: () => new TopologyDiagramEmitter().emit(),
    priority: 80
  },
  {
    name: 'Membrane Replay Diagram',
    run: () => new MembraneReplayDiagramEmitter().emit(),
    priority: 82
  },
  {
    name: 'WAL Reconstruction Visualization',
    run: () => new WalReconstructionVisualizationEmitter().emit(),
    priority: 83
  },
  {
    name: 'Benchmark Diagram',
    run: () => new BenchmarkDiagramEmitter().emit(),
    priority: 85
  },
  {
    name: 'Receipt Emitter',
    run: () => new ReceiptEmitter().emit(),
    priority: 100
  },
  {
    name: 'Governance Actuator',
    run: () => new GovernanceActuatorEmitter().emit(),
    priority: 110
  },
  {
    name: 'Artifacts',
    run: () => emitArtifacts(),
    priority: 120
  },
  {
    name: 'Docs Link',
    run: () => new DocsLinkEmitter().emit(),
    priority: 130
  }
];

export function getSortedEmitters(): RegisteredEmitter[] {
  return [...Registry].sort((a, b) => a.priority - b.priority);
}
