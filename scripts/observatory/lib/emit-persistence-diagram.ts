import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const DIAGRAM_PATH = 'docs/v1/latest/diagrams/persistence-arch.mmd';

export class PersistenceDiagramEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Persistence Diagram Emitter',
      description: 'Generates a Mermaid diagram for the persistence architecture',
      outputPath: DIAGRAM_PATH
    };
  }

  protected collectFacts() {
    return `
flowchart TB
    subgraph Hot ["Hot Tier: Zero-Loss Admission"]
        direction LR
        J[Delta Journal] --> WAL[(SQLite WAL)]
        WAL --> Q[Quad Store]
    end

    subgraph Warm ["Warm Tier: Search & Indexing"]
        direction TB
        WAL --> IDX[Index Manager]
        IDX --> FTS[Full Text Search]
        IDX --> AGG[Aggregator]
    end

    subgraph Cold ["Cold Tier: Durable Archive"]
        direction TB
        WAL --> SNAP[Snapshotter]
        SNAP --> S3[(Gall S3)]
        S3 --> RB[Receipt Bundle]
    end

    %% Data Flow
    Input([GraphDelta]) -->|Append| J
    Q -->|Update| State([Current State])
    S3 -.->|Recovery| J

    %% Styling
    classDef hot fill:#ffebee,stroke:#c62828,stroke-width:2px;
    classDef warm fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    classDef cold fill:#f1f8e9,stroke:#2e7d32,stroke-width:2px;
    classDef io fill:#f5f5f5,stroke:#333,stroke-dasharray: 5 5;

    class J,WAL,Q hot;
    class IDX,FTS,AGG warm;
    class SNAP,S3,RB cold;
    class Input,State io;

    %% Interactions
    click J href "https://github.com/truex/docs/journal" "Journal Specs"
    click WAL href "https://github.com/truex/docs/persistence" "SQLite Durability"
    click S3 href "https://github.com/truex/docs/s3-archive" "Cold Storage Archival"
`.trim();
  }
}

export async function emitPersistenceDiagram() {
  const emitter = new PersistenceDiagramEmitter();
  return emitter.emit();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-persistence-diagram.ts') || 
  process.argv[1].endsWith('emit-persistence-diagram.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitPersistenceDiagram();
}
