import { fileURLToPath } from 'node:url';
import { FactEmitter, EmitterMetadata } from './fact-emitter.js';

const DIAGRAM_PATH = 'docs/v1/latest/diagrams/benchmark-flow.mmd';

export class BenchmarkDiagramEmitter extends FactEmitter {
  getMetadata(): EmitterMetadata {
    return {
      name: 'Benchmark Diagram Emitter',
      description: 'Generates a Mermaid diagram for the benchmark execution flow',
      outputPath: DIAGRAM_PATH
    };
  }

  protected collectFacts() {
    return `
flowchart TD
    subgraph Input ["Input Phase"]
        D1[GraphDelta 1]
        D2[GraphDelta 2]
        DN[GraphDelta N]
    end

    subgraph Field ["Hook Field (VKG Projection)"]
        H1{Hook 1}
        H2{Hook 2}
        HM{Hook M}
    end

    subgraph Execution ["Execution Engine"]
        direction LR
        P[Policy Engine]
        V[Validator]
        E[Effect Processor]
    end

    subgraph Output ["Proof & Persistence"]
        R[Receipt Chain]
        RS[Replay Sample]
    end

    subgraph Refusal ["Refusal Path"]
        RP[Refusal Log]
        RC[Reason: Invariant Violation]
    end

    %% Flow
    Input -->|Stream| Field
    Field -->|Match| P
    P -->|Authorize| V
    V -->|Approve| E
    E -->|Commit| R
    E -.->|Sample| RS

    V -->|Fail| RP
    RP -->|Metadata| RC

    %% Styling
    classDef input fill:#e1f5fe,stroke:#01579b;
    classDef field fill:#fff9c4,stroke:#fbc02d;
    classDef exec fill:#f3e5f5,stroke:#7b1fa2;
    classDef out fill:#e8f5e9,stroke:#2e7d32;
    classDef refusal fill:#ffebee,stroke:#c62828;

    class D1,D2,DN input;
    class H1,H2,HM field;
    class P,V,E exec;
    class R,RS out;
    class RP,RC refusal;
`.trim();
  }
}

export async function emitBenchmarkDiagram() {
  const emitter = new BenchmarkDiagramEmitter();
  return emitter.emit();
}

const isMain = process.argv[1] && (
  process.argv[1].endsWith('emit-benchmark-diagram.ts') || 
  process.argv[1].endsWith('emit-benchmark-diagram.js') ||
  process.argv[1] === fileURLToPath(import.meta.url)
);

if (isMain) {
  emitBenchmarkDiagram();
}
