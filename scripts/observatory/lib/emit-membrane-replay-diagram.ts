import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const DIAGRAM_PATH = 'docs/v1/latest/diagrams/membrane-replay.mmd';

export class MembraneReplayDiagramEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Membrane Replay Diagram Emitter',
      description: 'Generates a Mermaid diagram for the S7 Membrane Replay and WAL reconstruction flow',
      outputPath: DIAGRAM_PATH
    };
  }

  protected collectFacts() {
    return `
flowchart TB
    subgraph Execution ["1. Cascade Execution & Logging"]
        direction LR
        GD([GraphDelta]) --> HookA[Hook A]
        HookA -->|Confirmed Receipt| TJ[(SQLite topology_journal)]
        HookA -->|State Transition| Mem[Memory State]
    end

    subgraph CrashRecovery ["2. Crash Recovery & Rollback Flow"]
        direction TB
        Crash[Simulated Crash] -.-> MemoryLost[Memory State Wiped]
        Restore[recoverFromCrash] --> Snapshot[Load Rollback Snapshot]
        Snapshot --> Rollback[Restore state to snapshot]
        Rollback --> RefusedReceipt[Append refused recovery receipt]
        RefusedReceipt --> TJ
    end

    subgraph WALReconstruction ["3. WAL Reconstruction & Verification"]
        direction TB
        Load[loadJournal] --> Integrity[verifyJournalIntegrity]
        Integrity -->|Pass| Reconstruct[reconstructTopologyState]
        Integrity -->|Fail| Tampered[Raise Tampered/Corrupted Error]
    end

    subgraph ReplayAndProjection ["4. Deterministic Replay & VKG Projection"]
        direction TB
        Lineage[Load Lineage] --> Sort[Normalize schedule order]
        Sort --> Replay[replayJournalLineage]
        Replay --> Verify[Verify hashes match expected receipts]
        Verify --> VKG[Calculate VKG Projection Hash]
    end

    %% Data flow connections
    TJ -->|Read Journal| Load
    Reconstruct -->|Initial State| Lineage
    VKG -->|Converged State| Converged([Verified State Hash])

    %% Styling
    classDef execution fill:#ffebee,stroke:#c62828,stroke-width:2px;
    classDef crash fill:#fff3e0,stroke:#ef6c00,stroke-width:2px;
    classDef reconstruction fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    classDef replay fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef terminal fill:#f5f5f5,stroke:#333,stroke-dasharray: 5 5;

    class GD,HookA,Mem execution;
    class Crash,MemoryLost,Restore,Snapshot,Rollback,RefusedReceipt crash;
    class Load,Integrity,Reconstruct,Tampered reconstruction;
    class Lineage,Sort,Replay,Verify,VKG replay;
    class TJ,Converged terminal;
`.trim();
  }
}

export async function emitMembraneReplayDiagram() {
  const emitter = new MembraneReplayDiagramEmitter();
  return emitter.emit();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-membrane-replay-diagram.ts') || 
  process.argv[1].endsWith('emit-membrane-replay-diagram.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitMembraneReplayDiagram();
}
