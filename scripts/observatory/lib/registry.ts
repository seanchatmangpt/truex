/**
 * @module registry
 * @description
 * Gall Classification: Observatory Registry
 * Purpose: Centralized index of all fact and diagram emitters. Determines 
 * execution order and priorities for the Truex Observatory dashboard generation.
 */
import { emitC4Diagrams } from './emit-c4-diagrams.js';
import { emitTopologyGraph } from './emit-topology-graph.js';
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
import { S8FactsEmitter } from './emit-s8-facts.js';
import { S8DiagramEmitter } from './emit-s8-diagram.js';
import {
  OtpPressureFactsEmitter,
  MailboxPressureDiagramEmitter,
  RestartStormDiagramEmitter,
  QuarantineGrowthFactsEmitter,
  ReplayTopologyPressureFactsEmitter
} from './emit-otp-breakpoints.js';

/**
 * Definition of a registered emitter configuration.
 */
export interface RegisteredEmitter {
  name: string;
  run: () => Promise<any>;
  priority: number;
}

/**
 * Global registry mapping all active observatory emitters to their execution logic and priority.
 */
export const Registry: RegisteredEmitter[] = [
  {
    name: 'Topology Graph',
    run: async () => emitTopologyGraph(),
    priority: 5
  },
  {
    name: 'C4 Architecture Diagrams',
    run: async () => emitC4Diagrams(),
    priority: 6 // Must run after Topology Graph
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
    name: 'S8 Facts',
    run: () => new S8FactsEmitter().emit(),
    priority: 78
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
    name: 'S8 Diagram',
    run: () => new S8DiagramEmitter().emit(),
    priority: 88
  },
  {
    name: 'OTP Pressure Facts',
    run: () => new OtpPressureFactsEmitter().emit(),
    priority: 79
  },
  {
    name: 'Quarantine Growth Facts',
    run: () => new QuarantineGrowthFactsEmitter().emit(),
    priority: 81
  },
  {
    name: 'Replay/Topology Pressure Facts',
    run: () => new ReplayTopologyPressureFactsEmitter().emit(),
    priority: 84
  },
  {
    name: 'Mailbox Pressure Diagram',
    run: () => new MailboxPressureDiagramEmitter().emit(),
    priority: 86
  },
  {
    name: 'Restart Storm Diagram',
    run: () => new RestartStormDiagramEmitter().emit(),
    priority: 87
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

/**
 * Retrieves the list of all registered emitters, sorted ascending by their priority.
 * @returns Array of sorted emitters.
 */
export function getSortedEmitters(): RegisteredEmitter[] {
  return [...Registry].sort((a, b) => a.priority - b.priority);
}
