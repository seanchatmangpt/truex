/**
 * @module emit-topology-diagram
 * @description
 * Gall Classification: S5 Topology Documentation
 * Purpose: Generates a Mermaid diagram representing the operational topology of Truex.
 */
import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const OUTPUT_PATH = 'docs/v1/latest/diagrams/operational-topology.mmd';

/**
 * Emitter for generating the full system operational topology Mermaid diagram.
 */
export class TopologyDiagramEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Topology Diagram Emitter',
      description: 'Generates a Mermaid diagram for the operational topology',
      outputPath: OUTPUT_PATH
    };
  }

  protected collectFacts() {
    return `flowchart TD
    subgraph ClientSpace ["Client Space"]
        direction LR
        A[Agent/Client] -->|Submit Delta| M([Admissions Membrane])
    end

    subgraph Engine ["Truex Lawful Engine"]
        direction TB
        M -->|Filtered| K{Kanban}
        
        subgraph Line ["Manufacturing Line"]
            direction LR
            K -->|Pull| PY[Poka-yoke Law]
            PY -->|Execute| H[Hook]
            H -->|Finalize| R[Admission Receipt]
        end

        subgraph TopologyCascade ["Topology Cascade Engine"]
            direction TB
            H -->|Triggers| TC{Causal Check}
            TC -->|Cycle / Storm?| TS[Storm Mitigation]
            TC -->|Valid| DH[Downstream Hook]
            DH -->|Recursive Delta| TC
        end
    end

    subgraph Projections ["VKG Projections"]
        direction TB
        R -->|Materialize| VKG[(Virtual Knowledge Graph)]
        DH -->|Materialize| VKG
    end

    subgraph Persistence ["Persistence Layer"]
        direction TB
        R -->|Sync Write| WAL[(SQLite WAL)]
        WAL -->|Async Archive| S3[(Gall S3 Cold Storage)]
    end

    subgraph Verification ["Verification & Audit"]
        direction TB
        R -->|Signal| RE[Replay Engine]
        RE -->|Integrity Check| WAL
        WAL -->|Evidence| AD[Independent Auditor]
    end

    %% Styling
    classDef client fill:#f5f5f5,stroke:#333,stroke-width:2px;
    classDef engine fill:#e1f5fe,stroke:#01579b,stroke-width:2px;
    classDef storage fill:#fff3e0,stroke:#e65100,stroke-width:2px;
    classDef audit fill:#f1f8e9,stroke:#33691e,stroke-width:2px;
    classDef membrane fill:#e1bee7,stroke:#4a148c,stroke-width:2px;
    classDef projection fill:#eceff1,stroke:#37474f,stroke-width:2px;

    class A client;
    class M membrane;
    class K,PY,H,R,TC,TS,DH engine;
    class WAL,S3 storage;
    class RE,AD audit;
    class VKG projection;

    %% Interactions
    click A href "https://github.com/truex/docs/agents" "Agent Documentation"
    click M href "https://github.com/truex/docs/membrane" "Membrane Security"
    click PY href "https://github.com/truex/docs/poka-yoke" "Lawful Verification"
`;
  }
}

/**
 * Generates and writes the operational topology Mermaid diagram.
 * @returns A promise resolving to the diagram content.
 */
export async function emitTopologyDiagram() {
  const emitter = new TopologyDiagramEmitter();
  return emitter.emit();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-topology-diagram.ts') || 
  process.argv[1].endsWith('emit-topology-diagram.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitTopologyDiagram();
}
